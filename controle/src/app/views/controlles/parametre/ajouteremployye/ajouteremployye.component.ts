import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Employee } from '../../../../models/Employee';
import { EmployeesService } from '../../../../services/employees.service';

@Component({
  selector: 'app-ajouteremployye',
  templateUrl: './ajouteremployye.component.html',
  styleUrl: './ajouteremployye.component.css'
})
export class AjouteremployyeComponent implements OnInit {
  name: string = 'Employee';
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
    this.EmployeeService.getAllEmployees().subscribe(
      (response: any) => {
        if (response.employés && Array.isArray(response.employés)) {
          this.employees = response.employés;
          console.log('Employés:', this.employees);
          
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
}