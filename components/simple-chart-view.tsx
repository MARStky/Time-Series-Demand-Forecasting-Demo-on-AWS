"use client"

import { useEffect, useRef } from "react"
import type { DataPoint } from "@/lib/types"
import { DEFAULT_CATEGORIES } from "@/lib/forecast-utils"

interface SimpleChartViewProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
  selectedCategory: string | null
}

export function SimpleChartView({ historicalData, forecastData, selectedCategory }: SimpleChartViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Filter data by category if selected
    const filteredHistoricalData = selectedCategory
      ? historicalData.filter((point) => point.category === selectedCategory)
      : historicalData

    const filteredForecastData = selectedCategory
      ? forecastData.filter((point) => point.category === selectedCategory)
      : forecastData

    // Add this console log
    console.log("SimpleChartView rendering with:", {
      historicalPoints: filteredHistoricalData.length,
      forecastPoints: filteredForecastData.length,
      selectedCategory,
    })

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Prepare data
    const combinedData = [
      ...filteredHistoricalData.map((point) => ({
        date: new Date(point.date),
        value: point.actual,
        type: "historical",
        category: point.category,
      })),
      ...filteredForecastData.map((point) => ({
        date: new Date(point.date),
        value: point.forecast,
        type: "forecast",
        category: point.category,
      })),
    ].filter((point) => !isNaN(point.date.getTime()) && point.value !== null)

    if (combinedData.length === 0) {
      drawNoDataMessage(ctx, canvas.width, canvas.height, selectedCategory)
      return
    }

    // Sort by date
    combinedData.sort((a, b) => a.date.getTime() - b.date.getTime())

    // Find min and max values
    const values = combinedData.map((point) => point.value as number)
    const minValue = Math.min(...values) * 0.9
    const maxValue = Math.max(...values) * 1.1

    // Set up chart dimensions
    const padding = 40
    const chartWidth = canvas.width - padding * 2
    const chartHeight = canvas.height - padding * 2

    // Draw axes
    ctx.beginPath()
    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Get colors for selected category
    let historicalColor = "rgba(14, 165, 233, 1)" // Solid blue
    let forecastColor = "rgba(249, 115, 22, 1)" // Solid orange

    if (selectedCategory) {
      const categoryInfo = DEFAULT_CATEGORIES.find((c) => c.name === selectedCategory)
      if (categoryInfo) {
        const color = categoryInfo.color

        // For historical data: use solid color
        historicalColor = color

        // For forecast data: use a complementary or contrasting color
        switch (categoryInfo.name) {
          case "Electronics":
            forecastColor = "#9333ea" // Purple for Electronics forecast
            break
          case "Clothing":
            forecastColor = "#0891b2" // Cyan for Clothing forecast
            break
          case "Home & Kitchen":
            forecastColor = "#7c3aed" // Violet for Home & Kitchen forecast
            break
          case "Toys & Games":
            forecastColor = "#0284c7" // Sky blue for Toys & Games forecast
            break
          case "Beauty":
            forecastColor = "#ea580c" // Orange for Beauty forecast
            break
          default:
            forecastColor = "#f97316" // Default orange
        }
      }
    }

    // Draw bars
    const barWidth = (chartWidth / combinedData.length) * 0.8
    const barSpacing = (chartWidth / combinedData.length) * 0.2

    combinedData.forEach((point, index) => {
      const x = padding + index * (barWidth + barSpacing)
      const valueRange = maxValue - minValue
      const barHeight = (((point.value as number) - minValue) / valueRange) * chartHeight
      const y = canvas.height - padding - barHeight

      // Set fill color based on data type
      ctx.fillStyle = point.type === "historical" ? historicalColor : forecastColor

      // Draw the bar
      ctx.fillRect(x, y, barWidth, barHeight)

      // Add pattern to forecast bars
      if (point.type === "forecast") {
        // Add a pattern or texture to forecast bars
        ctx.strokeStyle = "white"
        ctx.lineWidth = 1

        // Draw diagonal lines for forecast bars
        for (let i = 0; i < barHeight; i += 5) {
          ctx.beginPath()
          ctx.moveTo(x, y + i)
          ctx.lineTo(x + barWidth, y + i)
          ctx.stroke()
        }
      }
    })

    // Draw legend
    drawLegend(ctx, canvas.width, padding, selectedCategory, historicalColor, forecastColor)

    // Draw category label if selected
    if (selectedCategory) {
      ctx.fillStyle = "#333"
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(`Category: ${selectedCategory}`, canvas.width / 2, padding / 2)
    }
  }, [historicalData, forecastData, selectedCategory])

  function drawNoDataMessage(ctx: CanvasRenderingContext2D, width: number, height: number, category: string | null) {
    ctx.fillStyle = "#666"
    ctx.font = "14px Arial"
    ctx.textAlign = "center"
    if (category) {
      ctx.fillText(`No data available for category: ${category}`, width / 2, height / 2)
    } else {
      ctx.fillText("No data available to display", width / 2, height / 2)
    }
  }

  function drawLegend(
    ctx: CanvasRenderingContext2D,
    width: number,
    padding: number,
    category: string | null,
    historicalColor: string,
    forecastColor: string,
  ) {
    const legendX = width - padding - 150
    const legendY = padding

    // Historical
    ctx.fillStyle = historicalColor
    ctx.fillRect(legendX, legendY, 20, 10)
    ctx.fillStyle = "#333"
    ctx.font = "12px Arial"
    ctx.fillText("Historical", legendX + 25, legendY + 9)

    // Forecast
    ctx.fillStyle = forecastColor
    ctx.fillRect(legendX, legendY + 20, 20, 10)

    // Add pattern to forecast legend
    ctx.strokeStyle = "white"
    ctx.lineWidth = 1
    for (let i = 0; i < 10; i += 5) {
      ctx.beginPath()
      ctx.moveTo(legendX, legendY + 20 + i)
      ctx.lineTo(legendX + 20, legendY + 20 + i)
      ctx.stroke()
    }

    ctx.fillStyle = "#333"
    ctx.fillText("Forecast", legendX + 25, legendY + 29)
  }

  return (
    <div className="w-full aspect-[4/3] sm:aspect-[16/9] border rounded-md bg-white">
      <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
    </div>
  )
}
