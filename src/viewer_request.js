import * as cookie from "cookie";
import { KameleoonClient } from "@kameleoon/nodejs-sdk";
import { getClientConfig, generateRandomUserId } from "./helpers";

const KAMELEOON_USER_ID = "kameleoon_user_id";
const KAMELEOON_SITE_CODE = "5gswtw0aep";

exports.handler = async (event, _, callback) => {
  console.log("[KAMELEOON] Initializing function...");

  let request = null;
  let headers = {};
  let cookies = {};

  try {
    request = event.Records[0].cf.request;
    headers = request.headers;
    cookies = headers.cookie;
  } catch (error) {
    console.log("[KAMELEOON] WARNING: Unable to get request or headers.");
  }

  try {
    console.log("[KAMELEOON] Getting User ID...");

    const parsedCookies =
      cookies["cookie"] && cookies["cookie"][0]
        ? cookie.parse(cookies["cookie"][0].value)
        : {};

    let userId = parsedCookies[KAMELEOON_USER_ID] || "";

    if (userId === "") {
      userId = generateRandomUserId();
      headers = {
        ...headers,
        "Set-Cookie": [
          {
            key: "Set-Cookie",
            value: cookie.serialize(KAMELEOON_USER_ID, userId),
          },
        ],
      };
    }

    console.log(`[KAMELEOON] Using User ID: ${userId}`);
    console.log(`[KAMELEOON] Using site code: ${KAMELEOON_SITE_CODE}`);

    const clientConfig = await getClientConfig(KAMELEOON_SITE_CODE);

    // const kameleoonClient = new KameleoonClient({
    //   siteCode: KAMELEOON_SITE_CODE,
    //   integrations: {
    //     externalClientConfiguration: clientConfig
    //   },
    // });

    // await kameleoonClient.initialize();

    // const variationKey = kameleoonClient.getFeatureFlagVariationKey(
    //   userId,
    //   "test_fastly_starter_kit"
    // );
    // console.log(`[KAMELEOON] The variationKey is ${variationKey}`);

    request = {
      ...request,
      headers,
    };

    callback(null, request);
  } catch (error) {
    console.log(`[KAMELEOON] ERROR: ${error}`);
    callback(null, request);
  }
};
