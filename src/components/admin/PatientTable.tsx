import React from 'react';
import { Patient } from '../../types';

interface PatientTableProps {
  patients: Patient[];
  loading: boolean;
  onAffecter: (patient: Patient) => void;
  onDesaffecter: (patientId: number) => void;
}

const PatientTable: React.FC<PatientTableProps> = ({ 
  patients, 
  loading, 
  onAffecter, 
  onDesaffecter 
}) => {
  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="py-6 px-4 md:px-6 xl:px-7.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Chargement...
          </h4>
        </div>
        <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5">
          {[...Array(7)].map((_, index) => (
            <div key={index} className="col-span-1 flex items-center">
              <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-full animate-pulse"></div>
            </div>
          ))}
        </div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5">
            {[...Array(7)].map((_, colIndex) => (
              <div key={colIndex} className="col-span-1 flex items-center">
                <div className="h-4 bg-gray-200 rounded dark:bg-gray-700 w-3/4 animate-pulse"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Liste des Patients ({patients.length})
        </h4>
      </div>

      <div className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5">
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Nom</p>
        </div>
        <div className="col-span-1 hidden items-center sm:flex">
          <p className="font-medium">Date de naissance</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Email</p>
        </div>
        <div className="col-span-1 hidden items-center sm:flex">
          <p className="font-medium">Profession</p>
        </div>
        <div className="col-span-1 hidden items-center sm:flex">
          <p className="font-medium">Téléphone</p>
        </div>
        <div className="col-span-1 flex items-center">
          <p className="font-medium">Médecin</p>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <p className="font-medium">Actions</p>
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Aucun patient trouvé</p>
        </div>
      ) : (
        patients.map((patient) => (
          <div
            key={patient.id}
            className="grid grid-cols-7 border-t border-stroke py-4.5 px-4 dark:border-strokedark sm:grid-cols-7 md:px-6 2xl:px-7.5 hover:bg-gray-2 dark:hover:bg-meta-4"
          >
            <div className="col-span-1 flex items-center">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                  {patient.nom.charAt(0).toUpperCase()}
                </div>
                <p className="text-sm text-black dark:text-white ml-2">
                  {patient.nom}
                </p>
              </div>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">
                {new Date(patient.dateNaissance).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white truncate">
                {patient.email}
              </p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">
                {patient.profession}
              </p>
            </div>
            <div className="col-span-1 hidden items-center sm:flex">
              <p className="text-sm text-black dark:text-white">
                {patient.telephone}
              </p>
            </div>
            <div className="col-span-1 flex items-center">
              <p className="text-sm text-black dark:text-white">
                {patient.medecin ? patient.medecin.nom : (
                  <span className="text-orange-500">Aucun</span>
                )}
              </p>
            </div>
            <div className="col-span-1 flex items-center justify-center">
              {patient.medecin ? (
                <button
                  onClick={() => onDesaffecter(patient.id)}
                  className="inline-flex items-center justify-center rounded-md bg-red-600 py-2 px-3 text-center font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  title="Désaffecter"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => onAffecter(patient)}
                  className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-3 text-center font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title="Affecter à un médecin"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default PatientTable;
