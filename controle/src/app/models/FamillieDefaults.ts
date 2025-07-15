export class FamilleDefault {
  public id_famille?: number;
    public code?: string;
    public description?: string;
    public nom?: string;
  
    constructor(id_famille?: number,code?: string, description?: string,  nom?: string) {
      this.id_famille = id_famille;
      this.code = code;
      this.description = description;
      this.nom = nom;
    }
  
    static fromJson(json: any): FamilleDefault {
      return Object.assign(new FamilleDefault(
        json.id_famille,
        json.code,
        json.description,
        json.nom
      ), json);
    }
  }
  