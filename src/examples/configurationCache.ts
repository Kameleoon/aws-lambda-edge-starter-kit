import {
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
} from "aws-lambda";
import {
  IExternalRequester,
  KameleoonClient,
  KameleoonResponseType,
  RequestType,
  SendRequestParametersType,
  KameleoonUtils,
  ConfigurationDataType
} from "@kameleoon/nodejs-sdk";
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source";
import { LambdaVisitorCodeManager } from "../visitorCodeManager";

const SITE_CODE = "my_site_code";
const CLIENT_ID = "my_client_id";
const CLIENT_SECRET = "my_client_secret";

let configurationCache: ConfigurationDataType;

// --- External Requester Implementation
// Note: for `nodejs16` and lower use `https` instead of `fetch`
export class CacheRequester implements IExternalRequester {
  public async sendRequest({
    requestType,
    url,
    parameters,
  }: SendRequestParametersType<RequestType>): Promise<KameleoonResponseType> {
    if (requestType === RequestType.Configuration) {
      // -- Your code here for configuration request or cache
      if (!configurationCache) {
        const response = await fetch(url, parameters);

        if (!response.ok) {
          throw new Error("Failed to fetch Kameleoon configuration");
        }

        configurationCache = await response.json();
      }

      return KameleoonUtils.simulateSuccessRequest<RequestType.Configuration>(
          requestType,
          configurationCache,
      );
    }
    return await fetch(url, parameters);
  }
}

exports.handler = async (
  event: CloudFrontRequestEvent
): Promise<CloudFrontRequest | CloudFrontResponse | null> => {
  try {
    const kameleoonClient = new KameleoonClient({
      siteCode: SITE_CODE,
      credentials: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
      externals: {
        visitorCodeManager: new LambdaVisitorCodeManager(),
        eventSource: new KameleoonEventSource(),
        requester: new CacheRequester(),
      },
    });

    await kameleoonClient.initialize();

    // -- Feature Flags code here...

    return event.Records[0].cf.request;
  } catch (error) {
    return null;
  }
};
