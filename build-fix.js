// This script helps fix common issues with Amplify deployment
console.log("Running build fixes for Amplify deployment...")

// Check if we're running in Amplify environment
const isAmplify = process.env.AWS_REGION || process.env._HANDLER

if (isAmplify) {
  console.log("Detected Amplify environment, applying fixes...")

  // Set fallback environment variables if not provided
  if (!process.env.DATA_BUCKET) {
    console.log("Setting fallback DATA_BUCKET")
    process.env.DATA_BUCKET = "retail-forecasting-data"
  }

  if (!process.env.SAGEMAKER_ROLE_ARN) {
    console.log("Setting fallback SAGEMAKER_ROLE_ARN")
    process.env.SAGEMAKER_ROLE_ARN = "arn:aws:iam::123456789012:role/SageMakerExecutionRole"
  }

  if (!process.env.ENVIRONMENT) {
    console.log("Setting fallback ENVIRONMENT")
    process.env.ENVIRONMENT = "production"
  }

  console.log("Environment variables set for Amplify deployment")
}

console.log("Build fixes completed")
