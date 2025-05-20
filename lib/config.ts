interface AppConfig {
  dataBucket: string
  sageMakerRoleArn: string
  region: string
  environment: string
}

// Default configuration that works in Amplify
const defaultConfig: AppConfig = {
  dataBucket: process.env.DATA_BUCKET || "retail-forecasting-data",
  sageMakerRoleArn: process.env.SAGEMAKER_ROLE_ARN || "",
  region: process.env.AWS_REGION || "us-east-1",
  environment: process.env.ENVIRONMENT || "development",
}

/**
 * Gets application configuration from environment variables
 */
export async function getConfig(): Promise<AppConfig> {
  // In development or production, use environment variables
  return defaultConfig
}
