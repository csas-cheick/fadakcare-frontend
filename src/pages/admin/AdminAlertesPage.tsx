import { useEffect, useState, useMemo } from 'react';
import { HttpService } from '../../services/httpService';
import PageMeta from '../../components/common/PageMeta';
import Button from '../../components/ui/button/Button';
import StatCard from '../../components/common/StatCard';
import {
  UserIcon,
  UserCircleIcon,
  ArrowRightIcon,
  AlertIcon,
  CalenderIcon,
  CloseIcon,
  SearchIcon
} from '../../icons';

interface Alerte {
  id: number;
  message: string;
  dateEnvoi: string;
  expediteurId: number;
  destinataireId: number;
  expediteurRole: string;
  destinataireRole: string;
  expediteurNom: string;
  destinataireNom: string;
}

const API_BASE_URL = 'https://fadakcare-backend-1.onrender.com/api';

export default function AdminAlertesPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [filtre, setFiltre] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtreRole, setFiltreRole] = useState<string>('tous');

  const fetchAlertes = async () => {
    setLoading(true);
    setError(null);
    try {
  const resp = await HttpService.get<Alerte[]>(`${API_BASE_URL}/alerte/toutes`);
  if (!resp.ok) throw new Error('Erreur lors du chargement des alertes');
  setAlertes(resp.data || []);
    } catch (err) {
      setError('Erreur lors du chargement des alertes');
      console.error('Erreur chargement alertes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertes();
  }, []);

  const alertesFiltrees = alertes.filter(alerte => {
    const matchTexte = alerte.expediteurNom.toLowerCase().includes(filtre.toLowerCase()) ||
                      alerte.destinataireNom.toLowerCase().includes(filtre.toLowerCase()) ||
                      alerte.message.toLowerCase().includes(filtre.toLowerCase());
    
    const matchRole = filtreRole === 'tous' || 
                     alerte.expediteurRole === filtreRole || 
                     alerte.destinataireRole === filtreRole;
    
    return matchTexte && matchRole;
  });

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'patient': return 'Patient';
      case 'medecin': 
      case 'doctor': return 'Médecin';
      case 'admin': return 'Admin';
      default: return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'patient': return <UserIcon className="h-5 w-5" />;
      case 'medecin':
      case 'doctor': return <UserCircleIcon className="h-5 w-5" />;
      case 'admin': return <AlertIcon className="h-5 w-5" />;
      default: return <UserIcon className="h-5 w-5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'medecin':
      case 'doctor': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getAvatarBgColor = (role: string) => {
    switch (role) {
      case 'patient': return 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400';
      case 'medecin':
      case 'doctor': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400';
      case 'admin': return 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const clearFiltre = () => {
    setFiltre('');
    setFiltreRole('tous');
  };

  const stats = useMemo(() => {
    const total = alertes.length;
    const patients = alertes.filter(a => a.expediteurRole === 'patient').length;
    const medecins = alertes.filter(a => a.expediteurRole === 'medecin' || a.expediteurRole === 'doctor').length;
    const today = alertes.filter(a => new Date(a.dateEnvoi).toDateString() === new Date().toDateString()).length;
    return { total, patients, medecins, today };
  }, [alertes]);

  return (
    <>
      <PageMeta
        title="Gestion des Alertes | FadakCare - Administration"
        description="Consultez et gérez toutes les alertes du système"
      />
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300">
                <AlertIcon className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestion des Alertes</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">Surveillez et gérez toutes les alertes échangées entre patients, médecins et administrateurs.</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={filtre}
                  onChange={(e) => setFiltre(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-3 text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <select
                value={filtreRole}
                onChange={(e) => setFiltreRole(e.target.value)}
                aria-label="Filtrer par rôle"
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2.5 px-3 text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="tous">Tous les rôles</option>
                <option value="patient">Patients</option>
                <option value="medecin">Médecins</option>
                <option value="admin">Administrateurs</option>
              </select>
              {(filtre || filtreRole !== 'tous') && (
                <Button
                  onClick={clearFiltre}
                  variant="outline"
                  className="text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-gray-800"
                  startIcon={<CloseIcon className="w-4 h-4" />}
                >
                  Effacer
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Total Alertes" value={stats.total} icon={<AlertIcon className="w-5 h-5" />} color="red" />
              <StatCard title="De Patients" value={stats.patients} icon={<UserIcon className="w-5 h-5" />} color="blue" />
              <StatCard title="De Médecins" value={stats.medecins} icon={<UserCircleIcon className="w-5 h-5" />} color="emerald" />
              <StatCard title="Aujourd'hui" value={stats.today} icon={<CalenderIcon className="w-5 h-5" />} color="yellow" />
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <span className="ml-2 text-gray-600 dark:text-gray-400 text-sm">Chargement des alertes...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-6 flex items-center">
                <AlertIcon className="h-6 w-6 text-red-500 mr-3" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800 dark:text-red-300">Erreur de chargement</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            ) : alertesFiltrees.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <SearchIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">Aucune alerte trouvée</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  {filtre || filtreRole !== 'tous'
                    ? 'Aucune alerte ne correspond à vos critères de recherche.'
                    : 'Il n\'y a actuellement aucune alerte dans le système.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {alertesFiltrees.map((alerte) => (
                  <div
                    key={alerte.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-red-300 dark:hover:border-red-600 hover:shadow-sm transition-colors bg-white dark:bg-gray-900"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getAvatarBgColor(alerte.expediteurRole)}`}>
                            {getRoleIcon(alerte.expediteurRole)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alerte.expediteurNom}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleBadgeColor(alerte.expediteurRole)}`}>
                              {getRoleDisplayName(alerte.expediteurRole)}
                            </span>
                          </div>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-3" />
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${getAvatarBgColor(alerte.destinataireRole)}`}>
                            {getRoleIcon(alerte.destinataireRole)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{alerte.destinataireNom}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${getRoleBadgeColor(alerte.destinataireRole)}`}>
                              {getRoleDisplayName(alerte.destinataireRole)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <p className="text-sm text-gray-800 dark:text-gray-100 mb-3 whitespace-pre-line break-words">{alerte.message}</p>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                            <CalenderIcon className="h-4 w-4 mr-1" />
                            {new Date(alerte.dateEnvoi).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
