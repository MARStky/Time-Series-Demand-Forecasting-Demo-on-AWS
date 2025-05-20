export interface DataPoint {
  date: string
  actual: number | null
  forecast: number | null
  category?: string
}

export interface CategoryData {
  name: string
  color: string
  data: DataPoint[]
}
