import {
  Context,
  CloudFrontResponseEvent,
  CloudFrontRequestResult,
  CloudFrontResponseResult,
  CloudFrontResponseCallback,
} from "aws-lambda";
import * as cookie from "cookie";
import { KAMELEOON_USER_ID } from "./constants";
import { TypeCookies } from "./types";

/**
 * Handler function is called when Lambda function is invoked.
 * 1. User ID: capture the generated userId cookie.
 * 2. Result: Return the result to the caller via appending userId to headers.
 */
exports.handler = (
  event: CloudFrontResponseEvent,
  _: Context,
  callback: CloudFrontResponseCallback
) => {
  try {
    let request: CloudFrontRequestResult = null;

    try {
      request = event.Records[0].cf.request;
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get request object from event."
      );
    }

    let cookieHeader: TypeCookies[] = [];

    try {
      if (request) {
        const headers = request.headers;
        cookieHeader = headers["cookie"] ?? [];
      }
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get headers object from request."
      );
    }

    let response: CloudFrontResponseResult = null;

    try {
      response = event.Records[0].cf.response;
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get response object from event."
      );
    }

    if (cookieHeader.length) {
      const cookieValue = cookieHeader[0].value;
      const cookies = cookie.parse(cookieValue);

      const userId = cookies[KAMELEOON_USER_ID] || "";

      if (response && userId) {
        console.log(
          `[KAMELEOON]: ${KAMELEOON_USER_ID} cookie found and it's value is ${userId}`
        );

        response.headers = {
          ...response.headers,
          "Set-Cookie": [
            {
              key: "Set-Cookie",
              value: cookie.serialize(KAMELEOON_USER_ID, userId),
            },
          ],
        };
      }
    }

    // Here, you can include any other parameters you want to pass along.

    callback(null, response);
  } catch (error) {
    console.log(`[KAMELEOON] ERROR: generating viewer response: ${error}`);
  }
};
