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

interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  totalOrders: number;
  joinedDate: string;
}

@Component({
  selector: 'app-customers',
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
            <h1 class="text-lg font-bold tracking-tight text-white">
              Customer Hub & Loyalty Matrix
            </h1>
            <p class="text-xs text-slate-400">
              Manage customer directories, track loyalty points issuance, and review profile metric
              loops.
            </p>
          </div>

          <app-app-dev-btn
            variant="primary"
            size="md"
            class="w-full sm:w-auto"
            (click)="isModalOpen.set(true)"
          >
            <i class="fas fa-user-plus text-xs mr-2"></i>
            Register New Profile
          </app-app-dev-btn>
        </div>

        <app-dev-app-quick-stat-row
          [statsData]="customerStats()"
        ></app-dev-app-quick-stat-row>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-start" [formGroup]="filterForm">
          <div class="md:col-span-2 w-full">
            <app-dev-app-input
              formControlName="search"
              label="Search Directory"
              placeholder="Filter profiles by full name, email alias, or phone channel tracks..."
            ></app-dev-app-input>
          </div>

          <div class="w-full">
            <app-dev-app-select
              formControlName="tier"
              [options]="tierFilterOptions"
              label="Filter by Tier Level"
            ></app-dev-app-select>
          </div>
        </div>

        <app-dev-app-card
          cardTitle="Client Membership Registry"
          cardSubtitle="Consolidated tracking node containing loyalty assets metrics balance"
        >
          <div class="w-full overflow-x-auto block whitespace-nowrap">
            <app-dev-app-table
              [headers]="[
                'Client ID',
                'Profile Contacts info',
                'Loyalty Balance',
                'Membership Track',
                'Total Activity Log',
                'Joined Node',
                'Actions',
              ]"
              [data]="paginatedCustomers()"
            >
              <ng-template #rowTemplate let-client>
                <td class="px-4 md:px-6 py-4 font-mono font-medium text-xs text-slate-500">
                  #{{ client.id }}
                </td>
                <td class="px-4 md:px-6 py-4 min-w-[220px] whitespace-normal">
                  <span class="font-semibold text-slate-200 block">{{ client.fullName }}</span>
                  <span class="block text-[11px] text-slate-400 mt-0.5 font-mono">{{
                    client.email
                  }}</span>
                  <span class="block text-[10px] text-slate-500 font-mono mt-0.5">{{
                    client.phone
                  }}</span>
                </td>
                <td
                  class="px-4 md:px-6 py-4 text-center font-mono font-black text-sm text-emerald-400"
                >
                  {{ client.loyaltyPoints }}
                  <span class="text-[10px] text-slate-500 font-normal">pts</span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  @switch (client.tier) {
                    @case ('PLATINUM') {
                      <app-dev-app-badge
                        label="Platinum Elite"
                        variant="success"
                      ></app-dev-app-badge>
                    }
                    @case ('GOLD') {
                      <app-dev-app-badge label="Gold Tier" variant="primary"></app-dev-app-badge>
                    }
                    @case ('SILVER') {
                      <app-dev-app-badge label="Silver Tier" variant="slate"></app-dev-app-badge>
                    }
                    @case ('BRONZE') {
                      <app-dev-app-badge label="Bronze Base" variant="danger"></app-dev-app-badge>
                    }
                  }
                </td>
                <td class="px-4 md:px-6 py-4 text-center font-mono font-medium text-slate-300">
                  {{ client.totalOrders }} invoices
                </td>
                <td class="px-4 md:px-6 py-4 font-mono text-[11px] text-slate-500">
                  {{ client.joinedDate }}
                </td>
                <td class="px-4 md:px-6 py-4 text-center">
                  <app-dev-app-action-menu
                    [items]="customerMenuActions"
                    [rowContext]="client"
                    (actionTriggered)="onCustomerAction($event)"
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
          title="Register New Client Account Profile"
          size="md"
          (close)="closeModal()"
        >
          <form [formGroup]="customerForm" class="space-y-5 text-left">
            <app-dev-app-input
              formControlName="fullName"
              label="Full Client Identity Name *"
              placeholder="e.g., Jean-Luc Mendy"
            ></app-dev-app-input>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-dev-app-input
                formControlName="email"
                label="Email Communication Endpoint *"
                placeholder="name@server.com"
                type="email"
              ></app-dev-app-input>

              <app-dev-app-input
                formControlName="phone"
                label="Mobile Telephone Link *"
                placeholder="+243 900 000..."
              ></app-dev-app-input>
            </div>

            <div
              class="p-4 bg-[#1C2541]/30 border border-[#3A506B]/15 rounded-xl space-y-2 select-none"
            >
              <span
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"
              >
                <i class="fas fa-gift text-[10px] text-emerald-400"></i> Initial Registration
                Incentive
              </span>
              <p class="text-[11px] text-slate-400 leading-relaxed">
                New profiles automatically ingest a default balance initialization layer allocation
                of **25 onboarding points** mapping straight into the Bronze tier track parameters.
              </p>
            </div>
          </form>

          <div modal-footer class="flex items-center justify-end gap-2 w-full">
            <app-app-dev-btn variant="ghost" size="sm" (click)="closeModal()"
              >Cancel</app-app-dev-btn
            >
            <app-app-dev-btn
              variant="primary"
              size="sm"
              [disabled]="customerForm.invalid || isSaving()"
              [loading]="isSaving()"
              (click)="commitCustomerProfile()"
            >
              Deploy Account Record
            </app-app-dev-btn>
          </div>
        </app-dev-app-modal>
      </div>
    </app-dashboard>
  `,
})
export class Customers {
  private readonly fb = inject(FormBuilder);

  readonly isModalOpen = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(5);

  readonly filterForm = this.fb.group({
    search: [''],
    tier: ['ALL'],
  });

  readonly filterFormValue = toSignal(this.filterForm.valueChanges, {
    initialValue: this.filterForm.value,
  });

  readonly customerForm = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
  });

  readonly customerMenuActions: DevAppMenuItem[] = [
    { id: 'add_100_points', label: 'Award 100 Loyalty Pts', icon: 'fas fa-plus-circle' },
    {
      id: 'reset_points',
      label: 'Revoke Loyalty Status',
      icon: 'fas fa-history',
      variant: 'danger',
    },
  ];

  readonly tierFilterOptions: DevAppSelectOption[] = [
    { value: 'ALL', label: 'All Tiers' },
    { value: 'BRONZE', label: 'Bronze Level Only' },
    { value: 'SILVER', label: 'Silver Level Only' },
    { value: 'GOLD', label: 'Gold Level Only' },
    { value: 'PLATINUM', label: 'Platinum Elite' },
  ];

  readonly customerRecords = signal<CustomerProfile[]>([
    {
      id: 'CST-4091',
      fullName: 'Alain Tresor',
      email: 'tresor@couleursafrique.org',
      phone: '+243 812 345 678',
      loyaltyPoints: 340,
      tier: 'GOLD',
      totalOrders: 14,
      joinedDate: '2026-02-14',
    },
    {
      id: 'CST-1024',
      fullName: 'Sifa Mwamba',
      email: 'sifa.mwamba@domain.com',
      phone: '+243 998 765 432',
      loyaltyPoints: 850,
      tier: 'PLATINUM',
      totalOrders: 32,
      joinedDate: '2026-01-05',
    },
    {
      id: 'CST-0582',
      fullName: 'Grace Kamba',
      email: 'grace.k@outlook.fr',
      phone: '+243 897 111 222',
      loyaltyPoints: 45,
      tier: 'BRONZE',
      totalOrders: 2,
      joinedDate: '2026-05-29',
    },
  ]);

  constructor() {
    this.filterForm.valueChanges.subscribe(() => this.currentPage.set(1));
  }

  readonly totalProfilesCount = computed(() => this.customerRecords().length);
  readonly eliteProfilesCount = computed(
    () => this.customerRecords().filter((c) => c.tier === 'GOLD' || c.tier === 'PLATINUM').length,
  );

  readonly customerStats = computed(() => [
    {
      title: 'Registered Directory Size',
      value: `${this.totalProfilesCount()} Clients`,
      icon: 'fas fa-users',
    },
    {
      title: 'Premium Elite Tier Share',
      value: `${this.eliteProfilesCount()} Gold/Plat`,
      icon: 'fas fa-crown',
    },
  ]);

  readonly filteredCustomers = computed(() => {
    const filters = this.filterFormValue();
    const query = (filters?.search || '').toLowerCase().trim();
    const activeTier = filters?.tier || 'ALL';

    return this.customerRecords().filter((c) => {
      const matchSearch =
        !query ||
        c.fullName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query);
      const matchTier = activeTier === 'ALL' || c.tier === activeTier;
      return matchSearch && matchTier;
    });
  });

  readonly totalItems = computed(() => this.filteredCustomers().length);
  readonly paginatedCustomers = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredCustomers().slice(start, start + this.pageSize());
  });

  onCustomerAction(event: { itemId: string; context: any }): void {
    const target = event.context as CustomerProfile;
    if (!target) return;

    this.customerRecords.update((current) =>
      current.map((c) => {
        if (c.id === target.id) {
          let points = c.loyaltyPoints;
          if (event.itemId === 'add_100_points') points += 100;
          if (event.itemId === 'reset_points') points = 0;

          let tier: CustomerProfile['tier'] = 'BRONZE';
          if (points >= 500) tier = 'PLATINUM';
          else if (points >= 200) tier = 'GOLD';
          else if (points >= 75) tier = 'SILVER';

          return { ...c, loyaltyPoints: points, tier };
        }
        return c;
      }),
    );
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize.set(newSize);
    this.currentPage.set(1);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.customerForm.reset();
  }

  commitCustomerProfile(): void {
    if (this.customerForm.invalid) return;

    this.isSaving.set(true);
    const formValues = this.customerForm.value;

    setTimeout(() => {
      const uniqueId = `CST-${Math.floor(1000 + Math.random() * 9000)}`;
      const newCustomer: CustomerProfile = {
        id: uniqueId,
        fullName: formValues.fullName!,
        email: formValues.email!,
        phone: formValues.phone!,
        loyaltyPoints: 25,
        tier: 'BRONZE',
        totalOrders: 0,
        joinedDate: '2026-06-20',
      };

      this.customerRecords.update((current) => [newCustomer, ...current]);
      this.isSaving.set(false);
      this.closeModal();
    }, 1100);
  }
}
