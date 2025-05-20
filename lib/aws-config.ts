import { S3Client } from "@aws-sdk/client-s3"
import { SageMakerClient } from "@aws-sdk/client-sagemaker"
import { SSMClient } from "@aws-sdk/client-ssm"

// Create clients with debug logging

export const getSageMakerClient = () => {
  try {
    console.log("Initializing SageMaker client with region:", process.env.AWS_REGION)

    return new SageMakerClient({
      region: process.env.AWS_REGION || "us-east-1",
      // Add credentials explicitly
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })
  } catch (error) {
    console.error("Error initializing SageMaker client:", error)
    throw error
  }
}

export const getS3Client = () => {
  try {
    console.log("Initializing S3 client with region:", process.env.AWS_REGION)
    console.log("Using bucket:", process.env.DATA_BUCKET)

    return new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      // Add credentials explicitly
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    })
  } catch (error) {
    console.error("Error initializing S3 client:", error)
    throw error
  }
}

export const getSSMClient = () => {
  try {
    return new SSMClient({
      region: process.env.AWS_REGION || "us-east-1",
    })
  } catch (error) {
    console.error("Error initializing SSM client:", error)
    throw error
  }
}

// Similar updates for other clients...
