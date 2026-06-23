import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import { CommonModule } from '@angular/common';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';

interface StoreLocation {
  id: string;
  name: string;
  city: string;
  address: string;
  isActive: boolean;
}

interface DiscountRule {
  id: string;
  code: string;
  percentage: number;
  minOrderValue: number;
  isActive: boolean;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DevAppCard,
    DevAppBadge,
    DevAppInput,
    DevAppSelect,
    AppDevBtn,
    Dashboard,
  ],
  template: `
    <app-dashboard>
      <div class="space-y-6 p-4 md:p-6 bg-[#0B132B] min-h-screen text-slate-100">
        <!-- Top Title Context Hub -->
        <div class="space-y-0.5 select-none">
          <h1 class="text-lg font-bold tracking-tight text-white">
            System Configuration Control Panel
          </h1>
          <p class="text-xs text-slate-400">
            Modify core administrative profiles, operate active brick-and-mortar storefronts, and
            tune global checkout promotions.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <!-- Column 1: Profile Matrix Configuration -->
          <div class="lg:col-span-1 space-y-6">
            <app-dev-app-card
              cardTitle="Administrator Identity"
              cardSubtitle="Manage core personnel profile links and global language preferences"
            >
              <form [formGroup]="profileForm" class="space-y-4 text-left">
                <app-dev-app-input
                  formControlName="name"
                  label="Full System Operator Name *"
                  placeholder="Operator Identity"
                ></app-dev-app-input>

                <app-dev-app-input
                  formControlName="email"
                  label="Primary Login Email Alias *"
                  placeholder="name@couleursafrique.org"
                  type="email"
                ></app-dev-app-input>

                <app-dev-app-select
                  formControlName="preferredLanguage"
                  [options]="langOptions"
                  label="Localization Matrix Preference"
                ></app-dev-app-select>
              </form>

              <div card-footer class="flex items-center justify-end w-full pt-2">
                <app-app-dev-btn
                  variant="primary"
                  size="sm"
                  [disabled]="profileForm.invalid || isProfileSaving()"
                  [loading]="isProfileSaving()"
                  (click)="saveProfile()"
                >
                  Commit Profile Changes
                </app-app-dev-btn>
              </div>
            </app-dev-app-card>
          </div>

          <!-- Column 2 & 3: Operational Slices (Stores & Markdown Matrices) -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Store Locations Node Matrix Grid -->
            <app-dev-app-card
              cardTitle="Physical Retail Hub Locations"
              cardSubtitle="Active corporate storefront locations running local distribution layers"
            >
              <div class="space-y-3">
                @for (store of stores(); track store.id) {
                  <div
                    class="p-3 bg-[#1C2541]/40 border border-[#3A506B]/20 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div class="space-y-0.5">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-white">{{ store.name }}</span>
                        <span
                          class="text-[10px] font-mono bg-[#222E50] px-1.5 py-0.5 rounded text-indigo-300 font-semibold uppercase tracking-wider"
                        >
                          {{ store.city }}
                        </span>
                      </div>
                      <p class="text-[11px] text-slate-400 font-medium">{{ store.address }}</p>
                    </div>

                    <div class="flex items-center gap-3">
                      @if (store.isActive) {
                        <app-dev-app-badge label="Online" variant="success"></app-dev-app-badge>
                      } @else {
                        <app-dev-app-badge label="Offline" variant="slate"></app-dev-app-badge>
                      }
                      <app-app-dev-btn
                        class="text-xs text-slate-400 hover:text-white font-mono font-bold p-1 transition-colors select-none"
                        (click)="toggleStoreStatus(store.id)"
                      >
                        [Toggle]
                      </app-app-dev-btn>
                    </div>
                  </div>
                }
              </div>
            </app-dev-app-card>

            <!-- Promotional Campaigns & Loyalty Deductions Margin Track -->
            <app-dev-app-card
              cardTitle="Global Markdown Contracts & Markdown Rules"
              cardSubtitle="Rule settings mapping directly onto checkout workflows and active basket point systems"
            >
              <div class="overflow-x-auto block whitespace-nowrap w-full">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-[#3A506B]/20 text-slate-400 select-none font-bold">
                      <th class="pb-3 pl-1">Voucher Code</th>
                      <th class="pb-3 text-center">Markdown Amount</th>
                      <th class="pb-3 text-center">Minimum Cart Value</th>
                      <th class="pb-3 text-center">Campaign State</th>
                      <th class="pb-3 pr-1 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#3A506B]/10 font-mono">
                    @for (rule of discountRules(); track rule.id) {
                      <tr class="text-slate-200">
                        <td class="py-3 font-bold text-emerald-400 pl-1">#{{ rule.code }}</td>
                        <td class="py-3 text-center font-bold text-slate-100">
                          {{ rule.percentage }}% OFF
                        </td>
                        <td class="py-3 text-center text-slate-400">
                          \${{ rule.minOrderValue.toFixed(2) }}
                        </td>
                        <td class="py-3 text-center">
                          @if (rule.isActive) {
                            <span
                              class="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold"
                              >ACTIVE</span
                            >
                          } @else {
                            <span
                              class="text-[10px] text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded font-bold"
                              >SUSPENDED</span
                            >
                          }
                        </td>
                        <td class="py-3 text-center pr-1">
                          <app-app-dev-btn
                            class="text-[11px] text-blue-400 hover:text-blue-300 font-bold tracking-tight transition-colors"
                            (click)="toggleDiscountRule(rule.id)"
                          >
                            {{ rule.isActive ? 'Suspend' : 'Activate' }}
                          </app-app-dev-btn>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-dev-app-card>
          </div>
        </div>
      </div>
    </app-dashboard>
  `,
})
export class Settings {
  private readonly fb = inject(FormBuilder);

  readonly isProfileSaving = signal<boolean>(false);

  readonly profileForm = this.fb.group({
    name: ['Franck Amani', Validators.required],
    email: ['franck.amani@domain.com', [Validators.required, Validators.email]],
    preferredLanguage: ['FR', Validators.required],
  });

  readonly langOptions: DevAppSelectOption[] = [
    { value: 'FR', label: 'Français (Localized System Standard)' },
    { value: 'EN', label: 'English UI Engine' },
  ];

  readonly stores = signal<StoreLocation[]>([
    {
      id: 'STR-01',
      name: 'Couleurs Afrique Hub Principal',
      city: 'GOMA',
      address: 'Avenue du Lac, Himbi',
      isActive: true,
    },
    {
      id: 'STR-02',
      name: 'Showroom Kinshasa Branch',
      city: 'KINSHASA',
      address: 'Boulevard du 30 Juin, Gombe',
      isActive: true,
    },
    {
      id: 'STR-03',
      name: 'Boutique Outlet Lubumbashi',
      city: 'LUBUMBASHI',
      address: 'Avenue Mama Yemo',
      isActive: false,
    },
  ]);

  readonly discountRules = signal<DiscountRule[]>([
    { id: 'DSC-001', code: 'KIVUWELCO26', percentage: 10, minOrderValue: 50.0, isActive: true },
    { id: 'DSC-002', code: 'AFROELITE25', percentage: 25, minOrderValue: 200.0, isActive: true },
    { id: 'DSC-003', code: 'SEASONEND05', percentage: 5, minOrderValue: 0.0, isActive: false },
  ]);

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isProfileSaving.set(true);
    setTimeout(() => {
      this.isProfileSaving.set(false);
    }, 1000);
  }

  toggleStoreStatus(id: string): void {
    this.stores.update((current) =>
      current.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)),
    );
  }

  toggleDiscountRule(id: string): void {
    this.discountRules.update((current) =>
      current.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)),
    );
  }
}
