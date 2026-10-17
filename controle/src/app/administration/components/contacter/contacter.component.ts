import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Contact } from '../../../models/Contact';
import { ContacterService } from '../../../services/contacter.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-contacter',
    templateUrl: './contacter.component.html',
    styleUrls: ['../../shared/styles/style.css'],
    standalone: false
})
export class ContacterComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'Contact';
  contacts: Contact[] = [];
  contact: Contact = new Contact();
  isLoading = false;
  msg: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get contactsPage(): Contact[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.contacts.slice(debut, debut + this.pageSize);
  }

  changerPage(page: number): void {
    this.page = page;
  }

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
    this.contactService.getAllContacts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response && Array.isArray(response.contacts)) {
          this.contacts = response.contacts;
          this.page = 1;
          this.toastr.success('Contacts récupérés avec succès');
        } else {
          this.toastr.error('Format de réponse inattendu');
          console.error('Format de réponse inattendu :', response);
        }
      },
      (error: any) => {
        this.chargement = false;
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

    this.contactService.createContact(this.contactForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      () => {
        this.toastr.success('Contact ajouté avec succès.');
        this.resetForm();
        this.reloadData();
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout du contact :", error);
        this.toastr.error("Erreur lors de l'ajout du contact.");
      }
    );
  }

  // Supprimer un contact
  supprimerContact(contact: Contact) {
    this.contactService.deleteContact(contact.id_contact).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.contacts = this.contacts.filter(
          (item) => item.id_contact !== contact.id_contact
        );
        this.toastr.success('Contact supprimé avec succès.');
        this.reloadData();
      },
      (error: any) => {
        console.error('Erreur lors de la suppression du contact :', error);
        this.toastr.error('Erreur lors de la suppression du contact.');
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

    this.contactService.rechercher(searchValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response && response.contacts && response.contacts.length > 0) {
          this.contacts = response.contacts;
          this.page = 1;
          this.toastr.success('Contacts trouvés avec succès !');
        } else {
          this.contacts = [];
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

  // Sélectionne le contact (utilisé par la modale de suppression)
  confirmer(contact: Contact) {
    this.contact = contact;
  }
}
