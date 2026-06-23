import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { DevAppTablePagination } from '../../shared/ui/dev-app-table-pagination/dev-app-table-pagination';
import { DevAppModal } from '../../shared/ui/dev-app-modal/dev-app-modal';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import { DevAppQuickStatRow } from '../../shared/ui/dev-app-quick-stat-row/dev-app-quick-stat-row';

interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  variantInfo: string;
  warehouseLocation: string;
  availableStock: number;
  minimumThreshold: number;
  lastUpdated: string;
}

@Component({
  selector: 'app-inventory',
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
    DevAppQuickStatRow,
  ],
  template: `
    <app-dashboard>
      <div class="space-y-6 p-4 md:p-6 bg-[#0B132B] min-h-screen text-slate-100 relative">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div class="space-y-0.5">
            <h1 class="text-lg font-bold tracking-tight text-white">Stock & Inventory Control</h1>
            <p class="text-xs text-slate-400">
              Monitor real-time warehouse counts, log inbound stock items, and mitigate critical
              stockout conditions.
            </p>
          </div>

          <app-app-dev-btn
            variant="primary"
            size="md"
            class="w-full sm:w-auto"
            (click)="isAdjustmentModalOpen.set(true)"
          >
            <i class="fas fa-boxes text-xs mr-2"></i>
            Inbound Stock Intake
          </app-app-dev-btn>
        </div>

        <app-dev-app-quick-stat-row
          [statsData]="inventoryStats()"
        ></app-dev-app-quick-stat-row>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start" [formGroup]="filterForm">
          <div class="md:col-span-2 w-full">
            <app-dev-app-input
              formControlName="search"
              label="Filter Stock Records"
              placeholder="Search by SKU identifier, item design name, or zone coordinates..."
            ></app-dev-app-input>
          </div>

          <div class="w-full">
            <app-dev-app-select
              formControlName="location"
              [options]="warehouseOptions"
              label="Filter by Location Cluster"
            ></app-dev-app-select>
          </div>
        </div>

        <app-dev-app-card
          cardTitle="Physical Stock Ledger"
          cardSubtitle="Current balance of variant assets mapped across terminal zones"
        >
          <div class="w-full overflow-x-auto block whitespace-nowrap">
            <app-dev-app-table
              [headers]="[
                'SKU Code',
                'Apparel Line Item',
                'Warehouse Location',
                'Available Balance',
                'Alert Level Status',
                'Last Sync',
                'Actions',
              ]"
              [data]="paginatedInventory()"
            >
              <ng-template #rowTemplate let-row>
                <td class="px-4 md:px-6 py-4 font-mono font-medium text-xs text-slate-400">
                  #{{ row.sku }}
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[200px] whitespace-normal">
                  <span class="font-semibold text-slate-200 block">{{ row.name }}</span>
                  <span
                    class="text-[10px] text-slate-400 font-mono tracking-wide bg-[#222E50]/40 px-1.5 py-0.5 rounded mt-1 inline-block"
                  >
                    {{ row.variantInfo }}
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span class="text-slate-300 font-medium text-xs"
                    ><i class="fas fa-map-marker-alt text-[10px] text-slate-500 mr-1.5"></i
                    >{{ row.warehouseLocation }}</span
                  >
                </td>
                <td class="px-4 md:px-6 py-4 font-mono font-bold text-center text-sm">
                  {{ row.availableStock }}
                </td>
                <td class="px-4 md:px-6 py-4">
                  @if (row.availableStock === 0) {
                    <app-dev-app-badge label="Out of Stock" variant="danger"></app-dev-app-badge>
                  } @else if (row.availableStock <= row.minimumThreshold) {
                    <app-dev-app-badge
                      label="Low Stock Warning"
                      variant="warning"
                    ></app-dev-app-badge>
                  } @else {
                    <app-dev-app-badge
                      label="Healthy Allocation"
                      variant="success"
                    ></app-dev-app-badge>
                  }
                </td>
                <td class="px-4 md:px-6 py-4 font-mono text-[11px] text-slate-500">
                  {{ row.lastUpdated }}
                </td>
                <td class="px-4 md:px-6 py-4 text-center">
                  <app-dev-app-action-menu
                    [items]="inventoryMenuActions"
                    [rowContext]="row"
                    (actionTriggered)="onInventoryAction($event)"
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
          [isOpen]="isAdjustmentModalOpen()"
          title="Stock Level Intake / Re-allocation Adjustment"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="intakeForm" class="space-y-5 text-left">
            <app-dev-app-select
              formControlName="targetSku"
              [options]="skuFormOptions"
              label="Target SKU Coordinate Matrix Line Item *"
            ></app-dev-app-select>

            <div class="grid grid-cols-2 gap-4">
              <app-dev-app-input
                formControlName="quantityChange"
                label="Intake Ingestion Volume *"
                placeholder="e.g., 50"
                type="number"
              ></app-dev-app-input>

              <app-dev-app-select
                formControlName="destinationLocation"
                [options]="warehouseFormOptions"
                label="Assigned Warehouse Zone *"
              ></app-dev-app-select>
            </div>
          </form>

          <div modal-footer class="flex items-center justify-end gap-2 w-full">
            <app-app-dev-btn variant="ghost" size="sm" (click)="closeModal()">
              Cancel
            </app-app-dev-btn>
            <app-app-dev-btn
              variant="primary"
              size="sm"
              [disabled]="intakeForm.invalid || isSaving()"
              [loading]="isSaving()"
              (click)="commitStockIntake()"
            >
              Ingest Pipeline Allocation
            </app-app-dev-btn>
          </div>
        </app-dev-app-modal>
      </div>
    </app-dashboard>
  `,
})
export class Inventory {
  private readonly fb = inject(FormBuilder);

  readonly isAdjustmentModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly filterForm = this.fb.group({
    search: [''],
    location: ['ALL'],
  });

  readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  readonly intakeForm = this.fb.group({
    targetSku: ['', Validators.required],
    quantityChange: ['', [Validators.required, Validators.min(1)]],
    destinationLocation: ['', Validators.required],
  });

  readonly inventoryMenuActions: DevAppMenuItem[] = [
    { id: 'quick_add_10', label: 'Inbound Add +10', icon: 'fas fa-plus-circle' },
    { id: 'zero_out', label: 'Report Scrapped / Broken', icon: 'fas fa-ban', variant: 'danger' },
  ];

  readonly warehouseOptions: DevAppSelectOption[] = [
    { value: 'ALL', label: 'All Locations' },
    { value: 'Zone-A (Main Storage Hub)', label: 'Zone-A (Main Hub)' },
    { value: 'Zone-B (Secondary Storage Hub)', label: 'Zone-B (Secondary)' },
  ];

  readonly warehouseFormOptions: DevAppSelectOption[] = [
    { value: 'Zone-A (Main Storage Hub)', label: 'Zone-A (Main Hub)' },
    { value: 'Zone-B (Secondary Storage Hub)', label: 'Zone-B (Secondary)' },
  ];

  readonly skuFormOptions: DevAppSelectOption[] = [
    { value: 'SKU-101-S-BLK', label: 'Classic Linen Shirt - S / Black' },
    { value: 'SKU-102-M-GRN', label: 'Slim Chino Trousers - M / Olive' },
  ];

  readonly inventoryItems = signal<InventoryItem[]>([
    {
      id: 1,
      sku: 'SKU-101-S-BLK',
      name: 'Classic Linen Shirt',
      variantInfo: 'S / Black',
      warehouseLocation: 'Zone-A (Main Storage Hub)',
      availableStock: 12,
      minimumThreshold: 5,
      lastUpdated: '2026-06-20',
    },
    {
      id: 2,
      sku: 'SKU-101-M-BLK',
      name: 'Classic Linen Shirt',
      variantInfo: 'M / Black',
      warehouseLocation: 'Zone-A (Main Storage Hub)',
      availableStock: 4,
      minimumThreshold: 5,
      lastUpdated: '2026-06-19',
    },
    {
      id: 3,
      sku: 'SKU-102-M-GRN',
      name: 'Slim Chino Trousers',
      variantInfo: 'M / Olive Green',
      warehouseLocation: 'Zone-B (Secondary Storage Hub)',
      availableStock: 0,
      minimumThreshold: 3,
      lastUpdated: '2026-06-15',
    },
    {
      id: 4,
      sku: 'SKU-102-L-GRN',
      name: 'Slim Chino Trousers',
      variantInfo: 'L / Olive Green',
      warehouseLocation: 'Zone-B (Secondary Storage Hub)',
      availableStock: 25,
      minimumThreshold: 3,
      lastUpdated: '2026-06-20',
    },
  ]);

  constructor() {
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }

  readonly totalStockUnits = computed(() =>
    this.inventoryItems().reduce((acc, curr) => acc + curr.availableStock, 0),
  );
  readonly lowStockCount = computed(
    () => this.inventoryItems().filter((i) => i.availableStock <= i.minimumThreshold).length,
  );

  readonly inventoryStats = computed(() => [
    {
      title: 'Total Tracked Units',
      value: this.totalStockUnits().toString(),
      icon: 'fas fa-cubes',
    },
    {
      title: 'Critical Stockout Alerts',
      value: `${this.lowStockCount()} Items`,
      icon: 'fas fa-exclamation-triangle',
      change: this.lowStockCount() > 0 ? 'Action Reqd' : 'Healthy',
      isPositive: this.lowStockCount() === 0,
    },
  ]);

  readonly filteredInventory = computed(() => {
    const filters = this.filterFormValue();
    const search = (filters?.search || '').toLowerCase().trim();
    const loc = filters?.location || 'ALL';

    return this.inventoryItems().filter((item) => {
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search);
      const matchLoc = loc === 'ALL' || item.warehouseLocation === loc;
      return matchSearch && matchLoc;
    });
  });

  readonly totalItems = computed(() => this.filteredInventory().length);
  readonly paginatedInventory = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredInventory().slice(start, start + this.pageSize());
  });

  onInventoryAction(event: { itemId: string; context: any }): void {
    const target = event.context as InventoryItem;
    if (!target) return;

    if (event.itemId === 'quick_add_10') {
      this.modifyStockCount(target.sku, 10);
    } else if (event.itemId === 'zero_out') {
      this.modifyStockCount(target.sku, -target.availableStock);
    }
  }

  modifyStockCount(sku: string, variance: number): void {
    this.inventoryItems.update((current) =>
      current.map((item) => {
        if (item.sku === sku) {
          const finalStock = item.availableStock + variance;
          return {
            ...item,
            availableStock: finalStock > 0 ? finalStock : 0,
            lastUpdated: 'Just Now',
          };
        }
        return item;
      }),
    );
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  closeModal(): void {
    this.isAdjustmentModalOpen.set(false);
    this.intakeForm.reset();
  }

  commitStockIntake(): void {
    if (this.intakeForm.invalid) return;

    this.isSaving.set(true);
    const formValues = this.intakeForm.value;

    setTimeout(() => {
      this.modifyStockCount(formValues.targetSku!, Number(formValues.quantityChange!));
      this.isSaving.set(false);
      this.closeModal();
    }, 1000);
  }
}
