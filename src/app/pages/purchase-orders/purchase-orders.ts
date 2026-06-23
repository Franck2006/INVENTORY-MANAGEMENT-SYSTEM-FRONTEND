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

interface PurchaseOrder {
  id: string;
  vendorName: string;
  orderDate: string;
  totalCost: number;
  totalItems: number;
  status: 'DRAFT' | 'PENDING' | 'RECEIVED' | 'CANCELLED';
  expectedDelivery: string;
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
                'PO Reference',
                'Vendor Supplier',
                'Order Date',
                'Items Volume',
                'Total Value',
                'Expected Delivery',
                'Pipeline Status',
                'Actions',
              ]"
              [data]="paginatedOrders()"
            >
              <ng-template #rowTemplate let-order>
                <td class="px-4 md:px-6 py-4 font-mono font-bold text-xs text-blue-400">
                  #{{ order.id }}
                </td>
                <td class="px-4 md:px-6 py-4 text-slate-200 font-semibold">
                  {{ order.vendorName }}
                </td>
                <td class="px-4 md:px-6 py-4 font-mono text-[11px] text-slate-400">
                  {{ order.orderDate }}
                </td>
                <td class="px-4 md:px-6 py-4 text-center font-mono font-medium text-slate-400">
                  {{ order.totalItems }} units
                </td>
                <td class="px-4 md:px-6 py-4 font-mono font-black text-slate-100 text-right">
                  \${{ order.totalCost.toFixed(2) }}
                </td>
                <td class="px-4 md:px-6 py-4 font-mono text-[11px] text-slate-500">
                  {{ order.expectedDelivery }}
                </td>
                <td class="px-4 md:px-6 py-4">
                  @switch (order.status) {
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
                    [rowContext]="order"
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

        <app-dev-app-modal
          [isOpen]="isOrderModalOpen()"
          title="Draft New Purchase Requisition Contract"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="orderForm" class="space-y-5 text-left">
            <app-dev-app-select
              formControlName="vendorName"
              [options]="vendorFormOptions"
              label="Assigned Vendor Supplier Partner *"
            ></app-dev-app-select>

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

            <app-dev-app-input
              formControlName="expectedDelivery"
              label="Target Scheduled Delivery Date *"
              placeholder="YYYY-MM-DD"
            ></app-dev-app-input>
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
      </div>
    </app-dashboard>
  `,
})
export class PurchaseOrders {
  private readonly fb = inject(FormBuilder);

  readonly isOrderModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly filterForm = this.fb.group({
    search: [''],
    status: ['ALL'],
  });

  readonly orderForm = this.fb.group({
    vendorName: ['', Validators.required],
    totalItems: ['', [Validators.required, Validators.min(1)]],
    totalCost: ['', [Validators.required, Validators.min(1)]],
    expectedDelivery: ['', Validators.required],
  });

  readonly orderMenuActions: DevAppMenuItem[] = [
    { id: 'mark_received', label: 'Log Batch Received', icon: 'fas fa-clipboard-check' },
    { id: 'cancel_order', label: 'Void Contract', icon: 'fas fa-times-circle', variant: 'danger' },
  ];

  readonly statusFilterOptions: DevAppSelectOption[] = [
    { value: 'ALL', label: 'All Orders' },
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING', label: 'Pending / In Transit' },
    { value: 'RECEIVED', label: 'Received & Logged' },
    { value: 'CANCELLED', label: 'Voided / Cancelled' },
  ];

  readonly vendorFormOptions: DevAppSelectOption[] = [
    { value: 'Textile Horizon SARL', label: 'Textile Horizon SARL' },
    { value: 'AfroFashion Manufacturing', label: 'AfroFashion Manufacturing' },
  ];

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

  constructor() {
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }

  readonly filteredOrders = computed(() => {
    const query = (this.filterForm.get('search')?.value || '').toLowerCase().trim();
    const stat = this.filterForm.get('status')?.value || 'ALL';

    return this.orders().filter((o) => {
      const matchSearch =
        !query || o.vendorName.toLowerCase().includes(query) || o.id.toLowerCase().includes(query);
      const matchStatus = stat === 'ALL' || o.status === stat;
      return matchSearch && matchStatus;
    });
  });

  readonly totalItems = computed(() => this.filteredOrders().length);
  readonly paginatedOrders = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredOrders().slice(start, start + this.pageSize());
  });

  onOrderAction(event: { itemId: string; context: any }): void {
    const target = event.context as PurchaseOrder;
    if (!target) return;

    this.orders.update((current) =>
      current.map((o) => {
        if (o.id === target.id) {
          return { ...o, status: event.itemId === 'mark_received' ? 'RECEIVED' : 'CANCELLED' };
        }
        return o;
      }),
    );
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  closeModal(): void {
    this.isOrderModalOpen.set(false);
    this.orderForm.reset();
  }

  commitPurchaseOrder(): void {
    if (this.orderForm.invalid) return;

    this.isSaving.set(true);
    const formValues = this.orderForm.value;

    setTimeout(() => {
      const uniqueId = `PO-2026-00${this.orders().length + 1}`;
      const newPo: PurchaseOrder = {
        id: uniqueId,
        vendorName: formValues.vendorName!,
        orderDate: '2026-06-20',
        totalCost: Number(formValues.totalCost!),
        totalItems: Number(formValues.totalItems!),
        status: 'PENDING',
        expectedDelivery: formValues.expectedDelivery!,
      };

      this.orders.update((current) => [newPo, ...current]);
      this.isSaving.set(false);
      this.closeModal();
    }, 1200);
  }
}
