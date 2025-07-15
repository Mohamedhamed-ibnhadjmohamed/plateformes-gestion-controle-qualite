export class AllProduit {
  id_order: number;
  libelle: string;
  designation: string;
  qte_demandee: number;
  date: string;
  couleur: string;
  taille: string;
  niveau: number;
  id_produit: number;
  code: string;
  quantite: number;
  id_aql: number;
  nom: string;
  description: string;
  id_detail_aql: number;
  qte_min: number;
  qte_max: number;
  qte_critique: number;
  qte_mineure: number;
  qte_majeure: number;
  libelle_produit: string;
  libelle_order: string;
  designation_order: string;

  constructor(
    id_order: number,
    libelle: string,
    designation: string,
    qte_demandee: number,
    date: string,
    couleur: string,
    taille: string,
    niveau: number,
    id_produit: number,
    code: string,
    quantite: number,
    id_aql: number,
    nom: string,
    description: string,
    id_detail_aql: number,
    qte_min: number,
    qte_max: number,
    qte_critique: number,
    qte_mineure: number,
    qte_majeure: number,
    libelle_produit: string,
    libelle_order: string,
    designation_order: string
  ) {
    this.id_order = id_order;
    this.libelle = libelle;
    this.designation = designation;
    this.qte_demandee = qte_demandee;
    this.date = date;
    this.couleur = couleur;
    this.taille = taille;
    this.niveau = niveau;
    this.id_produit = id_produit;
    this.code = code;
    this.quantite = quantite;
    this.id_aql = id_aql;
    this.nom = nom;
    this.description = description;
    this.id_detail_aql = id_detail_aql;
    this.qte_min = qte_min;
    this.qte_max = qte_max;
    this.qte_critique = qte_critique;
    this.qte_mineure = qte_mineure;
    this.qte_majeure = qte_majeure;
    this.libelle_produit = libelle_produit;
    this.libelle_order = libelle_order;
    this.designation_order = designation_order;
  }
}
