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
import { DevAppConfirmDialog } from '../../shared/ui/dev-app-confirm-dialog/dev-app-confirm-dialog';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { Router } from '@angular/router';
import { RealtimeService } from '../../core/realtime/reatime.service';
import { GeneralModel } from '../../models/general-model.type';
import { ProductService } from '../../services/product/product.service';
import { DevAppToastType, ToastModel } from '../../shared/ui/dev-app-toast/dev-app-toast'; // Import DevAppToast directly
import { SupabaseService } from '../../core/supabase/supabasa.client';

interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
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
    DevAppTextarea,
    DevAppConfirmDialog,
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
            (click)="openCreateModal()"
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
                'No.',
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
                <td class="px-4 md:px-6 py-4 font-mono text-slate-400 font-medium text-xs">
                  #{{ product.index }}
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
          [title]="modalTitle()"
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

        <app-dev-app-confirm-dialog
          [isOpen]="isDeleteConfirmOpen()"
          title="Delete product?"
          message="Are you sure you want to delete this product style? This action cannot be undone."
          variant="danger"
          confirmLabel="Delete"
          cancelLabel="Cancel"
          (confirm)="confirmDeleteProduct()"
          (cancel)="cancelDeleteProduct()"
        ></app-dev-app-confirm-dialog>
      </div>
    </app-dashboard>
  `,
})
export class Products implements OnInit {
  public readonly realtimeService = inject(RealtimeService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly productService = inject(ProductService);
  private readonly supabase = inject(SupabaseService).supabaseClient;


  // Signals for reactive usage in templates/computed properties, directly from RealtimeService
  readonly productsFromRealtime = this.realtimeService.products;
  readonly categoriesFromRealtime = this.realtimeService.category;
  readonly suppliersFromRealtime = this.realtimeService.suppliers;

  constructor() {
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }
  ngOnInit(): void { }

  // Core Tracking Data Hooks
  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly isDeleteConfirmOpen = signal<boolean>(false);
  readonly editingProductId = signal<string | null>(null);
  readonly pendingDeleteProductId = signal<string | null>(null);
  readonly activeToasts = signal<ToastModel[]>([]);
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
    { id: 'archive_product', label: 'Delete', icon: 'fas fa-trash-alt', variant: 'danger' },
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

    suppliers.forEach((s) =>
      options.push({ value: s.id, label: s.company_name || 'Unknown Supplier' }),
    );
    return options;
  });

  readonly originalProducts = computed(() => {
    const variantList = this.realtimeService.product_variants();

    return this.productsFromRealtime().map((p) => {
      const matchingVariants = variantList.filter((variant) => variant.product_id === p.id);
      const totalStock = matchingVariants.reduce(
        (sum, variant) => sum + (Number(variant.low_stock_threshold) || 0),
        0,
      );

      return {
        id: p.id!,
        name: p.name,
        description: p.description || '',
        category: p.categories?.name || 'Uncategorized',
        base_price: parseFloat(p.base_price?.toString() || '0'),
        supplier: p.suppliers?.company_name || 'Unknown Supplier',
        variantsCount: matchingVariants.length,
        totalStock,
        createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
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
        this.openEditModal(activeProduct);
        break;
      case 'archive_product':
        this.pendingDeleteProductId.set(activeProduct.id);
        this.isDeleteConfirmOpen.set(true);
        break;
    }
  }

  // Reactive Computing Filtering Loop
  private readonly filteredProducts = computed(() => {
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

  readonly totalItems = computed(() => this.filteredProducts().length); // Total items after filtering

  readonly paginatedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredProducts()
      .slice(start, start + this.pageSize())
      .map((product, index) => ({
        ...product,
        index: start + index + 1, // Add sequential number for current page
      }));
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
  readonly modalTitle = computed(() =>
    this.editingProductId() ? 'Update Product Style' : 'Create New Product Style',
  );

  openCreateModal(): void {
    this.editingProductId.set(null);
    this.productForm.reset({
      name: '',
      description: '',
      categoryId: '',
      base_price: 0,
      supplierId: '',
    });
    this.isModalOpen.set(true);
  }

  openEditModal(product: CatalogProduct): void {
    const existingProduct = this.productsFromRealtime().find((item) => item.id === product.id);

    this.editingProductId.set(product.id);
    this.productForm.patchValue({
      name: product.name,
      description: existingProduct?.description ?? product.description ?? '',
      categoryId:
        existingProduct?.category_id ??
        (this.categoriesFromRealtime().find((cat) => cat.name === product.category)?.id || ''),
      base_price: product.base_price,
      supplierId:
        existingProduct?.supplier_id ??
        (this.suppliersFromRealtime().find((supplier) => supplier.company_name === product.supplier)?.id || ''),
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingProductId.set(null);
    this.productForm.reset();
  }

  saveProductStyle(): void {
    if (this.productForm.invalid) return;
    this.productForm.markAllAsTouched();

    this.isSaving.set(true);

    const { name, description, base_price, categoryId, supplierId } = this.productForm.value;
    const payload = {
      ...(this.editingProductId() ? { id: this.editingProductId() } : {}),
      name: name!,
      description: description!,
      basePrice: Number(base_price ?? 0),
      categoryId: categoryId!,
      supplierId: supplierId!,
    };

    const request$ = this.editingProductId()
      ? this.productService.updateProduct(payload, this.editingProductId()!)
      : this.productService.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.triggerNotification(
          'success',
          this.editingProductId() ? 'Product Updated' : 'Product Created',
          this.editingProductId()
            ? 'The product style has been updated.'
            : 'New product style has been successfully added.',
        );
        this.closeModal();
      },
      error: (err) => {
        console.error('Error saving product:', err);
        this.triggerNotification(
          'error',
          this.editingProductId() ? 'Update Failed' : 'Creation Failed',
          this.editingProductId()
            ? 'Failed to update product style. Please try again.'
            : 'Failed to create product style. Please try again.',
        );
      },
      complete: () => {
        this.isSaving.set(false);
      },
    });
  }

  confirmDeleteProduct(): void {
    const productId = this.pendingDeleteProductId();
    if (!productId) {
      this.isDeleteConfirmOpen.set(false);
      return;
    }

    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.triggerNotification('success', 'Product Deleted', 'The product style was removed.');
        this.pendingDeleteProductId.set(null);
        this.isDeleteConfirmOpen.set(false);
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.triggerNotification('error', 'Delete Failed', 'Failed to delete product style.');
      },
    });
  }

  cancelDeleteProduct(): void {
    this.pendingDeleteProductId.set(null);
    this.isDeleteConfirmOpen.set(false);
  }

  triggerNotification(type: DevAppToastType, title: string, message: string) {
    const newToast: ToastModel = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      duration: 4000, // Default duration for auto-dismiss
    };

    // Push clean trace index to the signal chain array
    this.activeToasts.update((current) => [...current, newToast]);
  }

  removeToastId(toastId: string) {
    this.activeToasts.update((current) => current.filter((t) => t.id !== toastId));
  }
}
