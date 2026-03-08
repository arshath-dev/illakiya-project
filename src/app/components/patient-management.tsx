import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { Search, Filter, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";

interface Patient {
  id: string;
  name: string;
  email: string;
  lastScan: string;
  severity: Severity;
  initials: string;
  scanCount: number;
}

const avatarColors = [
  "from-blue-400 to-blue-600", "from-purple-400 to-purple-600",
  "from-emerald-400 to-emerald-600", "from-pink-400 to-pink-600",
  "from-amber-400 to-amber-600", "from-teal-400 to-teal-600",
  "from-indigo-400 to-indigo-600", "from-rose-400 to-rose-600",
];

export function PatientManagement() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);

        // Step 1: Get all users with role "patient" from the users collection
        const usersSnap = await getDocs(
          query(collection(db, "users"), where("role", "==", "patient"))
        );

        // Step 2: Get all reports to find latest scan per patient
        const reportsSnap = await getDocs(
          query(collection(db, "reports"), orderBy("uploadedAt", "desc"))
        );

        // Build a map of userId -> { latestSeverity, latestDate, scanCount }
        const scanMap = new Map<string, { severity: Severity; date: string; count: number }>();
        reportsSnap.docs.forEach((doc) => {
          const d = doc.data();
          const uid: string = d.userId;
          if (!uid) return;
          const dateStr = d.uploadedAt?.toDate
            ? new Date(d.uploadedAt.toDate()).toLocaleDateString("en-US", {
              year: "numeric", month: "short", day: "numeric",
            })
            : "Unknown";

          if (!scanMap.has(uid)) {
            // First entry is already the latest (sorted desc)
            scanMap.set(uid, {
              severity: (d.severity || "No_DR") as Severity,
              date: dateStr,
              count: 1,
            });
          } else {
            scanMap.get(uid)!.count++;
          }
        });

        // Step 3: Merge users with their scan info
        const patientsData: Patient[] = usersSnap.docs.map((doc) => {
          const d = doc.data();
          const uid = doc.id;
          const scanInfo = scanMap.get(uid);
          return {
            id: uid,
            name: d.name || "Unknown",
            email: d.email || "",
            lastScan: scanInfo?.date || "No scans yet",
            severity: scanInfo?.severity || "No_DR",
            initials: (d.name || "U").split(" ").map((n: string) => n[0]).join("").substring(0, 2),
            scanCount: scanInfo?.count || 0,
          };
        });

        setPatients(patientsData);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = filterSeverity === "all" || p.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="min-h-screen">
      <Navbar title="Patient Management" />
      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
              placeholder="Search patients..."
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border bg-card text-[13px] outline-none focus:ring-2 focus:ring-[#1E88E5]/20 cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="No_DR">No DR</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>
              <option value="Proliferative">Proliferative</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-[#1E88E5] animate-spin" />
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Patient</th>
                    <th className="text-left px-6 py-3 text-[12px] text-muted-foreground hidden md:table-cell">Email</th>
                    <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Last Scan</th>
                    <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Latest Severity</th>
                    <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Scans</th>
                    <th className="text-left px-6 py-3 text-[12px] text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, idx) => (
                    <tr key={p.id} className="border-t border-border hover:bg-accent/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white text-[12px] font-medium`}>
                            {p.initials}
                          </div>
                          <span className="text-[14px]">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-muted-foreground hidden md:table-cell">{p.email}</td>
                      <td className="px-6 py-4 text-[13px] text-muted-foreground">{p.lastScan}</td>
                      <td className="px-6 py-4">
                        {p.scanCount > 0
                          ? <SeverityBadge severity={p.severity} />
                          : <span className="text-[12px] text-muted-foreground">—</span>
                        }
                      </td>
                      <td className="px-6 py-4 text-[13px] text-muted-foreground">{p.scanCount}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/doctor/patients/${p.id}`)}
                          className="px-4 py-1.5 rounded-lg bg-[#1E88E5]/10 text-[#1E88E5] text-[12px] hover:bg-[#1E88E5]/20 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-[14px]">
                        {patients.length === 0
                          ? "No patients registered yet."
                          : "No patients matching your criteria."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center py-4 text-[12px] text-muted-foreground">
          This AI system is for screening purposes only and does not replace professional medical diagnosis.
        </div>
      </div>
    </div>
  );
}
