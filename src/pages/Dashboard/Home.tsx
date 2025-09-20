import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminDashboard from "../../components/dashboards/AdminDashboard";
import DoctorDashboard from "../../components/dashboards/DoctorDashboard";
import PatientDashboard from "../../components/dashboards/PatientDashboard";

export default function Home() {
  const navigate = useNavigate();
  const [userRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    if (!userRole) {
      navigate("/login");
    }
  }, [userRole, navigate]);

  // Handle role routing
  const getRoleComponent = () => {
    switch (userRole) {
      case "patient":
        return <PatientDashboard />;
      case "doctor":
      case "medecin": // Handle both formats for backward compatibility
        return <DoctorDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <div className="p-6 text-center">Redirection en cours...</div>;
    }
  };

  if (!userRole) {
    return <div className="p-6 text-center">Redirection en cours...</div>;
  }

  return getRoleComponent();
}
