import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContacterService } from '../../../services/contacter.service';
import { Contact } from '../../../models/Contact';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-contacter-admin',
    templateUrl: './contacter-admin.component.html',
    styleUrl: './contacter-admin.component.css',
    standalone: false
})
export class ContacterAdminComponent {
  protected readonly destroyRef = inject(DestroyRef);
  contacts: Contact[] = [];

  /** Indique qu'un envoi est en cours (spinner + bouton désactivé). */
  isSubmitting = false;
  /** Affiche le bandeau de confirmation après un envoi réussi. */
  envoye = false;

  constructor(
    private contactService: ContacterService,
    private toastr: ToastrService
  ) {
    // Dès que l'utilisateur recommence à saisir, on masque la confirmation.
    this.contactForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.envoye && this.contactForm.dirty) {
          this.envoye = false;
        }
      });
  }

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
    if (this.contactForm.invalid || this.isSubmitting) {
      if (this.contactForm.invalid) {
        this.toastr.error('Veuillez remplir correctement tous les champs.');
      }
      return;
    }

    this.isSubmitting = true;
    this.envoye = false;

    this.contactService.createContact(this.contactForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.contacts.push(response);
        this.toastr.success('Contact ajouté avec succès.');
        this.resetForm();
        this.isSubmitting = false;
        this.envoye = true;
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout du contact :", error);
        this.toastr.error("Erreur lors de l'ajout du contact.");
        this.isSubmitting = false;
      }
    );
  }
}