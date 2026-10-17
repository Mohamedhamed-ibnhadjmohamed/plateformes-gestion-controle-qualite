import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Order } from '../../../models/Order';
import { OrdersResponse } from '../../../models/api';
import { OrdersService } from '../../../services/orders.service';
import { ToastrService } from 'ngx-toastr';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.component.html',
    styleUrl: '../../shared/styles/style.css',
    standalone: false
})
export class OrdersComponent implements OnInit {
  protected readonly destroyRef = inject(DestroyRef);
  name: string = 'Ordre de fabrication';
  orders: Order[] = [];
  order = new Order();
  isLoading = false;
  message: string = '';

  // Chargement initial (affiché avant les données) et pagination.
  chargement = true;
  page = 1;
  pageSize = 10;

  get ordersPage(): Order[] {
    const debut = (this.page - 1) * this.pageSize;
    return this.orders.slice(debut, debut + this.pageSize);
  }

  changerPage(page: number): void {
    this.page = page;
  }

  ngOnInit(): void {
    this.reloadData();
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

  /** Sélectionne l'ordre et pré-remplit le formulaire de modification. */
  ouvrirModifier(order: Order): void {
    this.order = order;
    this.orderForm.patchValue({
      libelle_order: order.libelle_order ?? '',
      designation_order: order.designation_order ?? '',
      qte_demandee: order.qte_demandee ?? null,
      date: this.versDateInput(order.date),
      couleur: order.couleur ?? '',
      taille: order.taille ?? '',
      niveau: order.niveau ?? null,
    } as any);
  }

  /** Convertit une date (Date ou chaîne) au format attendu par `<input type="date">`. */
  private versDateInput(value: Date | string | undefined | null): string {
    if (!value) {
      return '';
    }
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) {
      return '';
    }
    const mois = String(d.getMonth() + 1).padStart(2, '0');
    const jour = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mois}-${jour}`;
  }
  getAllordersFabrication(): void {
    this.orderservice.getAllordersFabrication().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        this.chargement = false;
        if (response.orders && Array.isArray(response.orders)) {
          this.orders = response.orders;
          this.page = 1;
          this.toastr.success('Ordres de fabrication récupérés avec succès.');
        }
      },
      (error: any) => {
        this.chargement = false;
        console.error('Erreur lors de la récupération des données.', error);
        this.toastr.error('Erreur lors de la récupération des ordres de fabrication.');
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
    if (this.orderForm.invalid) {
      this.toastr.error(
        'Veuillez remplir correctement le formulaire.',
        'Erreur de validation'
      );
      return;
    }

    this.orderservice.addorderFabrication(this.orderForm.value).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      () => {
        this.toastr.success("L'ordre de fabrication a été ajouté avec succès.");
        this.resetForm();
        this.reloadData();
      },
      (error: any) => {
        console.error(
          "Erreur lors de l'ajout de l'order de fabrication :",
          error
        );
        this.toastr.error("Erreur lors de l'ajout de l'ordre de fabrication.");
      }
    );
  }
  ModifierOrder() {
    if (this.orderForm.invalid || this.order.id_order === undefined) {
      this.toastr.error(
        'Veuillez vérifier le formulaire avant de valider.',
        'Erreur de validation'
      );
      return;
    }

    this.orderservice
      .updateorderFabrication(this.order.id_order, this.orderForm.value)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
        () => {
          this.toastr.success("L'ordre de fabrication a été mis à jour avec succès.");
          this.reloadData();
        },
        (error: any) => {
          console.error("Erreur lors de la mise à jour de l'élément :", error);
          this.toastr.error("Erreur lors de la mise à jour de l'ordre de fabrication.");
        }
      );
  }

  supprimer(order: Order) {
    this.orderservice.deleteorderFabrication(order.id_order).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: any) => {
        // Supprimer l'élément de la liste aqls une fois qu'il a été supprimé avec succès
        this.orders = this.orders.filter(
          (item) => item.id_order !== order.id_order
        );
        this.toastr.success("L'ordre de fabrication a été supprimé avec succès.");
        this.reloadData();
      },
      (error: any) => {
        console.error("Erreur lors de la suppression de l'utilisateur.", error);
        this.toastr.error("Erreur lors de la suppression de l'ordre de fabrication.");
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

    this.orderservice.getOrderByLibelle(searchValue).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (response: OrdersResponse) => {
        this.isLoading = false; // Fin du chargement

        this.orders = response.orders;
        this.page = 1;
        this.toastr.success('Ordres de fabrication trouvés avec succès !');
      },
      (error) => {
        this.isLoading = false; // Fin du chargement en cas d'erreur
        this.message =
          'Une erreur est survenue lors de la recherche. Veuillez réessayer plus tard.';
        this.toastr.error(this.message);
        console.error("Erreur lors de la recherche des ordres de fabrication :", error); // Log de l'erreur pour plus de détails
      }
    );
  }
}
