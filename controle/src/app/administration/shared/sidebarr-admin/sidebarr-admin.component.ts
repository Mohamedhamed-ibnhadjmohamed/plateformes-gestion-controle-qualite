import { Component, HostListener } from "@angular/core";
import { navbarData } from "./nav-data";

@Component({
  selector: 'app-sidebarr-admin',
  templateUrl: './sidebarr-admin.component.html',
  styleUrls: ['./sidebarr-admin.component.css'],
})
export class SidebarrAdminComponent {
  menuItem = navbarData;
}
