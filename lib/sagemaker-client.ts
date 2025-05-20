import {
  CreateAutoMLJobCommand,
  DescribeAutoMLJobCommand,
  ListCandidatesForAutoMLJobCommand,
} from "@aws-sdk/client-sagemaker"
import { getSageMakerClient } from "./aws-config"
import { uploadDatasetToS3 } from "./s3-client"
import { getConfig } from "./config"
import type { DataPoint } from "./types"

const JOB_PREFIX = "retail-forecast-"

/**
 * Creates a SageMaker AutoML job for time series forecasting
 */
export async function createForecastingJob(historicalData: DataPoint[], targetColumn = "value") {
  try {
    // 1. Get configuration
    const config = await getConfig()

    // 2. Upload data to S3
    const datasetPath = await uploadDatasetToS3(historicalData)

    // 3. Create a unique job name
    const jobName = `${JOB_PREFIX}${Date.now()}`

    // 4. Get SageMaker client
    const sageMakerClient = getSageMakerClient()

    // 5. Create AutoML job
    const response = await sageMakerClient.send(
      new CreateAutoMLJobCommand({
        AutoMLJobName: jobName,
        ProblemType: "Forecasting",
        AutoMLJobConfig: {
          CompletionCriteria: {
            MaxCandidates: 10,
            MaxRuntimePerTrainingJobInSeconds: 3600,
          },
        },
        InputDataConfig: [
          {
            DataSource: {
              S3DataSource: {
                S3DataType: "S3Prefix",
                S3Uri: datasetPath,
              },
            },
            TargetAttributeName: targetColumn,
          },
        ],
        OutputDataConfig: {
          S3OutputPath: `s3://${config.dataBucket}/output/`,
        },
        RoleArn: config.sageMakerRoleArn,
      }),
    )

    return {
      jobName,
      jobArn: response.AutoMLJobArn,
    }
  } catch (error) {
    console.error("Error creating forecasting job:", error)
    throw error
  }
}

/**
 * Gets the status of an AutoML job
 */
export async function getJobStatus(jobName: string) {
  try {
    const sageMakerClient = getSageMakerClient()

    const response = await sageMakerClient.send(
      new DescribeAutoMLJobCommand({
        AutoMLJobName: jobName,
      }),
    )

    // Get best candidate if job is complete
    let bestCandidate = null
    if (response.AutoMLJobStatus === "Completed") {
      const candidatesResponse = await sageMakerClient.send(
        new ListCandidatesForAutoMLJobCommand({
          AutoMLJobName: jobName,
        }),
      )

      bestCandidate = candidatesResponse.Candidates?.[0]
    }

    return {
      jobName,
      status: response.AutoMLJobStatus,
      bestCandidate,
      endTime: response.EndTime,
      failureReason: response.FailureReason,
    }
  } catch (error) {
    console.error("Error getting job status:", error)
    throw error
  }
}

// Simplified mock implementation for Amplify deployment
export async function deployBestModel(jobName: string) {
  try {
    return {
      modelName: `${jobName}-model`,
      endpointConfigName: `${jobName}-config`,
      endpointName: `${jobName}-endpoint`,
    }
  } catch (error) {
    console.error("Error deploying best model:", error)
    throw error
  }
}

// Simplified mock implementation for Amplify deployment
export async function getEndpointStatus(endpointName: string) {
  try {
    return {
      endpointName,
      status: "InService",
      creationTime: new Date(),
      lastModifiedTime: new Date(),
    }
  } catch (error) {
    console.error("Error getting endpoint status:", error)
    throw error
  }
}

// Simplified mock implementation for Amplify deployment
export async function getForecastFromEndpoint(
  endpointName: string,
  historicalData: DataPoint[],
  forecastHorizon: number,
) {
  try {
    // Generate mock forecast data
    const lastDate = new Date(historicalData[historicalData.length - 1].date)
    const forecastData: DataPoint[] = []

    for (let i = 0; i < forecastHorizon; i++) {
      const forecastDate = new Date(lastDate)
      forecastDate.setMonth(lastDate.getMonth() + i + 1)

      forecastData.push({
        date: forecastDate.toISOString(),
        actual: null,
        forecast: Math.round(1000 + Math.random() * 500),
      })
    }

    return forecastData
  } catch (error) {
    console.error("Error getting forecast from endpoint:", error)
    throw error
  }
}

// Simplified mock implementation for Amplify deployment
export async function cleanupSageMakerResources(endpointName: string, endpointConfigName: string, modelName: string) {
  try {
    return {
      success: true,
      message: "Resources cleaned up successfully",
    }
  } catch (error) {
    console.error("Error cleaning up SageMaker resources:", error)
    throw error
  }
}
