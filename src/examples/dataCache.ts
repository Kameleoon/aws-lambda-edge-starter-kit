import {
  CloudFrontRequest,
  CloudFrontRequestEvent,
  CloudFrontResponse,
} from "aws-lambda";
import { IExternalStorage, KameleoonClient } from "@kameleoon/nodejs-sdk";
import { KameleoonEventSource } from "@kameleoon/nodejs-event-source";
import { LambdaVisitorCodeManager } from "../visitorCodeManager";

const SITE_CODE = "my_site_code";
const CLIENT_ID = "my_client_id";
const CLIENT_SECRET = "my_client_secret";

let dataCache = new Map();

// -- Keeping `Configuration` in cache between lambda invocations
//    it can also be stored in any AWS service like S3, DynamoDB, etc.
// -- Even though the storage is synchronous, it can be updated
//    asynchronously using AWS services
class LambdaStorage<T> implements IExternalStorage<T> {
  public read(key: string): T | null {
    // - Read data using `key`
    const data = dataCache.get(key);

    // - Return `null` if there's no data
    if (!data) {
      return null;
    }

    // - Return obtained data
    return data;
  }

  public write(key: string, data: T): void {
    // - Write data using `key`
    dataCache.set(key, data);
  }
}

exports.handler = async (
  event: CloudFrontRequestEvent
): Promise<CloudFrontRequest | CloudFrontResponse | null> => {
  // -- Before working with the SDK you can asynchronously
  //    update the SDK storage using AWS services
  //    (e.g. S3, DynamoDB, etc.)
  // -- Your code here

  try {
    const kameleoonClient = new KameleoonClient({
      siteCode: SITE_CODE,
      credentials: {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
      },
      externals: {
        visitorCodeManager: new LambdaVisitorCodeManager(),
        eventSource: new KameleoonEventSource(),
        // -- Providing the storage to the client
        storage: new LambdaStorage(),
      },
    });

    // -- Initialization will be almost instant
    //    as the configuration is already cached
    await kameleoonClient.initialize();

    // -- Feature Flags code here...
  } catch (error) {
    return null;
  }

  // -- After working with the SDK
  //    if any of the data has changed
  //    you can asynchronously update the cache using AWS services
  // -- Your code here

  return event.Records[0].cf.request;
};
