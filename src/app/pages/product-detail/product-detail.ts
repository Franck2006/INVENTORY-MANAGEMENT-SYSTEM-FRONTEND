import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { DevAppModal } from '../../shared/ui/dev-app-modal/dev-app-modal';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import { DevAppConfirmDialog } from '../../shared/ui/dev-app-confirm-dialog/dev-app-confirm-dialog';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import { Subscription } from 'rxjs';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { RealtimeService } from '../../core/realtime/reatime.service';
import { GeneralModel } from '../../models/general-model.type';
import { ProductVariantService, type ProductVariant as ProductVariantPayload } from '../../services/product-variants/product-variant.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    DevAppCard,
    DevAppBadge,
    DevAppTable,
    DevAppActionMenu,
    Dashboard,
    AppDevBtn,
    DevAppModal,
    DevAppInput,
    DevAppSelect,
    DevAppConfirmDialog,
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
                    <p class="text-slate-200 font-medium mt-0.5">{{ choosenProduct()!.suppliers!.contact_name }}</p>
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
                  <app-app-dev-btn
                    variant="primary"
                    size="sm"
                    class="w-full sm:w-auto"
                    (click)="openVariantModal()"
                  >
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
                      'Calculated Final Price',
                      'Actions',
                    ]"
                    [data]="productDetail()"
                  >

                      <!-- , -->

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
                          [class.text-red-400]="variant.lowStockThreshold === 0"
                          [class.text-slate-200]="variant.lowStockThreshold > 0"
                          class="font-bold font-mono text-xs"
                        >
                          {{ variant.lowStockThreshold }} units
                        </span>
                      </td>
                      <td
                        class="px-4 md:px-6 py-4 font-mono font-extrabold text-slate-200 text-right"
                      >
                        \${{ (choosenProduct()!.base_price * variant!.lowStockThreshold).toFixed(2) }}
                      </td>
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

      <app-dev-app-modal
        [isOpen]="isVariantModalOpen()"
        [title]="modalTitle()"
        size="md"
        (close)="closeVariantModal()"
      >
        <form [formGroup]="variantForm" class="space-y-4 text-left">
          <div>
            <app-dev-app-input
              formControlName="sku"
              label="SKU *"
              placeholder="e.g. SKU-001"
            ></app-dev-app-input>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-dev-app-input
              formControlName="size"
              label="Size *"
              placeholder="e.g. M"
            ></app-dev-app-input>

            <app-dev-app-select
              formControlName="color"
              label="Color *"
              [options]="colorOptions"
              [withSearch]="true"
            ></app-dev-app-select>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <app-dev-app-input
              formControlName="price"
              label="Price *"
              placeholder="e.g. 120"
              type="number"
            ></app-dev-app-input>

            <app-dev-app-input
              formControlName="lowStockThreshold"
              label="Low Stock Threshold *"
              placeholder="e.g. 5"
              type="number"
            ></app-dev-app-input>
          </div>
        </form>

        <div modal-footer class="flex items-center justify-end gap-2 w-full">
          <app-app-dev-btn variant="ghost" size="sm" (click)="closeVariantModal()">
            Cancel
          </app-app-dev-btn>
          <app-app-dev-btn
            variant="primary"
            size="sm"
            [disabled]="variantForm.invalid"
            (click)="submitVariant()"
          >
            {{ submitButtonLabel() }}
          </app-app-dev-btn>
        </div>
      </app-dev-app-modal>

      <app-dev-app-confirm-dialog
        [isOpen]="isDeleteConfirmOpen()"
        title="Delete variant?"
        message="Are you sure you want to delete this variant record? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        (confirm)="confirmDeleteVariant()"
        (cancel)="cancelDeleteVariant()"
      ></app-dev-app-confirm-dialog>
    </app-dashboard>
  `,
})
export class ProductDetail implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private routeSub?: Subscription;
  private readonly realtimeService = inject(RealtimeService)
  private readonly productVariantService = inject(ProductVariantService)

  private readonly realtimeProductVariants = this.realtimeService.product_variants
  private readonly realtimeProduct = this.realtimeService.products

  readonly productId = signal<string | null>(null);
  readonly isVariantModalOpen = signal(false);
  readonly isDeleteConfirmOpen = signal(false);
  readonly editingVariantId = signal<string | null>(null);
  readonly pendingDeleteVariantId = signal<string | null>(null);
  readonly removedVariantIds = signal<string[]>([]);
  readonly addedVariants = signal<ProductVariantPayload[]>([]);
  readonly colorOptions: DevAppSelectOption[] = [
    { value: 'Black', label: 'Black' },
    { value: 'White', label: 'White' },
    { value: 'Navy', label: 'Navy' },
    { value: 'Red', label: 'Red' },
    { value: 'Green', label: 'Green' },
    { value: 'Blue', label: 'Blue' },
    { value: 'Gray', label: 'Gray' },
  ];

  readonly variantForm = this.formBuilder.group({
    sku: ['', Validators.required],
    size: ['', Validators.required],
    color: ['', Validators.required],
    price: ['', [Validators.required, Validators.min(0)]],
    lowStockThreshold: [0, [Validators.required, Validators.min(0)]],
  });
  // readonly product = signal<DetailedProduct | null>(null);

  readonly variantMenuActions: DevAppMenuItem[] = [
    { id: 'adjust_stock', label: 'Update Variant', icon: 'fas fa-boxes' },
    { id: 'delete_sku', label: 'Purge SKU Entry', icon: 'fas fa-trash-alt', variant: 'danger' },
  ];


  ngOnInit(): void {
    this.getSubRouteOnAppInit()
  }

  readonly modalTitle = computed(() =>
    this.editingVariantId() ? 'Update Variant Coordinate' : 'Add Variant Coordinate',
  );

  readonly submitButtonLabel = computed(() =>
    this.editingVariantId() ? 'Update Variant' : 'Save Variant',
  );

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
    const currentProductId = this.productId();
    const removedIds = new Set(this.removedVariantIds());
    const realtimeVariants: ProductVariantPayload[] = this.realtimeProductVariants().map((variant) => ({
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      lowStockThreshold: variant.low_stock_threshold,
      id: variant.id,
      productId: variant.product_id,
    }));

    return [...this.addedVariants(), ...realtimeVariants].filter((variant) => {
      return variant.productId === currentProductId && !removedIds.has(variant.id);
    });
  })

  choosenProduct = computed(() => {
    return this.realtimeProduct().find((p) => {
      return p.id === this.productId()
    })
  })

  openVariantModal(variant?: ProductVariantPayload): void {
    this.editingVariantId.set(variant?.id ?? null);

    if (variant) {
      this.variantForm.patchValue({
        sku: variant.sku ?? '',
        size: variant.size ?? '',
        color: variant.color ?? '',
        price: variant.price ?? '',
        lowStockThreshold: variant.lowStockThreshold ?? 0,
      });
    } else {
      this.variantForm.reset({
        sku: '',
        size: '',
        color: '',
        price: '',
        lowStockThreshold: 0,
      });
    }

    this.isVariantModalOpen.set(true);
  }

  closeVariantModal(): void {
    this.isVariantModalOpen.set(false);
    this.editingVariantId.set(null);
    this.variantForm.reset({
      sku: '',
      size: '',
      color: '',
      price: '',
      lowStockThreshold: 0,
    });
  }

  submitVariant(): void {
    if (this.variantForm.invalid) return;

    const value = this.variantForm.getRawValue();
    const currentProductId = this.productId();

    if (!currentProductId) return;

    const variantId = this.editingVariantId() ?? `local-${Date.now()}`;
    const variantPayload: Partial<ProductVariantPayload> = {
      sku: value.sku?.trim() ?? '',
      size: value.size?.trim() ?? '',
      color: value.color?.trim() ?? '',
      price: String(value.price ?? ''),
      lowStockThreshold: Number(value.lowStockThreshold ?? 0),
      productId: currentProductId,
    };

    const syncVariantToState = (response: ProductVariantPayload) => {
      const savedVariant: ProductVariantPayload = {
        ...response,
        id: response.id ?? variantId,
        productId: response.productId ?? currentProductId,
        price: response.price ?? String(value.price ?? ''),
        lowStockThreshold: response.lowStockThreshold ?? Number(value.lowStockThreshold ?? 0),
      };

      this.addedVariants.update((existing) => {
        const existingIndex = existing.findIndex((variant) => variant.id === savedVariant.id);
        if (existingIndex >= 0) {
          const next = [...existing];
          next[existingIndex] = savedVariant;
          return next;
        }
        return [...existing, savedVariant];
      });

      this.closeVariantModal();
    };

    if (this.editingVariantId()) {
      this.productVariantService.updateProductVariant(this.editingVariantId()!, variantPayload).subscribe({
        next: (response) => syncVariantToState(response),
        error: (error) => console.error('Failed to update product variant', error),
      });
      return;
    }

    this.productVariantService.createProductVariant(variantPayload).subscribe({
      next: (response) => syncVariantToState(response),
      error: (error) => console.error('Failed to create product variant', error),
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  onVariantAction(event: { itemId: string; context: any }) {
    if (event.itemId === 'adjust_stock') {
      this.openVariantModal(event.context as ProductVariantPayload);
      return;
    }

    if (event.itemId === 'delete_sku') {
      this.pendingDeleteVariantId.set(event.context?.id ?? null);
      this.isDeleteConfirmOpen.set(true);
      return;
    }

    console.log(
      `Executed action context pipeline loop: ${event.itemId} targeting SKU: ${event.context.sku}`,
    );
  }

  confirmDeleteVariant(): void {
    const variantId = this.pendingDeleteVariantId();
    if (!variantId) {
      this.isDeleteConfirmOpen.set(false);
      return;
    }

    this.productVariantService.deleteProductVariant(variantId).subscribe({
      next: () => {
        this.removedVariantIds.update((existing) =>
          existing.includes(variantId) ? existing : [...existing, variantId],
        );
        this.addedVariants.update((existing) => existing.filter((variant) => variant.id !== variantId));
        this.pendingDeleteVariantId.set(null);
        this.isDeleteConfirmOpen.set(false);
      },
      error: (error) => console.error('Failed to delete product variant', error),
    });
  }

  cancelDeleteVariant(): void {
    this.pendingDeleteVariantId.set(null);
    this.isDeleteConfirmOpen.set(false);
  }

}
