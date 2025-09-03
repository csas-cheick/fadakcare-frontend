import { PatientResult, ResultatService } from './resultatService';
import { HttpService } from './httpService';

export class ReportService {
  /**
   * Génère et télécharge un rapport PDF pour un résultat de dépistage
   */
  static async downloadResultatReport(resultat: PatientResult): Promise<void> {
    try {
      // Générer le contenu HTML du rapport
      const reportHtml = this.generateReportHtml(resultat);
      
      // Créer un fichier blob avec le contenu
      const blob = new Blob([reportHtml], { type: 'text/html' });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-depistage-${resultat.numeroDepistage}-${new Date().toISOString().split('T')[0]}.html`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur lors du téléchargement du rapport:', error);
      throw new Error('Impossible de télécharger le rapport');
    }
  }

  /**
   * Télécharge un rapport via l'API (si disponible)
   */
  static async downloadReportFromApi(resultatId: number): Promise<void> {
    try {
      const token = localStorage.getItem('accessToken');
      let response = await fetch(`http://localhost:5120/api/patients/resultat/${resultatId}/rapport`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      if (response.status === 401) {
        // Tente un refresh silencieux via un appel JSON protégé
        try { await HttpService.get('/api/auth/refresh-probe'); } catch { /* ignore refresh probe errors */ }
        const newToken = localStorage.getItem('accessToken');
        if (newToken) {
          response = await fetch(`http://localhost:5120/api/patients/resultat/${resultatId}/rapport`, {
            method: 'GET',
            headers: { 'Accept': 'application/pdf', 'Authorization': `Bearer ${newToken}` }
          });
        }
      }

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rapport-depistage-${resultatId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement via API:', error);
      throw error;
    }
  }

  /**
   * Génère le HTML du rapport de dépistage
   */
  private static generateReportHtml(resultat: PatientResult): string {
    const formatDate = ResultatService.formatDate(resultat.dateDepistage);
    const riskLevel = this.getRiskLevel(resultat.score);
    const recommendations = this.getRecommendations(resultat.score);

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Dépistage #${resultat.numeroDepistage}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 20px;
        }
        .score-section {
            text-align: center;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
        }
        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5em;
            font-weight: bold;
            color: white;
        }
        .score-low { background: linear-gradient(135deg, #10B981, #059669); }
        .score-medium { background: linear-gradient(135deg, #F59E0B, #D97706); }
        .score-high { background: linear-gradient(135deg, #EF4444, #DC2626); }
        .risk-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            color: white;
            margin: 10px 0;
        }
        .risk-low { background-color: #10B981; }
        .risk-medium { background-color: #F59E0B; }
        .risk-high { background-color: #EF4444; }
        .analysis-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .recommendations {
            background: #e1f5fe;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #0288d1;
        }
        .recommendation-item {
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
        }
        .recommendation-icon {
            width: 20px;
            height: 20px;
            margin-right: 10px;
            margin-top: 2px;
        }
        .footer {
            text-align: center;
            color: #666;
            font-size: 0.9em;
            margin-top: 30px;
            padding: 20px;
            border-top: 1px solid #eee;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 20px 0;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        .info-label {
            font-weight: 600;
            color: #666;
            font-size: 0.9em;
        }
        .info-value {
            font-size: 1.1em;
            margin-top: 5px;
        }
        @media print {
            body { background-color: white; }
            .content { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Rapport de Dépistage</h1>
        <p>Dépistage #${resultat.numeroDepistage}</p>
    </div>

    <div class="content">
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Date du dépistage</div>
                <div class="info-value">${formatDate}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Numéro de dépistage</div>
                <div class="info-value">#${resultat.numeroDepistage}</div>
            </div>
        </div>

        <div class="score-section">
            <h2>Score d'évaluation</h2>
            <div class="score-circle score-${riskLevel.level}">
                ${resultat.score}/10
            </div>
            <div class="risk-badge risk-${riskLevel.level}">
                ${riskLevel.label}
            </div>
        </div>

        <div class="analysis-section">
            <h3>Analyse médicale</h3>
            <p style="white-space: pre-line; line-height: 1.8;">${resultat.analyse}</p>
        </div>

        <div class="recommendations">
            <h3>Recommandations</h3>
            ${recommendations.map(rec => `
                <div class="recommendation-item">
                    <div class="recommendation-icon">${rec.icon}</div>
                    <div>${rec.text}</div>
                </div>
            `).join('')}
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
            <h4 style="margin-top: 0; color: #856404;">Important</h4>
            <p style="margin-bottom: 0; color: #856404;">
                Ce rapport est généré automatiquement et ne remplace pas une consultation médicale. 
                En cas de préoccupations, consultez votre médecin traitant.
            </p>
        </div>
    </div>

    <div class="footer">
        <p>Rapport généré le ${new Date().toLocaleDateString('fr-FR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
        <p>FadakCare - Plateforme de Dépistage Médical</p>
    </div>
</body>
</html>`;
  }

  /**
   * Détermine le niveau de risque basé sur le score
   */
  private static getRiskLevel(score: number): { level: string; label: string } {
    if (score < 4) {
      return { level: 'low', label: 'Risque Faible' };
    } else if (score < 7) {
      return { level: 'medium', label: 'Risque Modéré' };
    } else {
      return { level: 'high', label: 'Risque Élevé' };
    }
  }

  /**
   * Génère les recommandations basées sur le score
   */
  private static getRecommendations(score: number): Array<{ icon: string; text: string }> {
    const checkIcon = '✅';
    const warningIcon = '⚠️';
    const alertIcon = '🚨';

    if (score < 4) {
      return [
        { icon: checkIcon, text: 'Poursuivez vos bonnes habitudes de vie' },
        { icon: checkIcon, text: 'Surveillance régulière recommandée' },
        { icon: checkIcon, text: 'Maintenez une alimentation équilibrée et une activité physique régulière' }
      ];
    } else if (score < 7) {
      return [
        { icon: warningIcon, text: 'Consultez votre médecin dans les prochaines semaines' },
        { icon: warningIcon, text: 'Suivi médical régulier conseillé' },
        { icon: warningIcon, text: 'Adoptez des mesures préventives adaptées' }
      ];
    } else {
      return [
        { icon: alertIcon, text: 'Consultation médicale urgente recommandée' },
        { icon: alertIcon, text: 'Ne tardez pas à contacter votre médecin' },
        { icon: alertIcon, text: 'Surveillez attentivement votre état de santé' }
      ];
    }
  }
}
