import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { Download, Printer, FileText, Calendar, Search, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

interface Report {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  date: string;
  severity: Severity;
  confidence: number;
  initials: string;
  fileName: string;
  prediction: string;
}

export function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchReports = async () => {
      try {
        setLoading(true);

        // Doctors see all reports; patients see only their own
        const reportsRef = collection(db, "reports");
        const q = user.role === "doctor"
          ? query(reportsRef, orderBy("uploadedAt", "desc"))
          : query(reportsRef, where("userId", "==", user.uid), orderBy("uploadedAt", "desc"));

        const snapshot = await getDocs(q);
        const data: Report[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            userId: d.userId,
            userName: d.userName || "Unknown",
            userEmail: d.userEmail || "",
            prediction: d.prediction || d.severity || "No_DR",
            severity: (d.severity || "No_DR") as Severity,
            confidence: Math.round((d.confidence || 0) * 100),
            fileName: d.fileName || "Unknown",
            initials: (d.userName || "U").split(" ").map((n: string) => n[0]).join("").substring(0, 2),
            date: d.uploadedAt?.toDate
              ? new Date(d.uploadedAt.toDate()).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "Unknown date",
          };
        });

        setReports(data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [user]);

  const filtered = reports.filter((r) =>
    r.userName.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    r.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      <Navbar title="Reports" />
      <div className="p-4 lg:p-8 space-y-6">
        {selectedReport === null ? (
          <>
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none transition-all text-[14px]"
                placeholder="Search reports..."
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-[#1E88E5] animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {reports.length === 0 ? "No reports found. Upload a scan to create your first report." : "No reports matching your search."}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((r) => (
                  <div
                    key={r.id}
                    className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedReport(r)}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-[12px] font-medium">
                        {r.initials}
                      </div>
                      <div>
                        <p className="text-[14px]">{r.userName}</p>
                        <p className="text-[12px] text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {r.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <SeverityBadge severity={r.severity} />
                      <span className="text-[13px] text-muted-foreground">{r.confidence}% confidence</span>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedReport(r); }}
                      className="w-full py-2.5 bg-[#1E88E5]/10 text-[#1E88E5] rounded-xl text-[13px] hover:bg-[#1E88E5]/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileText className="w-4 h-4" /> View Report
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <ReportPreview report={selectedReport} onBack={() => setSelectedReport(null)} />
        )}

        <div className="text-center py-4 text-[12px] text-muted-foreground">
          This AI system is for screening purposes only and does not replace professional medical diagnosis.
        </div>
      </div>
    </div>
  );
}

function ReportPreview({ report, onBack }: { report: Report; onBack: () => void }) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-[14px] text-[#1E88E5] hover:underline">
          &larr; Back to Reports
        </button>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl border border-border text-[13px] hover:bg-accent transition-colors flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button className="px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-[13px] hover:bg-[#1976D2] transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold">Diabetic Retinopathy Screening Report</h2>
                <p className="text-white/70 text-[13px]">RetinaAI Medical Platform</p>
              </div>
            </div>
            <div className="text-right text-[12px] text-white/70">
              <p>Report #{report.id.substring(0, 8)}</p>
              <p>{report.date}</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-[14px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-xl p-4 text-[14px]">
              <div>
                <p className="text-muted-foreground text-[12px]">Name</p>
                <p className="font-medium">{report.userName}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Email</p>
                <p className="font-medium">{report.userEmail}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">Report Date</p>
                <p className="font-medium">{report.date}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-[12px]">File Name</p>
                <p className="font-medium truncate">{report.fileName}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[14px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">Analysis Results</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-[12px] mb-2">Prediction</p>
                <SeverityBadge severity={report.severity} size="lg" />
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-[12px] mb-2">Confidence</p>
                <p className="text-[24px] font-semibold text-[#1E88E5]">{report.confidence}%</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[14px] text-muted-foreground mb-3 uppercase tracking-wider font-semibold">AI Assessment</h3>
            <p className="text-[14px] bg-muted/50 rounded-xl p-4">
              Patient presents with {report.severity === "No_DR" ? "no signs of" : report.severity.toLowerCase().replace("_", " ")} diabetic retinopathy.
              The AI model provided this analysis with {report.confidence}% confidence.
              {report.severity !== "No_DR" && " Follow-up examination and ophthalmologist consultation are recommended."}
              {" "}Continue current diabetes management protocol and maintain regular screening schedule.
            </p>
          </div>

          <div className="border-t border-border pt-6 flex justify-between items-end">
            <div>
              <div className="w-40 border-b border-foreground/30 mb-2 pb-6 italic text-muted-foreground text-[14px]">
                RetinaAI System
              </div>
              <p className="text-[12px] text-muted-foreground">Automated Analysis System</p>
              <p className="text-[12px] text-muted-foreground">v2.4</p>
            </div>
            <div className="text-right text-[12px] text-muted-foreground">
              <p>Generated by RetinaAI</p>
              <p>{report.date}</p>
            </div>
          </div>
        </div>

        <div className="bg-muted/50 px-8 py-4 border-t border-border">
          <p className="text-[11px] text-muted-foreground text-center">
            This AI-generated report is for screening purposes only and does not constitute a medical diagnosis.
            Clinical decisions should be made by qualified medical professionals based on comprehensive patient evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}
