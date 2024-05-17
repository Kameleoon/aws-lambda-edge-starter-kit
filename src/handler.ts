import {
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
  CloudFrontResponseEvent,
} from "aws-lambda";
import { KameleoonClient, KameleoonError } from "@kameleoon/nodejs-sdk";
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source";
import { LambdaVisitorCodeManager } from "./visitorCodeManager";

const SITE_CODE = "my_site_code";
const CLIENT_ID = "my_client_id";
const CLIENT_SECRET = "my_client_secret";
const FEATURE_KEY = "my_feature_key";

// -- Keeping `KameleoonClient` in cache between lambda invocations
let kameleoonClient: KameleoonClient;
let isInitialized = false;

// -- Handler is universal for:
//   - `viewer_request`
//   - `origin_request`
//   - `viewer_response`
//   - `origin_response`
//   But it can be customized for each event type
exports.handler = async (
  event: CloudFrontRequestEvent | CloudFrontResponseEvent
): Promise<CloudFrontRequest | CloudFrontResponse | null> => {
  try {
    if (!kameleoonClient) {
      console.log("[KAMELEOON]: Creating a new Kameleoon Client...");

      kameleoonClient = new KameleoonClient({
        siteCode: SITE_CODE,
        credentials: {
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
        },
        externals: {
          visitorCodeManager: new LambdaVisitorCodeManager(),
          eventSource: new KameleoonEventSource(),
        },
      });
    }

    if (!isInitialized) {
      console.log("[KAMELEOON]: Initializing Kameleoon Client...");

      isInitialized = await kameleoonClient.initialize();
    }

    // -- Getting the visitor code from the `request` cookie
    //    or generating a new one if it doesn't exist
    // -- Setting the visitor code to the `response` cookie
    //    if event type is `viewer_response` or `origin_response`
    const visitorCode = kameleoonClient.getVisitorCode({
      input: event,
      output: event,
    });

    console.log(`[KAMELEOON]: Visitor Code: ${visitorCode}`);

    // -- Getting the variation key for the feature flag
    const variationKey = kameleoonClient.getFeatureFlagVariationKey(
      visitorCode,
      FEATURE_KEY
    );

    console.log(`[KAMELEOON]: Feature Flag Variation: ${variationKey}`);

    // -- You can now use the `visitorCode` and `variationKey` to personalize the content
    //    Your code here...

    // -- This part can be omitted if it's certain what type of event is being processed
    if ("response" in event.Records[0].cf) {
      return event.Records[0].cf.response;
    } else {
      return event.Records[0].cf.request;
    }
  } catch (error) {
    if (error instanceof KameleoonError) {
      console.error("[KAMELEOON]: Kameleoon Error:", error.message);
    } else {
      console.error("[KAMELEOON]: Error:", error);
    }

    return null;
  }
};
