import { Component } from '@angular/core';
import { Employee } from '../../../models/Employee';
import { EmployeesService } from '../../../services/employees.service';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrl: '../../shared/styles/style.css',
})
export class EmployeesComponent {
  name: string = 'Employee';
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
    this.EmployeeService.getAllEmployees().subscribe(
      (response: any) => {
        if (response.employés && Array.isArray(response.employés)) {
          this.employees = response.employés;
          console.log('Employés:', this.employees);
          this.toastr.success('Employés récupérés avec succès');
        } else {
          console.error(
            "La réponse du service ne contient pas de tableau 'employés' valide :",
            response
          );
          this.toastr.error('Données invalides reçues du service');
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.toastr.error('Erreur lors de la récupération des données');
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
    if (this.employeeForm.valid) {
      this.EmployeeService.updateEmployee(
        this.employee.id_employee,
        this.employeeForm.value
      ).subscribe(
        (response: any) => {
          console.log('Mise à jour réussie :', response);
          this.toastr.success('Mise à jour réussie');
          this.reloadData(); // Vérifiez que cette méthode est efficace
        },
        (error: any) => {
          console.error('Erreur lors de la mise à jour :', error);
          this.toastr.error('Erreur lors de la mise à jour');
        }
      );
    } else {
      this.toastr.error('Formulaire invalide');
    }
  }

  // Méthode pour ajouter un employé
  ajouter() {
    if (this.employeeForm.valid) {
      this.EmployeeService.createEmployee(this.employeeForm.value).subscribe(
        (response: any) => {
          this.employees.push(response);
          this.reloadData(); // Vérifiez que cette méthode est efficace
          console.log('Ajout réussi avec succès');
          this.toastr.success('Ajout réussi avec succès');
          this.employeeForm.reset(); // Réinitialiser le formulaire après ajout
        },
        (error: any) => {
          console.error("Erreur lors de l'ajout de l'employé :", error);
          this.toastr.error("Erreur lors de l'ajout de l'employé");
        }
      );
    } else {
      this.toastr.error('Formulaire invalide');
    }
  }

  confirmer(employee: Employee) {
    this.employee = employee;
  }

  supprimer(employee: Employee) {
    this.EmployeeService.deleteEmployee(employee.id_employee).subscribe(
      (response: any) => {
        this.employees = this.employees.filter(
          (item) => item.id_employee !== employee.id_employee
        );
        console.log("L'employé a été supprimé avec succès :", response);
        this.toastr.success("L'employé a été supprimé avec succès");
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'employé :", error);
        this.toastr.error("Erreur lors de la suppression de l'employé");
      }
    );
  }

  isLoading = false;
  message: string = '';

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

    this.EmployeeService.rechercher(searchValue.trim()).subscribe(
      (response: { employees: any[] }) => {
        this.isLoading = false; 

        if (response && response.employees && response.employees.length > 0) {
          this.employees = response.employees;
          this.toastr.success('employees trouvés avec succès!');
          console.log('Résultats de la recherche:', this.employees);
        } else {
          this.employees = [];
          this.message = 'Aucun employee trouvé pour ce libellé.';
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
