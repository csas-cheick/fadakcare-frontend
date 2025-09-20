import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Register from "./pages/AuthPages/Register";
import Login from "./pages/AuthPages/Login";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import VerifyCode from "./pages/AuthPages/VerifyCode";
import ResetPassword from "./pages/AuthPages/ResetPassword";
import PatientRendezVous from "./pages/patient/PatientRendezVous";
import PatientCalendrier from "./pages/patient/PatientCalendrier";
import MedecinRendezVousRedirect from "./pages/medecin/MedecinRendezVousRedirect";
import Messaging from "./pages/Messaging";
import MonMedecin from "./pages/patient/MonMedecin";
import Messagerie from "./pages/patient/Messagerie";
import RendezVous from "./pages/RendezVous";
import NotificationsPage from "./pages/NotificationsPage";
import MesResultats from "./pages/patient/MesResultats";
import DetailResultat from "./pages/patient/DetailResultat";
import DepistagePatientPage from "./pages/patient/DepistagePatientPage";
import PatientsAdminPage from "./pages/admin/PatientsAdminPage";
import MedecinsAdminPage from "./pages/admin/MedecinsAdminPage";
import DepistageAdminPage from "./pages/admin/DepistageAdminPage";
import AdminAlertesPage from "./pages/admin/AdminAlertesPage";
import MesPatientsPage from "./pages/medecin/MesPatientsPage";
import PatientDetailPage from "./pages/medecin/PatientDetailPage";
import PatientResultatsPage from "./pages/medecin/PatientResultatsPage";
import MedecinRendezVousPage from "./pages/medecin/MedecinRendezVousPage";
import MedecinCalendrierPage from "./pages/medecin/MedecinCalendrierPage";
import MedecinAlertesPage from "./pages/medecin/MedecinAlertesPage";
import PatientAlertesPage from "./pages/patient/PatientAlertesPage";
import AdminRendezVousPage from "./pages/admin/AdminRendezVousPage";
import AdminTelemedicinePage from "./pages/admin/AdminTelemedicinePage";
import MedecinTelemedicinePage from "./pages/medecin/MedecinTelemedicinePage";
import PatientTelemedicinePage from "./pages/patient/PatientTelemedicinePage";
import VideoCall from "./components/telemedecine/VideoCall";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route index path="/" element={<Login />} />
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/home" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/medecin-rendez-vous" element={<MedecinRendezVousRedirect />} />
            <Route path="/patient/rendez-vous" element={<PatientRendezVous />} />
            <Route path="/patient/calendrier" element={<PatientCalendrier />} />
            <Route path="/patient/medecin" element={<MonMedecin />} />
            <Route path="/patient/messagerie" element={<Messagerie />} />
            <Route path="/patient/prendre-rendez-vous" element={<RendezVous />} />
            <Route path="/patient/depistage" element={<DepistagePatientPage />} />
            <Route path="/patient/resultats" element={<MesResultats />} />
            <Route path="/patient/resultats/:id" element={<DetailResultat />} />
            <Route path="/patient/alerte" element={<PatientAlertesPage />} />
            <Route path="/patient/telemedecine" element={<PatientTelemedicinePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
 
            {/* Admin Pages */}
            <Route path="/admin/patients" element={<PatientsAdminPage />} />
            <Route path="/admin/medecins" element={<MedecinsAdminPage />} />
            <Route path="/admin/depistage" element={<DepistageAdminPage />} />
            <Route path="/admin/alertes" element={<AdminAlertesPage />} />
            <Route path="/admin/rendez-vous" element={<AdminRendezVousPage />} />
            <Route path="/admin/telemedecine" element={<AdminTelemedicinePage />} />

            {/* Medecin Pages */}
            <Route path="/medecin/mes-patients" element={<MesPatientsPage />} />
            <Route path="/medecin/patient/:patientId" element={<PatientDetailPage />} />
            <Route path="/medecin/patient/:patientId/resultats" element={<PatientResultatsPage />} />
            <Route path="/medecin/rendez-vous" element={<MedecinRendezVousPage />} />
            <Route path="/medecin/calendrier" element={<MedecinCalendrierPage />} />
            <Route path="/medecin/alerte" element={<MedecinAlertesPage />} />
            <Route path="/medecin/telemedecine" element={<MedecinTelemedicinePage />} />
            
            {/* Telemedecine Pages */}
            <Route path="/video-call/:sessionId" element={<VideoCall />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/verifyCode" element={<VerifyCode />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          
          {/* Video Call - Full Screen */}
          <Route path="/call/:sessionId" element={<VideoCall />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
