import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';

export interface StockStatusData {
  healthy: number;
  lowStock: number;
  outOfStock: number;
}

@Component({
  selector: 'app-stock-status-chart',
  standalone: true,
  imports: [CommonModule, DevAppCard],
  host: { class: 'block' },
  template: `
    <app-dev-app-card cardTitle="Inventory Health" cardSubtitle="Total variant distribution">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
        
        <!-- SVG Doughnut Chart -->
        <div class="relative w-40 h-40 flex-shrink-0 flex items-center justify-center">
          <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <!-- Background Ring -->
            <path
              class="text-[#3A506B]/20"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            />
            
            <!-- Healthy Stroke -->
            <path
              class="text-emerald-400 drop-shadow-md transition-all duration-1000 ease-out"
              stroke-dasharray="0, 100"
              [style.stroke-dasharray]="healthyDashArray()"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
            />

            <!-- Low Stock Stroke -->
            <path
              class="text-amber-400 drop-shadow-md transition-all duration-1000 ease-out delay-300"
              stroke-dasharray="0, 100"
              [style.stroke-dasharray]="lowDashArray()"
              [style.stroke-dashoffset]="-healthyPercent()"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
            />

            <!-- Out of Stock Stroke -->
            <path
              class="text-red-500 drop-shadow-md transition-all duration-1000 ease-out delay-500"
              stroke-dasharray="0, 100"
              [style.stroke-dasharray]="outDashArray()"
              [style.stroke-dashoffset]="-(healthyPercent() + lowPercent())"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
              stroke-linecap="round"
            />
          </svg>
          
          <!-- Inner Text -->
          <div class="absolute flex flex-col items-center justify-center text-center">
            <span class="text-2xl font-bold text-slate-100">{{ total() }}</span>
            <span class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Items</span>
          </div>
        </div>

        <!-- Legend -->
        <div class="flex-1 space-y-3 w-full">
          <div class="flex items-center justify-between group">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
              <span class="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">Healthy</span>
            </div>
            <span class="text-sm font-semibold text-slate-100">{{ data().healthy }}</span>
          </div>
          
          <div class="flex items-center justify-between group">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]"></div>
              <span class="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">Low Stock</span>
            </div>
            <span class="text-sm font-semibold text-slate-100">{{ data().lowStock }}</span>
          </div>

          <div class="flex items-center justify-between group">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
              <span class="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">Out of Stock</span>
            </div>
            <span class="text-sm font-semibold text-slate-100">{{ data().outOfStock }}</span>
          </div>
        </div>
      </div>
    </app-dev-app-card>
  `
})
export class StockStatusChart {
  readonly data = input.required<StockStatusData>();

  readonly total = computed(() => {
    const d = this.data();
    return d.healthy + d.lowStock + d.outOfStock;
  });

  readonly healthyPercent = computed(() => this.total() ? (this.data().healthy / this.total()) * 100 : 0);
  readonly lowPercent = computed(() => this.total() ? (this.data().lowStock / this.total()) * 100 : 0);
  readonly outPercent = computed(() => this.total() ? (this.data().outOfStock / this.total()) * 100 : 0);

  readonly healthyDashArray = computed(() => `${this.healthyPercent()}, 100`);
  readonly lowDashArray = computed(() => `${this.lowPercent()}, 100`);
  readonly outDashArray = computed(() => `${this.outPercent()}, 100`);
}
