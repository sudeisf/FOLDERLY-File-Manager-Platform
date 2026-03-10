import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react"
import type { AxiosError } from "axios"
import { Bell, Camera, Loader2, Lock, ShieldCheck, User } from "lucide-react"

// ...existing code...
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { useChangePasswordMutation } from "@/api/hooks/useAuthMutations"
import { useMyProfileQuery, useMyRecentActivityQuery, useUpdateMyProfileMutation, useUploadMyAvatarMutation } from "@/api/hooks/useProfile"

type ProfileFormState = {
  username: string
  email: string
  firstName: string
  lastName: string
  about: string
  avatarUrl: string
  portfolioName: string
  portfolioLink: string
  emailNotifications: boolean
  desktopNotifications: boolean
  sharedActivity: boolean
  twoFactorEnabled: boolean
}

const defaultFormState: ProfileFormState = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  about: "",
  avatarUrl: "",
  portfolioName: "",
  portfolioLink: "",
  emailNotifications: true,
  desktopNotifications: true,
  sharedActivity: false,
  twoFactorEnabled: true,
}

export default function ProfilePage() {
  const { toast } = useToast()
  const { data: profile, isLoading, isError } = useMyProfileQuery()
  const updateProfileMutation = useUpdateMyProfileMutation()
  const uploadAvatarMutation = useUploadMyAvatarMutation()
  const changePasswordMutation = useChangePasswordMutation()
  const [formState, setFormState] = useState<ProfileFormState>(defaultFormState)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (!profile) {
      return
    }

    setFormState({
      username: profile.username,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      about: profile.about,
      avatarUrl: profile.avatarUrl,
      portfolioName: profile.portfolioName,
      portfolioLink: profile.portfolioLink,
      emailNotifications: profile.emailNotifications,
      desktopNotifications: profile.desktopNotifications,
      sharedActivity: profile.sharedActivity,
      twoFactorEnabled: profile.twoFactorEnabled,
    })
  }, [profile])

  const displayName = useMemo(() => {
    const fullName = `${formState.firstName} ${formState.lastName}`.trim()
    return fullName || formState.username || "User"
  }, [formState.firstName, formState.lastName, formState.username])

  const avatarInitials = useMemo(() => {
    const base = displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")

    return base || "U"
  }, [displayName])

  const getErrorMessage = (error: unknown, fallback: string) => {
    const err = error as AxiosError<{ message?: string } | string>
    if (typeof err.response?.data === "string") {
      return err.response.data
    }
    return err.response?.data?.message || err.message || fallback
  }

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formState)
      toast({ title: "Profile saved", description: "Your account settings were updated." })
    } catch (error) {
      toast({
        title: "Unable to save profile",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      })
    }
  }

  const handleSelectAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    try {
      const response = await uploadAvatarMutation.mutateAsync(file)
      setField("avatarUrl", response.avatarUrl)
      toast({ title: "Photo updated", description: "Profile image uploaded to storage." })
    } catch (error) {
      toast({
        title: "Photo upload failed",
        description: getErrorMessage(error, "Please try another image."),
        variant: "destructive",
      })
    } finally {
      event.target.value = ""
    }
  }

  const setField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleTwoFactorToggle = async (value: boolean) => {
    setField("twoFactorEnabled", value)

    try {
      await updateProfileMutation.mutateAsync({ twoFactorEnabled: value })
      toast({
        title: "Security updated",
        description: value ? "Two-factor authentication enabled." : "Two-factor authentication disabled.",
      })
    } catch (error) {
      setField("twoFactorEnabled", !value)
      toast({
        title: "Could not update security setting",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      })
    }
  }

  const handlePasswordFieldChange = (field: "currentPassword" | "newPassword" | "confirmPassword", value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Missing password fields",
        description: "Fill in current password, new password, and confirm password.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "New password too short",
        description: "Use at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirm password must match.",
        variant: "destructive",
      })
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      setShowPasswordForm(false)
      toast({ title: "Password changed", description: "Your account password was updated." })
    } catch (error) {
      toast({
        title: "Could not change password",
        description: getErrorMessage(error, "Please try again."),
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4 text-center text-sm text-slate-600 dark:text-slate-300">
        Failed to load profile details. Refresh and try again.
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto bg-slate-50 px-3 py-4 md:px-6 md:py-6 dark:bg-[#18181B]">
      <div className="mx-auto w-full max-w-5xl">
      <div className="mb-5 rounded-sm border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">My Account</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage your identity, security, and workspace preferences.</p>
          </div>
          <Button
            className="rounded-sm bg-blue-600 px-5 text-white hover:bg-blue-700 hover:text-white dark:text-white"
            onClick={handleSave}
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="rounded-sm border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-[#18181B]">
          <CardContent className="p-5">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 border-4 border-slate-100 shadow-sm dark:border-slate-700">
                <AvatarImage src={formState.avatarUrl || undefined} alt={displayName} />
                <AvatarFallback className="bg-blue-100 text-2xl font-semibold text-blue-700 dark:bg-blue-900 dark:text-blue-200">{avatarInitials}</AvatarFallback>
              </Avatar>
              <h2 className="mt-3 text-lg font-semibold text-slate-900 dark:text-slate-100">{displayName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{formState.email || "No email"}</p>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp,image/gif"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <Button
                variant="outline"
                className="mt-4 w-full rounded-sm"
                onClick={handleSelectAvatarClick}
                disabled={uploadAvatarMutation.isPending}
              >
                <Camera className="h-4 w-4" />
                {uploadAvatarMutation.isPending ? "Uploading..." : "Change Photo"}
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
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "-"}</p>
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
                <Input
                  value={formState.firstName}
                  onChange={(event) => setField("firstName", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Last Name</label>
                <Input
                  value={formState.lastName}
                  onChange={(event) => setField("lastName", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Email</label>
              <Input
                value={formState.email}
                onChange={(event) => setField("email", event.target.value)}
                type="email"
                className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Username</label>
              <Input
                value={formState.username}
                onChange={(event) => setField("username", event.target.value)}
                className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Avatar URL</label>
              <Input
                value={formState.avatarUrl}
                onChange={(event) => setField("avatarUrl", event.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">About</label>
              <textarea
                value={formState.about}
                onChange={(event) => setField("about", event.target.value)}
                rows={4}
                className="w-full resize-none rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Portfolio Name</label>
                <Input
                  value={formState.portfolioName}
                  onChange={(event) => setField("portfolioName", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">Portfolio Link</label>
                <Input
                  value={formState.portfolioLink}
                  onChange={(event) => setField("portfolioLink", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
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
              <Button className="rounded-sm bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:text-white">Upgrade Plan</Button>
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
              <Button variant="link" className="h-auto p-0 text-blue-600" onClick={() => setShowPasswordForm((prev) => !prev)}>
                {showPasswordForm ? "Cancel" : "Change"}
              </Button>
            </div>

            {showPasswordForm ? (
              <div className="space-y-2 rounded-sm border border-slate-200 p-3 dark:border-slate-700">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => handlePasswordFieldChange("currentPassword", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={passwordForm.newPassword}
                  onChange={(event) => handlePasswordFieldChange("newPassword", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
                <Input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => handlePasswordFieldChange("confirmPassword", event.target.value)}
                  className="rounded-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-[#18181B] dark:text-slate-100"
                />
                <Button
                  className="w-full rounded-sm bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:text-white"
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 dark:border-slate-700 dark:bg-[#18181B]">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium dark:text-slate-100">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Currently {formState.twoFactorEnabled ? "enabled" : "disabled"}</p>
                </div>
              </div>
              <Checkbox
                checked={formState.twoFactorEnabled}
                onCheckedChange={(value) => void handleTwoFactorToggle(Boolean(value))}
                disabled={updateProfileMutation.isPending}
              />
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
                <Checkbox checked={formState.emailNotifications} onCheckedChange={(value) => setField("emailNotifications", Boolean(value))} />
              </label>
              <label className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-[#18181B]">
                <span className="dark:text-slate-100">Desktop Push Notifications</span>
                <Checkbox checked={formState.desktopNotifications} onCheckedChange={(value) => setField("desktopNotifications", Boolean(value))} />
              </label>
              <label className="flex items-center justify-between rounded-sm border border-slate-200 px-3 py-3 text-sm dark:border-slate-700 dark:bg-[#18181B]">
                <span className="dark:text-slate-100">Shared File Activity</span>
                <Checkbox checked={formState.sharedActivity} onCheckedChange={(value) => setField("sharedActivity", Boolean(value))} />
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
        <span>Last synced {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : "just now"}</span>
      </div>
      </div>
    </div>
  )
}
