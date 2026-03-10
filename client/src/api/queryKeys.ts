export const queryKeys = {
  folders: ["folders"] as const,
  shared: {
    items: ["shared-items"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (tab: "all" | "unread" | "system") => ["notifications", tab] as const,
  },
}
