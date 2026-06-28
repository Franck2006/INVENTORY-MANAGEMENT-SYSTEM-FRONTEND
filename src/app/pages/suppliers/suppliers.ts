import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { DevAppPhoneInput } from '../../shared/ui/dev-app-phone-input/dev-app-phone-input';
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
import { DevAppToast, DevAppToastType, ToastModel } from '../../shared/ui/dev-app-toast/dev-app-toast';
import { RealtimeService } from '../../core/realtime/reatime.service';
import { GeneralModel } from '../../models/general-model.type';
import { SupplierService } from '../../services/supplier/supplier.service';

interface SupplierTableRow {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DevAppCard,
    DevAppInput,
    DevAppPhoneInput,
    DevAppTable,
    DevAppTablePagination,
    DevAppModal,
    DevAppActionMenu,
    AppDevBtn,
    Dashboard,
    DevAppQuickStatRow,
    DevAppToast,
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
        <div class="w-full" [formGroup]="filterForm">
          <app-dev-app-input
            formControlName="search"
            label="Search Supplier Clusters"
            placeholder="Filter by supplier name, contact, or email..."
          ></app-dev-app-input>
        </div>

        @if (activeToasts().length > 0) {
          <div class="fixed top-4 right-4 z-50 space-y-2">
            @for (toast of activeToasts(); track toast.id) {
              <app-dev-app-toast
                [id]="toast.id"
                [type]="toast.type"
                [title]="toast.title ?? null"
                [message]="toast.message"
                [duration]="toast.duration ?? 3000"
                (close)="removeToast($event)"
              ></app-dev-app-toast>
            }
          </div>
        }

        <!-- Master Ledger Card Grid Layout -->
        <app-dev-app-card
          cardTitle="Supply Chain Sourcing Registry"
          cardSubtitle="Operational operational data nodes representing partner manufacturing facilities"
        >
          <div class="w-full overflow-x-auto block whitespace-nowrap">
            <app-dev-app-table
              [headers]="[
                'Supplier ID',
                'Supplier Name',
                'Contact Name',
                'Email',
                'Phone',
                'Actions',
              ]"
              [data]="paginatedSuppliers()"
            >
              <ng-template #rowTemplate let-supplier let-index="index">
                <td class="px-4 md:px-6 py-4 font-mono font-bold text-xs text-blue-400">
                  #{{ index + 1}}
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[220px] whitespace-normal">
                  <span class="font-semibold text-slate-200 block text-sm">{{ supplier.companyName }}</span>
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[180px] whitespace-normal">
                  <span class="text-sm text-slate-300">{{ supplier.contactName }}</span>
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[220px] whitespace-normal">
                  <span class="text-sm text-slate-400">{{ supplier.email }}</span>
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[140px] whitespace-normal">
                  <span class="text-sm text-slate-400">{{ supplier.phone }}</span>
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
          title="Register Supplier"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="supplierForm" class="space-y-5 text-left">
            <div>
                <app-dev-app-input
                  formControlName="companyName"
                  label="Supplier Name *"
                  placeholder="e.g., Kivu Textile Processing Co."
                ></app-dev-app-input>
            </div>

            <div>
              <app-dev-app-input
                formControlName="contactName"
                label="Contact Name *"
                placeholder="e.g., Ephraim Mwangu"
              ></app-dev-app-input>
            </div>
           

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <app-dev-app-input
                  formControlName="email"
                  label="Email *"
                  placeholder="b2b@factory.org"
                  type="email"
                ></app-dev-app-input>
              </div>

              <div>
                <app-dev-app-phone-input
                  formControlName="phone"
                  label="Phone *"
                ></app-dev-app-phone-input>
              </div>

             
            </div>
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
              Save Supplier
            </app-app-dev-btn>
          </div>
        </app-dev-app-modal>
      </div>
    </app-dashboard>
  `,
})
export class Suppliers {
  private readonly formBuilder = inject(FormBuilder);
  private readonly realtimeService = inject(RealtimeService);
  private readonly supplierService = inject(SupplierService);

  private readonly suppliers = this.realtimeService.suppliers;

  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);
  readonly activeToasts = signal<ToastModel[]>([]);

  readonly filterForm = this.formBuilder.group({
    search: [''],
  });

  readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  readonly supplierForm = this.formBuilder.group({
    companyName: ['', Validators.required],
    contactName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
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

  readonly supplierNodes = computed<SupplierTableRow[]>(() =>
    this.suppliers().map((supplier: GeneralModel.Supplier) => ({
      id: supplier.id,
      companyName: supplier.company_name || 'Unknown Supplier',
      contactName: supplier.contact_name || 'Unassigned Contact',
      email: supplier.email || '',
      phone: supplier.phone || '',
    })),
  );

  constructor() {
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }

  readonly totalSuppliers = computed(() => this.supplierNodes().length);

  readonly supplierStats = computed(() => [
    {
      title: 'Connected Fabric Ecosystem',
      value: `${this.totalSuppliers()} Active Entities`,
      icon: 'fas fa-industry',
    },
  ]);

  readonly filteredSuppliers = computed(() => {
    const filters = this.filterFormValue();
    const query = (filters?.search || '').toLowerCase().trim();

    return this.supplierNodes().filter((s) => {
      const matchSearch =
        !query ||
        s.companyName.toLowerCase().includes(query) ||
        s.contactName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query);
      return matchSearch;
    });
  });

  readonly totalItems = computed(() => this.filteredSuppliers().length);
  readonly paginatedSuppliers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredSuppliers().slice(start, start + this.pageSize());
  });

  onSupplierAction(event: { itemId: string; context: any }): void {
    const target = event.context as SupplierTableRow;
    if (!target) return;

    console.log(`Supplier action ${event.itemId} for`, target.companyName);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.supplierForm.reset();
  }

  commitSupplierNode(): void {
    if (this.supplierForm.invalid) return;

    this.isSaving.set(true);
    const val = this.supplierForm.value;

    this.supplierService
      .createSupplier({
        companyName: val.companyName!,
        contactName: val.contactName!,
        email: val.email!,
        phone: val.phone!,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.closeModal();
          this.showToast('success', 'Supplier created', 'Supplier was saved successfully.');
        },
        error: (err) => {
          console.error('Error creating supplier:', err);
          this.isSaving.set(false);
          this.showToast('error', 'Supplier not saved', 'Could not create the supplier. Please try again.');
        },
      });
  }

  private showToast(type: DevAppToastType, title: string, message: string): void {
    const toast: ToastModel = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
    };

    this.activeToasts.update((current) => [...current, toast]);

    setTimeout(() => {
      this.activeToasts.update((current) => current.filter((item) => item.id !== toast.id));
    }, 3000);
  }

  removeToast(id: string): void {
    this.activeToasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}
