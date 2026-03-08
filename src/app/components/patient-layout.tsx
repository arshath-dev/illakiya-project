import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./AuthContext";
import { DashboardLayout } from "./dashboard-layout";

export function PatientLayout() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "patient") {
      navigate("/doctor", { replace: true });
    }
  }, [user, navigate]);

  return <DashboardLayout role="patient" />;
}
