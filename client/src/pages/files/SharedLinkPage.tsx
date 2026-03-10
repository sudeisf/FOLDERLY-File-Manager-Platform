import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { apiClient } from "@/api/http"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { File, Clock, Download } from "lucide-react"
import { bytesToLabel } from "@/features/file-manager/utils"
import { Button } from "@/components/ui/button"

type SharedFolderData = {
  folder: {
    id: string
    name: string
  }
  files: Array<{
    id: string
    name: string
    size: number
    createdAt: string
    url: string
  }>
  expiresAt: string
}

export default function SharedLinkPage() {
  const { uuid } = useParams<{ uuid: string }>()
  const [data, setData] = useState<SharedFolderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSharedData = async () => {
      if (!uuid) {
        setError("Invalid share link")
        setLoading(false)
        return
      }

      try {
        const response = await apiClient.get<SharedFolderData>(`/api/share/${uuid}`)
        setData(response.data)
      } catch (err) {
        console.error("Failed to fetch shared data:", err)
        setError("This share link is invalid or has expired")
      } finally {
        setLoading(false)
      }
    }

    fetchSharedData()
  }, [uuid])

  const handleDownload = async (fileUrl: string, fileName: string) => {
    try {
      const response = await apiClient.get(fileUrl, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">Loading shared folder...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const isExpired = new Date(data.expiresAt) < new Date()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <File className="h-5 w-5" />
                {data.folder.name}
              </CardTitle>
              {isExpired && (
                <span className="text-sm text-red-500">Expired</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {isExpired
                ? `Expired on ${new Date(data.expiresAt).toLocaleDateString()}`
                : `Expires on ${new Date(data.expiresAt).toLocaleDateString()}`}
            </p>
          </CardHeader>
          <CardContent>
            {data.files.length === 0 ? (
              <p className="text-muted-foreground">This folder is empty</p>
            ) : (
              <div className="space-y-2">
                {data.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <File className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {bytesToLabel(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(file.url, file.name)}
                      disabled={isExpired}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
