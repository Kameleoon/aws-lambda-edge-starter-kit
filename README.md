# Kameleoon AWS Lambda@Edge Starter Kit

> Kameleoon AWS Lambda@Edge Starter Kit to run Kameleoon Experimentation and Feature Flags on [Lambda@Edge](https://aws.amazon.com/lambda/edge).

This repository is home to the AWS Lambda@Edge Starter Kit, providing a quickstart for users who want to use [Kameleoon NodeJS SDK](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk) with AWS Lambda@Edge. Kameleoon is a powerful experimentation and personalization platform for product teams, enabling insightful discoveries through every feature on your roadmap. Discover more at https://kameleoon.com, or see the [developer documentation](https://developers.kameleoon.com).

## Getting Started

### Prerequisites

These steps should be completed before you get started:

1. You need a **Kameleoon Account**.

2. You need an AWS Account with Lambda@Edge Access. For more information, visit the official [AWS Lambda@Edge product page here](https://aws.amazon.com/lambda/edge).

### Requirements

First, you are required to set up the basic AWS Lambda@Edge enviroment. To achive this, please follow this [official guide from AWS ](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html) to create a simple Lambda@Edge Function.

These are the steps:

1. **Sign up for AWS account** - If you don't have an account, please sign up for Amazon Web Services at https://aws.amazon.com.

2. **Create a Cloudfront distribution** - If you're not familiar with CloudFront, take a few minutes to read a short [overview](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) and learn a bit about [how CloudFront caches and serves content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html).

3. **Create a Lambda function** - In this step, you create a Lambda function, starting with a blueprint template that's provided in the Lambda Console.

4. **Add your Cloudfront trigger to Lambda function** - Now that you have a Lambda function, configure the CloudFront trigger to run your function.

### Install the Starter Kit

5. After your Lambda@Edge environment is prepared, clone this starter kit to your local development environment and run `npm install`.

## Use the AWS Lambda@Edge Starter Kit

The Kameleoon AWS Lambda@Edge Starter Kit uses and extends our [Kameleoon NodeJS SDK](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk) to provide experimentation and feature flagging on the edge.

> Note: In order to effectively run the Kameleoon NodeJS SDK on the edge, it's crucial to provide the `externalClientConfiguration`. This can be accomplished either by referencing a local file or by utilizing the supplied `getClientConfiguration` helper to retrieve your Kameleoon project's client configuration. The `externalClientConfiguration` is a JSON format that encapsulates all your feature flags and experiments. This essential data structure includes all the necessary information for implementing and monitoring your feature flag deployments and experiments.

### Initialization

The `src/viewer_request.js` file contains sample code that showcases how to fetch and cache the client configuration, initialize the Kameleoon SDK with this configuration, and modify the outgoing request by adding the User ID cookie and feature flag value to the header.

The `src/viewer_response.js` file contains sample code that showcases how to fetch the User ID cookie from the incoming request and attach it to the outgoing response.

Additional platform-specific code is included in `src/helpers.js` which provides workarounds for otherwise common features of the Kameleoon SDK.

### Get started

1. Navigate to `src/viewer_request.js` and update the `YOUR_SITE_CODE` and `YOUR_FEATURE_KEY` value with your respective value from your Kameleoon dashboard.
2. Hook into different lifecycle events by inserting logic to change headers, cookies, and more in the switch-case statement in `src/viewer_request.js` and `src/viewer_response.js`.
3. Use the Kameleoon NodeJS SDK to feature flagging and experimentation.
4. Run `npm run build:viewer_request`- this uses Rollup to bundle the source code of `src/viewer_request.js` into a neat .zip file to be imported into Lambda. Do the same for `src/viewer_response.js` by running `npm run build:viewer_response` to build. But pay attention, that it will overwrite the previous build. So you have to build these two files one by one. First, build viewer request, upload to Lambda, then build the viewer response.

> Note: Notice that a `/dist` folder is generated with the new dist.zip file. It should be roughly **~49kb** for `src/viewer_request.js` and **~1.7kb** for `src/viewer_response.js` in size assuming you have not made any additional changes.

5. Upload your function to AWS Lambda via GUI or CLI.

> **GUI**: Go to your AWS Lambda console, select the function associated your Lambda environment, and import the `dist.zip` file. After you upload it, there should now be a minified `index.js` file located inside of your Lambda function's "Code Source" section.

> **CLI**: You can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to update your AWS Lambda function programmatically. Example command: `aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist.zip`.

> **Lambda Layers**: If you need additional libraries, custom runtimes, or configuration files to use alongside your Lambda function, consider looking into utilizing [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).

6. After your Lambda Function is set up, provision it with Lambda@Edge permissions and associate it with your CloudFront distribution. Set the CloudFront trigger for this function to be `Viewer Request`.

> Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function. You may, for example, need to have one function that handles receiving viewer requests (viewer request trigger) and one function that handles returning a response to the viewer (viewer response trigger).

7. Test your Lambda@Edge function - you should see that it returns a simple home page with the results of your feature flag test and User ID cookie.

> For more visibility into what the starter kit is accomplishing, you can navigate to your CloudWatch console. Under `Logs` > `Log groups` > `/aws/lambda/<YOUR_LAMBDA_NAME>`, click into your Lambda's log group and view the test. You'll find the entire process of reading the headers, assigning the User ID, fetching the client configuration, and getting a variation key for particular User ID using the Kameleoon NodeJS SDK.

8. Adjust your Lambda's configuration as needed. For example, you may need to increase your function's memory, storage and timeout threshold to accommodate your function's needs.

9. From here, you can use Kameleoon's feature flagging and experimentation as desired. You can modify the cookies and headers based on experimentation results, add hooks to the "Origin Request" and "Origin Response" CloudFront triggers to do things like origin redirects or dynamic asset manipulation, or add more services to the pipeline including your own logging systems, databases, CDN origins and more. Keep in mind that Lambda@Edge has some limitations - you can familiarize yourself with those by referencing this article - [Edge Functions Restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html).

## Additional Resources and Concepts

### External Data Fetching & Caching

This starter kit uses standard ES7 async/await fetch methods to handle external data fetching. After fetching the Kameleoon client configuration, the client configuration itself is cached as a JSON object in-memory. Large client configurations may cause this method presented in the starter kit to break. If you experience issues with large datafiles breaking in-memory Lambda caching, you can consider one of the alternative methods of caching with Lambda@Edge outlined in [this article](https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/).

Alternative methods to in-memory data caching include using a persistent connection to your client configuration JSON or caching via CloudFront.

For even faster data fetching, you can consider storing your datafile in an S3 bucket that you own and refactor the client configuration fetching mechanism to use Lambda's built-in AWS SDK library and fetch from your S3 bucket instead.

> Note: Additional caching mechanisms may be available through your CloudFront distribution's configuration.

### Identity Management

Out of the box, Kameleoon's Feature Experimentation SDKs require a user-provided identifier to be passed in at runtime to drive experiment and feature flag results. In case a User ID is not provided directly from the client, this starter kit generates a unique ID as a fallback, stores it into the cookie and re-uses it to ensure decisions are sticky per user session. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `KAMELEOON_USER_ID` cookie.

### AWS Lambda@Edge and Kameleoon resources

For more information about AWS Lambda@Edge and Kameleoon, you may visit the following resources:

- [Lambda - Lambda@Edge offical documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
- [Kameleoon NodeJS SDK documentation](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk)
- [Kameleoon Serverless edge compute starter kits](https://developers.kameleoon.com/feature-management-and-experimentation/serverless-edge-compute-starter-kits)
