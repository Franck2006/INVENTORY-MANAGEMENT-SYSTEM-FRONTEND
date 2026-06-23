import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';

export interface SalesDataPoint {
  label: string; // e.g., 'Mon', 'Tue'
  amount: number;
}

@Component({
  selector: 'app-sales-overview-chart',
  standalone: true,
  imports: [CommonModule, DevAppCard],
  host: { class: 'block' },
  template: `
    <app-dev-app-card cardTitle="Weekly Sales Revenue" cardSubtitle="Total Order amounts past 7 days">
      <div class="h-64 w-full flex items-end justify-between gap-2 pt-6 pb-2 px-2 relative group">
        <!-- Background Grid Lines -->
        <div class="absolute inset-x-0 bottom-8 top-6 flex flex-col justify-between pointer-events-none opacity-10">
          <div class="w-full h-px bg-slate-300"></div>
          <div class="w-full h-px bg-slate-300"></div>
          <div class="w-full h-px bg-slate-300"></div>
          <div class="w-full h-px bg-slate-300"></div>
        </div>

        @for (item of chartData(); track item.label) {
          <div class="flex flex-col items-center flex-1 h-full justify-end group/bar relative">
            <!-- Tooltip -->
            <div class="absolute -top-10 opacity-0 group-hover/bar:opacity-100 transition-opacity duration-200 bg-[#222E50] border border-[#3A506B]/50 px-2 py-1 rounded-md text-xs font-bold text-white whitespace-nowrap shadow-xl z-10 pointers-events-none">
              \${{ item.amount.toFixed(2) }}
            </div>
            
            <!-- Bar -->
            <div 
              class="w-full max-w-[40px] rounded-t-md bg-gradient-to-t from-blue-600/50 to-indigo-400 hover:from-blue-500 hover:to-indigo-300 transition-all duration-300 relative overflow-hidden"
              [style.height.%]="item.amount > 0 ? (item.amount / maxValue()) * 100 : 0"
            >
              <!-- Shimmer Effect -->
              <div class="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover/bar:-translate-y-full transition-transform duration-700 ease-in-out"></div>
            </div>
            
            <!-- Label -->
            <span class="text-xs text-slate-400 mt-3 font-medium">{{ item.label }}</span>
          </div>
        }
      </div>
    </app-dev-app-card>
  `
})
export class SalesOverviewChart {
  readonly data = input.required<SalesDataPoint[]>();

  // Use a computed signal for max value to dynamically scale the bars out of 100%
  readonly maxValue = computed(() => {
    const max = Math.max(...this.data().map(d => d.amount), 0);
    return max === 0 ? 1 : max;
  });

  readonly chartData = computed(() => this.data());
}
