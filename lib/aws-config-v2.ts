import AWS from "aws-sdk"

export const getS3Client = () => {
  try {
    console.log("Initializing S3 client with region:", process.env.AWS_REGION)

    AWS.config.update({
      region: process.env.AWS_REGION || "us-east-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      maxRetries: 3,
    })

    return new AWS.S3()
  } catch (error) {
    console.error("Error initializing S3 client:", error)
    throw error
  }
}

// Similar updates for other clients...
