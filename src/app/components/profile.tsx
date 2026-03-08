import { Navbar } from "./navbar";
import { useAuth } from "./AuthContext";
import { Camera, Mail, Phone, MapPin, Building, Shield, Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { toast, Toaster } from "sonner";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [hospital, setHospital] = useState("");
  const [location, setLocation] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          setInitialLoading(true);
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setName(data.name || user.name || "");
            setEmail(data.email || user.email || "");
            setPhone(data.phone || "");
            setLocation(data.location || "");
            setHospital(data.hospital || "");
            setSpecialty(data.specialty || "");
          } else {
            setName(user.name || "");
            setEmail(user.email || "");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast.error("Failed to load profile");
        } finally {
          setInitialLoading(false);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (!user?.uid) { toast.error("User not authenticated"); return; }

    setLoading(true);
    try {
      const updateData: Record<string, string> = { name, email, phone, location };
      if (user.role === "doctor") {
        updateData.hospital = hospital;
        updateData.specialty = specialty;
      }

      await updateDoc(doc(db, "users", user.uid), updateData);

      // Refresh user in AuthContext so sidebar/navbar show updated name immediately
      await refreshUser();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen">
        <Navbar title="Profile Settings" />
        <div className="flex items-center justify-center p-8">
          <Loader className="w-8 h-8 text-[#1E88E5] animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors />
      <Navbar title="Profile Settings" />
      <div className="p-4 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Avatar Section */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-[28px] font-semibold">
              {name.split(" ").map((n) => n[0]).join("").substring(0, 2) || "U"}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#1E88E5] flex items-center justify-center text-white shadow-md hover:bg-[#1976D2] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-[20px]">{name}</h2>
            <p className="text-[14px] text-muted-foreground capitalize">{user?.role}</p>
            <p className="text-[12px] text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5">
          <h3 className="text-[16px] mb-2 font-semibold">Personal Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none text-[14px]"
              />
            </div>
            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none text-[14px]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Phone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none text-[14px]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div>
              <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none text-[14px]"
                  placeholder="City, Country"
                />
              </div>
            </div>
            {user?.role === "doctor" && (
              <>
                <div>
                  <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Hospital</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={hospital}
                      onChange={(e) => setHospital(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none text-[14px]"
                      placeholder="Hospital name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] mb-2 text-muted-foreground font-medium">Specialty</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-card focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] outline-none text-[14px]"
                      placeholder="Medical specialty"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-8 py-3 bg-[#1E88E5] hover:bg-[#1976D2] disabled:opacity-50 text-white rounded-xl transition-all shadow-lg shadow-blue-200 dark:shadow-blue-900/30 text-[14px] flex items-center gap-2"
            >
              {loading ? (
                <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
