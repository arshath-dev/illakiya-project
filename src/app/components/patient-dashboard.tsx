import { Navbar } from "./navbar";
import { SeverityBadge, type Severity } from "./severity-badge";
import { Activity, Calendar, MessageSquare, TrendingUp, Eye } from "lucide-react";

export function PatientDashboardPage() {
  return (
    <div className="min-h-screen">
      <Navbar title="My Dashboard" />
      <div className="p-4 lg:p-8 space-y-6">
        {/* Latest Scan Result */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-[#1E88E5]" />
            </div>
            <div>
              <h3 className="text-[16px]">Latest Scan Result</h3>
              <p className="text-[12px] text-muted-foreground">February 27, 2026</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="text-center p-6 bg-muted/50 rounded-xl">
              <p className="text-[12px] text-muted-foreground mb-3">Severity</p>
              <SeverityBadge severity="Mild" size="lg" />
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-xl">
              <p className="text-[12px] text-muted-foreground mb-3">Confidence</p>
              <p className="text-[32px] text-[#1E88E5]" style={{ lineHeight: 1.2 }}>82%</p>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-xl">
              <p className="text-[12px] text-muted-foreground mb-3">Next Checkup</p>
              <p className="text-[14px]">May 27, 2026</p>
              <p className="text-[12px] text-muted-foreground">In 3 months</p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
            <p className="text-[13px] text-muted-foreground mb-1">AI Explanation</p>
            <p className="text-[14px]">
              Early signs of non-proliferative diabetic retinopathy were detected. A few microaneurysms are visible
              in the peripheral retina. This is a mild condition that should be monitored regularly. Maintain good blood
              sugar control and schedule a follow-up in 3 months.
            </p>
          </div>

          {/* Risk Meter */}
          <RiskGauge level={1} />
        </div>

        {/* Doctor's Comment */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-5 h-5 text-[#1E88E5]" />
            <h3 className="text-[16px]">Doctor's Comment</h3>
          </div>
          <div className="bg-muted/50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-[11px]">
                SS
              </div>
              <div>
                <p className="text-[13px]">Dr. Sarah Smith</p>
                <p className="text-[11px] text-muted-foreground">Ophthalmologist · Feb 27, 2026</p>
              </div>
            </div>
            <p className="text-[14px] text-foreground/80">
              Your scan shows early signs of mild diabetic retinopathy. I recommend maintaining strict blood sugar control 
              (HbA1c below 7%) and scheduling your next eye exam in 3 months. Continue your current diabetes management plan.
              If you notice any sudden changes in vision, please contact us immediately.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#43A047]" />
              </div>
              <div>
                <p className="text-[20px]">4</p>
                <p className="text-[12px] text-muted-foreground">Total Scans</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#1E88E5]" />
              </div>
              <div>
                <p className="text-[20px]">3 mo</p>
                <p className="text-[12px] text-muted-foreground">Next Checkup</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-[20px]">Stable</p>
                <p className="text-[12px] text-muted-foreground">Trend</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-4 text-[12px] text-muted-foreground">
          This AI system is for screening purposes only and does not replace professional medical diagnosis.
        </div>
      </div>
    </div>
  );
}

function RiskGauge({ level }: { level: number }) {
  const angle = -90 + (level / 4) * 180;
  const colors = ["#43A047", "#FDD835", "#FB8C00", "#E53935", "#B71C1C"];

  return (
    <div className="flex justify-center">
      <div className="relative w-64 h-36">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          {[0, 1, 2, 3, 4].map((i) => {
            const startAngle = -90 + i * 36;
            const endAngle = startAngle + 34;
            const r = 80;
            const x1 = 100 + r * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 100 + r * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 100 + r * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 100 + r * Math.sin((endAngle * Math.PI) / 180);
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                fill="none"
                stroke={colors[i]}
                strokeWidth={12}
                strokeLinecap="round"
                opacity={i <= level ? 1 : 0.2}
              />
            );
          })}
          <line
            x1="100" y1="100"
            x2={100 + 55 * Math.cos((angle * Math.PI) / 180)}
            y2={100 + 55 * Math.sin((angle * Math.PI) / 180)}
            stroke="var(--foreground)" strokeWidth="2.5" strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="5" fill="var(--foreground)" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-muted-foreground">
          <span>No DR</span>
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
          <span>PDR</span>
        </div>
      </div>
    </div>
  );
}
