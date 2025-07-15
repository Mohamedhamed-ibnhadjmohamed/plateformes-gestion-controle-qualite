import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Order } from '../../../../models/Order';
import { OrdersService } from '../../../../services/orders.service';

@Component({
  selector: 'app-ajouter-order',
  templateUrl: './ajouter-order.component.html',
  styleUrl: './ajouter-order.component.css'
})
export class AjouterOrderComponent implements OnInit{
 

  orders: Order[] = [];
  Order = new Order();
  isLoading = false;
  message: string = '';

  ngOnInit(): void {
    this.reloadData();
  }
  
  reloadData(): void {
    this.getAllordersFabrication();
  }
  constructor(
    private OrdersService: OrdersService,
    private toastr: ToastrService
  ) {}

 
  getAllordersFabrication(): void {
    this.OrdersService.getAllordersFabrication().subscribe(
      (response: any) => {
        if (response.orders && Array.isArray(response.orders)) {
          this.orders = response.orders;
          console.log('orders:', this.orders);
         
        }
      },
      (error: any) => {
        console.error('Erreur lors de la récupération des données :', error);
        this.toastr.error('Erreur lors de la récupération des orders');
      }
    );
  }

  orderForm = new FormGroup({
    libelle_order: new FormControl('', [Validators.required]),
    designation_order: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(50),
    ]),
    qte_demandee: new FormControl('', [
      Validators.required,
      Validators.min(1)
    ]),
    date: new FormControl('', [Validators.required]),
    couleur: new FormControl('', [Validators.required]),
    taille: new FormControl('', [Validators.required]),
    niveau: new FormControl('', [Validators.required]),
  });
  resetForm() {
    this.orderForm.reset();
  }

  get libelle_order() {
    return this.orderForm.get('libelle_order');
  }
  get designation_order() {
    return this.orderForm.get('designation_order');
  }
  get qte_demandee() {
    return this.orderForm.get('qte_demandee');
  }
  get date() {
    return this.orderForm.get('date');
  }
  get taille() {
    return this.orderForm.get('taille');
  }
  get niveau() {
    return this.orderForm.get('niveau');
  }
  get couleur() {
    return this.orderForm.get('couleur');
  }

  ajouterOrder() {
    console.log(this.orderForm.value);

    this.OrdersService.addorderFabrication(this.orderForm.value).subscribe(
      (response: any) => {
        this.orders.push(response);
        console.log(this.orders.length);
        console.log("L'élément a été ajouté avec succès :", response);
        this.reloadData();
      },
      (error: any) => {
        console.error(
          "Erreur lors de l'ajout de l'order de fabrication :",
          error
        );
        this.toastr.error("Erreur lors de l'ajout de l'order de fabrication");
      }
    );
  }

}
