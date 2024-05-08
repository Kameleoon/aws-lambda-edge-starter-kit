# Kameleoon AWS Lambda@Edge Starter Kit

> The Kameleoon AWS Lambda@Edge Starter Kit demonstrates Kameleoon experimentation and feature flags on Amazon Web Services (AWS) [Lambda@Edge](https://aws.amazon.com/lambda/edge).

This repository is home to the Kameleoon starter kit for AWS Lambda@Edge. Kameleoon is a powerful experimentation and personalization platform for product teams that enables you to make insightful discoveries by testing the features on your roadmap. Discover more at https://kameleoon.com, or see the [developer documentation](https://developers.kameleoon.com).

## Contents

- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Set up the edge environment](#set-up-the-edge-environment)
  - [Install the starter kit](#install-the-starter-kit)
- [Use the AWS Lambda@Edge Starter Kit](#use-the-aws-lambdaedge-starter-kit)
- [Development](#development)
  - [Testing Locally](#testing-locally)
  - [Commands](#commands)
- [Additional Resources and Concepts](#additional-resources-and-concepts)
  - [External Data Fetching & Caching](#external-data-fetching--caching)
  - [Identity Management](#identity-management)
  - [AWS Lambda@Edge and Kameleoon resources](#aws-lambdaedge-and-kameleoon-resources)

## Getting started

This starter kit provides quick start instructions for developers using the [Kameleoon NodeJS SDK](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk) with AWS Lambda@Edge.

### Prerequisites

Make sure you have the following requirements before you get started:

1. A Kameleoon user account. Visit [kameleoon.com](https://www.kameleoon.com/) to learn more.
1. An AWS account with Lambda@Edge access. For more information, visit the official [AWS Lambda@Edge product page](https://aws.amazon.com/lambda/edge).

### Set up the edge environment

First, you'll set up a basic AWS Lambda@Edge environment. For this step, follow the [official tutorial from AWS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works-tutorial.html) to create a simple Lambda@Edge Function.

In the tutorial, complete these sections:

1. **Sign up for AWS account** - If you don't have an account, please sign up for Amazon Web Services at https://aws.amazon.com.

1. **Create a Cloudfront distribution** - If you're not familiar with CloudFront, take a few minutes to read a short [overview](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html) and learn a bit about [how CloudFront caches and serves content](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/HowCloudFrontWorks.html).

1. **Create a Lambda function** - In this step, you create a Lambda function, starting with a blueprint template that's provided in the Lambda Console.

1. **Add your Cloudfront trigger to Lambda function** - Now that you have a Lambda function, configure the CloudFront trigger to run your function.

1. **Verify that the function runs** - Make sure that your environment is properly configured.

### Install the starter kit

After your Lambda@Edge environment is prepared, install the starter kit:

1. Clone this repository to your local development environment.
1. In a terminal, navigate to the `aws-lambda-edge-starter-kit/` directory.
1. Run `npm install`.

## Use the AWS Lambda@Edge Starter Kit

The Kameleoon AWS Lambda@Edge Starter Kit uses and extends the [Kameleoon NodeJS SDK](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk) to provide experimentation and feature flagging on the edge.

### Initialization

In the `src` folder of the starter kit, you will find two TypeScript files:

- `src/handler.ts` contains sample code that initializes and caches the Kameleoon SDK and retrieves the feature flag variation.
- `src/visitorCodeManager.ts` file contains a custom implementation of Kameleoon Visitor Code Manager, which provides an ability to work with Kameleoon `visitorCode` at the edge.

You'll use these files to initialize your environment:

1. Navigate to `src/handler.ts` and update the `SITE_CODE`, `CLIENT_ID`, `CLIENT_SECRET` and `FEATURE_KEY` with your [Kameleoon credentials](https://help.kameleoon.com/api-credentials) and feature flag data collected on Kameleoon Platform.
1. Review or adjust the feature flags or experiments you've configured with the Kameleoon NodeJS SDK, and hook into the lifecycle events by inserting your desired logic in `src/handler.ts`. For example, you can change headers, cookies, and more.
1. Run `npm run build:lambda` to bundle the source code into a `dist/handler.zip` file that you'll import into Lambda.
1. Upload the handler `dist/handler.zip` file into Lambda using one of these options:
   - **GUI**: Go to your AWS Lambda console, select the function associated with your Lambda environment, and import the `dist/handler.zip` file. After you upload it, there should now be a minified `index.js` file located inside of your Lambda function's **Code Source** section.
   - **CLI**: You can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to update your AWS Lambda function programmatically. Example command:
     ```
     aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist/handler.zip
     ```
1. Upload the response `dist/handler.zip` file into Lambda.

   > **Lambda Layers**: If you need additional libraries, custom runtimes, or configuration files to use alongside your Lambda function, consider using [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).

1. Provision the function with [Lambda@Edge permissions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-permissions.html) and [associate the function](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/associate-function.html) with your CloudFront distribution.

   > Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function. For example, you may need one function that handles receiving viewer requests (viewer request trigger) and one function that handles returning a response to the viewer (viewer response trigger).

1. Test your Lambda@Edge function. It should return a simple home page with the results of your feature flag test and User ID cookie.

   > You can find details on how the starter kit works in the CloudWatch console under **Logs > Log groups > /aws/lambda/<YOUR_LAMBDA_NAME>**. Click your Lambda's log group to follow the entire process.

1. Adjust your lambda's configuration as needed. For example, you may need to increase your function's memory, storage, and timeout threshold to accommodate your needs.

You can now use Kameleoon's feature flagging and experimentation as desired. You can modify the cookies and headers based on experimentation results, add hooks to the **Origin Request** and **Origin Response** CloudFront triggers to perform origin redirects or dynamic asset manipulation, or add more services to the pipeline including your own logging systems, databases, CDN origins, and more. Keep in mind that Lambda@Edge has some limitations, which you can familiarize yourself with in the [Edge Functions Restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html) article.

## Development

### Testing Locally

To avoid the need to upload your Lambda function to AWS every time you make a change, you can test your Lambda function locally using the `AWS SAM` runtime interface client.

1. Install the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html).
2. Run `npm run test:viewer_request` to build the lambda and run it locally with the `viewer-request` event.

You can also run lambda handler using `viewer-response`/`origin-request`/`origin-response` events by running respective [commands](#commands).

Additionally you can change the configuration of lambda providing additional parameters to `template.yaml` or by modifying template event files in `lambda` folder.

### Commands

The following commands are available in the starter kit:

- `npm run build` - Builds the TypeScript files in the `src/` directory creating `dist/handler.js` (ignores `src/examples`).
- `npm run build:lambda` - Builds the Lambda function and creates a `dist/handler.zip` file.
- `npm run test:viewer_request` - Runs the Lambda function locally with the `lambda/viewer-request.json` event.
- `npm run test:viewer_response` - Runs the Lambda function locally with the `lambda/viewer-response.json` event.
- `npm run test:origin_request` - Runs the Lambda function locally with the `lambda/origin-request.json` event.
- `npm run test:origin_response` - Runs the Lambda function locally with the `lambda/origin-response.json` event.
- `npm run clean` - Removes the `dist/` directory.


## Additional Resources and Concepts

### External Data Fetching & Caching

SDK configuration and collected data is stored in-memory in the Lambda function. In some cases, when the data is too large, it may cause the Lambda function to break. We address this issue by giving the developers option to cache the data more efficiently by using AWS services like `S3`, `DynamoDB`, or `CloudFront`.

You can find basic examples of caching SDK configuration in `src/examples/configurationCache.ts` and caching SDK stored data in `src/examples/dataCache.ts`. These basic examples store data in AWS Lambda cache for more details on working with AWS service reference [official AWS documentation](https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/).

> Note: Additional caching mechanisms may be available depending on your CloudFront distribution's configuration.

### Identity Management

Out of the box, our starter kit uses a basic implementation of `KameleoonVisitorCodeManager` found in `src/visitorCodeManager.ts`. This implementation allows for basic Kameleoon Visitor Code reads and writes using lambda handler's `request` and `response` objects making the use of `getVisitorCode` method seamless.
Alternatively you can use your own User ID or other identifier as a visitor code.


### AWS Lambda@Edge and Kameleoon resources

For more information about AWS Lambda@Edge and Kameleoon, see the following resources:

- [Lambda - Lambda@Edge official documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
- [Kameleoon NodeJS SDK documentation](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk)
- [Kameleoon Serverless edge compute starter kits](https://developers.kameleoon.com/feature-management-and-experimentation/serverless-edge-compute-starter-kits)

