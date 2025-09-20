import { useEffect, useState } from "react";
import { HttpService, HttpError } from '../../services/httpService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import PageMeta from "../../components/common/PageMeta";
import StatCard from "../../components/common/StatCard";
import ChartCard from "../../components/common/ChartCard";
import DonutChart from "../../components/charts/DonutChart";
import { 
  UserCircleIcon, 
  CalenderIcon,
  CheckCircleIcon,
  TimeIcon
} from '../../icons';

interface PatientDashboardData {
  totalDepistages: number;
  dernierScore: number;
  depistagesParMois: Array<{ date: string; count: number }>;
  medecinActuel?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

interface RendezVousStats {
  passes: number;
  aVenir: number;
  enAttente: number;
}

export default function PatientDashboard() {
  const [data, setData] = useState<PatientDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = parseInt(localStorage.getItem("userId") || "0");
  const [rdvStats, setRdvStats] = useState<RendezVousStats | null>(null);
  const [currentAdviceIndex, setCurrentAdviceIndex] = useState(0);

  const healthAdvices = [
    {
      title: "Arrêt du tabac",
      content: "Arrêter de fumer diminue votre risque cardiovasculaire de 50 %",
      color: "red"
    },
    {
      title: "Activité physique",
      content: "30 minutes d'activité physique par jour diminuent de 30 % le risque d'accidents cardiovasculaires",
      color: "green"
    },
    {
      title: "Bienfaits du rire",
      content: "Rire permet de diminuer le cortisol, l'hormone du stress, de stabiliser le rythme cardiaque et de diminuer la pression artérielle",
      color: "yellow"
    },
    {
      title: "Sommeil régulier",
      content: "Les horaires de sommeil irréguliers doublent le risque de maladies cardiovasculaires",
      color: "purple"
    },
    {
      title: "Dépistage régulier",
      content: "Effectuez un dépistage tous les 3 mois pour un suivi optimal de votre santé",
      color: "green"
    },
    {
      title: "Prochaine consultation",
      content: "N'oubliez pas de prendre rendez-vous avec votre médecin si votre score augmente",
      color: "blue"
    },
    {
      title: "Télémédecine",
      content: "Demandez à votre médecin une consultation en ligne grâce à la télémédecine",
      color: "indigo"
    },
    {
      title: "Hydratation",
      content: "Boire 1,5 à 2 litres d'eau par jour améliore la circulation sanguine et réduit la tension artérielle",
      color: "blue"
    },
    {
      title: "Alimentation équilibrée",
      content: "Consommer 5 fruits et légumes par jour réduit de 20% le risque de maladies cardiovasculaires",
      color: "green"
    },
    {
      title: "Gestion du stress",
      content: "La méditation et les exercices de respiration peuvent réduire la pression artérielle de 10 à 20 mmHg",
      color: "purple"
    },
    {
      title: "Réduction du sel",
      content: "Limiter le sel à 5g par jour peut diminuer la pression artérielle de 5 à 6 mmHg",
      color: "orange"
    },
    {
      title: "Contrôle du poids",
      content: "Perdre 5 à 10 kg peut réduire la pression artérielle de 5 à 20 mmHg",
      color: "yellow"
    },
    {
      title: "Activité sociale",
      content: "Maintenir des liens sociaux réduit le risque de dépression et améliore la santé cardiovasculaire",
      color: "pink"
    },
    {
      title: "Protection solaire",
      content: "Une exposition modérée au soleil (15-20 min/jour) favorise la production de vitamine D, essentielle pour la santé cardiaque",
      color: "orange"
    },
    {
      title: "Suivi médical",
      content: "Un bilan de santé annuel permet de détecter précocement 80% des maladies cardiovasculaires",
      color: "red"
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await HttpService.get<PatientDashboardData>(`https://fadakcare-backend-1.onrender.com/api/dashboard/patient/${id}`);
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
        const { data } = await HttpService.get<RendezVousStats>(`http://localhost:5120/api/rendezvous/statistiques/patient/${id}`);
        setRdvStats(data);
      } catch (error) {
        console.error('Erreur lors du chargement des stats RDV:', error);
      }
    };
    fetchStats();
  }, [id]);

  // Alternance des conseils toutes les 5 minutes (300000ms)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdviceIndex((prevIndex) => (prevIndex + 1) % healthAdvices.length);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [healthAdvices.length]);

  const getAdviceColorClasses = (color: string) => {
    const colorMap = {
      red: "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300",
      green: "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300",
      yellow: "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300",
      purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300",
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300",
      indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-300",
      orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300",
      pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-800 dark:text-pink-300",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.green;
  };

  const Header = () => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center ring-8 ring-blue-50/60 dark:ring-blue-900/10">
          <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Mon Tableau de Bord</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Suivi de votre santé et de vos rendez-vous</p>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <button onClick={() => window.location.reload()} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition">Rafraîchir</button>
      </div>
    </div>
  );

  const Body = () => (
    <div className="p-6 space-y-10">
      {/* Statistiques Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Mes Dépistages"
          value={data?.totalDepistages || 0}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="RDV à Venir"
          value={rdvStats?.aVenir || 0}
          icon={<CalenderIcon className="w-6 h-6" />}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Dernier Score"
          value={data?.dernierScore || 0}
          icon={<UserCircleIcon className="w-6 h-6" />}
          color={data?.dernierScore && data.dernierScore >= 7 ? 'red' : data?.dernierScore && data.dernierScore >= 4 ? 'yellow' : 'green'}
          loading={loading}
        />
      </div>

      {/* RDV */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          title="RDV Passés"
          value={rdvStats?.passes || 0}
          icon={<CheckCircleIcon className="w-6 h-6" />}
          color="gray"
          loading={loading}
        />
        <StatCard
          title="RDV en Attente"
          value={rdvStats?.enAttente || 0}
          icon={<TimeIcon className="w-6 h-6" />}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard 
          title="Mes Dépistages par Mois"
          action={
            <select 
              aria-label="Filtrer la période des dépistages" 
              title="Filtrer la période des dépistages" 
              className="text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
              <option>6 derniers mois</option>
              <option>12 derniers mois</option>
            </select>
          }
        >
          <div className="h-80">
            {loading ? (
              <div className="h-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.depistagesParMois || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Mon Dernier Score">
          <div className="h-80 flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center">
                <div className="w-48 h-48 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse mb-4"></div>
                <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
            ) : (
              <>
                <DonutChart moyenneScore={data?.dernierScore || 0} />
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Votre dernier score de dépistage</p>
                  <p className="text-xs text-gray-400 mt-1">Sur une échelle de 0 à 10</p>
                </div>
              </>
            )}
          </div>
          {!loading && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-center space-x-6 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2" /><span>0-3: Bon</span></div>
                <div className="flex items-center"><span className="w-3 h-3 bg-yellow-500 rounded-full mr-2" /><span>4-6: Attention</span></div>
                <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-full mr-2" /><span>7-10: Urgent</span></div>
              </div>
            </div>
          )}
        </ChartCard>
      </div>

      {data?.medecinActuel && (
        <ChartCard title="Mon Médecin">
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-4 rounded-full">
                <UserCircleIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Dr. {data.medecinActuel.prenom} {data.medecinActuel.nom}</h3>
                <p className="text-gray-500 dark:text-gray-400">{data.medecinActuel.email}</p>
              </div>
            </div>
          </div>
        </ChartCard>
      )}

      <ChartCard title="Conseils Santé">
        <div className="p-6">
          <div className="transition-all duration-500 ease-in-out">
            <div className={`p-6 rounded-lg ${getAdviceColorClasses(healthAdvices[currentAdviceIndex].color)}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-3">{healthAdvices[currentAdviceIndex].title}</h4>
                  <p className="text-sm leading-relaxed">{healthAdvices[currentAdviceIndex].content}</p>
                </div>
                <div className="ml-4 flex flex-col items-center">
                  <div className="text-xs opacity-60 mb-2">
                    {currentAdviceIndex + 1} / {healthAdvices.length}
                  </div>
                  <div className="flex space-x-1">
                    {healthAdvices.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentAdviceIndex
                            ? 'bg-current scale-125'
                            : 'bg-current opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-current/20">
                <div className="flex justify-between items-center text-xs opacity-70">
                  <span>Conseil mis à jour automatiquement</span>
                  <button
                    onClick={() => setCurrentAdviceIndex((prev) => (prev + 1) % healthAdvices.length)}
                    className="px-3 py-1 rounded-full bg-current/10 hover:bg-current/20 transition-colors"
                  >
                    Suivant →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );

  return (
    <div className="p-6">
      <PageMeta title="Dashboard Patient - FadakCare" description="Tableau de bord patient avec suivi de santé" />
      <div className="max-w-screen-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
          {error ? (
            <div>
              <Header />
              <div className="p-6">
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30">
                    <UserCircleIcon className="w-8 h-8 text-red-500" />
                  </div>
                  <h3 className="text-lg font-medium text-red-600 mb-2">Erreur</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
                  <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Réessayer</button>
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
