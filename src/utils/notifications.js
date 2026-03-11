export const requestPermission = async () => {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  const permission = await Notification.requestPermission();
  return permission === "granted";
};

export const sendNotification = (title, body, icon = "💸") => {
  if (Notification.permission !== "granted") return;
  new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
  });
};