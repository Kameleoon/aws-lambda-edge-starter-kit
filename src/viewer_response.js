import * as cookie from "cookie";

const KAMELEOON_USER_ID = "kameleoon_user_id";

export function handler(event, _, callback) {
  try {
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

    let response = null;
    try {
      request = event.Records[0].cf.response;
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get response object from event."
      );
    }

    const parsedCookies =
      cookies["cookie"] && cookies["cookie"][0]
        ? cookie.parse(cookies["cookie"][0].value)
        : {};

    const userId = parsedCookies[KAMELEOON_USER_ID] || "";

    if (userId !== "") {
      response.headers = {
        ...headers,
        "Set-Cookie": [
          {
            key: "Set-Cookie",
            value: cookie.serialize(KAMELEOON_USER_ID, userId),
          },
        ],
      };
      callback(null, response);
      return;
    }

    console.log(`[KAMELEOON]: ${KAMELEOON_USER_ID} cookie found.`);

    callback(null, response);
  } catch (error) {
    console.log(`[KAMELEOON]: Error generating viewer response: ${error}`);
  }
}
