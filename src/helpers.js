const https = require("https");

/**
 * generateRandomUserId - Generates a random User ID.
 *
 * @returns string
 */
export function generateRandomUserId() {
  console.log("[KAMELEOON] Generating new random User ID...");
  const userId = (Math.random() + 1).toString(32).substring(2);
  console.log("[KAMELEOON] Generated User ID: " + userId);

  return userId;
}

/**
 * getClientConfigRequest - Retrieves the client config from the Kameleoon CDN and returns as a JSON object.
 *
 * @param string siteCode
 * @returns Promise
 */
async function getClientConfigRequest(siteCode) {
  console.log("[KAMELEOON] Retrieving client config: " + siteCode);
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "client-config.kameleoon.com",
      port: 443,
      path: `/mobile?siteCode=${siteCode}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.get(options, (res) => {
      res.setEncoding("utf8");
      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (err) {
          reject(new Error(err));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

// const TTL = 3600000; // 1 Hour
const TTL = 60000; // 1 Minute
let clientConfig = null;
let lastFetchedTime = 0; // Note last time the client confiruation was fetched.

/**
 * getClientConfig - Retrieves the client configuration from the Kameeloon CDN.
 *
 * Note: This starter kit uses in-memory caching per Lambda for data caching.
 * Alternative considerations could include using CloudFront or AWS S3 for caching instead.
 *
 * @param string siteCode
 * @returns client config JSON object or null in case of error
 */
export async function getClientConfig(siteCode) {
  console.log("[KAMELEOON] Getting client config...");

  try {
    console.log(
      `[KAMELEOON] Checking if client config is stale. Current time: ${Date.now()}. Last fetched time: ${lastFetchedTime}. TTL: ${TTL}`
    );

    if (!clientConfig) {
      console.log(
        "[KAMELEOON] Cached client config is stale, fetching new client config..."
      );

      clientConfig = await getClientConfigRequest(siteCode);

      console.log(
        "[KAMELEOON] Client config response: " + JSON.stringify(clientConfig)
      );

      // In-memory cache reset mechanism.
      // setTimeout(() => {
      //   clientConfig = null;
      // }, TTL);

      lastFetchedTime = Date.now();
    }

    console.log(
      `[KAMELEOON] Client config last fetched time: ${new Date(
        lastFetchedTime
      ).toLocaleTimeString()}`
    );

    console.log(
      `[KAMELEOON] Returning client config: ${JSON.stringify(clientConfig)}`
    );

    return clientConfig;
  } catch (error) {
    console.error(`[KAMELEOON] Error getting client config: ${error}`);

    return null;
  }
}
