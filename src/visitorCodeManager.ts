import { CloudFrontRequestEvent, CloudFrontResponseEvent } from "aws-lambda";
import {
  IExternalCustomVisitorCodeManager,
  GetDataCustomParametersType,
  SetDataCustomParametersType,
} from "@kameleoon/nodejs-sdk";

// -- Custom Implementation of Kameleoon Visitor Code Manager
//    for Lambda@Edge
export class LambdaVisitorCodeManager
  implements IExternalCustomVisitorCodeManager
{
  // -- Getting the visitor code from the `request` cookie of:
  //    - `viewer_request`
  //    - `origin_request`
  //    - `viewer_response`
  //    - `origin_response`
  getData(params: GetDataCustomParametersType): string | null {
    const { key, input: event } = params;

    if (!event || typeof event !== "object" || !("Records" in event)) {
      return null;
    }

    const request = (event as CloudFrontRequestEvent).Records[0].cf.request;
    const headers = request?.headers ?? {};
    const cookieHeader = headers["cookie"];

    if (!cookieHeader) {
      return null;
    }

    const cookieStr = cookieHeader[0].value;

    if (!cookieStr) {
      return null;
    }

    const keyValue = cookieStr.split(";").find((pair) => pair.includes(key));

    if (!keyValue) {
      return null;
    }

    return keyValue.split("=")[1];
  }

  // -- Setting the visitor code to the `response` cookie of:
  //    - `viewer_response`
  //    - `origin_response`
  // -- Or to the `request` cookie of:
  //    - `viewer_request`
  //    - `origin_request`
  setData(params: SetDataCustomParametersType): void {
    const { key, visitorCode, domain, maxAge, path, output: event } = params;

    if (!event || typeof event !== "object" || !("Records" in event)) {
      return;
    }

    let cookies = `${key}=${visitorCode}; Max-Age=${maxAge}; Path=${path}`;

    if (domain) {
      cookies += `; Domain=${domain}`;
    }

    if ("response" in (event as CloudFrontResponseEvent).Records[0].cf) {
      const headers = (event as CloudFrontResponseEvent).Records[0].cf.response
        ?.headers;

      if (!headers) {
        return;
      }

      headers["Set-Cookie"] = [
        {
          key: "Set-Cookie",
          value: cookies,
        },
      ];
    }

    if ("request" in (event as CloudFrontRequestEvent).Records[0].cf) {
      const headers = (event as CloudFrontRequestEvent).Records[0].cf.request
        ?.headers;

      if (!headers) {
        return;
      }

      headers["cookie"] = [
        {
          key: "cookie",
          value: cookies,
        },
      ];
    }
  }
}
