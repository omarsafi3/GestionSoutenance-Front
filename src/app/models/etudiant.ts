export interface Etudiant {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  matricule: string;
  filiere: string;
  niveau: string;
  encadrantId?: number;
}