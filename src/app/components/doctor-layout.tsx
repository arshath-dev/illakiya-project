import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import { DashboardLayout } from "./dashboard-layout";

export function DoctorLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "doctor") {
      // if a non-doctor somehow navigates here, send them to their dashboard
      navigate("/patient", { replace: true });
    }
  }, [user, navigate]);

  return <DashboardLayout role="doctor" />;
}
