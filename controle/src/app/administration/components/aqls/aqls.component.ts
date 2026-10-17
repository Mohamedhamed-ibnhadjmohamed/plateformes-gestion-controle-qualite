import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { AQL } from '../../../models/AQL';
import { AqlsService } from '../../../services/aqls.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr'; // Importer ToastrService

@Component({
    selector: 'app-aqls',
    templateUrl: './aqls.component.html',
    styleUrls: ['../../shared/styles/style.css'],
    standalone: false
})
export class AqlsComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'AQL';
  aqls: AQL[] = [];
  aql: AQL = new AQL();
  message: string = '';
  isLoading: boolean = false;

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get aqlsPage(): AQL[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.aqls.slice(debut, debut + this.pageSize);
  }

  changerPage(page: number): void {
    this.page = page;
  }

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
    this.aqlservice.getAllAql().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response.aqls && Array.isArray(response.aqls)) {
          this.aqls = response.aqls;
          this.page = 1;
          this.toastr.success('AQL récupérés avec succès.');
        } else {
          this.toastr.error(
            'La réponse du service ne contient pas de tableau "aqls" valide.',
            'Erreur'
          );
        }
      },
      (error: any) => {
        this.chargement = false;
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
      Validators.min(0),
      Validators.max(10),
    ]),
    qte_mineure: new FormControl('', [
      Validators.required,
      Validators.min(0),
      Validators.max(10),
    ]),
    qte_majeure: new FormControl('', [
      Validators.required,
      Validators.min(0),
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

  ajout(): void {
    if (this.aqlForm && this.aqlForm.valid) {
      this.isLoading = true;

      this.aqlservice.createAql(this.aqlForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response: any) => {
          this.toastr.success('AQL ajouté avec succès.', 'Succès');
          this.aqlForm.reset(); // Réinitialiser le formulaire après ajout
          this.isLoading = false;
          this.reloadData(); // Rafraîchit la liste une fois l'ajout confirmé
        },
        (error: any) => {
          console.error("Erreur lors de l'ajout du détail AQL:", error);
          this.toastr.error("Erreur lors de l'ajout du détail AQL.", 'Erreur');
          this.isLoading = false;
        }
      );
    } else {
      console.error('Formulaire AQL invalide ou non défini.');
      this.toastr.error(
        'Le formulaire AQL est invalide. Veuillez vérifier les champs.',
        'Erreur de validation'
      );
    }
  }

  modifier(): void {
    if (this.aqlForm.invalid || this.aql.id_aql === undefined) {
      this.toastr.error(
        'Veuillez vérifier le formulaire avant de valider.',
        'Erreur de validation'
      );
      return;
    }

    this.isLoading = true;

    this.aqlservice
      .updateAql(this.aql.id_aql, this.aqlForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        () => {
          this.toastr.success("L'élément a été mis à jour avec succès.", 'Succès');
          this.isLoading = false;
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément:", error);
          this.toastr.error(
            "Erreur lors de la mise à jour de l'élément.",
            'Erreur'
          );
          this.isLoading = false;
        }
      );
  }

  confirmer(a: AQL) {
    this.aql = a;
  }

  /** Sélectionne l'AQL et pré-remplit le formulaire de modification. */
  ouvrirModifier(a: AQL): void {
    this.aql = a;
    this.aqlForm.patchValue({
      nom: a.nom ?? '',
      description: a.description ?? '',
      qte_min: a.qte_min ?? null,
      qte_max: a.qte_max ?? null,
      qte_critique: a.qte_critique ?? null,
      qte_mineure: a.qte_mineure ?? null,
      qte_majeure: a.qte_majeure ?? null,
    } as any);
  }

  supprimer(aql: AQL): void {
    this.aqlservice.deleteAql(aql.id_aql).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
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
        "Veuillez entrer un nom d'AQL valide.",
        'Avertissement'
      );
      return;
    }

    this.isLoading = true;

    this.aqlservice.getByNom(searchValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.isLoading = false;

        if (response.aqls && Array.isArray(response.aqls)) {
          this.aqls = response.aqls;
          this.page = 1;
        } else {
          this.toastr.info('Aucun AQL trouvé pour ce code.', 'Information');
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
