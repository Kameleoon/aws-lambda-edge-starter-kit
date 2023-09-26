import { CloudFrontRequestEvent } from "aws-lambda";
import https from "https";
import cookie from "cookie";
import {
  KameleoonUtils,
  GetClientConfigurationResultType,
} from "@kameleoon/nodejs-sdk";
import { TypeCookies, TypeRequestandHeaderResponse } from "./types";
import { KAMELEOON_USER_ID } from "./constants";

/**
 * generateRandomUserId - Generates a random User ID.
 *
 * @returns string
 */
export function generateRandomUserId(): string {
  console.log("[KAMELEOON] Generating new random User ID...");
  const userId = (Math.random() + 1).toString(32).substring(2);
  console.log(`[KAMELEOON] Generated User ID: ${userId}`);

  return userId;
}

/**
 * getRequestAndHeaders - Get the request object from event and headers object from request.
 *
 * @param CloudFrontRequestEvent event
 * @returns object with values such as request, headers and cookieHeader
 */
export function getRequestAndHeaders(
  event: CloudFrontRequestEvent
): TypeRequestandHeaderResponse {
  const request = event.Records[0].cf.request;
  const headers = request?.headers || {};
  const cookieHeader = headers["cookie"] ?? [];

  return { request, headers, cookieHeader };
}

/**
 * getUserId - Get the User ID from cookie header, if missing returns empty string.
 *
 * @param TypeCookies[] cookieHeader
 * @returns userId
 */
export function getUserId(cookieHeader: TypeCookies[]): string {
  let userId = "";

  if (cookieHeader.length) {
    const cookieValue = cookieHeader[0].value;
    const cookies = cookie.parse(cookieValue);

    userId = cookies[KAMELEOON_USER_ID] || "";
  }

  return userId;
}

/**
 * getClientConfigRequest - Retrieves the client config from the Kameleoon CDN and returns as a JSON object.
 *
 * @param string siteCode
 * @returns Promise
 */
async function getClientConfigRequest(
  url: string
): Promise<GetClientConfigurationResultType> {
  console.log("[KAMELEOON] Retrieving client config...");

  const urlObj = new URL(url);

  return new Promise((resolve, reject) => {
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
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
          reject(new Error(err as string));
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}

// const CLIENT_CONFIG_TTL = 3_600_000; // 1 Hour
const CLIENT_CONFIG_TTL: number = 60_000; // 1 Minute
let clientConfig: GetClientConfigurationResultType | null = null;
let clientConfigLastFetchedTime: number = 0; // Last time the client confiruation was fetched.

/**
 * getClientConfig - Retrieves the client configuration from the Kameeloon CDN.
 *
 * Note: This starter kit uses in-memory caching per Lambda for data caching.
 * Alternative considerations could include using CloudFront or AWS S3 for caching instead.
 *
 * @param string siteCode
 * @returns client config JSON object or null in case of error
 */
export async function getClientConfig(
  siteCode: string
): Promise<GetClientConfigurationResultType | null> {
  console.log("[KAMELEOON] Getting client config...");

  // Get the Kameleoon Client Configuration URL from KameleoonUtils
  const url = KameleoonUtils.getClientConfigurationUrl(siteCode);

  try {
    const currentTime = Date.now();

    if (
      !clientConfig ||
      currentTime - clientConfigLastFetchedTime > CLIENT_CONFIG_TTL
    ) {
      console.log(
        "[KAMELEOON] Cached client config is stale, fetching new client config..."
      );

      clientConfig = await getClientConfigRequest(url);

      console.log(
        `[KAMELEOON] Client config response: ${JSON.stringify(clientConfig)}`
      );

      clientConfigLastFetchedTime = currentTime;
    }

    console.log(
      `[KAMELEOON] Client config last fetched time: ${new Date(
        clientConfigLastFetchedTime
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
