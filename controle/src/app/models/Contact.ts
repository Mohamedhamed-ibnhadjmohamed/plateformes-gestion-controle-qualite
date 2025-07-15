export class Contact {
  id_contact?: number;
  non_utilisateur?: string;
  email?: string;
  message?: string;

  constructor(
    id_contact?: number,
    non_utilisateur?: string,
    email?: string,
    message?: string
  ) {
    this.id_contact = id_contact;
    this.non_utilisateur = non_utilisateur;
    this.email = email;
    this.message = message;
  }
}
