import { useMemo, useState } from "react"
import { Copy, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

type ShareWithUsersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  folderName?: string
  isSharing: boolean
  onCopyLink: () => Promise<void>
  onShareWithEmails: (emails: string[]) => Promise<void>
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const splitEmailTokens = (value: string) => {
  return value
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter((part) => part.length > 0)
}

export default function ShareWithUsersDialog({
  open,
  onOpenChange,
  folderName,
  isSharing,
  onCopyLink,
  onShareWithEmails,
}: ShareWithUsersDialogProps) {
  const [emailsInput, setEmailsInput] = useState("")
  const [selectedEmails, setSelectedEmails] = useState<string[]>([])

  const { validDraftEmails, invalidDraftEmails } = useMemo(() => {
    const tokens = splitEmailTokens(emailsInput)
    return {
      validDraftEmails: tokens.filter((token) => emailPattern.test(token)),
      invalidDraftEmails: tokens.filter((token) => !emailPattern.test(token)),
    }
  }, [emailsInput])

  const draftPreview = useMemo(() => {
    return [...selectedEmails, ...validDraftEmails.filter((email) => !selectedEmails.includes(email))]
  }, [selectedEmails, validDraftEmails])

  const commitDraftEmails = () => {
    if (validDraftEmails.length === 0) {
      return
    }

    setSelectedEmails((prev) => [...new Set([...prev, ...validDraftEmails])])
    setEmailsInput("")
  }

  const removeEmail = (email: string) => {
    setSelectedEmails((prev) => prev.filter((entry) => entry !== email))
  }

  const resetAndClose = () => {
    setEmailsInput("")
    setSelectedEmails([])
    onOpenChange(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setEmailsInput("")
      setSelectedEmails([])
    }
    onOpenChange(nextOpen)
  }

  const handleShare = async () => {
    const payloadEmails = [...new Set([...selectedEmails, ...validDraftEmails])]
    if (payloadEmails.length === 0) {
      return
    }

    await onShareWithEmails(payloadEmails)
    resetAndClose()
  }

  const handleCopyLink = async () => {
    await onCopyLink()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Share Folder</DialogTitle>
          <DialogDescription>
            {folderName ? `Share ${folderName} with specific users or copy a share link.` : "Share this folder with specific users or copy a share link."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Recipient Emails</p>
          <Input
            value={emailsInput}
            onChange={(event) => setEmailsInput(event.target.value)}
            onBlur={commitDraftEmails}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === ",") {
                event.preventDefault()
                commitDraftEmails()
              }
            }}
            placeholder="jane@example.com, alex@example.com"
          />

          {draftPreview.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-sm border border-border p-2">
              {draftPreview.map((email) => (
                <span key={email} className="inline-flex items-center gap-1 rounded-sm bg-slate-100 px-2 py-1 text-xs dark:bg-slate-800">
                  {email}
                  <button
                    type="button"
                    onClick={() => removeEmail(email)}
                    className="inline-flex"
                    aria-label={`Remove ${email}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {invalidDraftEmails.length > 0 && (
            <p className="text-xs text-red-600 dark:text-red-300">
              Invalid email{invalidDraftEmails.length > 1 ? "s" : ""}: {invalidDraftEmails.join(", ")}
            </p>
          )}

          <p className="text-xs text-muted-foreground">Press Enter or comma to add recipients.</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={resetAndClose} disabled={isSharing}>
            Cancel
          </Button>
          <Button type="button" variant="outline" onClick={handleCopyLink} disabled={isSharing}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Link
          </Button>
          <Button
            type="button"
            className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white dark:text-white"
            onClick={handleShare}
            disabled={isSharing || draftPreview.length === 0 || invalidDraftEmails.length > 0}
          >
            <Send className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
