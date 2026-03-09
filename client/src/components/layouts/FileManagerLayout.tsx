import { Bell, Download, Folder, HardDrive, Home, LogOut, Moon, Share2, Star, Sun, Users } from "lucide-react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
                  <div className="grid h-8 w-8 place-content-center rounded-lg bg-blue-600 text-xs font-semibold text-white">C</div>
                  <div className="group-data-[collapsible=icon]:hidden">
                    <p className="text-sm font-semibold">CloudBox</p>
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
                      <span>{model.usedPercent.toFixed(0)}%</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Upgrade Plan
                    </Button>
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
                <section className={cn("flex min-w-0 flex-1 flex-col", !isProfileRoute && "border-r border-border")}>
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
                      <Button variant="ghost" size="icon" className="hidden text-muted-foreground md:inline-flex">
                        <Bell className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => navigate("/protected/profile")}
                        aria-label="Go to profile"
                      >
                        <Avatar className="h-8 w-8 border border-border bg-background">
                          <AvatarFallback className="text-[11px] font-semibold">JD</AvatarFallback>
                        </Avatar>
                      </Button>
                    </div>
                  </div>

                  <Outlet context={model} />
                </section>

                {!isProfileRoute && <aside className="hidden w-[310px] min-h-0 flex-col bg-card dark:bg-[#18181B] lg:flex">
                  <div className="flex h-16 items-center border-b border-border px-5 dark:border-slate-700">
                    <h2 className="text-lg font-semibold">Details</h2>
                  </div>
                  <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5">
                    <div className="grid aspect-[4/3] place-content-center rounded-xl bg-muted/40 dark:bg-slate-900">
                      {model.selectedFile ? (
                        (() => {
                          const Icon = getFileIcon(model.selectedFile.metadata.mimetype)
                          return <Icon className="h-16 w-16 text-blue-600" />
                        })()
                      ) : (
                        <HardDrive className="h-16 w-16 text-muted-foreground" />
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

                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={model.shareActiveFolder}>
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

                      <div className="space-y-0">
                        <div className="group relative flex gap-x-3">
                          <div className="relative after:absolute after:bottom-0 after:start-1/2 after:top-4 after:w-px after:-translate-x-[0.5px] after:bg-border">
                            <div className="relative z-10 flex h-4 w-4 items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                            </div>
                          </div>

                          <div className="grow pb-4 pt-0.5">
                            <p className="text-sm font-semibold leading-5">You uploaded a new version</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">10 mins ago</p>
                          </div>
                        </div>

                        <div className="group relative flex gap-x-3">
                          <div className="relative after:absolute after:bottom-0 after:start-1/2 after:top-4 after:w-px after:-translate-x-[0.5px] after:bg-border">
                            <div className="relative z-10 flex h-4 w-4 items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            </div>
                          </div>

                          <div className="grow pb-4 pt-0.5">
                            <p className="text-sm font-semibold leading-5">Sarah Miller viewed the file</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">1h ago</p>
                          </div>
                        </div>

                        <div className="group relative flex gap-x-3">
                          <div className="relative">
                            <div className="relative z-10 flex h-4 w-4 items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                            </div>
                          </div>

                          <div className="grow pb-0.5 pt-0.5">
                            <p className="text-sm font-semibold leading-5">Shared with Web Team</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Yesterday, 4:12 PM</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>}
              </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
