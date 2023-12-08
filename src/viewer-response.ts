import {
  Context,
  CloudFrontResponseEvent,
  CloudFrontResponseCallback,
} from "aws-lambda";
import * as cookie from "cookie";
import { KAMELEOON_COOKIE_KEY } from "./constants";
import { getRequestAndHeaders, getUserId } from "./helpers";

/**
 * Handler function is called when Lambda function is invoked.
 * 1. User ID: capture the generated userId cookie.
 * 2. Result: Return the result to the caller via appending userId to headers.
 *
 * NOTE: Additionally, you can capture the result of `getFeatureFlagVariationKey` from headers and pass it's value to user
 */
exports.handler = (
  event: CloudFrontResponseEvent,
  _: Context,
  callback: CloudFrontResponseCallback
) => {
  try {
    const { cookieHeader } = getRequestAndHeaders(event);
    const response = event.Records[0].cf.response;

    const userId = getUserId(cookieHeader);

    if (userId) {
      console.log(
        `[KAMELEOON]: ${KAMELEOON_COOKIE_KEY} cookie found and it's value is ${userId}`
      );

      response.headers = {
        ...response.headers,
        "Set-Cookie": [
          {
            key: "Set-Cookie",
            value: cookie.serialize(KAMELEOON_COOKIE_KEY, userId),
          },
        ],
      };
    }

    // Here, you can include your own logic to handle the viewer response.

    callback(null, response);
  } catch (error) {
    console.log(`[KAMELEOON] ERROR: generating viewer response: ${error}`);
  }
};
