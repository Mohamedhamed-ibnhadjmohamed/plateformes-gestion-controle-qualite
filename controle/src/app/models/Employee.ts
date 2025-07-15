export class Employee {
  public id_employee?: number;
  public matricule?: number;
  public nom?: string;
  public prenom?: string;
  public notes?: number;

  constructor(
    id_employee?: number,
    matricule?: number,
    nom?: string,
    prenom?: string,
    notes?: number
  ) {
    this.id_employee = id_employee;
    this.matricule = matricule;
    this.nom = nom;
    this.prenom = prenom;
    this.notes = notes;
  }

  static fromJson(json: any): Employee {
    return Object.assign(
      new Employee(
        json.id_employee,
        json.matricule,
        json.nom,
        json.prenom,
        json.notes
      ),
      json
    );
  }
}
