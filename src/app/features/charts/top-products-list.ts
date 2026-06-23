import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';

export interface TopProduct {
  name: string;
  variantSku: string;
  quantitySold: number;
  totalRevenue: number;
}

@Component({
  selector: 'app-top-products-list',
  standalone: true,
  imports: [CommonModule, DevAppCard],
  host: { class: 'block' },
  template: `
    <app-dev-app-card cardTitle="Top Selling Products" cardSubtitle="By quantity sold across all locations">
      <div class="flex flex-col gap-5 pt-2 pb-1 px-4">
        @for (product of data(); track product.variantSku; let i = $index) {
          <div class="relative w-full group">
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2 max-w-[70%]">
                <span class="text-xs font-bold text-slate-500 w-3">{{ i + 1 }}.</span>
                <span class="text-sm font-medium text-slate-200 truncate">{{ product.name }}</span>
                <span class="text-[10px] text-slate-500 font-mono hidden sm:inline-block border border-[#3A506B]/30 bg-[#1C2541]/40 px-1.5 py-0.5 rounded">{{ product.variantSku }}</span>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-sm font-bold text-slate-100">{{ product.quantitySold }} <span class="text-[10px] text-slate-400 font-normal">sold</span></span>
                <span class="text-[10px] text-emerald-400/80 font-medium">\${{ product.totalRevenue.toFixed(2) }}</span>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="w-full bg-[#1C2541]/50 h-1.5 rounded-full overflow-hidden">
              <div 
                class="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full transition-all duration-1000 ease-out group-hover:from-blue-400 group-hover:to-indigo-300 relative"
                [style.width.%]="(product.quantitySold / maxQuantity()) * 100"
              >
                <!-- Shimmer -->
                <div class="absolute inset-0 bg-white/20 w-1/3 blur-[2px] -translate-x-[150%] animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        }
      </div>
    </app-dev-app-card>
  `,
  styles: [`
    @keyframes shimmer {
      100% {
        transform: translateX(350%);
      }
    }
  `]
})
export class TopProductsList {
  readonly data = input.required<TopProduct[]>();

  readonly maxQuantity = computed(() => {
    const max = Math.max(...this.data().map(p => p.quantitySold), 0);
    return max === 0 ? 1 : max;
  });
}
