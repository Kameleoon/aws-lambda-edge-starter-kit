/**
 * Create a new Lambda@Edge function with Viewer Response trigger
 * of Cloudfront Distrubution.
 *
 * This handler will capture the generated userId cookie and return it to the client.
 */

import * as cookie from "cookie";
import { KAMELEOON_USER_ID } from "./constants";

exports.handler = (event, _, callback) => {
  try {
    let request = null;

    try {
      request = event.Records[0].cf.request;
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get request object from event."
      );
    }

    let cookieHeader = [];

    try {
      const headers = request.headers;
      cookieHeader = headers["cookie"] ?? [];
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get headers object from request."
      );
    }

    let response = null;

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

      if (userId) {
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
