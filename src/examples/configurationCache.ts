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
} from "@kameleoon/nodejs-sdk";
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source";
import { LambdaVisitorCodeManager } from "../visitorCodeManager";

const SITE_CODE = "my_site_code";
const CLIENT_ID = "my_client_id";
const CLIENT_SECRET = "my_client_secret";

// --- External Requester Implementation
export class CacheRequester implements IExternalRequester {
  public async sendRequest({
                             requestType,
                             url,
                             parameters,
                           }: SendRequestParametersType<RequestType>): Promise<KameleoonResponseType> {
    if (requestType === RequestType.Configuration) {
      // -- Your code here for configuration request or cache
      return await fetch(url, parameters);
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
