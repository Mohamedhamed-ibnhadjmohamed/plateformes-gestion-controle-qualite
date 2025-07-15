import { Component, OnInit } from '@angular/core';
import { AQL } from '../../../models/AQL';
import { AqlsService } from '../../../services/aqls.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr'; // Importer ToastrService

@Component({
  selector: 'app-aqls',
  templateUrl: './aqls.component.html',
  styleUrls: ['../../shared/styles/style.css'], // Corriger 'styleUrl' en 'styleUrls'
})
export class AqlsComponent implements OnInit {
  name: string = 'AQL';
  aqls: AQL[] = [];
  aql: AQL = new AQL();
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private aqlservice: AqlsService,
    private toastr: ToastrService // Injecter ToastrService
  ) {}

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
          this.toastr.success('AQLs récupérés avec succès.');
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

  async modifier(): Promise<void> {
    this.isLoading = true;

    try {
      await this.aqlservice
        .updateAql(this.aql.id_aql, this.aqlForm.value)
        .toPromise();
      this.toastr.success("L'élément a été mis à jour avec succès.", 'Succès');
      this.reloadData();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'élément:", error);
      this.toastr.error(
        "Erreur lors de la mise à jour de l'élément.",
        'Erreur'
      );
    } finally {
      this.isLoading = false;
    }
  }

  confirmer(a: AQL) {
    this.aql = a;
  }

  supprimer(aql: AQL): void {
    this.aqlservice.deleteAql(aql.id_aql).subscribe(
      (response: any) => {
        this.aqls = this.aqls.filter((item) => item.id_aql !== aql.id_aql);
        this.toastr.success("L'élément a été supprimé avec succès.", 'Succès');
      },
      (error: any) => {
        this.toastr.error(
          "Erreur lors de la suppression de l'élément.",
          'Erreur'
        );
      }
    );
  }



  searchForm = new FormGroup({
    rech: new FormControl('', Validators.required),
  });

  rechercher() {
    const searchValue = this.searchForm.get('rech')?.value?.trim();

    if (!searchValue) {
      this.toastr.warning(
        'Veuillez entrer un code de produit valide.',
        'Avertissement'
      );
      return;
    }

    this.isLoading = true;

    this.aqlservice.getByNom(searchValue).subscribe(
      (response: any) => {
        this.isLoading = false;

        if (response.aqls && Array.isArray(response.aqls)) {
          this.aqls = response.aqls;
        } else {
          this.toastr.info('Aucun aql trouvé pour ce code.', 'Information');
          this.aqls = [];
        }
      },
      (error) => {
        this.isLoading = false;
        this.toastr.error(
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.',
          'Erreur'
        );
        this.aqls = [];
      }
    );
  }
}
