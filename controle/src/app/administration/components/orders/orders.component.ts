import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Order } from '../../../models/Order';
import { OrdersService } from '../../../services/orders.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: '../../shared/styles/style.css',
})
export class OrdersComponent {
  name: string = 'Order Fabrication';
  orders: Order[] = [];
  order = new Order();
  isLoading = false;
  message: string = '';

  ngOnInit(): void {
    this.reloadData();
  }
  alerthelle() {
    console.log('hello from console')
    alert('hello')
  }
  reloadData(): void {
    this.getAllordersFabrication();
  }
  constructor(
    private orderservice: OrdersService,
    private toastr: ToastrService
  ) {}

  confirmer(order: Order) {
    this.order = order;
  }
  getAllordersFabrication(): void {
    this.orderservice.getAllordersFabrication().subscribe(
      (response: any) => {
        if (response.orders && Array.isArray(response.orders)) {
          this.orders = response.orders;
          console.log('orders:', this.orders);
          this.toastr.success('order de faboration récupérer avec succes');
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

    this.orderservice.addorderFabrication(this.orderForm.value).subscribe(
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
  ModifierOrder() {
    //? alert(JSON.stringify(this.order));
    this.orderservice
      .updateorderFabrication(this.order.id_order, this.orderForm.value)
      .subscribe(
        (response: any) => {
          console.log("L'élément a été mis à jour avec succès :", response);
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément :", error);
          // Traiter les erreurs de mise à jour ici
        }
      );
  }

  supprimer(order: Order) {
    this.orderservice.deleteorderFabrication(order.id_order).subscribe(
      (response: any) => {
        // Supprimer l'élément de la liste aqls une fois qu'il a été supprimé avec succès
        this.orders = this.orders.filter(
          (item) => item.id_order !== order.id_order
        );
        console.log("L'élément a été supprimé avec succès :", response);
        this.toastr.success("L'élément a été supprimé avec succès!");
        this.reloadData();
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'élément :", error);
        this.toastr.error("Erreur lors de la suppression de l'élément");
      }
    );
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

    this.orderservice.getOrderByLibelle(searchValue).subscribe(
      (response: { orders: any[] }) => {
        this.isLoading = false; // Fin du chargement

        this.orders = response.orders;
        this.toastr.success('Orders trouvés avec succès!');
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche d'orders:", error); // Log de l'erreur pour plus de détails
      }
    );
  }
}
