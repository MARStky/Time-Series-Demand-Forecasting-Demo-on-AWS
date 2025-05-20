"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { DataPoint } from "@/lib/types"

interface DataTableProps {
  historicalData: DataPoint[]
  forecastData: DataPoint[]
  selectedCategory: string | null
}

export function DataTable({ historicalData, forecastData, selectedCategory }: DataTableProps) {
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

  if (combinedData.length === 0) {
    return (
      <div className="text-center p-8 border rounded-md">
        <p className="text-muted-foreground">
          {selectedCategory ? `No data available for category: ${selectedCategory}` : "No data available"}
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {!selectedCategory && <TableHead>Category</TableHead>}
              <TableHead className="text-right">Historical</TableHead>
              <TableHead className="text-right">Forecast</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {combinedData.map((point, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {point.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </TableCell>
                {!selectedCategory && <TableCell>{point.category || "N/A"}</TableCell>}
                <TableCell className="text-right">
                  {point.actual !== null ? point.actual.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {point.forecast !== null ? point.forecast.toLocaleString() : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
