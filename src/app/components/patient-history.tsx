import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { Calendar, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "./AuthContext";

interface ScanRecord {
  id: string;
  date: string;
  severity: Severity;
  confidence: number;
  fileName: string;
}

export function PatientHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "reports"),
          where("userId", "==", user.uid),
          orderBy("uploadedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data: ScanRecord[] = snapshot.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            severity: (d.severity || "No_DR") as Severity,
            confidence: Math.round((d.confidence || 0) * 100),
            fileName: d.fileName || "Unknown",
            date: d.uploadedAt?.toDate
              ? new Date(d.uploadedAt.toDate()).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })
              : "Unknown date",
          };
        });
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  return (
    <div className="min-h-screen">
      <Navbar title="Scan History" />
      <div className="p-4 lg:p-8 space-y-6 max-w-4xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-[#1E88E5] animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-12 text-center">
            <p className="text-muted-foreground text-[14px]">No scan history yet. Upload your first retinal scan to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((h) => (
              <div key={h.id} className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <SeverityBadge severity={h.severity} />
                    <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {h.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-[13px] text-muted-foreground">
                    <span>Confidence: <strong className="text-foreground">{h.confidence}%</strong></span>
                    <span>File: <strong className="text-foreground">{h.fileName}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center py-4 text-[12px] text-muted-foreground">
          This AI system is for screening purposes only and does not replace professional medical diagnosis.
        </div>
      </div>
    </div>
  );
}
