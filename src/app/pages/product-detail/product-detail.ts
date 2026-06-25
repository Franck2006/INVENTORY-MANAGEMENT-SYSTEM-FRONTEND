import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { CommonModule } from '@angular/common';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import { Subscription } from 'rxjs';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { RealtimeService } from '../../core/realtime/reatime.service';

interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  stock: number;
  additionalPrice: number; // Modifiers over base price
}

interface DetailedProduct {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  supplier: string;
  description: string;
  createdAt: string;
  variants: ProductVariant[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DevAppCard,
    DevAppBadge,
    DevAppTable,
    DevAppActionMenu,
    Dashboard,
    AppDevBtn,
  ],
  template: `
    <app-dashboard>
      <div class="space-y-6 p-4 md:p-6 bg-[#0B132B] min-h-screen text-slate-100 relative">
        <div
          class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#3A506B]/15 pb-4 select-none"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2 text-xs text-slate-400">
              <span
                class="hover:text-blue-400 transition-colors cursor-pointer"
                [routerLink]="['/products']"
                >Products</span
              >
              <i class="fas fa-chevron-right text-[9px] opacity-60"></i>
              <span class="text-slate-300 font-mono">#{{ productId() }}</span>
            </div>
            <h1 class="text-xl font-bold tracking-tight text-white">
              {{ choosenProduct()?.name || 'Loading Style...' }}
            </h1>
          </div>

          <app-app-dev-btn
            variant="secondary"
            size="sm"
            class="w-full sm:w-auto"
            [routerLink]="['/products']"
          >
            <i class="fas fa-arrow-left text-xs mr-2"></i> Back to Catalog
          </app-app-dev-btn>
        </div>

        @if (choosenProduct()) {
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div class="w-full">
              <app-dev-app-card
                cardTitle="Style Configuration Blueprint"
                cardSubtitle="Base parameters tracking structural definitions"
              >
                <div class="space-y-4 text-sm select-none">
                  <div class="pb-3 border-b border-[#3A506B]/15">
                    <span
                      class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block"
                      >Category Cluster</span
                    >
                    <div class="mt-1">
                      <app-dev-app-badge
                        [label]="choosenProduct()!.categories!.name"
                        variant="slate"
                      ></app-dev-app-badge>
                    </div>
                  </div>

                  <div class="pb-3 border-b border-[#3A506B]/15">
                    <span
                      class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block"
                      >Vendor Supplier Link</span
                    >
                    <p class="text-slate-200 font-medium mt-0.5">{{ choosenProduct()!.suppliers!.contactName }}</p>
                  </div>

                  <div class="pb-3 border-b border-[#3A506B]/15">
                    <span
                      class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block"
                      >Baseline Base Price</span
                    >
                    <p class="text-lg font-mono font-black text-emerald-400 mt-0.5">
                      \$   {{ choosenProduct()?.base_price }}
                    </p>
                  </div>

                  <div class="pb-1">
                    <span
                      class="text-[10px] uppercase font-bold tracking-wider text-slate-500 block"
                      >System Architecture Footprint</span
                    >
                    <p class="text-xs text-slate-400 leading-relaxed mt-1">
                      {{ choosenProduct()?.description }}
                     
                    </p>
                    <span class="block font-mono text-[10px] text-slate-500 mt-3"
                      >Ingested into node matrix: {{ choosenProduct()?.created_at }}</span
                    >
                  </div>
                </div>
              </app-dev-app-card>
            </div>

            <div class="lg:col-span-2 w-full min-w-0">
              <app-dev-app-card
                cardTitle="Mapped SKU Matrix Distribution"
                cardSubtitle="Physical warehouse variations bound to coordinates"
              >
                <div card-header-actions class="w-full sm:w-auto">
                  <app-app-dev-btn variant="primary" size="sm" class="w-full sm:w-auto">
                    <i class="fas fa-plus text-xs mr-1.5"></i> Add Variant Coordinate
                  </app-app-dev-btn>
                </div>

                <div class="w-full overflow-x-auto block whitespace-nowrap">
                  <app-dev-app-table
                    [headers]="[
                      'SKU Identifier',
                      'Size Dimension',
                      'Color Tone',
                      'Physical Stock',
                      'Actions',
                    ]"
                    [data]="productDetail()"
                  >

                      <!-- 'Calculated Final Price', -->

                    <ng-template #rowTemplate let-variant>
                      <td class="px-4 md:px-6 py-4 font-mono font-medium text-slate-400 text-xs">
                        {{ variant.sku }}
                      </td>
                      <td class="px-4 md:px-6 py-4">
                        <span
                          class="bg-[#1C2541] border border-[#3A506B]/20 px-2 py-0.5 rounded text-xs font-bold font-mono text-slate-200"
                        >
                          {{ variant.size }}
                        </span>
                      </td>
                      <td class="px-4 md:px-6 py-4 text-sm text-slate-300">
                        <div class="flex items-center gap-2">
                          <span class="w-2.5 h-2.5 rounded-full bg-slate-400 shadow-sm"></span>
                          {{ variant.color }}
                        </div>
                      </td>
                      <td class="px-4 md:px-6 py-4">
                        <span
                          [class.text-red-400]="variant.stock === 0"
                          [class.text-slate-200]="variant.stock > 0"
                          class="font-bold font-mono text-xs"
                        >
                          {{ variant.low_stock_threshold}} units
                        </span>
                      </td>
                      <!-- <td
                        class="px-4 md:px-6 py-4 font-mono font-extrabold text-slate-200 text-right"
                      >
                      {{""}}
                        \${{ (product()!.basePrice + variant.additionalPrice).toFixed(2) }}
                      </td> -->
                      <td class="px-4 md:px-6 py-4 text-center">
                        <app-dev-app-action-menu
                          [items]="variantMenuActions"
                          [rowContext]="variant"
                          (actionTriggered)="onVariantAction($event)"
                        ></app-dev-app-action-menu>
                      </td>
                    </ng-template>
                  </app-dev-app-table>
                </div>
              </app-dev-app-card>
            </div>
          </div>
        } @else {
          <div class="p-12 text-center text-slate-500 text-xs font-mono animate-pulse select-none">
            Extracting database record array references matching trace coordinates...
          </div>
        }
      </div>
    </app-dashboard>
  `,
})
export class ProductDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private routeSub?: Subscription;
  private readonly realtimeService = inject(RealtimeService)

  private readonly realtimeProductVariants = this.realtimeService.product_variant
  private readonly realtimeProduct = this.realtimeService.products

  readonly productId = signal<string | null>(null);
  // readonly product = signal<DetailedProduct | null>(null);

  readonly variantMenuActions: DevAppMenuItem[] = [
    { id: 'adjust_stock', label: 'Modify Stock Count', icon: 'fas fa-boxes' },
    { id: 'delete_sku', label: 'Purge SKU Entry', icon: 'fas fa-trash-alt', variant: 'danger' },
  ];


  constructor() {
    effect(() => {
      console.log("THIS IS THE ARRAY", this.productDetail())
    })
  }

  ngOnInit(): void {
    this.getSubRouteOnAppInit()
  }

  getSubRouteOnAppInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const idParam = params.get('product-id');
      if (idParam) {
        const id = parseInt(idParam, 10);
        this.productId.set(idParam);
      }
    });
  }

  productDetail = computed(() => {
    console.log(this.productId())
    return this.realtimeProductVariants().filter((p) => {
      const { color, id, low_stock_threshold, price, product, product_id, size } = p

      return p.product_id === this.productId()
    })
  })

  choosenProduct = computed(() => {
    return this.realtimeProduct().find((p) => {
      return p.id === this.productId()
    })
  })

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  onVariantAction(event: { itemId: string; context: any }) {
    console.log(
      `Executed action context pipeline loop: ${event.itemId} targeting SKU: ${event.context.sku}`,
    );
  }

  // private loadProductMockData(id: number): void {
  //   setTimeout(() => {
  //     this.product.set({
  //       id,
  //       name: id === 102 ? 'Slim Chino Trousers' : 'Classic Linen Shirt',
  //       category: id === 102 ? 'Trousers' : 'Shirts',
  //       basePrice: id === 102 ? 65.0 : 45.0,
  //       supplier: id === 102 ? 'AfroFashion Manufacturing' : 'Textile Horizon SARL',
  //       description:
  //         'Premium lightweight structural apparel choice utilizing refined textile mesh optimizations.',
  //       createdAt: '2026-05-12',
  //       variants: [
  //         {
  //           sku: `SKU-${id}-S-BLK`,
  //           size: 'S',
  //           color: 'Midnight Jet Black',
  //           stock: 12,
  //           additionalPrice: 0.0,
  //         },
  //         {
  //           sku: `SKU-${id}-M-BLK`,
  //           size: 'M',
  //           color: 'Midnight Jet Black',
  //           stock: 8,
  //           additionalPrice: 0.0,
  //         },
  //       ],
  //     });
  //   }, 250);
  // }
}
