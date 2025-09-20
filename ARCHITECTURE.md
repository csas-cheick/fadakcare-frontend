# 📋 Architecture FadakCare Web - Guide de Structure

## 🏗️ Vue d'ensemble de l'architecture

Cette documentation décrit la nouvelle architecture modulaire et maintenable du projet FadakCare Web.

## 📁 Structure des dossiers

```
src/
├── 📂 types/                    # Types TypeScript centralisés
│   ├── auth.ts                  # Types d'authentification
│   ├── patient.ts               # Types liés aux patients  
│   ├── medecin.ts               # Types liés aux médecins
│   ├── rendez-vous.ts           # Types des rendez-vous
│   ├── depistage.ts             # Types de dépistage
│   ├── messaging.ts             # Types de messagerie
│   ├── resultats.ts             # Types des résultats médicaux
│   ├── alertes.ts               # Types des alertes
│   ├── telemedecine.ts          # Types de télémédecine
│   ├── common.ts                # Types utilitaires
│   └── index.ts                 # Point d'entrée
│
├── 📂 services/                 # Services organisés par couches
│   ├── 📂 api/                  # Couche d'accès aux données
│   │   ├── base-api.service.ts         # Service HTTP de base
│   │   ├── auth-api.service.ts         # API d'authentification
│   │   ├── patient-api.service.ts      # API des patients
│   │   ├── rendez-vous-api.service.ts  # API des rendez-vous
│   │   └── index.ts                    # Exports des services API
│   │
│   ├── 📂 business/             # Couche de logique métier
│   │   └── auth-business.service.ts    # Logique d'authentification
│   │
│   ├── 📂 utils/                # Services utilitaires
│   │   └── data-utils.service.ts       # Utilitaires de données
│   │
│   └── index.ts                 # Point d'entrée principal
│
├── 📂 components/               # Composants React organisés
│   ├── 📂 ui/                   # Composants UI génériques
│   │   ├── button/              # Composant bouton
│   │   ├── modal/               # Composant modal
│   │   ├── badge/               # Composant badge
│   │   └── index.ts             # Exports des composants UI
│   │
│   ├── 📂 shared/               # Composants partagés
│   │   ├── layouts/             # Layouts réutilisables
│   │   └── navigation/          # Composants de navigation
│   │
│   ├── 📂 business/             # Composants métier spécialisés
│   │   ├── patient/             # Composants spécifiques aux patients
│   │   ├── medecin/             # Composants spécifiques aux médecins
│   │   └── admin/               # Composants spécifiques aux admins
│   │
│   └── 📂 features/             # Composants par fonctionnalité
│       ├── auth/                # Composants d'authentification
│       ├── messaging/           # Composants de messagerie
│       └── telemedecine/        # Composants de télémédecine
│
└── 📂 pages/                    # Pages de l'application
    ├── 📂 patient/              # Pages patient
    ├── 📂 medecin/              # Pages médecin
    ├── 📂 admin/                # Pages admin
    └── 📂 auth/                 # Pages d'authentification
```

## 🎯 Principes architecturaux

### 1. **Séparation des responsabilités**

#### 🔧 **Services API** (`services/api/`)
- **Responsabilité** : Communication directe avec le backend
- **Contenu** : Appels HTTP, gestion des erreurs réseau, sérialisation
- **Exemple** : `AuthApiService.login()`, `PatientApiService.getPatients()`

#### 💼 **Services Business** (`services/business/`)
- **Responsabilité** : Logique métier, validations, transformations
- **Contenu** : Règles business, orchestration d'API, gestion d'état complexe
- **Exemple** : `AuthBusinessService.login()` (API + session + validation)

#### 🛠️ **Services Utils** (`services/utils/`)
- **Responsabilité** : Fonctions utilitaires réutilisables
- **Contenu** : Formatage, validation, helpers génériques
- **Exemple** : `DateUtils.formatFrenchDate()`, `ValidationUtils.isValidEmail()`

### 2. **Types centralisés**

```typescript
// ✅ Bonne pratique - Import centralisé
import { Patient, CreatePatientRequest } from '../../types';

// ❌ Éviter - Types dispersés
interface Patient { ... } // défini dans chaque fichier
```

### 3. **Composants hiérarchisés**

#### 🎨 **Composants UI** (`components/ui/`)
- Composants génériques réutilisables
- Aucune logique métier
- Props configurables

#### 🏢 **Composants Business** (`components/business/`)
- Composants spécialisés par domaine
- Logique métier intégrée
- Utilisent les services business

#### 🔧 **Composants Shared** (`components/shared/`)
- Composants partagés entre domaines
- Layouts, navigation, utilitaires

## 📚 Guide d'utilisation

### ✨ **Créer un nouveau service API**

```typescript
// services/api/nouveau-service-api.service.ts
import { BaseApiService } from './base-api.service';
import { MonType } from '../../types';

export class NouveauApiService extends BaseApiService {
  private static readonly ENDPOINTS = {
    base: '/nouveau',
    byId: (id: number) => `/nouveau/${id}`,
  };

  static async getAll(): Promise<MonType[]> {
    return this.get<MonType[]>(this.ENDPOINTS.base);
  }

  static async getById(id: number): Promise<MonType> {
    return this.get<MonType>(this.ENDPOINTS.byId(id));
  }
}
```

### 🎯 **Créer un service business**

```typescript
// services/business/nouveau-business.service.ts
import { NouveauApiService } from '../api/nouveau-service-api.service';
import { MonType } from '../../types';

export class NouveauBusinessService {
  static async getWithValidation(id: number): Promise<MonType> {
    // Validation métier
    if (id <= 0) {
      throw new Error('ID invalide');
    }

    // Appel API
    const result = await NouveauApiService.getById(id);
    
    // Transformation métier
    return this.transformData(result);
  }

  private static transformData(data: MonType): MonType {
    // Logique de transformation
    return data;
  }
}
```

### 🎨 **Créer un composant UI réutilisable**

```typescript
// components/ui/nouveau-composant/NouveauComposant.tsx
interface NouveauComposantProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
}

export const NouveauComposant: React.FC<NouveauComposantProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick
}) => {
  // Composant UI générique sans logique métier
  return (
    <div className={`nouveau-composant ${variant} ${size}`} onClick={onClick}>
      {children}
    </div>
  );
};
```

## 🔄 Migration progressive

### Phase 1 : **Types** ✅
- [x] Centralisation des interfaces TypeScript
- [x] Organisation par domaine métier
- [x] Point d'entrée unique

### Phase 2 : **Services** 🚧
- [x] Services API structurés
- [x] Services business créés
- [ ] Migration des anciens services
- [ ] Tests unitaires

### Phase 3 : **Composants** 📋
- [ ] Réorganisation des composants UI
- [ ] Création des composants business
- [ ] Documentation des composants

### Phase 4 : **Pages** 📋
- [ ] Restructuration des pages
- [ ] Utilisation des nouveaux services
- [ ] Optimisation des performances

## 🎯 Bonnes pratiques

### ✅ **À faire**
- Utiliser les nouveaux services API/Business
- Importer les types depuis `types/`
- Créer des composants UI réutilisables
- Documenter les nouvelles fonctionnalités
- Écrire des tests pour les services

### ❌ **À éviter**
- Dupliquer les types/interfaces
- Mélanger logique UI et logique métier
- Appels API directs dans les composants
- Hardcoder les URLs d'API
- Ignorer la gestion d'erreurs

## 🔗 Points d'entrée

```typescript
// Types
import { Patient, Medecin, RendezVous } from '../types';

// Services modernes
import { AuthBusinessService, PatientApiService } from '../services';

// Composants UI
import { Button, Modal, Badge } from '../components/ui';

// Utilitaires
import { DateUtils, ValidationUtils } from '../services/utils/data-utils.service';
```

## 🎉 Résultat attendu

Cette architecture permet :

- **🔧 Maintenabilité** : Code organisé et facile à modifier
- **🚀 Scalabilité** : Ajout de fonctionnalités simplifié
- **♻️ Réutilisabilité** : Composants et services partagés
- **🧪 Testabilité** : Services isolés et testables
- **📖 Lisibilité** : Structure claire et documentée
- **🔒 Robustesse** : Gestion d'erreurs centralisée

---

*Architecture conçue pour l'évolutivité et la maintenabilité du projet FadakCare* 🏥✨
