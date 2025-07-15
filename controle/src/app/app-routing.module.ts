import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AqlsComponent } from "./administration/components/aqls/aqls.component";
import { ContacterComponent } from "./administration/components/contacter/contacter.component";
import { DefautsComponent } from "./administration/components/defauts/defauts.component";
import { EmployeesComponent } from "./administration/components/employees/employees.component";
import { FamillieDefautsComponent } from "./administration/components/famillie-defauts/famillie-defauts.component";
import { InspectionsComponent } from "./administration/components/inspections/inspections.component";
import { OrdersComponent } from "./administration/components/orders/orders.component";
import { ProduitsComponent } from "./administration/components/produits/produits.component";
import { UtilisateursComponent } from "./administration/components/utilisateurs/utilisateurs.component";
import { AuditeComponent } from "./controle/audite/audite.component";
import { FinChaineComponent } from "./controle/fin-chaine/fin-chaine.component";
import { ConsultationComponent } from "./controle/shared/consultation/consultation.component";
import { PdfComponent } from "./controle/shared/consultation/pdf/pdf.component";
import { PdfimprimerComponent } from "./controle/shared/consultation/pdfimprimer/pdfimprimer.component";
import { SousChaineComponent } from "./controle/sous-chaine/sous-chaine.component";
import { LoginComponent } from "./login/login/login.component";
import { RegisterComponent } from "./login/register/register.component";
import { NotfoundComponent } from "./shared/notfound/notfound.component";
import { AdministrationComponent } from "./views/administration/administration.component";
import { AccueilComponent } from "./views/controlles/accueil/accueil.component";
import { HomeComponent } from "./views/controlles/home/home.component";
import { ParametreComponent } from "./views/controlles/parametre/parametre.component";
import { AjouterProduitComponent } from "./views/controlles/parametre/ajouter-produit/ajouter-produit.component";
import { AjouterAqlComponent } from "./views/controlles/parametre/ajouter-aql/ajouter-aql.component";
import { AjouteremployyeComponent } from "./views/controlles/parametre/ajouteremployye/ajouteremployye.component";
import { AjouterOrderComponent } from "./views/controlles/parametre/ajouter-order/ajouter-order.component";
import { AjouterfamilleComponent } from "./views/controlles/parametre/ajouterfamille/ajouterfamille.component";

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'admin',
    component: AdministrationComponent,
    children: [
      { path: 'produit', component: ProduitsComponent },
      { path: 'contacter', component: ContacterComponent },
      { path: 'employee', component: EmployeesComponent },
      { path: 'famille', component: FamillieDefautsComponent },
      { path: 'aql', component: AqlsComponent },
      { path: 'default', component: DefautsComponent },
      { path: 'utilisateur', component: UtilisateursComponent },
      { path: 'inspection', component: InspectionsComponent },
      { path: 'order', component: OrdersComponent },
      { path: '', redirectTo: 'produit', pathMatch: 'full' }, // Redirection par défaut vers 'produit'
    ],
  },

{
  path: 'home', component: HomeComponent,
  children: [
    { path: 'accueil', component: AccueilComponent },
    { path: 'consulter', component: ConsultationComponent },
    { path: 'pdf/:id', component: PdfComponent },
    { path: 'pdfimprimer/:id', component: PdfimprimerComponent },
    {
      path: 'souschain',
      component: SousChaineComponent,
      pathMatch: 'full',
    },
    {
      path: 'finchain',
      component: FinChaineComponent,
      pathMatch: 'full',
    },
    { path: 'audit', component: AuditeComponent },
    {
      path: 'parametre',
      component: ParametreComponent,
      children: [
        { path: 'ajouterproduit', component: AjouterProduitComponent },
        { path: 'ajouteraql', component: AjouterAqlComponent },
        { path: 'ajouteremployee', component: AjouteremployyeComponent },
        { path: 'ajouterorder', component: AjouterOrderComponent },
        { path: 'ajouterfamille', component: AjouterfamilleComponent },
      ]
    },
    { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  ]
},


  { path: 'login', component: LoginComponent, pathMatch: 'full' },
  { path: 'notfound', component: NotfoundComponent },
  { path: 'register', component: RegisterComponent, pathMatch: 'full' },
  { path: '**', redirectTo: '/notfound', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
