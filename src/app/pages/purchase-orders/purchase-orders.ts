import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { DevAppTablePagination } from '../../shared/ui/dev-app-table-pagination/dev-app-table-pagination';
import { DevAppModal } from '../../shared/ui/dev-app-modal/dev-app-modal';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import { RealtimeService } from '../../core/realtime/reatime.service';
import { PurchaseOrderService } from '../../services/purchase-order/purchase-order.service';
import { DevAppToast, DevAppToastType, ToastModel } from '../../shared/ui/dev-app-toast/dev-app-toast';
import { GeneralModel } from '../../models/general-model.type';

interface PurchaseOrder {
  id: string;
  vendorName: string;
  orderDate: Date | string;
  totalCost: number;
  totalItems: number;
  status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED';
  expectedDelivery: Date | string | null;
}

interface PurchaseOrderRow {
  orderItemId: string;
  vendorName: string;
  supplierName: string;
  supplierEmail: string;
  quantity_ordered: number;
  quantity_received: number;
  orderedAt: Date | string | null;
  productName: string;
  totalCost: number;
  expected_delivery: Date | string | null;
  status: PurchaseOrder['status'];
  totalItems: number;
  purchaseOrderId?: string
}

@Component({
  selector: 'app-purchase-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DevAppCard,
    DevAppBadge,
    DevAppSelect,
    DevAppInput,
    DevAppTable,
    DevAppTablePagination,
    DevAppModal,
    DevAppActionMenu,
    AppDevBtn,
    Dashboard,
    DevAppToast,
  ],
  template: `
    <app-dashboard>
      <div class="space-y-6 p-4 md:p-6 bg-[#0B132B] min-h-screen text-slate-100 relative">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div class="space-y-0.5">
            <h1 class="text-lg font-bold tracking-tight text-white">Purchase Procurement Orders</h1>
            <p class="text-xs text-slate-400">
              Generate supply line requisitions, track outstanding supplier shipments, and log
              vendor intake batches.
            </p>
          </div>

          <app-app-dev-btn
            is="app-app-dev-btn"
            variant="primary"
            size="md"
            class="w-full sm:w-auto"
            (click)="isOrderModalOpen.set(true)"
          >
            <i class="fas fa-file-invoice text-xs mr-2"></i>
            Create Purchase Order
          </app-app-dev-btn>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start" [formGroup]="filterForm">
          <div class="md:col-span-2 w-full">
            <app-dev-app-input
              formControlName="search"
              label="Search Requisitions"
              placeholder="Search by purchase index string, vendor identifier, or supply lines..."
            ></app-dev-app-input>
          </div>

          <div class="w-full">
            <app-dev-app-select
              formControlName="status"
              [options]="statusFilterOptions"
              [withSearch]="true"
              label="Filter by Order Status"
            ></app-dev-app-select>
          </div>
        </div>

        <app-dev-app-card
          cardTitle="Supply Chain Ingestion Tracker"
          cardSubtitle="Active and historic stock purchase contracts mapped to active supplier pipelines"
        >
          <div class="w-full overflow-x-auto block whitespace-nowrap">
            <app-dev-app-table
              [headers]="[
               '#',
               'Supplier Name',
                'Supplier Email',
                'quantity ordered',
                'quantity received',
                'Order Date',
                'Items Volume',
                'Total Cost',
                'Expected Delivery',
                'Pipeline Status',
                'Actions',
              ]"
              [data]="paginatedOrders()"
            >
           
              <ng-template #rowTemplate let-orderItem let-index="index">
                <td class="px-4 md:px-6 py-4 font-mono font-bold text-xs text-blue-400">
                  #{{ index + 1 }}
                </td>
                <td class="px-4 md:px-6 py-4 text-slate-200 font-semibold">
                  {{ orderItem.supplierName }}
                </td>
                 <td class="px-4 md:px-6 py-4 text-slate-200 ">
                  {{ orderItem.supplierEmail }}
                </td>
                 <td class="px-4 md:px-6 py-4 text-slate-200 font-semibold">
                  {{ orderItem.quantity_ordered }}
                </td>
                <td class="px-4 md:px-6 py-4 text-slate-200 font-semibold">
                  {{ orderItem.quantity_received }}
                </td>
                
                <td class="px-4 md:px-6 py-4 font-mono text-[11px] text-slate-400">
                  {{ (orderItem.orderedAt | date :'mediumDate')|| "time"}}
                </td>
                <td class="px-4 md:px-6 py-4 text-center font-mono font-medium text-slate-400">
                  {{ orderItem.productName  }} units
                </td>
                <td class="px-4 md:px-6 py-4 font-mono font-black text-slate-100 text-right">
                  \${{ orderItem.totalCost.toFixed(2) }}
                </td>
                <td class="px-4 md:px-6 py-4 font-mono text-[11px] text-slate-500">
                  {{ (orderItem.expected_delivery | date :'mediumDate') ?? 'insert delivery date' }}
                </td>
                <td class="px-4 md:px-6 py-4">
                  @switch (orderItem.status) {
                    @case ('RECEIVED') {
                      <app-dev-app-badge
                        label="Received & Stocked"
                        variant="success"
                      ></app-dev-app-badge>
                    }
                    @case ('PENDING') {
                      <app-dev-app-badge label="In Transit" variant="warning"></app-dev-app-badge>
                    }
                    @case ('DRAFT') {
                      <app-dev-app-badge
                        label="Draft Requisition"
                        variant="slate"
                      ></app-dev-app-badge>
                    }
                    @case ('CANCELLED') {
                      <app-dev-app-badge
                        label="Cancelled Void"
                        variant="danger"
                      ></app-dev-app-badge>
                    }
                  }
                </td>
                <td class="px-4 md:px-6 py-4 text-center">
                  <app-dev-app-action-menu
                    [items]="orderMenuActions"
                    [rowContext]="orderItem"
                    [loading]="orderActionLoading()"
                    (actionTriggered)="onOrderAction($event)"
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

        <!-- this is the model -->
        <app-dev-app-modal
          [isOpen]="isOrderModalOpen()"
          title="Draft New Purchase Requisition Contract"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="orderForm" class="space-y-5 text-left">
            
            <div>
              <app-dev-app-select
                formControlName="supplierId"
                [options]="suppliersFormOptions()"
                [withSearch]="true"
                label="Assigned Supplier *"
              ></app-dev-app-select>
            </div>

            <div>
              <app-dev-app-select
                formControlName="productVariantId"
                [options]="productVariantsFormOptions()"
                [withSearch]="true"
                label="Product Variant *"
              ></app-dev-app-select>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-dev-app-input
                formControlName="totalItems"
                label="Estimated Asset Items Count *"
                placeholder="e.g., 200"
                type="number"
              ></app-dev-app-input>

              <app-dev-app-input
                formControlName="totalCost"
                label="Stipulated Gross Value (USD) *"
                placeholder="e.g., 2450.00"
                type="number"
              ></app-dev-app-input>
            </div>

            <div class="space-y-2">
              <label class="block text-sm font-medium text-slate-200">Target Scheduled Delivery Date *</label>
              <input
                formControlName="expectedDelivery"
                type="date"
                class="w-full h-12 rounded-xl border border-[#3A506B]/40 bg-[#1C2541] px-4 py-3 text-sm text-slate-100 outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </form>
          <!--   [type]="date" -->

          <div modal-footer class="flex items-center justify-end gap-2 w-full">
            <app-app-dev-btn is="app-app-dev-btn" variant="ghost" size="sm" (click)="closeModal()">
              Cancel
            </app-app-dev-btn>
            <app-app-dev-btn
              is="app-app-dev-btn"
              variant="primary"
              size="sm"
              [disabled]="orderForm.invalid || isSaving()"
              [loading]="isSaving()"
              (click)="commitPurchaseOrder()"
            >
              Emit Purchase Contract
            </app-app-dev-btn>
          </div>
        </app-dev-app-modal>

        <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-[min(90vw,24rem)] pointer-events-none">
          @for (toast of activeToasts(); track toast.id) {
            <div class="pointer-events-auto">
              <app-dev-app-toast
                [id]="toast.id"
                [type]="toast.type"
                [title]="toast.title || null"
                [message]="toast.message"
                [duration]="toast.duration ?? 4000"
                (close)="removeToastId($event)"
              ></app-dev-app-toast>
            </div>
          }
        </div>
      </div>
    </app-dashboard>

   
  `,
})
export class PurchaseOrders {
  constructor() {
    this.filterForm.valueChanges.subscribe((value) => {
      this.filters.set({
        search: value.search ?? '',
        status: value.status ?? 'ALL',
      });
    });
  }

  private readonly formBuilder = inject(FormBuilder);
  private readonly realtimeService = inject(RealtimeService);
  private readonly purchaseOrderService = inject(PurchaseOrderService);

  private readonly realtimeSuppliers = this.realtimeService.suppliers;
  private readonly realtimeProductItem = this.realtimeService.purchase_order_items;
  private readonly realtimeOrders = this.realtimeService.purchase_orders
  private readonly realtimeProductViariants = this.realtimeService.product_variants;

  readonly isOrderModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly activeToasts = signal<ToastModel[]>([]);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);
  readonly orderActionLoading = signal<boolean>(false);

  readonly filterForm = this.formBuilder.group({
    search: [''],
    status: ['ALL'],
  });

  readonly filters = signal({ search: '', status: 'ALL' });

  readonly orderForm = this.formBuilder.group({
    supplierId: ['', Validators.required],
    productVariantId: ['', Validators.required],
    totalItems: [1, [Validators.required, Validators.min(1)]],
    totalCost: [0, [Validators.required, Validators.min(0.01)]],
    expectedDelivery: ['', Validators.required],
    status: ['DRAFT'],
  });

  readonly orderMenuActions: DevAppMenuItem[] = [
    { id: 'mark_received', label: 'Log Batch Received', icon: 'fas fa-clipboard-check' },
    { id: 'mark_Pending', label: 'Log Batch Pending ', icon: 'fa-solid fa-truck-ramp-box' },
    { id: 'cancel_order', label: 'Void Contract', icon: 'fas fa-times-circle', variant: 'danger' },
  ];

  readonly statusFilterOptions: DevAppSelectOption[] = [
    { value: 'ALL', label: 'All Orders' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING', label: 'Pending / In Transit' },
    { value: 'RECEIVED', label: 'Received & Logged' },
    { value: 'CANCELLED', label: 'Voided / Cancelled' },
  ];

  readonly suppliersFormOptions = computed<DevAppSelectOption[]>(() => {
    return this.realtimeSuppliers().map((supplier) => {
      return {
        value: supplier.id,
        label: supplier.company_name ?? supplier.email ?? supplier.id,
      };
    });
  });

  readonly productVariantsFormOptions = computed<DevAppSelectOption[]>(() => {
    return this.realtimeProductViariants().map((variant) => {
      const label = variant.sku ? `${variant.sku} • ${variant.color}` : `${variant.color}`;
      return {
        value: variant.id,
        label,
      };
    });
  });



  readonly orders = signal<PurchaseOrder[]>([
    {
      id: 'PO-2026-001',
      vendorName: 'Textile Horizon SARL',
      orderDate: '2026-06-01',
      totalCost: 1450.0,
      totalItems: 120,
      status: 'RECEIVED',
      expectedDelivery: '2026-06-12',
    },
    {
      id: 'PO-2026-002',
      vendorName: 'AfroFashion Manufacturing',
      orderDate: '2026-06-15',
      totalCost: 3200.0,
      totalItems: 250,
      status: 'PENDING',
      expectedDelivery: '2026-06-25',
    },
    {
      id: 'PO-2026-003',
      vendorName: 'Textile Horizon SARL',
      orderDate: '2026-06-19',
      totalCost: 890.0,
      totalItems: 60,
      status: 'DRAFT',
      expectedDelivery: '2026-07-02',
    },
  ]);

  readonly purchaseOrderItems = computed<PurchaseOrderRow[]>(() => {
    return this.realtimeProductItem().map((po) => {
      const status = (po.purchase_orders?.status ?? 'DRAFT') as PurchaseOrder['status'];

      return {
        orderItemId: po.id,
        vendorName: po.purchase_orders?.vendor_name ?? '',
        supplierName: po.purchase_orders?.vendor_name ?? '',
        supplierEmail: po.product_variants?.products?.suppliers?.email ?? '',
        quantity_ordered: po.quantity_ordered ?? 0,
        quantity_received: po.quantity_received ?? 0,
        orderedAt: po.purchase_orders?.orderAt ?? null,
        productName: po.product_variants?.products?.name ?? '',
        totalCost: po.purchase_orders?.total_cost ?? 0,
        expected_delivery: po.purchase_orders?.expected_delivery ?? null,
        status,
        totalItems: po.purchase_orders?.totalItems ?? 0,

        // these are for the IDs
        purchaseOrderId: po.purchase_order_id ?? '',

      };
    });
  });

  readonly displayedOrders = computed<PurchaseOrderRow[]>(() => {
    const realtimeRows = this.purchaseOrderItems();
    if (!realtimeRows.length) {
      return this.orders().map((order) => this.mapLocalOrderToRow(order));
    }

    const merged = [...realtimeRows];
    this.orders().forEach((order) => {
      const row = this.mapLocalOrderToRow(order);
      if (!merged.some((item) => item.orderItemId === row.orderItemId)) {
        merged.push(row);
      }
    });

    return merged;
  });

  readonly filteredOrders = computed(() => {
    const query = this.filters().search.toLowerCase().trim();
    const stat = this.filters().status || 'ALL';

    return this.displayedOrders().filter((order) => {
      const matchesStatus = stat === 'ALL' || order.status === stat;
      const matchesQuery =
        !query || this.buildSearchText(order).includes(query);

      return matchesStatus && matchesQuery;
    });
  });

  readonly totalItems = computed(() => this.filteredOrders().length);

  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });

  private mapLocalOrderToRow(order: PurchaseOrder): PurchaseOrderRow {
    return {
      orderItemId: order.id,
      vendorName: order.vendorName,
      supplierName: order.vendorName,
      supplierEmail: '',
      quantity_ordered: order.totalItems,
      quantity_received: 0,
      orderedAt: order.orderDate,
      productName: '',
      totalCost: order.totalCost,
      expected_delivery: order.expectedDelivery,
      status: order.status,
      totalItems: order.totalItems,
      purchaseOrderId: ""

    };
  }

  private buildSearchText(order: PurchaseOrderRow): string {
    return [
      order.orderItemId,
      order.vendorName,
      order.supplierName,
      order.supplierEmail,
      order.productName,
      order.status,
      order.orderedAt ? String(order.orderedAt) : '',
      order.expected_delivery ? String(order.expected_delivery) : '',
    ]
      .join(' ')
      .toLowerCase();
  }

  onOrderAction(event: { itemId: string; context: any }): void {
    const target = event.context as PurchaseOrderRow;
    const status = this.mapOrderActionToStatus(event.itemId);

    if (!target || !status) return;

    const purchaseOrderId = target.purchaseOrderId;
    if (!purchaseOrderId) return;

    this.orderActionLoading.set(true);
    this.purchaseOrderService.updateOrderService({ status }, purchaseOrderId).subscribe({
      next: (data) => {
        console.log(data);
        this.triggerNotification('success', 'Purchase order updated', 'The purchase order status was updated successfully.');
        this.orderActionLoading.set(false);
      },
      error: (e) => {
        console.log(e);
        this.triggerNotification('error', 'Update failed', 'The purchase order status could not be updated. Please try again.');
        this.orderActionLoading.set(false);
      },
    });
  }

  private mapOrderActionToStatus(actionId: string): PurchaseOrder['status'] | null {
    switch (actionId) {
      case 'mark_received':
        return 'RECEIVED';
      case 'mark_Pending':
        return 'PENDING';
      case 'cancel_order':
        return 'CANCELLED';
      default:
        return null;
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  closeModal(): void {
    this.isOrderModalOpen.set(false);
    this.orderForm.reset();
  }

  triggerNotification(type: DevAppToastType, title: string, message: string): void {
    const newToast: ToastModel = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      title,
      message,
      duration: 4000,
    };

    this.activeToasts.update((current) => [...current, newToast]);
  }

  removeToastId(toastId: string): void {
    this.activeToasts.update((current) => current.filter((toast) => toast.id !== toastId));
  }

  commitPurchaseOrder(): void {
    if (this.orderForm.invalid) return;

    this.isSaving.set(true);

    const formValue = this.orderForm.value;
    const supplierId = formValue.supplierId ?? '';
    const supplierName = this.getSupplierName(supplierId);
    const totalItems = Number(formValue.totalItems);
    const totalCost = Number(formValue.totalCost);
    const unitCost = totalItems > 0 ? Number((totalCost / totalItems).toFixed(2)) : 0;

    const payload = {
      supplierId,
      supplierName,
      orderAt: new Date().toISOString(),
      totalCost,
      totalItems,
      status: formValue.status,
      expectedDelivery: this.formatPrismaDate(formValue.expectedDelivery),
      items: [
        {
          productVariantId: formValue.productVariantId,
          quantityOrdered: totalItems,
          unitCost,
        },
      ],
    };

    this.purchaseOrderService.createOrderService(payload).subscribe({
      next: () => {
        this.triggerNotification('success', 'Purchase order created', 'The purchase order was submitted successfully.');
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.triggerNotification('error', 'Submission failed', 'The purchase order could not be created. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  private getSupplierById(supplierId: string): GeneralModel.Supplier | undefined {
    return this.realtimeSuppliers().find((s) => s.id === supplierId);
  }

  private getSupplierName(supplierId: string): string {
    return this.getSupplierById(supplierId)?.company_name ?? '';
  }

  private formatPrismaDate(dateString: string | null | undefined): string | null {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.toISOString();
  }
}
