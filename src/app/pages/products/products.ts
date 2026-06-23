import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { DevAppTablePagination } from '../../shared/ui/dev-app-table-pagination/dev-app-table-pagination';
import { DevAppModal } from '../../shared/ui/dev-app-modal/dev-app-modal';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { Router } from '@angular/router';
import { RealtimeService } from '../../core/realtime/reatime.service';
import { SupabaseService } from '../../core/supabase/supabasa.client';

interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  basePrice: number;
  supplier: string;
  variantsCount: number;
  totalStock: number;
  createdAt: string;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DevAppCard,
    DevAppBadge,
    DevAppSelect,
    AppDevBtn,
    DevAppInput,
    DevAppTable,
    DevAppTablePagination,
    DevAppModal,
    DevAppActionMenu,
    Dashboard,
  ],
  template: `
    <app-dashboard>
      <div class="space-y-6 p-4 md:p-6 bg-[#0B132B] min-h-screen text-slate-100 relative">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div class="space-y-0.5">
            <h1 class="text-lg font-bold tracking-tight text-white">Product Catalog</h1>
            <p class="text-xs text-slate-400">
              Manage base apparel styles, category tracks, and variant distribution arrays.
            </p>
          </div>

          <app-app-dev-btn
            variant="primary"
            size="md"
            class="w-full sm:w-auto"
            (click)="isModalOpen.set(true)"
          >
            <i class="fas fa-plus text-xs mr-2"></i>
            New Product Style
          </app-app-dev-btn>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start" [formGroup]="filterForm">
          <div class="md:col-span-2 w-full">
            <app-dev-app-input
              formControlName="search"
              label="Search Catalog"
              placeholder="Filter by style name, supplier identifier, or group tag..."
            ></app-dev-app-input>
          </div>

          <div class="w-full">
            <app-dev-app-select
              formControlName="category"
              [options]="filterCategories"
              label="Filter by Category"
            ></app-dev-app-select>
          </div>
        </div>

        <app-dev-app-card
          cardTitle="Apparel Master Registry"
          cardSubtitle="Overview of parent structural elements matching filter criteria"
        >
          <div class="w-full overflow-x-auto block">
            <app-dev-app-table
              [headers]="[
                'ID',
                'Apparel Name / Design Line',
                'Category',
                'Vendor Supplier',
                'SKU Variations',
                'Global Physical Stock',
                'Base Price',
                'Actions',
              ]"
              [data]="paginatedProducts()"
            >
              <ng-template #rowTemplate let-product>
                <td class="px-4 md:px-6 py-4 font-mono text-slate-500 font-medium">
                  #{{ product.id }}
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[180px] whitespace-normal">
                  <span
                    class="font-semibold text-slate-200 hover:text-blue-400 transition-colors cursor-pointer"
                    (click)="navigateToDetail(product.id)"
                  >
                    {{ product.name }}
                  </span>
                  <span class="block text-[10px] text-slate-500 mt-0.5"
                    >Created: {{ product.createdAt }}</span
                  >
                </td>
                <td class="px-4 md:px-6 py-4">
                  <app-dev-app-badge [label]="product.category" variant="slate"></app-dev-app-badge>
                </td>
                <td class="px-4 md:px-6 py-4 text-slate-300">{{ product.supplier }}</td>
                <td class="px-4 md:px-6 py-4 text-center font-mono font-medium text-slate-400">
                  {{ product.variantsCount }} SKUs
                </td>
                <td class="px-4 md:px-6 py-4 text-center">
                  <span
                    [class.text-red-400]="product.totalStock <= 5"
                    [class.text-emerald-400]="product.totalStock > 5"
                    class="font-bold"
                  >
                    {{ product.totalStock }} units
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4 text-right font-mono font-extrabold text-slate-200">
                  \${{ product.basePrice.toFixed(2) }}
                </td>
                <td class="px-4 md:px-6 py-4 text-center">
                  <app-dev-app-action-menu
                    [items]="productMenuActions"
                    [rowContext]="product"
                    (actionTriggered)="onProductAction($event)"
                  ></app-dev-app-action-menu>
                </td>
              </ng-template>
            </app-dev-app-table>
          </div>

          <div card-footer class="w-full">
            @if (totalItems() > 0) {
              <app-dev-app-table-pagination
                [totalItems]="totalItems()"
                [pageSize]="pageSize()"
                [currentPage]="currentPage()"
                (pageChange)="currentPage.set($event)"
                (pageSizeChange)="onPageSizeChange($event)"
              ></app-dev-app-table-pagination>
            }
          </div>
        </app-dev-app-card>

        <app-dev-app-modal
          [isOpen]="isModalOpen()"
          title="Create New Product Style"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="productForm" class="space-y-5 text-left">
            <app-dev-app-input
              formControlName="name"
              label="Product Style Name *"
              placeholder="e.g., Premium Chino Shorts"
            ></app-dev-app-input>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-dev-app-select
                formControlName="category"
                [options]="formCategories"
                label="Category Hierarchy *"
              ></app-dev-app-select>

              <app-dev-app-input
                formControlName="basePrice"
                label="Base Price (USD) *"
                placeholder="49.99"
                type="number"
              ></app-dev-app-input>
            </div>

            <app-dev-app-select
              formControlName="supplier"
              [options]="formSuppliers"
              label="Assigned Vendor Supplier *"
            ></app-dev-app-select>

            <div
              class="p-4 bg-[#1C2541]/30 border border-[#3A506B]/15 rounded-xl space-y-2 select-none"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"
              >
                <i class="fas fa-layer-group text-[10px]"></i> Initial Blueprint Variations Rule
              </span>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                Saving this structure will automatically map placeholder matrix coordinates for
                sizes (S, M, L, XL) and color codes to streamline the individual SKU tracking
                process.
              </p>
            </div>
          </form>

          <div modal-footer class="flex items-center justify-end gap-2 w-full">
            <app-app-dev-btn is="app-app-dev-btn" variant="ghost" size="sm" (click)="closeModal()">
              Cancel
            </app-app-dev-btn>

            <app-app-dev-btn
              is="app-app-dev-btn"
              variant="primary"
              size="sm"
              type="submit"
              [disabled]="productForm.invalid || isSaving()"
              [loading]="isSaving()"
              (click)="saveProductStyle()"
            >
              Commit Entry
            </app-app-dev-btn>
          </div>
        </app-dev-app-modal>
      </div>
    </app-dashboard>
  `,
})
export class Products implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly realtimeService = inject(RealtimeService);
  private readonly supabase = inject(SupabaseService).supabaseClient;

  protected products = this.realtimeService.products;

  constructor() {
    // effect(() => {
    //   console.log(this.products());
    // });
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }

  ngOnInit(): void {
    this.getProducts();
  }

  async getProducts() {
    const { data, error } = await this.supabase.from('categories').select('*');

    console.log(`the data is ${JSON.stringify(data)}`);
    console.log(`THE ERROR IS ${error?.message}`);
  }

  // Core Tracking Data Hooks
  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  // Form groups initialized via FormBuilder
  readonly filterForm = this.fb.group({
    search: [''],
    category: ['ALL'],
  });

  readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  readonly productForm = this.fb.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    basePrice: ['', [Validators.required, Validators.min(0)]],
    supplier: ['', Validators.required],
  });

  // Structural mapping parameters definitions for menu actions
  readonly productMenuActions: DevAppMenuItem[] = [
    { id: 'view_details', label: 'See Product Details', icon: 'fas fa-eye' },
    { id: 'edit_style', label: 'Modify Parameters', icon: 'fas fa-edit' },
    { id: 'archive_product', label: 'Archive Record', icon: 'fas fa-archive', variant: 'danger' },
  ];

  readonly filterCategories: DevAppSelectOption[] = [
    { value: 'ALL', label: 'All Categories' },
    { value: 'Shirts', label: 'Shirts' },
    { value: 'Trousers', label: 'Trousers' },
    { value: 'Outerwear', label: 'Outerwear' },
  ];

  readonly formCategories: DevAppSelectOption[] = [
    { value: 'Shirts', label: 'Shirts' },
    { value: 'Trousers', label: 'Trousers' },
    { value: 'Outerwear', label: 'Outerwear' },
  ];

  readonly formSuppliers: DevAppSelectOption[] = [
    { value: 'Textile Horizon SARL', label: 'Textile Horizon SARL' },
    { value: 'AfroFashion Manufacturing', label: 'AfroFashion Manufacturing' },
  ];

  readonly originalProducts = signal<CatalogProduct[]>([
    {
      id: 101,
      name: 'Classic Linen Shirt',
      category: 'Shirts',
      basePrice: 45.0,
      supplier: 'Textile Horizon SARL',
      variantsCount: 4,
      totalStock: 20,
      createdAt: '2026-05-12',
    },
    {
      id: 102,
      name: 'Slim Chino Trousers',
      category: 'Trousers',
      basePrice: 65.0,
      supplier: 'AfroFashion Manufacturing',
      variantsCount: 6,
      totalStock: 18,
      createdAt: '2026-05-20',
    },
    {
      id: 103,
      name: 'Winter Overcoat',
      category: 'Outerwear',
      basePrice: 120.0,
      supplier: 'Textile Horizon SARL',
      variantsCount: 3,
      totalStock: 0,
      createdAt: '2026-06-02',
    },
    {
      id: 104,
      name: 'Lightweight Summer Bomber',
      category: 'Outerwear',
      basePrice: 85.0,
      supplier: 'AfroFashion Manufacturing',
      variantsCount: 5,
      totalStock: 42,
      createdAt: '2026-06-15',
    },
  ]);

  // Handle actions dispatched by the DevAppActionMenu instances
  onProductAction(event: { itemId: string; context: any }): void {
    const activeProduct = event.context as CatalogProduct;
    if (!activeProduct) return;

    switch (event.itemId) {
      case 'view_details':
        this.navigateToDetail(activeProduct.id);
        break;
      case 'edit_style':
        console.log(`Open edit mode parameter array tracking context for ID: ${activeProduct.id}`);
        break;
      case 'archive_product':
        console.log(`Marking style blueprint row target as deactivated: ${activeProduct.id}`);
        break;
    }
  }

  // Reactive Computing Filtering Loop
  readonly filteredProducts = computed(() => {
    const filters = this.filterFormValue();
    const rawSearch = filters?.search;
    const query = (rawSearch || '').toLowerCase().trim();
    const activeCat = filters?.category || 'ALL';

    return this.originalProducts().filter((prod) => {
      const matchQuery =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.supplier.toLowerCase().includes(query);
      const matchCat = activeCat === 'ALL' || prod.category === activeCat;
      return matchQuery && matchCat;
    });
  });

  readonly totalItems = computed(() => this.filteredProducts().length);

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts().slice(start, start + this.pageSize());
  });

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  navigateToDetail(productId: number): void {
    // Route matching your dynamic parameter mapping structure array lines
    this.router.navigate(['/products', productId]);
  }
  closeModal(): void {
    this.isModalOpen.set(false);
    this.productForm.reset();
  }

  saveProductStyle(): void {
    if (this.productForm.invalid) return;

    this.isSaving.set(true);
    setTimeout(() => {
      console.log('Committed to data stream repository:', this.productForm.value);
      this.isSaving.set(false);
      this.closeModal();
    }, 1200);
  }
}
