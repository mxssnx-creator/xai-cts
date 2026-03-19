"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Play, Pause, Square, Info } from "lucide-react"

interface GlobalEngineStatus {
  running: boolean
  paused: boolean
  status: string
  analysis?: {
    total: number
    withCredentials: number
    inActivePanel: number
    dashboardEnabled: number
  }
  requirements?: {
    message: string
    needed: string[]
  }
}

export function GlobalStatusBanner() {
  const [engineStatus, setEngineStatus] = useState<GlobalEngineStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const response = await fetch("/api/trade-engine/status", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      if (response.ok) {
        const data = await response.json()
        setEngineStatus({
          running: data.running === true || data.running === "true",
          paused: data.paused === true,
          status: data.status,
          analysis: data.analysis,
          requirements: data.requirements,
        })
      }
    } catch (error) {
      console.error("Failed to load engine status:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return null
  }

  // Don't show banner if engine is running and not paused
  if (engineStatus?.running && !engineStatus?.paused) {
    return null
  }

  const getStatusColor = () => {
    if (!engineStatus?.running) return "bg-red-50 border-red-200"
    if (engineStatus?.paused) return "bg-yellow-50 border-yellow-200"
    return "bg-gray-50 border-gray-200"
  }

  const getStatusIcon = () => {
    if (!engineStatus?.running) return <Square className="h-4 w-4 text-red-600" />
    if (engineStatus?.paused) return <Pause className="h-4 w-4 text-yellow-600" />
    return <Play className="h-4 w-4 text-green-600" />
  }

  const getStatusText = () => {
    if (!engineStatus?.running) return "Trade Engine Stopped"
    if (engineStatus?.paused) return "Trade Engine Paused"
    return "Trade Engine Running"
  }

  const getStatusBadge = () => {
    if (!engineStatus?.running) {
      return <Badge variant="destructive">Stopped</Badge>
    }
    if (engineStatus?.paused) {
      return <Badge className="bg-yellow-500">Paused</Badge>
    }
    return <Badge className="bg-green-500">Running</Badge>
  }

  return (
    <Card className={`${getStatusColor()} border-l-4 border-l-red-500`}>
      <CardContent className="py-3 px-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getStatusIcon()}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm">{getStatusText()}</span>
              {getStatusBadge()}
            </div>
            
            {/* Show requirements if engine is stopped */}
            {!engineStatus?.running && engineStatus?.requirements && (
              <div className="text-xs text-muted-foreground mt-1">
                {engineStatus.requirements.needed && engineStatus.requirements.needed.length > 0 ? (
                  <div className="space-y-1">
                    <p className="font-medium text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Engine cannot start because:
                    </p>
                    <ul className="list-disc list-inside ml-1">
                      {engineStatus.requirements.needed.map((need, idx) => (
                        <li key={idx}>{need}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    {engineStatus.requirements.message || "No connections eligible for processing"}
                  </p>
                )}
              </div>
            )}
            
            {/* Show analysis info when paused */}
            {engineStatus?.paused && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                All engines are paused. Resume to continue processing.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
