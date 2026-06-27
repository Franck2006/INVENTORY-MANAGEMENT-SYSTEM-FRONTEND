import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
import { DevAppQuickStatRow } from '../../shared/ui/dev-app-quick-stat-row/dev-app-quick-stat-row';
import { RealtimeService } from '../../core/realtime/reatime.service';

interface SupplierNode {
  id: string;
  vendorName: string;
  category: 'FABRIC_MILL' | 'MANUFACTURER' | 'ACCESSORIES';
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'BLACKLISTED';
}

@Component({
  selector: 'app-suppliers',
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
        <!-- Top Context Header Hub -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none">
          <div class="space-y-0.5">
            <h1 class="text-lg font-bold tracking-tight text-white">
              Fashion Vendor & Supplier Node Directory
            </h1>
            <p class="text-xs text-slate-400">
              Manage factory manufacturing contacts, raw textile source channels, and operational
              procurement matrices.
            </p>
          </div>

          <app-app-dev-btn
            variant="primary"
            size="md"
            class="w-full sm:w-auto"
            (click)="isModalOpen.set(true)"
          >
            <i class="fas fa-truck-loading text-xs mr-2"></i>
            Register Supplier Node
          </app-app-dev-btn>
        </div>

        <!-- Live Pipeline Matrix Insights -->
        <app-dev-app-quick-stat-row
          [statsData]="supplierStats()"
        ></app-dev-app-quick-stat-row>

        <!-- Operational Filters Matrix Grid Row -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start" [formGroup]="filterForm">
          <div class="md:col-span-2 w-full">
            <app-dev-app-input
              formControlName="search"
              label="Search Supplier Clusters"
              placeholder="Filter entities by trade identity name, manager token, or structural email..."
            ></app-dev-app-input>
          </div>

          <div class="w-full">
            <app-dev-app-select
              formControlName="category"
              [options]="categoryFilterOptions"
              label="Filter by Sector Specialization"
            ></app-dev-app-select>
          </div>
        </div>

        <!-- Master Ledger Card Grid Layout -->
        <app-dev-app-card
          cardTitle="Supply Chain Sourcing Registry"
          cardSubtitle="Operational operational data nodes representing partner manufacturing facilities"
        >
          <div class="w-full overflow-x-auto block whitespace-nowrap">
            <app-dev-app-table
              [headers]="[
                'Vendor ID',
                'Corporate Identity / Contact',
                'Specialization Cluster',
                'Factory Lead Time',
                'Contract Status',
                'Actions',
              ]"
              [data]="paginatedSuppliers()"
            >
              <ng-template #rowTemplate let-supplier let-index="index">
                <td class="px-4 md:px-6 py-4 font-mono font-bold text-xs text-blue-400">
                  #{{ index }}
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[240px] whitespace-normal">
                  <span class="font-semibold text-slate-200 block text-sm">{{
                    supplier.vendorName
                  }}</span>
                  <span class="text-[11px] text-slate-400 mt-0.5 block font-medium"
                    >Attn: {{ supplier.contactPerson }}</span
                  >
                  <span class="text-[10px] text-slate-500 mt-0.5 block font-mono"
                    >{{ supplier.email }} &bull; {{ supplier.phone }}</span
                  >
                </td>
                <td class="px-4 md:px-6 py-4">
                  @switch (supplier.category) {
                    @case ('FABRIC_MILL') {
                      <span
                        class="text-xs bg-[#222E50]/60 text-indigo-300 px-2 py-1 rounded font-medium border border-indigo-500/15"
                        >Textile & Fabric Mill</span
                      >
                    }
                    @case ('MANUFACTURER') {
                      <span
                        class="text-xs bg-[#222E50]/60 text-sky-300 px-2 py-1 rounded font-medium border border-sky-500/15"
                        >Cut & Sew Manufacturer</span
                      >
                    }
                    @case ('ACCESSORIES') {
                      <span
                        class="text-xs bg-[#222E50]/60 text-amber-300 px-2 py-1 rounded font-medium border border-amber-500/15"
                        >Hardware & Trim Supply</span
                      >
                    }
                  }
                </td>
                <td class="px-4 md:px-6 py-4 font-mono text-xs text-slate-300 text-center">
                  <i class="far fa-clock text-[10px] text-slate-500 mr-1"></i>
                  {{ supplier.leadTimeDays }} Days avg
                </td>
                <td class="px-4 md:px-6 py-4">
                  @switch (supplier.status) {
                    @case ('ACTIVE') {
                      <app-dev-app-badge
                        label="Verified Active"
                        variant="success"
                      ></app-dev-app-badge>
                    }
                    @case ('UNDER_REVIEW') {
                      <app-dev-app-badge
                        label="Quality Audit"
                        variant="warning"
                      ></app-dev-app-badge>
                    }
                    @case ('BLACKLISTED') {
                      <app-dev-app-badge
                        label="Terminated Void"
                        variant="danger"
                      ></app-dev-app-badge>
                    }
                  }
                </td>
                <td class="px-4 md:px-6 py-4 text-center">
                  <app-dev-app-action-menu
                    [items]="supplierMenuActions"
                    [rowContext]="supplier"
                    (actionTriggered)="onSupplierAction($event)"
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

        <!-- Vendor Entry Registration Modal Overlay -->
        <app-dev-app-modal
          [isOpen]="isModalOpen()"
          title="Register Production Partner Contract Node"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="supplierForm" class="space-y-5 text-left">
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="sm:col-span-2">
                <app-dev-app-input
                  formControlName="vendorName"
                  label="Corporate Manufacturing Identity *"
                  placeholder="e.g., Kivu Textile Processing Co."
                ></app-dev-app-input>
              </div>
              <div>
                <app-dev-app-select
                  formControlName="category"
                  [options]="categoryFormOptions"
                  label="Sector Core Cluster *"
                ></app-dev-app-select>
              </div>
            </div>

            <app-dev-app-input
              formControlName="contactPerson"
              label="Assigned Lead Account Representative *"
              placeholder="e.g., Ephraim Mwangu"
            ></app-dev-app-input>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-dev-app-input
                formControlName="email"
                label="Corporate B2B Mail Gateway *"
                placeholder="b2b@factory.org"
                type="email"
              ></app-dev-app-input>

              <app-dev-app-input
                formControlName="phone"
                label="Operational Routing Comms Line *"
                placeholder="+243 850..."
              ></app-dev-app-input>
            </div>

            <app-dev-app-input
              formControlName="leadTimeDays"
              label="Guaranteed Fulfillment Cycle Window (Days) *"
              placeholder="e.g., 14"
              type="number"
            ></app-dev-app-input>
          </form>

          <div modal-footer class="flex items-center justify-end gap-2 w-full">
            <app-app-dev-btn variant="ghost" size="sm" (click)="closeModal()">
              Cancel
            </app-app-dev-btn>
            <app-app-dev-btn
              variant="primary"
              size="sm"
              [disabled]="supplierForm.invalid || isSaving()"
              [loading]="isSaving()"
              (click)="commitSupplierNode()"
            >
              Deploy Sourcing Stream
            </app-app-dev-btn>
          </div>
        </app-dev-app-modal>
      </div>
    </app-dashboard>
  `,
})
export class Suppliers {
  private readonly formBuilder = inject(FormBuilder);
  private readonly realtimeService = inject(RealtimeService)

  private readonly suppliers = this.realtimeService.suppliers

  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly filterForm = this.formBuilder.group({
    search: [''],
    category: ['ALL'],
  });

  readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  readonly supplierForm = this.formBuilder.group({
    vendorName: ['', Validators.required],
    category: ['MANUFACTURER', Validators.required],
    contactPerson: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    leadTimeDays: ['', [Validators.required, Validators.min(1)]],
  });

  readonly supplierMenuActions: DevAppMenuItem[] = [
    { id: 'set_active', label: 'Approve Quality Status', icon: 'fas fa-check-shield' },
    {
      id: 'flag_review',
      label: 'Place On Hold (Audit)',
      icon: 'fas fa-pause-circle',
      variant: 'danger',
    },
  ];

  readonly categoryFilterOptions: DevAppSelectOption[] = [
    { value: 'ALL', label: 'All Specializations' },
    { value: 'FABRIC_MILL', label: 'Textile & Fabric Mills' },
    { value: 'MANUFACTURER', label: 'Cut & Sew Assembly Plants' },
    { value: 'ACCESSORIES', label: 'Hardware, app-app-dev-btns & Trims' },
  ];

  readonly categoryFormOptions: DevAppSelectOption[] = [
    { value: 'FABRIC_MILL', label: 'Textile Fabric Mill' },
    { value: 'MANUFACTURER', label: 'Cut & Sew Assembly' },
    { value: 'ACCESSORIES', label: 'Hardware / Trim Supply' },
  ];

  readonly supplierNodes = signal<SupplierNode[]>([
    {
      id: 'VND-702',
      vendorName: 'Textile Horizon SARL',
      category: 'FABRIC_MILL',
      contactPerson: 'Marc Dubois',
      email: 'm.dubois@textilehorizon.com',
      phone: '+243 812 990 112',
      leadTimeDays: 14,
      status: 'ACTIVE',
    },
    {
      id: 'VND-315',
      vendorName: 'AfroFashion Manufacturing',
      category: 'MANUFACTURER',
      contactPerson: 'Faustin Kalombo',
      email: 'procurement@afrofashion.cd',
      phone: '+243 994 203 040',
      leadTimeDays: 21,
      status: 'ACTIVE',
    },
    {
      id: 'VND-089',
      vendorName: 'Ecoapp-app-dev-btn Premium Trims',
      category: 'ACCESSORIES',
      contactPerson: 'Sarah Jenkins',
      email: 's.jenkins@ecotrims.com',
      phone: '+1 555 019 2831',
      leadTimeDays: 7,
      status: 'UNDER_REVIEW',
    },
  ]);

  constructor() {
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }

  readonly totalSuppliers = computed(() => this.supplierNodes().length);
  readonly reviewCount = computed(
    () => this.supplierNodes().filter((s) => s.status === 'UNDER_REVIEW').length,
  );

  readonly supplierStats = computed(() => [
    {
      title: 'Connected Fabric Ecosystem',
      value: `${this.totalSuppliers()} Active Entities`,
      icon: 'fas fa-industry',
    },
    {
      title: 'Critical Pipeline Alerts',
      value: `${this.reviewCount()} Nodes On Hold`,
      icon: 'fas fa-shield-alt',
      change: this.reviewCount() > 0 ? 'Review Reqd' : 'Clear',
      isPositive: this.reviewCount() === 0,
    },
  ]);

  readonly filteredSuppliers = computed(() => {
    const filters = this.filterFormValue();
    const query = (filters?.search || '').toLowerCase().trim();
    const cat = filters?.category || 'ALL';

    return this.supplierNodes().filter((s) => {
      const matchSearch =
        !query ||
        s.vendorName.toLowerCase().includes(query) ||
        s.contactPerson.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query);
      const matchCat = cat === 'ALL' || s.category === cat;
      return matchSearch && matchCat;
    });
  });

  readonly totalItems = computed(() => this.filteredSuppliers().length);
  readonly paginatedSuppliers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSuppliers().slice(start, start + this.pageSize());
  });

  onSupplierAction(event: { itemId: string; context: any }): void {
    const target = event.context as SupplierNode;
    if (!target) return;

    this.supplierNodes.update((current) =>
      current.map((s) => {
        if (s.id === target.id) {
          return { ...s, status: event.itemId === 'set_active' ? 'ACTIVE' : 'UNDER_REVIEW' };
        }
        return s;
      }),
    );
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.supplierForm.reset({ category: 'MANUFACTURER' });
  }

  commitSupplierNode(): void {
    if (this.supplierForm.invalid) return;

    this.isSaving.set(true);
    const val = this.supplierForm.value;

    setTimeout(() => {
      const uniqueId = `VND-${Math.floor(100 + Math.random() * 900)}`;
      const newNode: SupplierNode = {
        id: uniqueId,
        vendorName: val.vendorName!,
        category: val.category as SupplierNode['category'],
        contactPerson: val.contactPerson!,
        email: val.email!,
        phone: val.phone!,
        leadTimeDays: Number(val.leadTimeDays!),
        status: 'ACTIVE',
      };

      this.supplierNodes.update((current) => [newNode, ...current]);
      this.isSaving.set(false);
      this.closeModal();
    }, 1100);
  }
}
