export function requestNotificationPermission(): void {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

export function showNotification(title: string, options?: NotificationOptions): void {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, {
      icon: "/favicon.ico",
      ...options,
    });
  }
}
