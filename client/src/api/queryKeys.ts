export const queryKeys = {
  folders: ["folders"] as const,
  profile: {
    me: ["profile", "me"] as const,
  },
  shared: {
    items: ["shared-items"] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    count: ["notifications", "count"] as const,
    list: (tab: "all" | "unread" | "system") => ["notifications", tab] as const,
  },
}
