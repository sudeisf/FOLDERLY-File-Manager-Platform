import { useState } from "react"
import { Bell, Camera, Lock, ShieldCheck, User } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [desktopNotifications, setDesktopNotifications] = useState(true)
  const [sharedActivity, setSharedActivity] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-slate-50 px-3 py-4 md:px-6 md:py-6 dark:bg-[#18181B]">
      <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">My Account</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your identity, security, and workspace preferences.</p>
          </div>
          <Button className="rounded-xl bg-blue-600 px-5 hover:bg-blue-700">Save Changes</Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="rounded-sm border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
          <CardContent className="p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-slate-100 shadow-sm dark:border-slate-700">
                <AvatarFallback className="bg-blue-100 text-2xl font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">AM</AvatarFallback>
              </Avatar>
              <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">Alex Morgan</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">alex.morgan@cloudbox.com</p>
              <Button variant="outline" className="mt-4 w-full rounded-sm">
                <Camera className="h-4 w-4" />
                Change Photo
              </Button>
            </div>

            <Separator className="my-5 dark:bg-slate-700" />

            <div className="space-y-3">
              <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-[#18181B]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Role</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Team Owner</p>
              </div>
              <div className="rounded-sm border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-[#18181B]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Joined</p>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">March 2024</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-lg dark:text-slate-100">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">First Name</label>
                <Input defaultValue="Alex" className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Last Name</label>
                <Input defaultValue="Morgan" className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Email</label>
              <Input defaultValue="alex.morgan@cloudbox.com" type="email" className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">About</label>
              <textarea
                defaultValue="Product designer focused on developer tools and collaboration experiences."
                rows={4}
                className="w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Portfolio Name</label>
                <Input defaultValue="CloudBox" className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Portfolio Link</label>
                <Input defaultValue="www.cloudbox.com/alex" className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="rounded-sm border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
          <CardHeader className="flex-row items-center justify-between p-5 pb-3">
            <CardTitle className="text-lg dark:text-slate-100">Storage & Plan</CardTitle>
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">PREMIUM</span>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>7.5 GB of 10 GB used</span>
              <span className="font-semibold text-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />
            <div className="grid grid-cols-2 gap-3">
              <Button className="rounded-sm bg-blue-600 hover:bg-blue-700">Upgrade Plan</Button>
              <Button variant="secondary" className="rounded-sm">Manage Billing</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
          <CardHeader className="p-5 pb-3">
            <CardTitle className="text-lg dark:text-slate-100">Account Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <div className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 dark:border-slate-700 dark:bg-[#18181B]">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium dark:text-slate-100">Password</p>
                  <p className="text-xs text-muted-foreground">Last changed 3 months ago</p>
                </div>
              </div>
              <Button variant="link" className="h-auto p-0 text-blue-600">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 dark:border-slate-700 dark:bg-[#18181B]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium dark:text-slate-100">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Currently enabled</p>
                </div>
              </div>
              <Checkbox checked={twoFactorEnabled} onCheckedChange={(value) => setTwoFactorEnabled(Boolean(value))} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-5 rounded-sm border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-lg dark:text-slate-100">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
              <Bell className="h-3.5 w-3.5" />
              Notifications
            </p>
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-[#18181B]">
                <span className="dark:text-slate-100">Email Notifications</span>
                <Checkbox checked={emailNotifications} onCheckedChange={(value) => setEmailNotifications(Boolean(value))} />
              </label>
              <label className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-[#18181B]">
                <span className="dark:text-slate-100">Desktop Push Notifications</span>
                <Checkbox checked={desktopNotifications} onCheckedChange={(value) => setDesktopNotifications(Boolean(value))} />
              </label>
              <label className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-[#18181B]">
                <span className="dark:text-slate-100">Shared File Activity</span>
                <Checkbox checked={sharedActivity} onCheckedChange={(value) => setSharedActivity(Boolean(value))} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1">
          <User className="h-3.5 w-3.5" />
          Profile updates are private to your account.
        </span>
        <span>Last synced just now</span>
      </div>
      </div>
    </div>
  )
}
