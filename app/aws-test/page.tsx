"use client"

import { useState } from "react"

export default function AwsTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-aws")
      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  // Environment variables that are safe to display (no secrets)
  const envInfo = {
    "Next.js Environment": process.env.NODE_ENV,
    "Vercel Environment": process.env.NEXT_PUBLIC_VERCEL_ENV,
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AWS Connection Test</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Client Environment</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(envInfo, null, 2)}</pre>
      </div>

      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test AWS Connection"}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Test Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
