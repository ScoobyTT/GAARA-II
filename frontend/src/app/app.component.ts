import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AlertsViewComponent } from './features/alerts/alerts-view.component';
import { SimulationViewComponent } from './features/simulation/simulation-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    FooterComponent,
    DashboardComponent,
    AlertsViewComponent,
    SimulationViewComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  activeTab: 'dashboard' | 'alerts' | 'simulation' = 'dashboard';

  onTabChange(tab: 'dashboard' | 'alerts' | 'simulation'): void {
    this.activeTab = tab;
  }
}
