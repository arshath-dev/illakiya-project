import { Navbar } from "./navbar";
import { AlertTriangle, Upload, FileText, Bell, CheckCheck } from "lucide-react";
import { useState } from "react";

const allNotifications = [
  { id: 1, type: "severe", text: "New severe case detected - Patient James Wilson requires immediate attention", time: "2 min ago", date: "Today", unread: true, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { id: 2, type: "upload", text: "Patient Maria Garcia uploaded a new retinal scan for analysis", time: "15 min ago", date: "Today", unread: true, icon: Upload, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 3, type: "report", text: "Report generated successfully for Robert Chen - No DR detected", time: "1 hour ago", date: "Today", unread: false, icon: FileText, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  { id: 4, type: "system", text: "System update: AI model v2.4 has been deployed with improved accuracy", time: "3 hours ago", date: "Today", unread: false, icon: Bell, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  { id: 5, type: "severe", text: "Patient Ahmed Hassan - Proliferative DR detected. Urgent referral needed", time: "Yesterday", date: "Yesterday", unread: false, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { id: 6, type: "upload", text: "Patient Lisa Thompson uploaded a new retinal scan", time: "Yesterday", date: "Yesterday", unread: false, icon: Upload, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { id: 7, type: "report", text: "Monthly analytics report is ready for review", time: "2 days ago", date: "Earlier", unread: false, icon: FileText, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState("all");

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.type === filter);
  const groupedByDate = filtered.reduce((acc, n) => {
    if (!acc[n.date]) acc[n.date] = [];
    acc[n.date].push(n);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div className="min-h-screen">
      <Navbar title="Notifications" />
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "severe", label: "Severe" },
              { key: "upload", label: "Uploads" },
              { key: "report", label: "Reports" },
              { key: "system", label: "System" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-[13px] transition-colors ${
                  filter === f.key
                    ? "bg-[#1E88E5] text-white"
                    : "bg-card border border-border hover:bg-accent text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-[13px] text-[#1E88E5] hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> Mark all as read
          </button>
        </div>

        {Object.entries(groupedByDate).map(([date, notifs]) => (
          <div key={date}>
            <p className="text-[12px] text-muted-foreground mb-3 uppercase tracking-wider">{date}</p>
            <div className="space-y-2">
              {notifs.map((n) => (
                <div
                  key={n.id}
                  className={`bg-card rounded-2xl border border-border p-4 flex items-start gap-4 hover:shadow-sm transition-shadow ${
                    n.unread ? "border-l-4 border-l-[#1E88E5]" : ""
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${n.bg} flex items-center justify-center shrink-0`}>
                    <n.icon className={`w-5 h-5 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] ${n.unread ? "" : "text-foreground/70"}`}>{n.text}</p>
                    <p className="text-[12px] text-muted-foreground mt-1">{n.time}</p>
                  </div>
                  {n.unread && <div className="w-2.5 h-2.5 rounded-full bg-[#1E88E5] shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
