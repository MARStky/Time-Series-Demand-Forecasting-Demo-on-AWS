import { NextResponse } from "next/server"
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3"

export async function GET() {
  try {
    console.log("Testing AWS connectivity...")

    // Log environment variables (without exposing secrets)
    console.log("Environment check:")
    console.log("- AWS_REGION:", process.env.AWS_REGION)
    console.log("- DATA_BUCKET:", process.env.DATA_BUCKET)
    console.log("- Has AWS_ACCESS_KEY_ID:", !!process.env.AWS_ACCESS_KEY_ID)
    console.log("- Has AWS_SECRET_ACCESS_KEY:", !!process.env.AWS_SECRET_ACCESS_KEY)

    // Add more detailed logging
    if (process.env.AWS_ACCESS_KEY_ID) {
      console.log("- AWS_ACCESS_KEY_ID starts with:", process.env.AWS_ACCESS_KEY_ID.substring(0, 4))
      console.log("- AWS_ACCESS_KEY_ID length:", process.env.AWS_ACCESS_KEY_ID.length)
    }

    if (process.env.AWS_SECRET_ACCESS_KEY) {
      console.log("- AWS_SECRET_ACCESS_KEY length:", process.env.AWS_SECRET_ACCESS_KEY.length)
    }

    // Test S3 connectivity with more detailed error handling
    try {
      const s3Client = new S3Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
        // Add retry configuration
        maxAttempts: 3,
      })

      console.log("S3 client created, attempting to list buckets...")
      const response = await s3Client.send(new ListBucketsCommand({}))
      console.log("S3 ListBuckets successful!")

      return NextResponse.json({
        success: true,
        message: "AWS connection successful",
        buckets: response.Buckets?.map((bucket) => bucket.Name) || [],
        region: process.env.AWS_REGION,
        dataBucket: process.env.DATA_BUCKET,
        serverTime: new Date().toISOString(),
      })
    } catch (s3Error) {
      console.error("S3 operation failed:", s3Error)

      // Try with AWS SDK v2 as fallback
      try {
        console.log("Trying with AWS SDK v2...")
        // This will only work if aws-sdk is installed
        const AWS = require("aws-sdk")

        AWS.config.update({
          region: process.env.AWS_REGION || "us-east-1",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        })

        const s3 = new AWS.S3()
        const v2Response = await s3.listBuckets().promise()
        console.log("AWS SDK v2 ListBuckets successful!")

        return NextResponse.json({
          success: true,
          message: "AWS connection successful (using SDK v2)",
          buckets: v2Response.Buckets?.map((bucket: any) => bucket.Name) || [],
          region: process.env.AWS_REGION,
          dataBucket: process.env.DATA_BUCKET,
          serverTime: new Date().toISOString(),
        })
      } catch (v2Error) {
        console.error("AWS SDK v2 operation also failed:", v2Error)
        throw s3Error // Throw the original error
      }
    }
  } catch (error) {
    console.error("AWS connectivity test failed:", error)

    // Extract more detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : "Unknown error",
      name: error instanceof Error ? error.name : "Unknown",
      stack: error instanceof Error ? error.stack : undefined,
      // Try to extract AWS-specific error details
      code: (error as any)?.Code || (error as any)?.code,
      requestId: (error as any)?.RequestId || (error as any)?.requestId,
      time: (error as any)?.Time || (error as any)?.time,
    }

    return NextResponse.json(
      {
        success: false,
        error: errorDetails.message,
        errorType: errorDetails.name,
        errorDetails,
        region: process.env.AWS_REGION,
        dataBucket: process.env.DATA_BUCKET,
        serverTime: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
