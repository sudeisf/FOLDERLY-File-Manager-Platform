import { useEffect, useState } from "react"
import { Bell, Cloud, Download, Folder, HardDrive, Home, LogOut, Moon, Share2, Star, Sun, Users } from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { io } from "socket.io-client"
import { useQueryClient } from "@tanstack/react-query"

import { useNotificationCountQuery } from "@/api/hooks/useNotifications"
import { useMyProfileQuery } from "@/api/hooks/useProfile"
import { useMyActivityQuery } from "@/api/hooks/useSharedItems"
import { queryKeys } from "@/api/queryKeys"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// Removed PlansDialog import
import ShareWithUsersDialog from "@/components/dialog/ShareWithUsersDialog"
import { useAuth } from "@/context/AuthContext"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { useFileManagerModel } from "@/features/file-manager/use-file-manager-model"
import { bytesToLabel, getFileIcon, getFileKind } from "@/features/file-manager/utils"
import { cn } from "@/lib/utils"
import { useThemeStore } from "@/stores/themeStore"

export default function FileManagerLayout() {
  const model = useFileManagerModel()
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const isProfileRoute = location.pathname === "/protected/profile"
  const isNotificationsRoute = location.pathname === "/protected/notifications"
  const isWideContentRoute = isProfileRoute || isNotificationsRoute
  // Removed isPlansOpen state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  // Activity query - fetches user's recent activities
  const activityQuery = useMyActivityQuery()
  const queryClient = useQueryClient()
  const notificationCountQuery = useNotificationCountQuery()
  const unreadCount = notificationCountQuery.data?.unreadCount ?? 0
  const profileQuery = useMyProfileQuery()
  const profileName = (() => {
    const profile = profileQuery.data
    if (!profile) {
      return "User"
    }

    const fullName = `${profile.firstName || ""} ${profile.lastName || ""}`.trim()
    return fullName || profile.username || "User"
  })()
  const profileInitials = profileName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "U"

  useEffect(() => {
    const baseURL = String(import.meta.env.VITE_API_URL || "")
    const socket = io(baseURL, {
      path: "/socket.io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    socket.on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.count })
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all })
    })

    return () => {
      socket.disconnect()
    }
  }, [queryClient])

  const selectedFilePreviewUrl = (() => {
    if (!model.activeFolder || !model.selectedFile) {
      return null
    }

    const fileUid = model.selectedFile.uid ?? model.selectedFile.id
    if (!fileUid) {
      return null
    }

    const apiBase = String(import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "")
    return `${apiBase}/api/files/view/${encodeURIComponent(model.activeFolder.name)}/${encodeURIComponent(fileUid)}`
  })()

  const selectedMimeType = model.selectedFile?.metadata.mimetype ?? ""
  const isImagePreview = selectedMimeType.startsWith("image/") && Boolean(selectedFilePreviewUrl)
  const isPdfPreview = selectedMimeType === "application/pdf" && Boolean(selectedFilePreviewUrl)

  const handleLogout = async () => {
    await logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-background text-foreground dark:bg-[#18181B]">
      <SidebarProvider className="h-full">
        <div className="flex h-full w-full items-stretch overflow-hidden border border-border bg-card dark:border-slate-700 dark:bg-[#18181B]">
            <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/70 dark:border-slate-700 dark:bg-[#18181B]">
              <SidebarHeader className="px-3 pt-4">
                <div className="flex items-center gap-2 px-2">
                  <div className="grid h-8 w-8 place-content-center rounded-lg bg-blue-600 text-xs font-semibold text-white">
                    <Cloud className="h-5 w-5" />
                  </div>
                  <div className="group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold">FOLDERLY</p>
                  </div>
                </div>
              </SidebarHeader>

              <SidebarContent className="px-2">
                <SidebarGroup>
                  <SidebarGroupLabel>MAIN</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/protected/all-files" className={({ isActive }) => (isActive ? "bg-sidebar-accent" : "")}>
                            <Home />
                            <span>All Files</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/protected/shared" className={({ isActive }) => (isActive ? "bg-sidebar-accent" : "")}>
                            <Users />
                            <span>Shared</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <NavLink to="/protected/starred" className={({ isActive }) => (isActive ? "bg-sidebar-accent" : "")}>
                            <Star />
                            <span>Starred</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                  <SidebarGroupLabel>FOLDER TREE</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {model.isLoading &&
                        Array.from({ length: 4 }).map((_, index) => (
                          <SidebarMenuItem key={`loading-${index}`}>
                            <Skeleton className="h-8 w-full" />
                          </SidebarMenuItem>
                        ))}
                      {!model.isLoading &&
                        model.folders.map((folder) => (
                          <SidebarMenuItem key={folder.id}>
                            <SidebarMenuButton
                              isActive={(model.activeFolder?.id ?? "") === folder.id}
                              onClick={() => model.setSelectedFolderId(folder.id)}
                            >
                              <Folder />
                              <span>{folder.name}</span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="p-3">
                <Card className="border-border bg-card shadow-none group-data-[collapsible=icon]:hidden">
                  <CardHeader className="p-3 pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Storage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 p-3 pt-0">
                    <Progress value={model.usedPercent} className="h-1.5" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{bytesToLabel(model.totalUsed)} used</span>
                      <span>35 MB allowed</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="pt-2 group-data-[collapsible=icon]:pt-0">
                  <Button variant="ghost" size="sm" className="w-full justify-start text-xs group-data-[collapsible=icon]:justify-center" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                  </Button>
                </div>
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="bg-background dark:bg-[#18181B]">
              <div className="flex h-full">
                <section className={cn("flex min-w-0 flex-1 flex-col", !isWideContentRoute && "border-r border-border")}>
                  <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-3 md:px-5 dark:border-slate-700 dark:bg-[#18181B]">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <SidebarTrigger className="md:hidden" />
                      <Input
                        value={model.search}
                        onChange={(event) => model.setSearch(event.target.value)}
                        placeholder="Search files, folders, or people..."
                        className="h-9 w-full max-w-[560px] border-input bg-background/70"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="hidden text-muted-foreground md:inline-flex" onClick={toggleTheme}>
                        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="relative hidden text-muted-foreground md:inline-flex"
                        onClick={() => navigate("/protected/notifications")}
                        aria-label="Go to notifications"
                      >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 ? (
                          <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        ) : null}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => navigate("/protected/profile")}
                        aria-label="Go to profile"
                        title={profileName}
                      >
                        <Avatar className="h-8 w-8 border border-border bg-background">
                          <AvatarImage src={profileQuery.data?.avatarUrl || undefined} alt={profileName} />
                          <AvatarFallback className="text-[11px] font-semibold">{profileInitials}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </div>
                  </div>

                  <Outlet context={model} />
                </section>

                {!isWideContentRoute && <aside className="hidden w-[310px] min-h-0 flex-col bg-card dark:bg-[#18181B] lg:flex">
                  <div className="flex h-16 items-center border-b border-border px-5 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">Details</h2>
                  </div>
                  <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
                    <div className="grid aspect-[4/3] overflow-hidden rounded-xl bg-muted/40 dark:bg-slate-900">
                      {isImagePreview && selectedFilePreviewUrl ? (
                        <img
                          src={selectedFilePreviewUrl}
                          alt={model.selectedFile?.name ?? "Selected file preview"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : isPdfPreview && selectedFilePreviewUrl ? (
                        <iframe
                          src={`${selectedFilePreviewUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`}
                          title={model.selectedFile?.name ?? "PDF preview"}
                          className="h-full w-full"
                        />
                      ) : model.selectedFile ? (
                        (() => {
                          const Icon = getFileIcon(model.selectedFile.metadata.mimetype)
                          return (
                            <div className="grid h-full w-full place-content-center">
                              <Icon className="h-16 w-16 text-blue-600" />
                            </div>
                          )
                        })()
                      ) : (
                        <div className="grid h-full w-full place-content-center">
                          <HardDrive className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate text-base font-semibold">{model.selectedFile?.name ?? "No file selected"}</h3>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={model.downloadSelectedFile}
                          disabled={!model.selectedFile}
                          aria-label="Download selected file"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Last edited 10 mins ago</p>
                    </div>

                    <dl className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="font-semibold">{model.selectedFile ? getFileKind(model.selectedFile.metadata.mimetype) : "-"}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Size</dt>
                        <dd className="font-semibold">{model.selectedFile ? bytesToLabel(model.selectedFile.metadata.size) : "-"}</dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-muted-foreground">Location</dt>
                        <dd className="font-semibold">{model.activeFolder?.name ?? "-"}</dd>
                      </div>
                    </dl>

                    <Button className="w-full bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:text-white" onClick={() => setIsShareDialogOpen(true)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={model.deleteSelectedFile}
                      disabled={!model.selectedFile}
                    >
                      Delete Selected
                    </Button>

                    <div className="pt-1">
                      <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent Activity</h4>

                      {activityQuery.isLoading ? (
                        <div className="space-y-3">
                          {[1,2,3].map((i) => (
                            <div key={i} className="h-10 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                          ))}
                        </div>
                      ) : activityQuery.data && activityQuery.data.length > 0 ? (
                        <div className="space-y-0">
                          {activityQuery.data.map((act, idx) => {
                            const diff = Math.max(0, Date.now() - new Date(act.createdAt).getTime())
                            const mins = Math.floor(diff / 60_000)
                            const hours = Math.floor(diff / 3_600_000)
                            const days = Math.floor(diff / 86_400_000)
                            let timeLabel = mins < 1 ? "just now" : mins < 60 ? `${mins} min${mins > 1 ? "s" : ""} ago` : hours < 24 ? `${hours} hour${hours > 1 ? "s" : ""} ago` : days === 1 ? "yesterday" : `${days} days ago`

                            return (
                              <div key={act.id} className="group relative flex gap-x-3">
                                <div className={`relative after:absolute after:bottom-0 after:start-1/2 after:top-4 after:w-px after:-translate-x-[0.5px] after:bg-border ${idx === activityQuery.data!.length - 1 ? "after:hidden" : ""}`}>
                                  <div className="relative z-10 flex h-4 w-4 items-center justify-center">
                                    <div className={`h-2.5 w-2.5 rounded-full ${idx === 0 ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`} />
                                  </div>
                                </div>

                                <div className={`grow pb-4 pt-0.5 ${idx === activityQuery.data!.length - 1 ? "pb-0.5" : ""}`}>
                                  <p className="text-sm font-semibold leading-5">{act.message}</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{timeLabel}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No activity yet.</p>
                      )}
                    </div>
                  </div>
                </aside>}
              </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
      {/* Removed PlansDialog modal */}
      <ShareWithUsersDialog
        open={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        folderName={model.activeFolder?.name}
        isSharing={model.isSharing}
        onCopyLink={() => model.shareActiveFolder([])}
        onShareWithEmails={(emails) => model.shareActiveFolder(emails)}
      />
    </div>
  )
}
