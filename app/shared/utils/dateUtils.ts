/**
 * Formats a message date based on requirements:
 * - If today: "Today"
 * - If yesterday: "Yesterday"
 * - If same week and same month: Day name (e.g. "Monday")
 * - If same year: "Wed, 18, March"
 * - Otherwise: "Wed, 18, March, 2026"
 */
export const formatMessageDate = (date: Date): string => {
  const now = new Date();
  const msgDate = new Date(date);

  // Strip time for day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const msgDay = new Date(msgDate.getFullYear(), msgDate.getMonth(), msgDate.getDate());

  if (msgDay.getTime() === today.getTime()) {
    return "Today";
  }

  if (msgDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // Same week and same month
  if (
    msgDay.getTime() >= startOfWeek.getTime() &&
    msgDay.getMonth() === today.getMonth() &&
    msgDay.getFullYear() === today.getFullYear()
  ) {
    return msgDay.toLocaleDateString("en-US", { weekday: "long" });
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "long",
  };

  if (msgDay.getFullYear() !== today.getFullYear()) {
    options.year = "numeric";
  }

  // Formatting to match "Wed, 18, March, 2026" style
  // Intl.DateTimeFormat is limited, so we manual format if needed, but let's try to get close.
  const weekday = msgDay.toLocaleDateString("en-US", { weekday: "short" });
  const day = msgDay.toLocaleDateString("en-US", { day: "numeric" });
  const month = msgDay.toLocaleDateString("en-US", { month: "long" });
  const year = msgDay.getFullYear();

  if (msgDay.getFullYear() === today.getFullYear()) {
    return `${weekday}, ${day}, ${month}`;
  }
  return `${weekday}, ${day}, ${month}, ${year}`;
};

export const isSameDay = (d1: Date, d2: Date): boolean => {
  const date1 = new Date(d1);
  const date2 = new Date(d2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};
