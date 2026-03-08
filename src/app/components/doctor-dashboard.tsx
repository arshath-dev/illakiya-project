import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { Users, ScanLine, AlertTriangle, Activity, TrendingUp, ArrowUpRight, Loader } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

interface RecentUpload {
  id: string;
  name: string;
  date: string;
  severity: Severity;
  confidence: number;
}

interface Stats {
  totalPatients: number;
  totalScans: number;
  severeCases: number;
  moderateCases: number;
}



export function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalPatients: 0, totalScans: 0, severeCases: 0, moderateCases: 0 });
  const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all reports
        const reportsSnap = await getDocs(query(collection(db, "reports"), orderBy("uploadedAt", "desc")));
        const reportsData = reportsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));

        // Stats
        const uniquePatients = new Set(reportsData.map((r: any) => r.userId));
        const severe = reportsData.filter((r: any) => r.severity === "Severe" || r.severity === "Proliferative").length;
        const moderate = reportsData.filter((r: any) => r.severity === "Moderate").length;

        setStats({
          totalPatients: uniquePatients.size,
          totalScans: reportsData.length,
          severeCases: severe,
          moderateCases: moderate,
        });

        // Recent uploads (latest 6)
        const recent: RecentUpload[] = reportsData.slice(0, 6).map((r: any) => ({
          id: r.id,
          name: r.userName || "Unknown",
          date: r.uploadedAt?.toDate
            ? new Date(r.uploadedAt.toDate()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
            : "Unknown",
          severity: (r.severity || "No_DR") as Severity,
          confidence: Math.round((r.confidence || 0) * 100),
        }));
        setRecentUploads(recent);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    { label: "Total Patients", value: stats.totalPatients, icon: Users, color: "#1E88E5", bgColor: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Total Scans", value: stats.totalScans, icon: ScanLine, color: "#43A047", bgColor: "bg-green-50 dark:bg-green-900/20" },
    { label: "Severe Cases", value: stats.severeCases, icon: AlertTriangle, color: "#E53935", bgColor: "bg-red-50 dark:bg-red-900/20" },
    { label: "Moderate Cases", value: stats.moderateCases, icon: Activity, color: "#FB8C00", bgColor: "bg-orange-50 dark:bg-orange-900/20" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar title={`Welcome, ${user?.name || "Doctor"}`} />
      <div className="p-4 lg:p-8 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="w-8 h-8 text-[#1E88E5] animate-spin" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
              {statCards.map((s) => (
                <div key={s.label} className="bg-card rounded-2xl p-5 lg:p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-xl ${s.bgColor} flex items-center justify-center`}>
                      <s.icon className="w-6 h-6" style={{ color: s.color }} />
                    </div>
                    <span className="flex items-center gap-1 text-[12px] text-emerald-600">
                      <TrendingUp className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-[28px] mt-4" style={{ lineHeight: 1.2 }}>{s.value.toLocaleString()}</p>
                  <p className="text-[13px] text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>


            {/* Recent Uploads */}
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h3 className="text-[16px]">Recent Scans</h3>
                <button
                  className="text-[13px] text-[#1E88E5] hover:underline flex items-center gap-1"
                  onClick={() => navigate("/doctor/reports")}
                >
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {recentUploads.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-[14px]">No scans yet. Patient uploads will appear here.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Patient Name</th>
                        <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Date</th>
                        <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Severity</th>
                        <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Confidence</th>
                        <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentUploads.map((u) => (
                        <tr key={u.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E88E5]/20 to-[#1E88E5]/5 flex items-center justify-center text-[12px] text-[#1E88E5]">
                                {u.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
                              </div>
                              <span className="text-[14px]">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-[13px] text-muted-foreground">{u.date}</td>
                          <td className="px-6 py-4"><SeverityBadge severity={u.severity} /></td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full bg-[#1E88E5]" style={{ width: `${u.confidence}%` }} />
                              </div>
                              <span className="text-[13px] text-muted-foreground">{u.confidence}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate("/doctor/reports")}
                              className="px-4 py-1.5 rounded-lg bg-[#1E88E5]/10 text-[#1E88E5] text-[12px] hover:bg-[#1E88E5]/20 transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-center py-4 text-[12px] text-muted-foreground">
          This AI system is for screening purposes only and does not replace professional medical diagnosis.
        </div>
      </div>
    </div>
  );
}
