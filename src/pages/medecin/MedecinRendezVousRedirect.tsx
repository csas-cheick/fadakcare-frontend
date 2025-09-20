import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MedecinRendezVous: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirection vers la nouvelle page médecin rendez-vous
    navigate('/medecin/rendez-vous', { replace: true });
  }, [navigate]);

  return null;
};

export default MedecinRendezVous;
