export type RoleJury = 'PRESIDENT' | 'RAPPORTEUR' | 'EXAMINATEUR';

export interface Soutenance {
  id?: number;
  titre: string;
  date?: string;
  duree?: number;
  presidentId?: number;
  rapporteurId?: number;
  examinateurId?: number;
  etudiantId?: number;
  etudiantNom?: string;
  etudiantPrenom?: string;
  encadrantId?: number;
  salleId?: number;
  statut?: string;
  notePresident?: number;
  noteRapporteur?: number;
  noteExaminateur?: number;
}

export interface Encadrant {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  grade: string;
  specialite: string;
}

export interface Jury {
  id?: number;
  soutenanceId: number;
  presidentId: number;
  presidentNom?: string;
  rapporteurId: number;
  rapporteurNom?: string;
  examinateurId: number;
  examinateurNom?: string;
}

export interface Note {
  id?: number;
  soutenanceId: number;
  evaluateurId: number;
  evaluateurNom?: string;
  roleJury: RoleJury;
  noteExpose: number;
  noteRapport: number;
  noteQuestions: number;
  moyenneEvaluateur?: number;
  commentaire?: string;
}

export interface Resultat {
  id?: number;
  etudiantId: number;
  soutenanceId: number;
  moyenneFinale?: number;
  mention?: string;
  decisionFinale?: string;
  valide?: boolean;
  publie?: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}
