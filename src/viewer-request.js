import * as cookie from "cookie";
import { KameleoonClient } from "@kameleoon/nodejs-sdk";
import { getClientConfig, generateRandomUserId } from "./helpers";
import { KAMELEOON_USER_ID } from "./constants";

const KAMELEOON_SITE_CODE = "5gswtw0aep";

/**
 * Handler function is called when Lambda function is invoked.
 * 1. User ID: Get the useId from cookie if it exists. Otherwise, generate a new userId.
 * 2. Client Configuration: Get the client configuration data from cache if it exists. Otherwise, fetch fresh data from Kameleoon CDN.
 * 3. Initialize KameleoonClient SDK: Create an instance of KameleoonClient using fetched client configuration.
 * 4. Use kameleoonClient instance to access SDK methods. Using methdos get result for this particular userId.
 * 5. Result: Return the result to the caller via appending headers or cookies to the callback function.
 */

exports.handler = async (event, _, callback) => {
  console.log("[KAMELEOON] Initializing function...");

  let request = null;

  try {
    request = event.Records[0].cf.request;
  } catch (error) {
    console.log(
      "[KAMELEOON] WARNING: Unable to get request object from event."
    );
  }

  let headers = {};
  let cookieHeader = [];

  try {
    headers = request.headers;
    cookieHeader = headers["cookie"] ?? [];
  } catch (error) {
    console.log(
      "[KAMELEOON] WARNING: Unable to get headers object from request."
    );
  }

  let userId = "";

  try {
    console.log("[KAMELEOON] Getting User ID...");

    // 1. User ID: Get the useId from cookie if it exists. Otherwise, generate a new userId.
    //    If userId is missing in request header cookie, then attach it to request header.
    if (cookieHeader.length) {
      const cookieValue = cookieHeader[0].value;
      const cookies = cookie.parse(cookieValue);

      userId = cookies[KAMELEOON_USER_ID] || "";
    }

    if (!cookieHeader.length || !userId) {
      userId = generateRandomUserId();
      headers = {
        ...headers,
        Cookie: [
          {
            key: "Cookie",
            value: cookie.serialize(KAMELEOON_USER_ID, userId),
          },
        ],
      };
    }

    console.log(`[KAMELEOON] Using User ID: ${userId}`);
    console.log(`[KAMELEOON] Using site code: ${KAMELEOON_SITE_CODE}`);

    // 2. Client Configuration: Get the client configuration data from cache if it exists. Otherwise, fetch fresh data from Kameleoon CDN.
    const clientConfig = await getClientConfig(KAMELEOON_SITE_CODE);

    // 3. Initialize KameleoonClient SDK: Create an instance of KameleoonClient using fetched client configuration
    const kameleoonClient = new KameleoonClient({
      siteCode: KAMELEOON_SITE_CODE,
      integrations: {
        externalClientConfiguration: clientConfig,
      },
    });

    await kameleoonClient.initialize();

    // 4. Use kameleoonClient instance to access SDK methods. You can refer to our developers documentation to find out more about methods
    //    Here is the simple example of how to get the variationKey for this particular userId and feature flag.
    const variationKey = kameleoonClient.getFeatureFlagVariationKey(
      userId,
      "test_fastly_starter_kit"
    );
    console.log(
      `[KAMELEOON] The variationKey of userId: ${userId} is ${variationKey}`
    );

    // 5. Result: Return the result to the caller via appending headers or cookies to the callback function.

    // Example of attaching the result of `getFeatureFlagVariationKey` method to header to pass it a caller
    // headers["<YOUR_FEATURE_KEY>"] = [
    //   {
    //     key: "<YOUR_FEATURE_KEY>",
    //     value: variationKey,
    //   },
    // ];

    // Here, you can include any other loficto handle the viewer request event.

    request = {
      ...request,
      headers,
    };

    callback(null, request);
  } catch (error) {
    console.log(`[KAMELEOON] ERROR: generating viewer request: ${error}`);
    callback(null, request);
  }
};
