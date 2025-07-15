export class Order {
  id_order?: number;
  libelle_order?: string;
  designation_order?: string;
  qte_demandee?: number;
  date?: Date;
  couleur?: string;
  taille?: string;
  niveau?: number;

  constructor(
    id_order?: number,
    libelle_order?: string,
    designation_order?: string,
    qte_demandee?: number,
    date?: Date,
    couleur?: string,
    taille?: string,
    niveau?: number
  ) {
    this.id_order = id_order;
    this.libelle_order = libelle_order;
    this.designation_order = designation_order;
    this.qte_demandee = qte_demandee;
    this.date = date;
    this.couleur = couleur;
    this.taille = taille;
    this.niveau = niveau;
  }
}
