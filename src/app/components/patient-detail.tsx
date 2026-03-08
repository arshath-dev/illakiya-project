import { useParams, useNavigate } from "react-router";
import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { ArrowLeft, Download, Calendar, Mail, User, Shield, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Scan {
  id: string;
  date: string;
  severity: Severity;
  confidence: number;
  fileName: string;
}

interface PatientData {
  name: string;
  email: string;
  role: string;
  scans: Scan[];
}

export function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatientData = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Step 1: Get patient name/email from the users collection (now readable by all authenticated users)
        let patientName = "Unknown Patient";
        let patientEmail = "";
        try {
          const userDoc = await getDoc(doc(db, "users", id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            patientName = userData.name || patientName;
            patientEmail = userData.email || patientEmail;
          }
        } catch {
          // If user doc is unreadable, we'll fall back to report data below
        }

        // Step 2: Get all reports for this patient
        const q = query(
          collection(db, "reports"),
          where("userId", "==", id),
          orderBy("uploadedAt", "desc")
        );
        const reportsSnap = await getDocs(q);

        // If we couldn't get the name from users collection, try from reports
        if (patientName === "Unknown Patient" && !reportsSnap.empty) {
          const firstDoc = reportsSnap.docs[0].data();
          patientName = firstDoc.userName || patientName;
          patientEmail = firstDoc.userEmail || patientEmail;
        }

        const scansData: Scan[] = reportsSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.uploadedAt?.toDate
              ? new Date(data.uploadedAt.toDate()).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })
              : "Unknown date",
            severity: (data.severity || "No_DR") as Severity,
            confidence: Math.round((data.confidence || 0) * 100),
            fileName: data.fileName || "Unknown",
          };
        });

        setPatient({
          name: patientName,
          email: patientEmail,
          role: "patient",
          scans: scansData,
        });
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar title="Patient Details" />
        <div className="flex items-center justify-center p-8">
          <Loader className="w-8 h-8 text-[#1E88E5] animate-spin" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen">
        <Navbar title="Patient Details" />
        <div className="p-4 lg:p-8 text-center text-muted-foreground">
          Patient not found
        </div>
      </div>
    );
  }

  const risk = patient.scans.length > 0
    ? patient.scans.reduce((highest: Severity, scan) => {
      const severityOrder: Record<Severity, number> = {
        "No_DR": 0,
        "Mild": 1,
        "Moderate": 2,
        "Severe": 3,
        "Proliferative": 4,
      };
      return severityOrder[scan.severity] > severityOrder[highest] ? scan.severity : highest;
    }, "No_DR")
    : "No_DR";

  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2);

  return (
    <div className="min-h-screen">
      <Navbar title="Patient Details" />
      <div className="p-4 lg:p-8 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to patients
        </button>

        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-[24px] font-semibold">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-[22px] font-semibold">{patient.name}</h2>
                <SeverityBadge severity={risk} size="lg" />
              </div>
              <div className="flex flex-wrap gap-4 sm:gap-6 text-[13px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> {patient.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4" /> Risk: {risk}
                </span>
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4" /> {patient.scans.length} Scan{patient.scans.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scan History */}
        <h3 className="text-[18px] font-semibold">Scan History ({patient.scans.length})</h3>
        {patient.scans.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 text-center text-muted-foreground">
            No scans found for this patient
          </div>
        ) : (
          <div className="space-y-4">
            {patient.scans.map((scan) => (
              <div key={scan.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Retinal Image Placeholder */}
                  <div className="lg:w-64 h-48 lg:h-auto bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center relative overflow-hidden">
                    <div className="w-32 h-32 rounded-full border-2 border-green-400/30 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-2 border-green-400/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-orange-500/60" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 text-[10px] text-green-400 bg-black/40 px-2 py-1 rounded">
                      Retinal Fundus Image
                    </div>
                  </div>

                  {/* Scan Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <SeverityBadge severity={scan.severity} />
                      <span className="text-[13px] text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {scan.date}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-[12px] text-muted-foreground mb-1">File Name</p>
                        <p className="text-[13px] truncate">{scan.fileName}</p>
                      </div>
                      <div>
                        <p className="text-[12px] text-muted-foreground mb-1">Prediction</p>
                        <p className="text-[15px] font-medium">
                          {scan.severity === "No_DR" ? "No DR" : `${scan.severity} DR`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[12px] text-muted-foreground mb-1">Confidence Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-[#1E88E5]" style={{ width: `${scan.confidence}%` }} />
                          </div>
                          <span className="text-[14px]">{scan.confidence}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button className="px-4 py-2 rounded-xl bg-[#1E88E5] text-white text-[13px] hover:bg-[#1976D2] transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Report
                      </button>
                    </div>
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