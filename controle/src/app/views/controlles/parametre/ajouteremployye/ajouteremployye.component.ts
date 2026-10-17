import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Employee } from '../../../../models/Employee';
import { EmployeesService } from '../../../../services/employees.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-ajouteremployye',
    templateUrl: './ajouteremployye.component.html',
    styleUrl: './ajouteremployye.component.css',
    standalone: false
})
export class AjouteremployyeComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'Employé';
  employees: Employee[] = [];
  employee: Employee = new Employee();

  constructor(
    private EmployeeService: EmployeesService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.reloadData();
  }

  reloadData(): void {
    this.getAllEmployees();
  }

  getAllEmployees(): void {
    this.EmployeeService.getAllEmployees().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        if (response.employees && Array.isArray(response.employees)) {
          this.employees = response.employees;
          
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'employees' valide :",
            response
          );
          this.toastr.error('Données invalides reçues du service.');
        }
      },
      (error: any) => {
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

  // Méthode pour ajouter un employé
  ajouter() {
    if (this.employeeForm.valid) {
      this.EmployeeService.createEmployee(this.employeeForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        (response: any) => {
          this.employees.push(response);
          this.reloadData(); // Vérifiez que cette méthode est efficace
          this.toastr.success('Employé ajouté avec succès.');
          this.employeeForm.reset(); // Réinitialiser le formulaire après ajout
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
}