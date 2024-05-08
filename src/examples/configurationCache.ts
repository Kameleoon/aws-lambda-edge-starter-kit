import {
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
} from "aws-lambda";
import {
  ConfigurationDataType,
  Environment,
  KameleoonClient,
  KameleoonUtils,
} from "@kameleoon/nodejs-sdk";
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source";
import { LambdaVisitorCodeManager } from "../visitorCodeManager";

const SITE_CODE = "my_site_code";
const CLIENT_ID = "my_client_id";
const CLIENT_SECRET = "my_client_secret";

let configurationCache: ConfigurationDataType;

// -- Getting configuration using Kameleoon Provided URL
//    Note: for `nodejs16` and lower use `https` instead of `fetch`
// -- In the example we store cached data in lambda memory,
//    but it can be stored in any AWS service like S3, DynamoDB, etc.
async function getKameleoonConfiguration(): Promise<ConfigurationDataType> {
  const url = KameleoonUtils.getClientConfigurationUrl(
    SITE_CODE,
    Environment.Production
  );
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch Kameleoon configuration");
  }

  const configuration = await response.json();

  return configuration;
}

exports.handler = async (
  event: CloudFrontRequestEvent
): Promise<CloudFrontRequest | CloudFrontResponse | null> => {
  try {
    if (!configurationCache) {
      configurationCache = await getKameleoonConfiguration();
    }

    const kameleoonClient = new KameleoonClient({
      siteCode: SITE_CODE,
      credentials: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
      externals: {
        visitorCodeManager: new LambdaVisitorCodeManager(),
        eventSource: new KameleoonEventSource(),
      },
      // -- Providing the configuration to the client
      integrations: {
        externalClientConfiguration: configurationCache,
      },
    });

    await kameleoonClient.initialize();

    // -- Feature Flags code here...

    return event.Records[0].cf.request;
  } catch (error) {
    return null;
  }
};
