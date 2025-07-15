export class Inspection {
  id_inspection?: number;
  date?: Date;
  observations?: string;
  type_categorie?: string;
  designation?: string;
  id_produit?: number;
  id_utilisateur?: number;
  resultat?: string;

  constructor(
    id_inspection?: number,
    date?: Date,
    observations?: string,
    type_categorie?: string,
    designation?: string,
    id_produit?: number,
    id_utilisateur?: number,
    resultat?: string
  ) {
    this.id_inspection = id_inspection;
    this.date = date;
    this.observations = observations;
    this.type_categorie = type_categorie;
    this.designation = designation;
    this.id_produit = id_produit;
    this.id_utilisateur = id_utilisateur;
    this.resultat = resultat;
  }
}
