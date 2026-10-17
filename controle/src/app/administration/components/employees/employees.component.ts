import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Employee } from '../../../models/Employee';
import { EmployeesResponse } from '../../../models/api';
import { EmployeesService } from '../../../services/employees.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-employees',
    templateUrl: './employees.component.html',
    styleUrl: '../../shared/styles/style.css',
    standalone: false
})
export class EmployeesComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'Employé';
  employees: Employee[] = [];
  employee: Employee = new Employee();

  constructor(
    private EmployeeService: EmployeesService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.reloadData();
  }

  reloadData(): void {
    this.getAllEmployees();
  }

  getAllEmployees(): void {
    this.EmployeeService.getAllEmployees().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response.employees && Array.isArray(response.employees)) {
          this.employees = response.employees;
          this.page = 1;
          this.toastr.success('Employés récupérés avec succès.');
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'employees' valide :",
            response
          );
          this.toastr.error('Données invalides reçues du service.');
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des données.', error);
        this.toastr.error('Erreur lors de la récupération des données.');
      }
    );
  }

  employeeForm = new FormGroup({
    matricule: new FormControl(null, [Validators.required]),
    nom: new FormControl(null, [Validators.required]),
    prenom: new FormControl(null, [Validators.required]),
    notes: new FormControl(null, [Validators.min(0), Validators.max(20)]),
  });

  // Getters pour un accès plus simple aux contrôles du formulaire
  get matricule() {
    return this.employeeForm.get('matricule');
  }

  get nom() {
    return this.employeeForm.get('nom');
  }

  get prenom() {
    return this.employeeForm.get('prenom');
  }

  get notes() {
    return this.employeeForm.get('notes');
  }

  // Méthode pour modifier un employé
  modifier() {
    if (this.employeeForm.invalid || this.employee.id_employee === undefined) {
      this.toastr.error(
        'Veuillez vérifier le formulaire avant de valider.',
        'Erreur de validation'
      );
      return;
    }

    this.EmployeeService.updateEmployee(
      this.employee.id_employee,
      this.employeeForm.value
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      () => {
        this.toastr.success('Employé mis à jour avec succès.');
        this.reloadData();
      },
      (error: any) => {
        console.error('Erreur lors de la mise à jour :', error);
        this.toastr.error("Erreur lors de la mise à jour de l'employé.");
      }
    );
  }

  // Méthode pour ajouter un employé
  ajouter() {
    if (this.employeeForm.valid) {
      this.EmployeeService.createEmployee(this.employeeForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        () => {
          this.toastr.success('Employé ajouté avec succès.');
          this.employeeForm.reset(); // Réinitialiser le formulaire après ajout
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de l'ajout de l'employé :", error);
          this.toastr.error("Erreur lors de l'ajout de l'employé.");
        }
      );
    } else {
      this.toastr.error('Formulaire invalide.');
    }
  }

  confirmer(employee: Employee) {
    this.employee = employee;
  }

  /** Sélectionne l'employé et pré-remplit le formulaire de modification. */
  ouvrirModifier(employee: Employee): void {
    this.employee = employee;
    this.employeeForm.patchValue({
      matricule: employee.matricule ?? null,
      nom: employee.nom ?? '',
      prenom: employee.prenom ?? '',
      notes: employee.notes ?? null,
    } as any);
  }

  supprimer(employee: Employee) {
    this.EmployeeService.deleteEmployee(employee.id_employee).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.employees = this.employees.filter(
          (item) => item.id_employee !== employee.id_employee
        );
        this.toastr.success("L'employé a été supprimé avec succès.");
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'employé :", error);
        this.toastr.error("Erreur lors de la suppression de l'employé.");
      }
    );
  }

  isLoading = false;
  message: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get employeesPage(): Employee[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.employees.slice(debut, debut + this.pageSize);
  }

  changerPage(page: number): void {
    this.page = page;
  }

  searchForm = new FormGroup({
    rech: new FormControl('', Validators.required),
  });

  rechercher() {
    const searchValue = this.searchForm.get('rech')?.value;

    // Vérification que searchValue est une chaîne non vide
    if (
      !searchValue ||
      typeof searchValue !== 'string' ||
      searchValue.trim() === ''
    ) {
      this.message = 'Veuillez entrer un libellé valide.';
      this.toastr.warning(this.message);
      return;
    }

    this.isLoading = true; // Indique que la recherche est en cours

    this.EmployeeService.rechercher(searchValue.trim()).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: EmployeesResponse) => {
        this.isLoading = false; 

        if (response && response.employees && response.employees.length > 0) {
          this.employees = response.employees;
          this.page = 1;
          this.toastr.success('Employés trouvés avec succès !');
        } else {
          this.employees = [];
          this.message = 'Aucun employé trouvé pour ce libellé.';
          this.toastr.info(this.message);
        }
      },
      (error) => {
        this.isLoading = false;
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche d'employees:", error);
      }
    );
  }
}
