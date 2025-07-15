import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AQL } from '../../../../models/AQL';
import { AqlsService } from '../../../../services/aqls.service';

@Component({
  selector: 'app-ajouter-aql',
  templateUrl: './ajouter-aql.component.html',
  styleUrl: './ajouter-aql.component.css'
})
export class AjouterAqlComponent implements OnInit {
  name: string = 'AQL';
  aqls: AQL[] = [];
  aql: AQL = new AQL();
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private aqlservice: AqlsService,
    private toastr: ToastrService // Injecter ToastrService
  ) { }

  ngOnInit(): void {
    this.reloadData();
  }

  reloadData(): void {
    this.getAllAql();
  }

  getAllAql(): void {
    this.aqlservice.getAllAql().subscribe(
      (response: any) => {
        if (response.aqls && Array.isArray(response.aqls)) {
          this.aqls = response.aqls;         
        } else {
          this.toastr.error(
            'La réponse du service ne contient pas de tableau "aqls" valide.',
            'Erreur'
          );
        }
      },
      (error: any) => {
        this.toastr.error(
          'Erreur lors de la récupération des données.',
          'Erreur'
        );
      }
    );
  }
  aqlForm = new FormGroup({
    nom: new FormControl('', [Validators.required, Validators.minLength(3)]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(10),
    ]),
    qte_min: new FormControl('', [
      Validators.required,
      Validators.min(1),
    ]),
    qte_max: new FormControl('', [
      Validators.required,
      Validators.min(1),
    ]),
    qte_critique: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    qte_mineure: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
    qte_majeure: new FormControl('', [
      Validators.required,
      Validators.min(1),
      Validators.max(10),
    ]),
  });
  get qte_min() {
    return this.aqlForm.get('qte_min');
  }

  get qte_max() {
    return this.aqlForm.get('qte_max');
  }

  get qte_critique() {
    return this.aqlForm.get('qte_critique');
  }

  get qte_mineure() {
    return this.aqlForm.get('qte_mineure');
  }

  get qte_majeure() {
    return this.aqlForm.get('qte_majeure');
  }

  get nom() {
    return this.aqlForm.get('nom');
  }

  get description() {
    return this.aqlForm.get('description');
  }

  get id_detail_aql() {
    return this.aqlForm.get('id_detail_aql');
  }

  ajout(): void {
    if (this.aqlForm && this.aqlForm.valid) {
      this.isLoading = true;
      console.log('Formulaire AQL valide, soumission en cours...');

      this.aqlservice.createAql(this.aqlForm.value).subscribe(
        (response: any) => {
          console.log('Réponse du serveur:', response);
          this.aqls.push(response);
          this.toastr.success('AQL ajouté avec succès.', 'Succès');
          this.aqlForm.reset(); // Réinitialiser le formulaire après ajout
          this.isLoading = false;
        },
        (error: any) => {
          console.error("Erreur lors de l'ajout du détail AQL:", error);
          this.toastr.error("Erreur lors de l'ajout du détail AQL.", 'Erreur');
          this.isLoading = false;
        }
      );

      this.reloadData(); // Mieux que location.reload()
    } else {
      console.error('Formulaire AQL invalide ou non défini.');
      this.toastr.error(
        'Le formulaire AQL est invalide. Veuillez vérifier les champs.',
        'Erreur de validation'
      );
    }
  }
}
