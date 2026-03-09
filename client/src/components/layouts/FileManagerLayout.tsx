import { Bell, Folder, HardDrive, Home, Moon, Share2, Star, Sun, Users } from "lucide-react"
import { NavLink, Outlet } from "react-router-dom"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useThemeStore } from "@/stores/themeStore"

export default function FileManagerLayout() {
  const model = useFileManagerModel()
  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  return (
    <div className="h-dvh w-full overflow-hidden bg-background text-foreground">
      <SidebarProvider className="h-full">
        <div className="flex h-full w-full items-stretch overflow-hidden border border-border bg-card">
            <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border/70">
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
              </SidebarFooter>
            </Sidebar>

            <SidebarInset className="bg-background">
              <div className="flex h-full">
                <section className="flex min-w-0 flex-1 flex-col border-r border-border">
                  <div className="flex h-16 items-center justify-between gap-3 border-b border-border px-3 md:px-5">
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
                      <Avatar className="h-8 w-8 border border-border bg-background">
                        <AvatarFallback className="text-[11px] font-semibold">JD</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  <Outlet context={model} />
                </section>

                <aside className="hidden w-[290px] flex-col bg-card lg:flex">
                  <div className="flex h-16 items-center border-b border-border px-4">
                    <h2 className="text-lg font-semibold">Details</h2>
                  </div>
                  <div className="space-y-5 p-4">
                    <div className="grid aspect-square place-content-center rounded-xl bg-muted/50">
                      {model.selectedFile ? (
                        (() => {
                          const Icon = getFileIcon(model.selectedFile.metadata.mimetype)
                          return <Icon className="h-16 w-16 text-blue-600" />
                        })()
                      ) : (
                        <HardDrive className="h-16 w-16 text-muted-foreground" />
                      )}
                    </div>

                    <div>
                      <h3 className="truncate text-base font-semibold">{model.selectedFile?.name ?? "No file selected"}</h3>
                      <p className="text-xs text-muted-foreground">Last edited 10 mins ago</p>
                    </div>

                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Type</dt>
                        <dd className="font-medium">{model.selectedFile ? getFileKind(model.selectedFile.metadata.mimetype) : "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Size</dt>
                        <dd className="font-medium">{model.selectedFile ? bytesToLabel(model.selectedFile.metadata.size) : "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Location</dt>
                        <dd className="font-medium">{model.activeFolder?.name ?? "-"}</dd>
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

                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recent Activity</h4>
                      <ul className="space-y-2 text-xs text-muted-foreground">
                        <li>New version uploaded 10 mins ago</li>
                        <li>File viewed 1 hour ago</li>
                        <li>Shared with Web Team yesterday</li>
                      </ul>
                    </div>
                  </div>
                </aside>
              </div>
            </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  )
}
