import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DashboardFilter } from '../models/epidemiology.models';

@Injectable({
  providedIn: 'root'
})
export class FilterStateService {
  private filterSubject = new BehaviorSubject<DashboardFilter>({
    uf: 'Todos',
    ano_inicio: 2014,
    ano_fim: 2026,
    semana_inicio: 1,
    semana_fim: 52
  });

  filter$ = this.filterSubject.asObservable();

  get currentFilter(): DashboardFilter {
    return this.filterSubject.value;
  }

  setUf(uf: string): void {
    this.filterSubject.next({
      ...this.filterSubject.value,
      uf
    });
  }

  setPeriodo(anoInicio: number, anoFim: number): void {
    this.filterSubject.next({
      ...this.filterSubject.value,
      ano_inicio: anoInicio,
      ano_fim: anoFim
    });
  }

  setPreset(preset: 'todos' | 'epidemia2024' | 'recente'): void {
    if (preset === 'todos') {
      this.setPeriodo(2014, 2026);
    } else if (preset === 'epidemia2024') {
      this.setPeriodo(2024, 2024);
    } else if (preset === 'recente') {
      this.setPeriodo(2022, 2026);
    }
  }
}
