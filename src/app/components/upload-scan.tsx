import { useState, useRef } from "react";
import { Upload, Check, AlertCircle, Loader, X } from "lucide-react";
import { SeverityBadge, type Severity } from "./severity-badge";
import { useAuth } from "./AuthContext";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";
import { toast, Toaster } from "sonner";

function UploadScan() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const severityMap: Record<string, Severity> = {
    "No_DR": "No_DR",
    "Mild": "Mild",
    "Moderate": "Moderate",
    "Severe": "Severe",
    "Proliferate_DR": "Proliferative",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setError(null);
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target?.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) { setError("Please select an image first"); return; }
    if (!user?.uid) { setError("You must be logged in to upload"); return; }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Failed to process image");
      const data = await response.json();

      const severity = severityMap[data.prediction] || "No_DR";

      // Save report to Firestore — results only, no image
      await addDoc(collection(db, "reports"), {
        userId: user.uid,
        userName: user.name,
        userEmail: user.email,
        fileName: file.name,
        prediction: data.prediction,
        severity,
        confidence: data.confidence,
        uploadedAt: Timestamp.now(),
      });

      toast.success("Report saved successfully!");
      setResult(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8">
      <Toaster position="top-right" richColors />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[32px] font-semibold text-foreground mb-2">Diabetic Retinopathy Detection</h1>
          <p className="text-[14px] text-muted-foreground">Upload a retinal fundus image for AI-powered screening</p>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-sm p-8 lg:p-10">
            {!result ? (
              <>
                {!preview ? (
                  <div
                    className="border-2 border-dashed border-border rounded-xl p-8 lg:p-12 text-center hover:border-[#1E88E5]/50 transition-colors cursor-pointer bg-accent/20"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-3 rounded-full bg-[#1E88E5]/10">
                        <Upload className="w-8 h-8 text-[#1E88E5]" />
                      </div>
                    </div>
                    <p className="text-[16px] font-medium text-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-[13px] text-muted-foreground mb-4">PNG, JPG or GIF (max. 10MB)</p>
                    <input ref={fileInputRef} type="file" onChange={handleFileChange} accept="image/*" className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2.5 bg-[#1E88E5] text-white rounded-xl text-[13px] font-medium hover:bg-[#1976D2] transition-colors"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-6 space-y-4">
                      <div className="relative inline-flex w-full justify-center">
                        <img src={preview} alt="Preview" className="max-w-full h-auto max-h-96 rounded-xl border border-border shadow-sm" />
                        <button
                          onClick={() => { setFile(null); setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="absolute top-2 right-2 p-2 bg-black/40 hover:bg-black/60 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5 text-white" />
                        </button>
                      </div>
                      <div className="bg-accent/50 rounded-lg p-4">
                        <p className="text-[13px] text-muted-foreground mb-1">Selected File</p>
                        <p className="text-[14px] font-medium text-foreground">{file?.name}</p>
                        <p className="text-[12px] text-muted-foreground mt-1">{(file!.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-[13px] text-destructive">{error}</p>
                      </div>
                    )}

                    <div className="flex gap-3 justify-center">
                      <button onClick={handleReset} className="px-6 py-2.5 border border-border rounded-xl text-[13px] font-medium text-foreground hover:bg-accent transition-colors">
                        Change Image
                      </button>
                      <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="px-6 py-2.5 bg-[#1E88E5] text-white rounded-xl text-[13px] font-medium hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {loading ? (
                          <><Loader className="w-4 h-4 animate-spin" /> Processing...</>
                        ) : (
                          <><Upload className="w-4 h-4" /> Upload & Analyze</>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-center mb-6">
                  <div className="p-3 rounded-full bg-green-400/10">
                    <Check className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="text-center mb-8">
                  <p className="text-[14px] text-muted-foreground mb-2">Analysis Complete</p>
                  <h2 className="text-[24px] font-semibold text-foreground">Results</h2>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-[#1E88E5]/20 p-8 space-y-6">
                  <div className="flex justify-center">
                    <SeverityBadge severity={severityMap[result.prediction] || "No_DR"} size="lg" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[13px] text-muted-foreground mb-2">Diagnosis Result</p>
                      <p className="text-[20px] font-semibold text-foreground">{result.prediction}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] text-muted-foreground">Confidence Score</p>
                        <p className="text-[16px] font-semibold text-[#1E88E5]">{(result.confidence * 100).toFixed(1)}%</p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-[#1E88E5] to-[#1565C0]"
                          style={{ width: `${result.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[#1E88E5]/10">
                    <p className="text-[12px] text-muted-foreground text-center">
                      This AI system is for screening purposes only and does not replace professional medical diagnosis.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-center pt-4">
                  <button onClick={handleReset} className="px-6 py-2.5 border border-border rounded-xl text-[13px] font-medium text-foreground hover:bg-accent transition-colors">
                    Analyze Another Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {!result && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-[#1E88E5]/10"><Upload className="w-5 h-5 text-[#1E88E5]" /></div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground mb-1">Supported Formats</p>
                    <p className="text-[12px] text-muted-foreground">PNG, JPG, and GIF images</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-[#1E88E5]/10"><AlertCircle className="w-5 h-5 text-[#1E88E5]" /></div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground mb-1">Quality Matters</p>
                    <p className="text-[12px] text-muted-foreground">Clear fundus images yield best results</p>
                  </div>
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-[#1E88E5]/10"><Check className="w-5 h-5 text-[#1E88E5]" /></div>
                  <div>
                    <p className="text-[13px] font-medium text-foreground mb-1">Fast Processing</p>
                    <p className="text-[12px] text-muted-foreground">Instant AI-powered analysis</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadScan;