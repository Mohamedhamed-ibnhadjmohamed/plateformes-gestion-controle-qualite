export class Produit {
  public code?: string;
  public designation?: string;
  public id_produit?: number;
  public libelle_produit?: string;
  public niveau?: number;
  public quantite?: number;
  public id_aql?: number;
  public id_order?: number;

  constructor(
    id_produit?: number,
    code?: string,
    designation?: string,
    libelle_produit?: string,
    niveau?: number,
    quantite?: number,
    id_aql?: number,
    id_order?: number
  ) {
    this.id_produit = id_produit;
    this.code = code;
    this.designation = designation;
    this.libelle_produit = libelle_produit;
    this.niveau = niveau;
    this.quantite = quantite;
    this.id_aql = id_aql;
    this.id_order = id_order;
  }

  static fromJson(json: any): Produit {
    return Object.assign(
      new Produit(
        json.code,
        json.designation,
        json.id_produit,
        json.libelle,
        json.niveau,
        json.quantite,
        json.id_aql,
        json.id_order
      ),
      json
    );
  }
}
