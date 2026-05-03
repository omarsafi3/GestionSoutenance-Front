export enum StatutSoutenance {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE'
}

export interface Soutenance {
  id?: number;
  titre: string;
  date: string; // LocalDateTime → string
  duree: number;
  statut: StatutSoutenance;

  presidentId: number;
  rapporteurId: number;
  examinateurId: number;
  salleId: number;
  etudiantId: number;

  notePresident?: number;
  noteRapporteur?: number;
  noteExaminateur?: number;
}