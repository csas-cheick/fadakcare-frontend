import { useEffect, useState } from "react";
import { HttpService, HttpError } from '../../services/httpService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PageMeta from "../../components/common/PageMeta";
import StatCard from "../../components/common/StatCard";
import ChartCard from "../../components/common/ChartCard";
import DonutChart from "../../components/charts/DonutChart";
import { 
  UserCircleIcon, 
  AlertIcon, 
  CalenderIcon,
  CheckCircleIcon,
  TimeIcon
} from '../../icons';

interface DoctorDashboardData {
  totalPatients: number;
  totalAlertes: number;
  depistagesParJour: Array<{ date: string; count: number }>;
  moyenneScore: number;
  patientsRecents?: Array<{
    id: number;
    nom: string;
    prenom: string;
    dernierDepistage: string;
    score: number;
  }>;
}

interface RendezVousStats {
  passes: number;
  aVenir: number;
  enAttente: number;
}

export default function DoctorDashboard() {
  const [data, setData] = useState<DoctorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = parseInt(localStorage.getItem("userId") || "0");
  const [rdvStats, setRdvStats] = useState<RendezVousStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await HttpService.get<DoctorDashboardData>(`https://fadakcare-backend-1.onrender.com/api/dashboard/medecin/${id}`);
        setData(data);
      } catch (error) {
        if (error instanceof HttpError) {
          console.error(`Erreur HTTP dashboard (${error.status}):`, error);
        } else {
          console.error('Erreur lors du chargement des données:', error);
        }
        setError("Impossible de charger les données du dashboard. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await HttpService.get<RendezVousStats>(`http://localhost:5120/api/rendezvous/statistiques/medecin/${id}`);
        setRdvStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats RDV:', error);
      }
    };
    fetchStats();
  }, [id]);

  const Header = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center ring-8 ring-emerald-50/60 dark:ring-emerald-900/10">
          <UserCircleIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de Bord Médecin</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aperçu de votre activité et de vos patients</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <button onClick={() => window.location.reload()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition">Rafraîchir</button>
      </div>
    </div>
  );

  const Body = () => (
    <div className="p-6 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Mes Patients" value={data?.totalPatients || 0} icon={<UserCircleIcon className="w-6 h-6" />} color="emerald" loading={loading} />
        <StatCard title="Alertes" value={data?.totalAlertes || 0} icon={<AlertIcon className="w-6 h-6" />} color="red" loading={loading} />
        <StatCard title="RDV à Venir" value={rdvStats?.aVenir || 0} icon={<CalenderIcon className="w-6 h-6" />} color="blue" loading={loading} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard title="RDV Passés" value={rdvStats?.passes || 0} icon={<CheckCircleIcon className="w-6 h-6" />} color="gray" loading={loading} />
        <StatCard title="RDV en Attente" value={rdvStats?.enAttente || 0} icon={<TimeIcon className="w-6 h-6" />} color="yellow" loading={loading} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title="Dépistages par Jour"
          action={<select 
            aria-label="Filtrer la période des dépistages" 
            title="Filtrer la période des dépistages" 
            className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
          </select>}
        >
          <div className="h-80">
            {loading ? <div className="h-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.depistagesParJour || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#0d9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
        <ChartCard title="Moyenne des Scores">
          <div className="h-80 flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-4"></div>
                <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <DonutChart moyenneScore={data?.moyenneScore || 0} />
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Score moyen de vos patients</p>
                  <p className="text-xs text-gray-400 mt-1">Sur une échelle de 0 à 10</p>
                </div>
              </>
            )}
          </div>
          {!loading && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-center space-x-6 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span><span>0-3: Faible</span></div>
                <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span><span>4-6: Modéré</span></div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span><span>7-10: Élevé</span></div>
              </div>
            </div>
          )}
        </ChartCard>
      </div>
      {data?.patientsRecents && data.patientsRecents.length > 0 && (
        <ChartCard title="Patients Récents">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dernier dépistage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {data.patientsRecents.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-gray-900 dark:text-gray-100">{patient.prenom} {patient.nom}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{new Date(patient.dernierDepistage).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${patient.score >= 7 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : patient.score >= 4 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'}`}>{patient.score}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <PageMeta title="Dashboard Médecin - FadakCare" description="Tableau de bord médecin avec aperçu des patients" />
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          {error ? (
            <div>
              <Header />
              <div className="p-6">
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
                    <AlertIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-red-600 mb-2">Erreur</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">Réessayer</button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Header />
              <Body />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
