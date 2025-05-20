"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { DataPoint } from "@/lib/types"
import { DEFAULT_CATEGORIES } from "@/lib/forecast-utils"

// Import chart components directly to avoid any potential issues
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Bar } from "react-chartjs-2"

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface DemandForecastChartProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
  selectedCategory: string | null
}

export function DemandForecastChart({ historicalData, forecastData, selectedCategory }: DemandForecastChartProps) {
  const [chartData, setChartData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [fallbackView, setFallbackView] = useState(false)

  // Add this near the top of the component
  useEffect(() => {
    console.log("Chart received new data:", {
      historicalDataLength: historicalData?.length,
      forecastDataLength: forecastData?.length,
      selectedCategory,
    })
  }, [historicalData, forecastData, selectedCategory])

  useEffect(() => {
    try {
      // Validate data
      if (!historicalData || historicalData.length === 0) {
        setError("No historical data available")
        return
      }

      console.log("Chart component received data:", {
        historicalDataLength: historicalData.length,
        forecastDataLength: forecastData.length,
        forecastPeriods: forecastData.length,
      })

      // Filter data by category if selected
      const filteredHistoricalData = selectedCategory
        ? historicalData.filter((point) => point.category === selectedCategory)
        : historicalData

      const filteredForecastData = selectedCategory
        ? forecastData.filter((point) => point.category === selectedCategory)
        : forecastData

      if (filteredHistoricalData.length === 0) {
        setError(`No historical data available for category: ${selectedCategory}`)
        return
      }

      // Prepare data for Chart.js
      const labels: string[] = []
      const actualValues: (number | null)[] = []
      const forecastValues: (number | null)[] = []

      // Process historical data
      filteredHistoricalData.forEach((point) => {
        if (point && point.date) {
          try {
            const date = new Date(point.date)
            if (!isNaN(date.getTime())) {
              labels.push(formatDate(date))
              actualValues.push(point.actual)
              forecastValues.push(null)
            }
          } catch (e) {
            console.error("Error processing historical data point:", point, e)
          }
        }
      })

      // Process forecast data - now with dynamic length based on testPeriods
      filteredForecastData.forEach((point) => {
        if (point && point.date) {
          try {
            const date = new Date(point.date)
            if (!isNaN(date.getTime())) {
              labels.push(formatDate(date))
              actualValues.push(null)
              forecastValues.push(point.forecast)
            }
          } catch (e) {
            console.error("Error processing forecast data point:", point, e)
          }
        }
      })

      if (labels.length === 0) {
        setError("No valid data points to display")
        return
      }

      // Get colors for selected category
      let historicalColor = "rgba(14, 165, 233, 0.8)" // Solid blue
      let forecastColor = "rgba(249, 115, 22, 0.8)" // Solid orange
      let historicalBorderColor = "rgb(14, 165, 233)"
      let forecastBorderColor = "rgb(249, 115, 22)"

      // Define patterns for better distinction
      const historicalPattern = {
        color: "rgba(14, 165, 233, 0.8)",
        pattern: "solid",
      }

      const forecastPattern = {
        color: "rgba(249, 115, 22, 0.8)",
        pattern: "stripe",
      }

      if (selectedCategory) {
        const categoryInfo = DEFAULT_CATEGORIES.find((c) => c.name === selectedCategory)
        if (categoryInfo) {
          const color = categoryInfo.color

          // For historical data: use solid color
          historicalColor = color
          historicalBorderColor = color

          // For forecast data: use a complementary or contrasting color
          // This creates a more distinct visual difference
          switch (categoryInfo.name) {
            case "Electronics":
              forecastColor = "#9333ea" // Purple for Electronics forecast
              forecastBorderColor = "#9333ea"
              break
            case "Clothing":
              forecastColor = "#0891b2" // Cyan for Clothing forecast
              forecastBorderColor = "#0891b2"
              break
            case "Home & Kitchen":
              forecastColor = "#7c3aed" // Violet for Home & Kitchen forecast
              forecastBorderColor = "#7c3aed"
              break
            case "Toys & Games":
              forecastColor = "#0284c7" // Sky blue for Toys & Games forecast
              forecastBorderColor = "#0284c7"
              break
            case "Beauty":
              forecastColor = "#ea580c" // Orange for Beauty forecast
              forecastBorderColor = "#ea580c"
              break
            default:
              forecastColor = "#f97316" // Default orange
              forecastBorderColor = "#f97316"
          }
        }
      }

      // Create Chart.js data object
      const data = {
        labels,
        datasets: [
          {
            label: "Historical",
            data: actualValues,
            backgroundColor: historicalColor,
            borderColor: historicalBorderColor,
            borderWidth: 1,
            // Add a pattern or texture to make it more distinct
            hoverBackgroundColor: historicalBorderColor,
          },
          {
            label: "Forecast",
            data: forecastValues,
            backgroundColor: forecastColor,
            borderColor: forecastBorderColor,
            borderWidth: 1,
            // Add a pattern or texture to make it more distinct
            hoverBackgroundColor: forecastBorderColor,
            // Add a dashed border to forecast bars
            borderDash: [5, 5],
          },
        ],
      }

      console.log(`Chart prepared with ${labels.length} total data points (${forecastData.length} forecast points)`)
      setChartData(data)
      setError(null)
    } catch (err) {
      console.error("Error preparing chart data:", err)
      setError(`Error preparing chart: ${err instanceof Error ? err.message : "Unknown error"}`)
      setFallbackView(true)
    }
  }, [historicalData, forecastData, selectedCategory])

  // If there's an error, show error message
  if (error) {
    return (
      <Alert variant="destructive" className="w-full">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Visualization Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // If chart data is not ready yet, show loading
  if (!chartData) {
    return (
      <div className="w-full aspect-[4/3] sm:aspect-[16/9] flex items-center justify-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">Preparing visualization...</p>
      </div>
    )
  }

  // If fallback view is enabled, show a simple table
  if (fallbackView) {
    return (
      <FallbackTableView
        historicalData={historicalData}
        forecastData={forecastData}
        selectedCategory={selectedCategory}
      />
    )
  }

  // Render the chart
  return (
    <div className="w-full aspect-[4/3] sm:aspect-[16/9]">
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          animation: {
            duration: 0, // Disable animations to ensure immediate updates
          },
          scales: {
            x: {
              stacked: false,
              title: {
                display: true,
                text: "Month",
              },
            },
            y: {
              stacked: false,
              title: {
                display: true,
                text: "Value",
              },
              beginAtZero: true,
            },
          },
          plugins: {
            legend: {
              position: "top" as const,
              labels: {
                // Add visual indicators to the legend
                usePointStyle: true,
                pointStyle: "rect",
              },
            },
            tooltip: {
              mode: "index" as const,
              intersect: false,
            },
          },
        }}
      />

      {/* Add a visual legend explanation */}
      <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: "rgba(14, 165, 233, 0.8)" }}></div>
          <span>Historical Data</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4" style={{ backgroundColor: "rgba(249, 115, 22, 0.8)" }}></div>
          <span>Forecast Data</span>
        </div>
      </div>
    </div>
  )
}

// Fallback table view in case the chart fails to render
function FallbackTableView({ historicalData, forecastData, selectedCategory }: DemandForecastChartProps) {
  // Filter data by category if selected
  const filteredHistoricalData = selectedCategory
    ? historicalData.filter((point) => point.category === selectedCategory)
    : historicalData

  const filteredForecastData = selectedCategory
    ? forecastData.filter((point) => point.category === selectedCategory)
    : forecastData

  // Combine and sort data
  const combinedData = [
    ...filteredHistoricalData.map((point) => ({
      date: new Date(point.date),
      actual: point.actual,
      forecast: null,
      category: point.category,
    })),
    ...filteredForecastData.map((point) => ({
      date: new Date(point.date),
      actual: null,
      forecast: point.forecast,
      category: point.category,
    })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime())

  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <h3 className="font-medium">
            Demand Forecast Data {selectedCategory ? `(${selectedCategory})` : "(All Categories)"} (Fallback View)
          </h3>
          <p className="text-sm text-muted-foreground">Chart rendering failed. Showing data in table format instead.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Date</th>
                <th className="border p-2 text-left">Category</th>
                <th className="border p-2 text-left">Historical</th>
                <th className="border p-2 text-left">Forecast</th>
              </tr>
            </thead>
            <tbody>
              {combinedData.map((point, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-muted/20" : ""}>
                  <td className="border p-2">{formatDate(point.date)}</td>
                  <td className="border p-2">{point.category || "N/A"}</td>
                  <td className="border p-2">{point.actual !== null ? point.actual : "-"}</td>
                  <td className="border p-2">{point.forecast !== null ? point.forecast : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Simple date formatter
function formatDate(date: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
    }).format(date)
  } catch (e) {
    return date.toISOString().substring(0, 7)
  }
}
