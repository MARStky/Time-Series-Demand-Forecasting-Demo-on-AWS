"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, Filter } from "lucide-react"
import { DEFAULT_CATEGORIES } from "@/lib/forecast-utils"
import { cn } from "@/lib/utils"

interface CategorySelectorProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

export function CategorySelector({ selectedCategory, onSelectCategory }: CategorySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center">
          <Filter className="h-4 w-4 mr-2" />
          Product Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(null)}
            className={cn(
              "h-8 text-xs",
              selectedCategory === null ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100",
            )}
          >
            {selectedCategory === null && <Check className="h-3 w-3 mr-1" />}
            All Categories
          </Button>

          {DEFAULT_CATEGORIES.map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectCategory(category.name)}
              className={cn(
                "h-8 text-xs",
                selectedCategory === category.name
                  ? `bg-[${category.color}] hover:bg-[${category.color}]/90`
                  : "hover:bg-gray-100",
              )}
              style={{
                backgroundColor: selectedCategory === category.name ? category.color : undefined,
                borderColor: selectedCategory !== category.name ? category.color : undefined,
                color: selectedCategory === category.name ? "white" : undefined,
              }}
            >
              {selectedCategory === category.name && <Check className="h-3 w-3 mr-1" />}
              {category.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
