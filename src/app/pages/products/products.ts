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
import { DevAppTextarea } from '../../shared/ui/dev-app-textarea/dev-app-textarea';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { Router } from '@angular/router';
import { RealtimeService } from '../../core/realtime/reatime.service';
import { SupabaseService } from '../../core/supabase/supabase.client';
import { GeneralModel } from '../../models/general-model.type';
import { ProductService } from '../../services/product/product.service';

interface CatalogProduct {
  id: string; // Changed from number to string to match GeneralModel.ID
  name: string;
  category: string;
  base_price: number;
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
    DevAppTextarea, // Added DevAppTextarea to imports
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
              formControlName="categoryId"
              [options]="filterCategories()"
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

                'SKU Variations',
                'Global Physical Stock',
                'Base Price',
                'Actions',
              ]"
              [data]="paginatedProducts()"
            >
              <ng-template #rowTemplate let-product>
                <td class="px-4 md:px-6 py-4 font-mono text-slate-500 font-medium">
                  #{{ 'index' }}
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

                <!-- <td class="px-4 md:px-6 py-4 text-slate-300">{{ product.supplier || 'right' }}</td> -->

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
                  \${{ product.base_price.toFixed(2) }}
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
              label="Product Name *"
              placeholder="e.g., Premium Chino Shorts"
            ></app-dev-app-input>

            <app-dev-app-textarea
              formControlName="description"
              label="Product Description *"
              placeholder="e.g., Comfortable and stylish chino shorts made from durable cotton blend."
              [rows]="4"
            ></app-dev-app-textarea>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-dev-app-select
                formControlName="categoryId"
                [options]="formCategories()"
                label="Category Hierarchy *"
              ></app-dev-app-select>

              <app-dev-app-input
                formControlName="base_price"
                label="Base Price (USD) *"
                placeholder="e.g., 49.99"
                type="number"
              ></app-dev-app-input>
            </div>

            <app-dev-app-select
              formControlName="supplierId"
              [options]="formSuppliers()"
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
  public readonly realtimeService = inject(RealtimeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly supabase = inject(SupabaseService).supabaseClient;
  private readonly productService = inject(ProductService);

  // Convert BehaviorSubjects to signals for reactive usage in templates/computed properties
  readonly productsFromRealtime = this.realtimeService.products;
  readonly categoriesFromRealtime = this.realtimeService.category;
  readonly suppliersFromRealtime = signal<any[]>([]); // Placeholder for suppliers

  constructor() {
    // The effect is no longer necessary as BehaviorSubjects are not signals directly.
    // If reactive behavior is needed, use toSignal and then react to the derived signal.
    // For now, removing this as its purpose is unclear without further context.
    // effect(() => { this.productsFromRealtime(); this.categoriesFromRealtime(); });
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }
  ngOnInit(): void {
    this.getInitialData();
    // this.realtimeService.initRealtimeSync();
  }

  async getInitialData() {
    let products = await this.supabase.from('products').select('*');
    let categories = await this.supabase.from('categories').select('*');
    let suppliers = await this.supabase.from('suppliers').select('*'); // Assuming a 'suppliers' table

    this.realtimeService.products.set(products.data || []);
    this.realtimeService.category.set(categories.data || []);
    this.suppliersFromRealtime.set(suppliers.data || []); // Populate the new signal

    if (products.error) throw new Error(products.error.message);
    if (categories.error) throw new Error(categories.error.message);
    if (suppliers.error) throw new Error(suppliers.error.message);

    console.log('-===============products.data=================');
    console.log(' ');
    console.log(products.data);
    console.log(' ');
    console.log('-==============products.data==================');
    console.log('-===============categories.data=================');
    console.log(' ');
    console.log(categories.data);
    console.log(' ');
    console.log('-==============categories.data==================');
    console.log('-===============suppliers.data================='); // New log
    console.log(' ');
    console.log(suppliers.data);
    console.log('-==============categories.data==================');
  }

  // Core Tracking Data Hooks
  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  // Form groups initialized via FormBuilder
  readonly filterForm = this.formBuilder.group({
    search: [''], // This search field will still filter by category name or supplier name
    categoryId: ['ALL'], // Changed to categoryId for consistency with formCategories
    // The filter logic will need to resolve the category name from the ID for comparison
  });

  readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  readonly productForm = this.formBuilder.group({
    name: ['', Validators.required], // Product name
    description: ['', Validators.required], // Added description field
    categoryId: ['', Validators.required], // Category ID (UUID)
    base_price: [0, [Validators.required, Validators.min(0)]], // Base price, initialized as number
    supplierId: ['', Validators.required], // Supplier ID (UUID)
  });

  // Structural mapping parameters definitions for menu actions
  readonly productMenuActions: DevAppMenuItem[] = [
    { id: 'view_details', label: 'See Product Details', icon: 'fas fa-eye' },
    { id: 'edit_style', label: 'Modify Parameters', icon: 'fas fa-edit' },
    { id: 'archive_product', label: 'Archive Record', icon: 'fas fa-archive', variant: 'danger' },
  ];

  readonly filterCategories = computed(() => {
    const categories = this.categoriesFromRealtime();
    const options: DevAppSelectOption[] = [{ value: 'ALL', label: 'All Categories' }]; // 'ALL' for filtering
    categories.forEach((cat) => options.push({ value: cat.id, label: cat.name })); // Use cat.id for value, cat.name for label
    return options;
  });

  readonly formCategories = computed(() => {
    const categories = this.categoriesFromRealtime();
    const options: DevAppSelectOption[] = [];
    categories.forEach((cat) => options.push({ value: cat.id, label: cat.name })); // Use cat.id for value, cat.name for label
    return options;
  });

  readonly formSuppliers = computed(() => {
    const suppliers = this.suppliersFromRealtime();
    const options: DevAppSelectOption[] = [];
    // Assuming supplier objects have 'id' and 'companyName' properties
    suppliers.forEach((s) =>
      options.push({ value: s.id, label: s.companyName || 'Unknown Supplier' }),
    );
    return options;
  });

  readonly originalProducts = computed(() => {
    // Map GeneralModel.Product to CatalogProduct, assuming field compatibility
    return this.productsFromRealtime().map((p) => {
      // Find the category name by matching p.categoryId with the 'id' property of categories
      const categoryName =
        this.categoriesFromRealtime().find((cat) => cat.id === p.categoryId)?.name || 'Unknown';
      return {
        id: p.id!, // Ensure id is present and cast to string
        name: p.name,
        category: categoryName,
        base_price: parseFloat(p.base_price as any) || 0,
        supplier: String(p.supplier?.companyName || p.supplierId || ''), // Use companyName from the supplier object, fallback to supplierId, then empty string
        totalStock: 0, // Placeholder, as stock data is not fetched
        createdAt: p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '', // Format date to string
      };
    });
  });

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
    const query = (rawSearch || '').toLowerCase().trim(); // Search query
    const activeCatId = filters?.categoryId || 'ALL'; // Active category ID from filter form

    return this.originalProducts().filter((prod) => {
      // Resolve category name from ID for filtering purposes
      const filterCategoryName =
        activeCatId === 'ALL'
          ? 'ALL'
          : this.categoriesFromRealtime().find((cat) => cat.id === activeCatId)?.name || 'Unknown';

      const matchQuery =
        !query ||
        prod.name.toLowerCase().includes(query) ||
        prod.supplier.toLowerCase().includes(query);
      const matchCat =
        filterCategoryName === 'ALL' ||
        prod.category.toLowerCase() === filterCategoryName.toLowerCase();
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

  navigateToDetail(productId: string): void {
    // Changed productId type to string
    // Route matching your dynamic parameter mapping structure array lines
    this.router.navigate(['/products', productId]);
  }
  closeModal(): void {
    this.isModalOpen.set(false);
    this.productForm.reset();
  }

  saveProductStyle(): void {
    if (this.productForm.invalid) return;

    const { name, description, base_price, categoryId, supplierId } = this.productForm.value;

    this.productService
      .createProduct({
        name,
        description,
        base_price,
        categoryId,
        supplierId,
      })
      .subscribe({
        error: () => {
          console.log('error');
        },
        next: () => {
          console.log('next');
        },
      });

    console.log(this.productForm.value);

    this.isSaving.set(true);
    setTimeout(() => {
      console.log('Committed to data stream repository:', this.productForm.value);
      this.isSaving.set(false);
      this.closeModal();
    }, 1200);
  }
}
