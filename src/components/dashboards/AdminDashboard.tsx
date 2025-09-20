import { useEffect, useState } from "react";
import { HttpService, HttpError } from '../../services/httpService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PageMeta from "../../components/common/PageMeta";
import StatCard from "../../components/common/StatCard";
import ChartCard from "../../components/common/ChartCard";
import DonutChart from "../../components/charts/DonutChart";
import { 
  UserCircleIcon, 
  DocsIcon, 
  AlertIcon, 
  TaskIcon, 
  CalenderIcon,
  CheckCircleIcon,
  CloseIcon,
  TimeIcon
} from '../../icons';

interface DashboardData {
  totalPatients: number;
  totalMedecins: number;
  totalAdmins: number;
  totalAlertes: number;
  depistagesParJour: Array<{ date: string; count: number }>;
  moyenneScore: number;
  totalDepistages: number;
  scoreGraves: number;
  patientNonAffectes: number;
}

interface RendezVousStats {
  passes: number;
  aVenir: number;
  enAttente: number;
  refuses: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rdvStats, setRdvStats] = useState<RendezVousStats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await HttpService.get<DashboardData>("https://fadakcare-backend-1.onrender.com/api/dashboard/admin");
        setData(data);
      } catch (error) {
        if (error instanceof HttpError) {
          console.error(`Erreur HTTP dashboard admin (${error.status}):`, error);
        } else {
          console.error('Erreur lors du chargement des données:', error);
        }
        setError("Impossible de charger les données. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await HttpService.get<RendezVousStats>(`http://localhost:5120/api/rendezvous/statistiques/admin`);
        setRdvStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats RDV:', error);
      }
    };
    fetchStats();
  }, []);

  const Header = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center ring-8 ring-indigo-50/60 dark:ring-indigo-900/10">
          <UserCircleIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Tableau de Bord Administrateur</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Aperçu global des activités et statistiques</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <button onClick={() => window.location.reload()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition">Rafraîchir</button>
      </div>
    </div>
  );

  const Body = () => (
    <div className="p-6 space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Patients" value={data?.totalPatients || 0} icon={<UserCircleIcon className="w-6 h-6" />} color="blue" loading={loading} />
        <StatCard title="Médecins" value={data?.totalMedecins || 0} icon={<DocsIcon className="w-6 h-6" />} color="emerald" loading={loading} />
        <StatCard title="Administrateurs" value={data?.totalAdmins || 0} icon={<UserCircleIcon className="w-6 h-6" />} color="purple" loading={loading} />
        <StatCard title="Alertes" value={data?.totalAlertes || 0} icon={<AlertIcon className="w-6 h-6" />} color="red" loading={loading} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Dépistages" value={data?.totalDepistages || 0} icon={<TaskIcon className="w-6 h-6" />} color="teal" loading={loading} />
        <StatCard title="Scores Graves" value={data?.scoreGraves || 0} icon={<AlertIcon className="w-6 h-6" />} color="red" loading={loading} />
        <StatCard title="Patients Non Affectés" value={data?.patientNonAffectes || 0} icon={<UserCircleIcon className="w-6 h-6" />} color="yellow" loading={loading} />
        <StatCard title="RDV à Venir" value={rdvStats?.aVenir || 0} icon={<CalenderIcon className="w-6 h-6" />} color="blue" loading={loading} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="RDV Passés" value={rdvStats?.passes || 0} icon={<CheckCircleIcon className="w-6 h-6" />} color="gray" loading={loading} />
        <StatCard title="RDV en Attente" value={rdvStats?.enAttente || 0} icon={<TimeIcon className="w-6 h-6" />} color="yellow" loading={loading} />
        <StatCard title="RDV Refusés" value={rdvStats?.refuses || 0} icon={<CloseIcon className="w-6 h-6" />} color="red" loading={loading} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <ChartCard 
          title="Dépistages par Jour"
          className="lg:col-span-2"
          action={<select aria-label="Plage temporelle" title="Plage temporelle" className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"><option>7 derniers jours</option><option>30 derniers jours</option></select>}
        >
          <div className="h-80">
            {loading ? <div className="h-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.depistagesParJour}>
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
                  <p className="text-sm text-gray-500 dark:text-gray-400">Score moyen de tous les patients</p>
                  <p className="text-xs text-gray-400 mt-1">Sur une échelle de 0 à 10</p>
                </div>
              </>
            )}
          </div>
          {!loading && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-center space-x-6 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2" /><span>0-3: Faible</span></div>
                <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2" /><span>4-6: Modéré</span></div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2" /><span>7-10: Élevé</span></div>
              </div>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <PageMeta title="Dashboard Administrateur - FadakCare" description="Tableau de bord administrateur avec statistiques globales" />
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
                  <h3 className="text-lg font-medium text-red-600 mb-2">Erreur de chargement</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Réessayer</button>
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
