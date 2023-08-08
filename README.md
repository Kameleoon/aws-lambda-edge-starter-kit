# Kameleoon AWS Lambda@Edge Starter Kit

> The Kameleoon AWS Lambda@Edge Starter Kit demonstrates Kameleoon experimentation and feature flags on Amazon Web Services (AWS) [Lambda@Edge](https://aws.amazon.com/lambda/edge).

This repository is home to the Kameleoon starter kit for AWS Lambda@Edge. Kameleoon is a powerful experimentation and personalization platform for product teams that enables you to make insightful discoveries by testing the features on your roadmap. Discover more at https://kameleoon.com, or see the [developer documentation](https://developers.kameleoon.com).

## Getting started

This starter kit provides quickstart instructions for developers using the [Kameleoon NodeJS SDK](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk) with AWS Lambda@Edge.

### Prerequisites

Make sure you have the following requirements before you get started:

1. A Kameleoon user account. Visit [kameleoon.com](https://www.kameleoon.com/) to learn more.
1. The [Kameleoon NodeJS SDK](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk) installed with some feature flags or experiments already configured.
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

> Note: To run the Kameleoon NodeJS SDK on the edge, you need to provide an `externalClientConfiguration`. This can be accomplished either by referencing a local file or using the supplied `getClientConfiguration` helper function to retrieve your Kameleoon project's client configuration. The `externalClientConfiguration` is a JSON file that encapsulates all of your feature flags and experiments. The Kameleoon NodeJS SDK needs this data to implement and monitor your feature flag deployments and experiments.

### Initialization

In the `src` folder of the starter kit, you'll find three JavaScript files:

- `src/viewer_request.js` contains sample code that fetches and caches the client configuration, initializes the Kameleoon SDK with this configuration, and modifies the outgoing request by adding the User ID cookie and feature flag value to the header.
- `src/viewer_response.js` file contains sample code that fetches the User ID cookie from the incoming request and attaches the cookie to the outgoing response.
- `src/helpers.js` contains some additional platform-specific code that demonstrates common features of the Kameleoon SDK.

You'll use these files to initialize your environment:

1. Navigate to `src/viewer_request.js` and update the `YOUR_SITE_CODE` and `YOUR_FEATURE_KEY` values with your [Kameleoon credentials](https://help.kameleoon.com/api-credentials).
1. Review or adjust the feature flags or experiments you've configured with the Kameleoon NodeJS SDK, and hook into the lifecycle events by inserting your desired logic into the switch-case statements in `src/viewer_request.js` and `src/viewer_response.js`.  For example, you can change headers, cookies, and more.
1. Run `npm run build:viewer_request` to use Rollup to bundle the source code of `src/viewer_request.js` into a `dist/dist.zip` file that you'll import into Lambda. The `dist.zip` file should be roughly **~49kb** in size for `src/viewer_request.js` assuming you have not made any additional changes.
1. Upload the request `dist/dist.zip` file into Lambda using one of these options:
    - **GUI**: Go to your AWS Lambda console, select the function associated with your Lambda environment, and import the `dist.zip` file. After you upload it, there should now be a minified `index.js` file located inside of your Lambda function's **Code Source** section.
    - **CLI**: You can use the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) to update your AWS Lambda function programmatically. Example command:
       ```
       aws lambda update-function-code --function-name my-aws-lambda-at-edge-function --zip-file fileb://dist.zip
       ```
1. Run `npm run build:viewer_response` to do the same for `src/viewer_response.js`. After running this command, the `dist/dist.zip` file should be roughly **~1.7kb** in size for `src/viewer_response.js`. This command overwrites the previous `dist/dist.zip` file. Don't run the command until after you've uploaded the request file.
1. Upload the response `dist/dist.zip` file into Lambda.
 
    > **Lambda Layers**: If you need additional libraries, custom runtimes, or configuration files to use alongside your Lambda function, consider using [Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/invocation-layers.html).

1. Provision the function with [Lambda@Edge permissions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-permissions.html) and [associate the function](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/associate-function.html) with your CloudFront distribution. Set the CloudFront trigger for this function to be `Viewer Request`.

    > Note: CloudFront triggers are associated with only one specific version of your Lambda function. Remember to update the CloudFront trigger assignment as needed when pushing new versions of your Lambda function. For example, you may need one function that handles receiving viewer requests (viewer request trigger) and one function that handles returning a response to the viewer (viewer response trigger).

1. Test your Lambda@Edge function. It should return a simple home page with the results of your feature flag test and User ID cookie.

   > You can find details on how the starter kit works in the CloudWatch console under **Logs > Log groups > /aws/lambda/<YOUR_LAMBDA_NAME>**. Click your Lambda's log group to follow the entire process of reading the headers, assigning the User ID, fetching the client configuration, and getting a variation key for a particular User ID using the Kameleoon NodeJS SDK.

1. Adjust your lambda's configuration as needed. For example, you may need to increase your function's memory, storage, and timeout threshold to accommodate your needs.

You can now use Kameleoon's feature flagging and experimentation as desired. You can modify the cookies and headers based on experimentation results, add hooks to the **Origin Request** and **Origin Response** CloudFront triggers to perform origin redirects or dynamic asset manipulation, or add more services to the pipeline including your own logging systems, databases, CDN origins, and more. Keep in mind that Lambda@Edge has some limitations, which you can familiarize yourself with in the [Edge Functions Restrictions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/edge-functions-restrictions.html) article.

## Additional Resources and Concepts

### External Data Fetching & Caching

This starter kit uses standard ES7 async and await fetch methods to handle external data fetching. After fetching the Kameleoon client configuration, the SDK caches the client configuration as a JSON object in-memory. However, very large client configurations may cause the method presented in this starter kit to break. If you experience issues with large datafiles breaking in-memory Lambda caching, consider one of the alternative methods of caching with Lambda@Edge outlined in this [external data](https://aws.amazon.com/blogs/networking-and-content-delivery/leveraging-external-data-in-lambdaedge/) article.

Alternative methods for in-memory data caching include using a persistent connection to your client configuration JSON or caching using CloudFront.

For even faster data fetching, consider storing your data file in an S3 bucket that you own and refactor the client configuration fetching mechanism to use Lambda's built-in AWS SDK library to fetch from your S3 bucket instead.

> Note: Additional caching mechanisms may be available depending on your CloudFront distribution's configuration.

### Identity Management

Out of the box, Kameleoon's SDKs require a user-provided identifier at runtime to drive experimentation and feature flag results. If the client doesn't provide the User ID directly, this starter kit generates a unique ID as a fallback, stores it into the cookie, and re-uses it to ensure decisions are consistent throughout the user session. Alternatively, you can use an existing unique identifier available within your application and pass it in as the value for the `KAMELEOON_USER_ID` cookie.

### AWS Lambda@Edge and Kameleoon resources

For more information about AWS Lambda@Edge and Kameleoon, see the following resources:

- [Lambda - Lambda@Edge official documentation](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront - Lambda@Edge documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-at-the-edge.html)
- [CloudFront - Lambda@Edge Get Started](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-how-it-works.html)
- [Example Lambda Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-examples.html)
- [Kameleoon NodeJS SDK documentation](https://developers.kameleoon.com/feature-management-and-experimentation/web-sdks/nodejs-sdk)
- [Kameleoon Serverless edge compute starter kits](https://developers.kameleoon.com/feature-management-and-experimentation/serverless-edge-compute-starter-kits)
