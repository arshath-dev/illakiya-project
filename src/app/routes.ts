import { createBrowserRouter } from "react-router";
import { LoginPage } from "./components/login";
import { RegisterPage } from "./components/register";
import { DoctorLayout } from "./components/doctor-layout";
import { PatientLayout } from "./components/patient-layout";
import { DoctorDashboard } from "./components/doctor-dashboard";
import { PatientManagement } from "./components/patient-management";
import { PatientDetail } from "./components/patient-detail";
import { UploadScanDoctor } from "./components/upload-scan-doctor";
import { UploadScanPatient } from "./components/upload-scan-patient";
import { ReportsPage } from "./components/reports";
import { ReportDetail } from "./components/report-detail";

import { ProfilePage } from "./components/profile";
import { PatientDashboardPage } from "./components/patient-dashboard";
import { PatientHistory } from "./components/patient-history";

export const router = createBrowserRouter([
  { path: "/", Component: LoginPage },
  { path: "/register", Component: RegisterPage },
  {
    path: "/doctor",
    Component: DoctorLayout,
    children: [
      { index: true, Component: DoctorDashboard },
      { path: "patients", Component: PatientManagement },
      { path: "patients/:id", Component: PatientDetail },
      { path: "upload", Component: UploadScanDoctor },
      { path: "reports", Component: ReportsPage },
      { path: "reports/:patientId/:scanId", Component: ReportDetail },

      { path: "profile", Component: ProfilePage },
    ],
  },
  {
    path: "/patient",
    Component: PatientLayout,
    children: [
      { index: true, Component: PatientDashboardPage },
      { path: "upload", Component: UploadScanPatient },
      { path: "history", Component: PatientHistory },
      { path: "profile", Component: ProfilePage },
    ],
  },
]);
