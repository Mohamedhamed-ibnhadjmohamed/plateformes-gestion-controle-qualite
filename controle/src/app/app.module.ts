import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AqlsComponent } from './administration/components/aqls/aqls.component';
import { DefautsComponent } from './administration/components/defauts/defauts.component';
import { UploadimageComponent } from './administration/components/defauts/uploadimage/uploadimage.component';
import { EmployeesComponent } from './administration/components/employees/employees.component';
import { FamillieDefautsComponent } from './administration/components/famillie-defauts/famillie-defauts.component';
import { InspectionsComponent } from './administration/components/inspections/inspections.component';
import { OrdersComponent } from './administration/components/orders/orders.component';
import { ProduitsComponent } from './administration/components/produits/produits.component';
import { UtilisateursComponent } from './administration/components/utilisateurs/utilisateurs.component';
import { AuditeComponent } from './controle/audite/audite.component';
import { FinChaineComponent } from './controle/fin-chaine/fin-chaine.component';
import { ControleComponent } from './controle/shared/controle/controle.component';
import { MenuControleComponent } from './controle/shared/menu-controle/menu-controle.component';
import { SousChaineComponent } from './controle/sous-chaine/sous-chaine.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './login/register/register.component';
import { NotfoundComponent } from './shared/notfound/notfound.component';
import { NavbarAdminComponent } from './administration/shared/navbar-admin/navbar-admin.component';
import { SidebarrAdminComponent } from './administration/shared/sidebarr-admin/sidebarr-admin.component';
import { AdministrationComponent } from './views/administration/administration.component';
import { ControleAComponent } from './controle/shared/controle-a/controle-a.component';
import { ControleBComponent } from './controle/shared/controle-b/controle-b.component';
import { ControleCComponent } from './controle/shared/controle-c/controle-c.component';
import {
  ToastrModule,
  ToastNoAnimation,
  ToastNoAnimationModule,
} from 'ngx-toastr';
import { ConsultationComponent } from './controle/shared/consultation/consultation.component';
import { PdfComponent } from './controle/shared/consultation/pdf/pdf.component';
import { PdfimprimerComponent } from './controle/shared/consultation/pdfimprimer/pdfimprimer.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { AccueilComponent } from './views/controlles/accueil/accueil.component';
import { HomeComponent } from './views/controlles/home/home.component';
import { InformationComponent } from './views/controlles/information/information.component';
import { LandingComponent } from './views/controlles/landing/landing.component';
import { RapportComponent } from './views/controlles/rapport/rapport.component';
import { TypeControleComponent } from './views/controlles/type-controle/type-controle.component';
import { ContacterAdminComponent } from './views/controlles/contacter-admin/contacter-admin.component';
import { ContacterComponent } from './administration/components/contacter/contacter.component';
import { ParametreComponent } from './views/controlles/parametre/parametre.component';
import { AjouterProduitComponent } from './views/controlles/parametre/ajouter-produit/ajouter-produit.component';
import { AjouterAqlComponent } from './views/controlles/parametre/ajouter-aql/ajouter-aql.component';
import { AjouterOrderComponent } from './views/controlles/parametre/ajouter-order/ajouter-order.component';
import { AjouterfamilleComponent } from './views/controlles/parametre/ajouterfamille/ajouterfamille.component';
import { AjouteremployyeComponent } from './views/controlles/parametre/ajouteremployye/ajouteremployye.component';



@NgModule({
  declarations: [
    AppComponent,
    AqlsComponent,
    DefautsComponent,
    EmployeesComponent,
    FamillieDefautsComponent,
    InspectionsComponent,
    OrdersComponent,
    ProduitsComponent,
    UtilisateursComponent,
    LoginComponent,
    RegisterComponent,
    NotfoundComponent,
    UploadimageComponent,
    AuditeComponent,
    FinChaineComponent,
    SousChaineComponent,
    ControleComponent,
    MenuControleComponent,
    AdministrationComponent,
    SidebarrAdminComponent,
    NavbarAdminComponent,
    ControleAComponent,
    ControleBComponent,
    ControleCComponent,
    HomeComponent,
    NavbarComponent,
    AccueilComponent,
    ConsultationComponent,
    PdfComponent,
    FooterComponent,
    LandingComponent,
    TypeControleComponent,
    RapportComponent,
    PdfimprimerComponent,
    InformationComponent,
    ContacterAdminComponent,
    ContacterComponent,
    ParametreComponent,
    AjouterProduitComponent,
    AjouterAqlComponent,
    AjouterOrderComponent,
    AjouterfamilleComponent,
    AjouteremployyeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ToastNoAnimationModule.forRoot(),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
