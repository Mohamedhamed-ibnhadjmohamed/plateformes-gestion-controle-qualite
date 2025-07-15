export class Default {
  id_defaults?: number;
  description?: string;
  image?: string;
  id_famille?: number;
  id_inspection?: number;
  nombre?: number;
  type?: 'critique' | 'mineur' | 'majeur';
  id_employee?: number;

  constructor (
    id_defaults?: number ,
    description?: string,
    image?: string ,
    id_famille?: number ,
    id_inspection?: number ,
    nombre?: number ,
    type?: 'critique' | 'mineur' | 'majeur' ,
    id_employee?: number
  ) {
    this.id_defaults = id_defaults;
    this.description = description;
    this.image = image;
    this.id_famille = id_famille;
    this.id_inspection = id_inspection;
    this.nombre = nombre;
    this.type = type;
    this.id_employee = id_employee;
  }
}
