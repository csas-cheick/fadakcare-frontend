/**
 * Utilitaires pour le formatage et la validation des données
 */

/**
 * Formatage des dates
 */
export class DateUtils {
  /**
   * Formate une date en français
   */
  static formatFrenchDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formate une date avec l'heure
   */
  static formatFrenchDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Calcule l'âge à partir de la date de naissance
   */
  static calculateAge(birthDate: string | Date): number {
    const today = new Date();
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Vérifie si une date est dans le futur
   */
  static isFutureDate(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj > new Date();
  }

  /**
   * Formate une durée en heures/minutes
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} min`;
    }
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
  }
}

/**
 * Utilitaires de validation
 */
export class ValidationUtils {
  /**
   * Valide un email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un numéro de téléphone français
   */
  static isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Valide un mot de passe
   */
  static isValidPassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Le mot de passe doit contenir au moins 8 caractères');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une majuscule');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins une minuscule');
    }

    if (!/\d/.test(password)) {
      errors.push('Le mot de passe doit contenir au moins un chiffre');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valide un numéro de sécurité sociale
   */
  static isValidSSN(ssn: string): boolean {
    // Format français simplifié: 13 chiffres + 2 chiffres de clé
    const ssnRegex = /^[12]\d{2}(0[1-9]|1[0-2])\d{2}(\d{3})\d{3}(\d{2})$/;
    return ssnRegex.test(ssn.replace(/\s/g, ''));
  }
}

/**
 * Utilitaires de formatage de texte
 */
export class TextUtils {
  /**
   * Capitalise la première lettre
   */
  static capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Formate un nom (Prénom NOM)
   */
  static formatName(name: string): string {
    return name
      .split(' ')
      .map(part => this.capitalize(part))
      .join(' ');
  }

  /**
   * Tronque un texte avec des points de suspension
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength - 3) + '...';
  }

  /**
   * Supprime les accents
   */
  static removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Génère un slug à partir d'un texte
   */
  static slugify(text: string): string {
    return this.removeAccents(text)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

/**
 * Utilitaires pour les arrays et objets
 */
export class DataUtils {
  /**
   * Groupe un array par une propriété
   */
  static groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const groupKey = String(item[key]);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  /**
   * Tri un array par une propriété
   */
  static sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }

  /**
   * Filtre les valeurs uniques d'un array
   */
  static unique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Vérifie si un objet est vide
   */
  static isEmpty(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  }
}
