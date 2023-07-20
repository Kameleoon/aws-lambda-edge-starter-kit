import * as cookie from "cookie";

const KAMELEOON_USER_ID = "kameleoon_user_id";

exports.handler = (event, _, callback) => {
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
      response = event.Records[0].cf.response;
    } catch (error) {
      console.log(
        "[KAMELEOON] WARNING: Unable to get response object from event."
      );
    }

    console.log("REQUEST: ", JSON.stringify(request));
    console.log("RESPONSE: ", JSON.stringify(response));

    console.log("COOKIE: ", JSON.stringify(cookies));

    const parsedCookies =
      cookies && cookies["cookie"] && cookies["cookie"][0]
        ? cookie.parse(cookies["cookie"][0].value)
        : {};

    console.log("PARSEDCOOKIE: ", JSON.stringify(parsedCookies));

    const userId = parsedCookies[KAMELEOON_USER_ID] || "";

    if (userId) {
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
};
