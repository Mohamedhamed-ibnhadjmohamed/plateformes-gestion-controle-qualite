export class Utilisateur {
  public email?: string;
  public id_utilisateur?: number;
  public mot_de_passe?: string;
  public nom?: string;
  public prenom?: string;

  constructor(
    email?: string,
    mot_de_passe?: string,
    nom?: string,
    prenom?: string,
    id_utilisateur?: number,

  ) {
    this.email = email;
    this.mot_de_passe = mot_de_passe;
    this.nom = nom;
    this.prenom = prenom;
    this.id_utilisateur = id_utilisateur;

  }




}
