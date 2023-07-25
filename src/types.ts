import { CloudFrontHeaders, CloudFrontRequest } from "aws-lambda";

export type TypeCookies = {
  key?: string;
  value: string;
};

export type TypeRequestandHeaderResponse = {
  request: CloudFrontRequest;
  headers: CloudFrontHeaders;
  cookieHeader: TypeCookies[];
};
