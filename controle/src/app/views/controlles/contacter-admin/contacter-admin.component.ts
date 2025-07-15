import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ContacterService } from '../../../services/contacter.service';
import { Contact } from '../../../models/Contact';

@Component({
  selector: 'app-contacter-admin',
  templateUrl: './contacter-admin.component.html',
  styleUrl: './contacter-admin.component.css',
})
export class ContacterAdminComponent {
  contacts: Contact[] = [];

  constructor(
    private contactService: ContacterService,
    private toastr: ToastrService
  ) {}

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
        this.resetForm();
      },
      (error: any) => {
        console.error("Erreur lors de l'ajout du contact :", error);
        this.toastr.error("Erreur lors de l'ajout du contact");
      }
    );
  }
}