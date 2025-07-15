export class AQL {
  public id_aql?: number;
  public nom?: string;
  public description?: string;

  public qte_min?: number;
  public qte_max?: number;
  public qte_critique?: number;
  public qte_mineure?: number;
  public qte_majeure?: number;

  constructor(
    id_aql?: number,
    nom?: string,
    description?: string,
    qte_min?: number,
    qte_max?: number,
    qte_critique?: number,
    qte_mineure?: number,
    qte_majeure?: number
  ) {
    this.id_aql = id_aql;
    this.nom = nom;
    this.description = description;
    this.qte_min = qte_min;
    this.qte_max = qte_max;
    this.qte_critique = qte_critique;
    this.qte_mineure = qte_mineure;
    this.qte_majeure = qte_majeure;
  }

  static fromJson(json: any): AQL {
    return Object.assign(
      new AQL(
        json.id_aql,
        json.nom,
        json.description,
        json.qte_min,
        json.qte_max,
        json.qte_critique,
        json.qte_mineure,
        json.qte_majeure
      ),
      json
    );
  }
}
