import { useParams, useNavigate } from "react-router";
import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { ArrowLeft, Download, Printer, FileText, Eye } from "lucide-react";

const reportData: Record<string, { patient: string; severity: Severity; confidence: number; date: string; comment: string }> = {
  "1-1": { patient: "James Wilson", severity: "Severe", confidence: 94, date: "Feb 27, 2026", comment: "Significant neovascularization detected. Recommend immediate referral to retina specialist." },
  "2-1": { patient: "Maria Garcia", severity: "Moderate", confidence: 88, date: "Feb 27, 2026", comment: "Moderate NPDR with macular edema. Consider anti-VEGF treatment." },
  "3-1": { patient: "Robert Chen", severity: "No_DR", confidence: 97, date: "Feb 26, 2026", comment: "No signs of diabetic retinopathy. Annual screening recommended." },
};

export function ReportDetail() {
  const { patientId, scanId } = useParams();
  const navigate = useNavigate();
  const key = `${patientId}-${scanId}`;
  const report = reportData[key] || reportData["1-1"];

  return (
    <div className="min-h-screen">
      <Navbar title="Report Preview" />
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back
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
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[20px]">DR Screening Report</h2>
                  <p className="text-white/70 text-[13px]">RetinaAI Medical Platform</p>
                </div>
              </div>
              <p className="text-[12px] text-white/70">{report.date}</p>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/50 rounded-xl p-4 text-[14px]">
              <div><p className="text-muted-foreground text-[12px]">Patient</p><p>{report.patient}</p></div>
              <div><p className="text-muted-foreground text-[12px]">Date</p><p>{report.date}</p></div>
            </div>

            <div className="h-48 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border-2 border-green-400/30 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-green-400/20 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-orange-500/60" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-[12px] mb-2">Prediction</p>
                <SeverityBadge severity={report.severity} size="lg" />
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-muted-foreground text-[12px] mb-2">Confidence</p>
                <p className="text-[24px] text-[#1E88E5]">{report.confidence}%</p>
              </div>
            </div>

            <div>
              <h4 className="text-[13px] text-muted-foreground mb-2">Doctor's Comments</h4>
              <p className="text-[14px] bg-muted/50 rounded-xl p-4">{report.comment}</p>
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-end">
              <div>
                <div className="w-40 border-b border-foreground/30 mb-2 pb-4 italic text-muted-foreground text-[14px]">Dr. Sarah Smith</div>
                <p className="text-[12px] text-muted-foreground">Attending Ophthalmologist</p>
              </div>
              <p className="text-[11px] text-muted-foreground">RetinaAI v2.4</p>
            </div>
          </div>

          <div className="bg-muted/50 px-8 py-4 border-t border-border">
            <p className="text-[11px] text-muted-foreground text-center">
              This AI-generated report is for screening purposes only and does not constitute a medical diagnosis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
