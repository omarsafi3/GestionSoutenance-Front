export type RoleJury = 'PRESIDENT' | 'RAPPORTEUR' | 'EXAMINATEUR';

export interface Soutenance {
  id?: number;
  titre: string;
  dateHeure?: string;
  dureeMinutes?: number;
  etudiantId?: number;
  etudiantNom?: string;
  etudiantPrenom?: string;
  encadrantId?: number;
  salleId?: number;
  statut?: string;
}

export interface Encadrant {
  id?: number;
  nom: string;
  prenom: string;
  email?: string;
  grade?: string;
  specialite?: string;
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