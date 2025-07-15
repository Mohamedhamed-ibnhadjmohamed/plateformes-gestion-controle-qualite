import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Contact } from '../../../models/Contact';
import { ContacterService } from '../../../services/contacter.service';

@Component({
  selector: 'app-contacter',
  templateUrl: './contacter.component.html',
  styleUrls: ['../../shared/styles/style.css'],
})
export class ContacterComponent {
  name: string = 'Contact';
  contacts: Contact[] = [];
  contact: Contact = new Contact();
  isLoading = false;
  msg: string = '';

  constructor(
    private contactService: ContacterService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getAllContacts();
  }

  reloadData(): void {
    this.getAllContacts();
  }

  // Récupérer tous les contacts
  getAllContacts(): void {
    this.contactService.getAllContacts().subscribe(
      (response: any) => {
        if (response && Array.isArray(response.contacts)) {
          this.contacts = response.contacts;
          console.log('Contacts:', this.contacts);
          this.toastr.success('Contacts récupérés avec succès');
        } else {
          this.toastr.error('Format de réponse inattendu');
          console.error('Format de réponse inattendu :', response);
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des contacts :', error);
        this.toastr.error('Erreur lors de la récupération des contacts');
      }
    );
  }

  // Formulaire de gestion des contacts
  contactForm = new FormGroup({
    non_utilisateur: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    message: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
    ]),
  });

  resetForm() {
    this.contactForm.reset();
    this.contactForm.markAsPristine();
    this.contactForm.markAsUntouched();
  }

  get non_utilisateur() {
    return this.contactForm.get('non_utilisateur');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get message() {
    return this.contactForm.get('message');
  }

  // Ajouter un nouveau contact
  ajouterContact() {
    if (this.contactForm.invalid) {
      this.toastr.error('Veuillez remplir correctement tous les champs.');
      return;
    }

    this.contactService.createContact(this.contactForm.value).subscribe(
      (response: any) => {
        this.contacts.push(response);
        console.log('Contact ajouté avec succès :', response);
        this.toastr.success('Contact ajouté avec succès');
        this.reloadData();
        this.resetForm();
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout du contact :", error);
        this.toastr.error("Erreur lors de l'ajout du contact");
      }
    );
  }

  // Supprimer un contact
  supprimerContact(contact: Contact) {
    this.contactService.deleteContact(contact.id_contact).subscribe(
      (response: any) => {
        this.contacts = this.contacts.filter(
          (item) => item.id_contact !== contact.id_contact
        );
        console.log('Contact supprimé avec succès :', response);
        this.toastr.success('Contact supprimé avec succès');
        this.reloadData();
      },
      (error: any) => {
        console.error('Erreur lors de la suppression du contact :', error);
        this.toastr.error('Erreur lors de la suppression du contact');
      }
    );
  }

  // Rechercher un contact par nom ou email
  searchForm = new FormGroup({
    rech: new FormControl('', Validators.required),
  });

  rechercher() {
    const searchValue = this.searchForm.get('rech')?.value;

    if (
      !searchValue ||
      typeof searchValue !== 'string' ||
      searchValue.trim() === ''
    ) {
      this.msg = 'Veuillez entrer un nom ou email valide.';
      this.toastr.warning(this.msg);
      return;
    }

    this.isLoading = true;

    this.contactService.rechercher(searchValue).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response && response.contacts && response.contacts.length > 0) {
          this.contacts = response.contacts;
          this.toastr.success('Contacts trouvés avec succès !');
        } else {
          this.msg = 'Aucun contact trouvé avec ces informations.';
          this.toastr.info(this.msg);
        }
      },
      (error) => {
        this.isLoading = false;
        this.msg = 'Erreur lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.msg);
        console.error('Erreur lors de la recherche de contacts :', error);
      }
    );
  }

  // Confirmation pour modifier un contact
  confirmer(contact: Contact) {
    this.contact = contact;
    this.contactForm.patchValue(contact); // Pré-remplir le formulaire avec les données existantes
  }
}
