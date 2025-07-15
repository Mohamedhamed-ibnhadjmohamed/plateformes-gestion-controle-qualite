import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FamilleDefault } from '../../../../models/FamillieDefaults';
import { FamilliedefaultService } from '../../../../services/familliedefault.service';

@Component({
  selector: 'app-ajouterfamille',
  templateUrl: './ajouterfamille.component.html',
  styleUrl: './ajouterfamille.component.css'
})
export class AjouterfamilleComponent implements OnInit {
  name: string = 'Famille Default';
  familledefaults: FamilleDefault[] = []; // Array of FamilleDefault objects (type safety)
  familledefault: FamilleDefault = new FamilleDefault(); // Selected FamilleDefault (optional, type safety)

  constructor(
    private famillesdefaultservice: FamilliedefaultService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData(); // Load data when the component initializes
  }

  reloadData(): void {
    this.getAllfamilledefault();
  }

  getAllfamilledefault(): void {
    this.famillesdefaultservice.getAllfamilledefault().subscribe(
      (response: any) => {
        if (response && response.familles && Array.isArray(response.familles)) {
          this.familledefaults = response.familles;
        } else {
          console.error(
            'La réponse du service ne contient pas de tableau familledefaults valide :',
            response
          );
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.toastr.error('Erreur lors de la récupération des données.');
      }
    );
  }

  familleForm = new FormGroup({
    code: new FormControl('', Validators.required), // Form control for 'code' with a required validator
    description: new FormControl(''), // Form control for 'description', no validation rules
    nom: new FormControl('', Validators.required), // Form control for 'nom' with a required validator
  });

  // Getters for easier access to form controls
  get code() {
    return this.familleForm.get('code');
  }

  get description() {
    return this.familleForm.get('description');
  }

  get nom() {
    return this.familleForm.get('nom');
  }

  ajout(): void {
    this.famillesdefaultservice
      .createfamilledefault(this.familleForm.value)
      .subscribe(
        (response: any) => {
          // Si la création réussit, ajouter la réponse à la liste des FamilleDefaults
          this.familledefaults.push(response);
          this.toastr.success('Famille Default ajoutée avec succès !');
          this.familleForm.reset(); // Reset the form after successful submission
        },
        (error: any) => {
          // En cas d'erreur, afficher un message d'erreur dans la console
          console.error("Erreur lors de l'ajout du familledefault :", error);
          this.toastr.error("Erreur lors de l'ajout du Famille Default.");
        }
      );
    this.reloadData();
  }

 

  
}
