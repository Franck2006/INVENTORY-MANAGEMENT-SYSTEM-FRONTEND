import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import {
  DevAppActionMenu,
  DevAppMenuItem,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';

interface POSItem {
  id: string;
  sku: string;
  name: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

interface CartItem {
  skuId: string;
  name: string;
  variantInfo: string; // e.g., "L / Black"
  unitPrice: number;
  quantity: number;
}

@Component({
  selector: 'app-pos',
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
    DevAppActionMenu,
    Dashboard,
  ],
  template: `
    <app-dashboard>
      <div class="p-6 bg-[#0B132B] min-h-screen text-slate-100 space-y-6">
        <div
          class="flex items-center justify-between border-b border-[#3A506B]/15 pb-4 select-none"
        >
          <div class="space-y-0.5">
            <h1 class="text-lg font-bold tracking-tight text-white">POS Checkout Terminal</h1>
            <p class="text-xs text-slate-400">
              Execute real-time order processing loops and generate instant physical receipts.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <app-dev-app-badge
              label="Terminal Active"
              variant="success"
              icon="fas fa-desktop"
            ></app-dev-app-badge>
            <span class="text-xs font-mono text-slate-500">ID: TRM-042</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div class="lg:col-span-2 space-y-4">
            <app-dev-app-card
              cardTitle="Active Transaction Items"
              cardSubtitle="Apparel lines allocated to the current counter sequence loop"
            >
              <div card-header-actions>
                <button
                  is="app-app-dev-btn"
                  variant="ghost"
                  size="sm"
                  [disabled]="cart().length === 0"
                  (click)="clearCart()"
                >
                  <i class="fas fa-trash-alt text-xs mr-1.5"></i> Clear Cart
                </button>
              </div>

              <app-dev-app-table
                [headers]="[
                  'Apparel Description',
                  'Unit Price',
                  'Quantity',
                  'Row Subtotal',
                  'Actions',
                ]"
                [data]="cart()"
              >
                <ng-template #rowTemplate let-item>
                  <td class="px-6 py-4">
                    <span class="font-semibold text-slate-200 block">{{ item.name }}</span>
                    <span
                      class="text-[10px] text-slate-400 font-mono tracking-wide bg-[#222E50]/40 px-1.5 py-0.5 rounded mt-1 inline-block"
                    >
                      {{ item.variantInfo }}
                    </span>
                  </td>
                  <td class="px-6 py-4 font-mono text-slate-300">
                    \${{ item.unitPrice.toFixed(2) }}
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 select-none">
                      <button
                        (click)="updateQty(item.skuId, -1)"
                        class="w-6 h-6 rounded bg-[#222E50] hover:bg-[#2C3B66] text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      >
                        -
                      </button>
                      <span class="w-8 text-center font-mono font-bold text-sm text-slate-100">{{
                        item.quantity
                      }}</span>
                      <button
                        (click)="updateQty(item.skuId, 1)"
                        class="w-6 h-6 rounded bg-[#222E50] hover:bg-[#2C3B66] text-slate-300 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td class="px-6 py-4 font-mono font-extrabold text-slate-200">
                    \${{ (item.unitPrice * item.quantity).toFixed(2) }}
                  </td>
                  <td class="px-6 py-4 text-center">
                    <app-dev-app-action-menu
                      [items]="rowActions"
                      [rowContext]="item"
                      (actionTriggered)="onMenuAction($event)"
                    ></app-dev-app-action-menu>
                  </td>
                </ng-template>
              </app-dev-app-table>
            </app-dev-app-card>

            <div
              class="p-4 bg-[#1C2541]/20 border border-[#3A506B]/15 rounded-xl flex items-center justify-between gap-4 select-none"
            >
              <span class="text-xs text-slate-400 font-medium">
                <i class="fas fa-barcode mr-2 text-slate-500"></i> Simulate physical warehouse
                scanner ingestion lines:
              </span>
              <div class="flex gap-2">
                <button
                  is="app-app-dev-btn"
                  variant="secondary"
                  size="sm"
                  (click)="simulateBarcodeScan('SHIRT-L-BLK')"
                >
                  + Scan Shirt (L)
                </button>
                <button
                  is="app-app-dev-btn"
                  variant="secondary"
                  size="sm"
                  (click)="simulateBarcodeScan('TROUSER-M-GRN')"
                >
                  + Scan Chino (M)
                </button>
              </div>
            </div>
          </div>

          <div class="space-y-6" [formGroup]="checkoutForm">
            <app-dev-app-card
              cardTitle="Customer & Settlement"
              cardSubtitle="Parameters binding order payload to architecture channels"
            >
              <div class="space-y-5">
                <app-dev-app-input
                  formControlName="customerQuery"
                  label="Customer Reference (Optional)"
                  placeholder="Name, phone number, or subscriber ID..."
                ></app-dev-app-input>

                <app-dev-app-select
                  formControlName="paymentMethod"
                  [options]="paymentOptions"
                  label="Payment Track Ingestion *"
                ></app-dev-app-select>

                <div
                  class="border-t border-[#3A506B]/20 pt-4 mt-2 space-y-2.5 select-none font-medium"
                >
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>Cart Subtotal</span>
                    <span class="font-mono text-slate-300">\${{ subtotal().toFixed(2) }}</span>
                  </div>
                  <div class="flex justify-between text-xs text-slate-400">
                    <span>Estimated Tax (Value Tracking 0%)</span>
                    <span class="font-mono text-slate-300">$0.00</span>
                  </div>
                  <div
                    class="flex justify-between text-sm border-t border-[#3A506B]/10 pt-3 text-slate-200"
                  >
                    <span class="font-bold">Total Amount Due</span>
                    <span class="font-mono font-black text-blue-400 text-base"
                      >\${{ subtotal().toFixed(2) }}</span
                    >
                  </div>
                </div>
              </div>

              <div card-footer class="w-full pt-2">
                <app-app-dev-btn
                  variant="primary"
                  size="lg"
                  class="w-full"
                  [disabled]="cart().length === 0 || checkoutForm.invalid || isProcessing()"
                  [loading]="isProcessing()"
                  type="submit"
                  (click)="processCheckout()"
                >
                  <i class="fas fa-cash-register text-xs mr-2"></i> Execute Settlement
                </app-app-dev-btn>
              </div>
            </app-dev-app-card>
          </div>
        </div>
      </div>
    </app-dashboard>
  `,
})
export class Pos {
  private readonly fb = inject(FormBuilder);

  readonly cart = signal<CartItem[]>([
    {
      skuId: 'SHIRT-L-BLK',
      name: 'Classic Linen Shirt',
      variantInfo: 'L / Black',
      unitPrice: 45.0,
      quantity: 2,
    },
    {
      skuId: 'TROUSER-M-GRN',
      name: 'Slim Chino Trousers',
      variantInfo: 'M / Olive Green',
      unitPrice: 65.0,
      quantity: 1,
    },
  ]);
  readonly isProcessing = signal<boolean>(false);

  readonly checkoutForm = this.fb.group({
    customerQuery: [''],
    paymentMethod: ['CASH', Validators.required],
  });

  readonly paymentOptions: DevAppSelectOption[] = [
    { value: 'CASH', label: 'Cash Settlement' },
    { value: 'MOBILE_MONEY', label: 'Mobile Money Ingestion' },
    { value: 'CARD', label: 'Credit/Debit Processing Track' },
  ];

  // Action Menu definitions for the table row dropdown
  readonly rowActions: DevAppMenuItem[] = [
    { id: 'add_one', label: 'Add 1 Quantity', icon: 'fas fa-plus' },
    { id: 'sub_one', label: 'Subtract 1 Quantity', icon: 'fas fa-minus' },
    { id: 'remove', label: 'Delete Item', icon: 'fas fa-trash-alt', variant: 'danger' },
  ];

  readonly subtotal = computed(() => {
    return this.cart().reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  });

  // Handle centralized actions triggered by our DevAppActionMenu component
  onMenuAction(event: { itemId: string; context: any }): void {
    const targetItem = event.context as CartItem;
    if (!targetItem) return;

    switch (event.itemId) {
      case 'add_one':
        this.updateQty(targetItem.skuId, 1);
        break;
      case 'sub_one':
        this.updateQty(targetItem.skuId, -1);
        break;
      case 'remove':
        this.removeItem(targetItem.skuId);
        break;
    }
  }

  updateQty(skuId: string, change: number): void {
    this.cart.update((current) => {
      return current.map((item) => {
        if (item.skuId === skuId) {
          const newQty = item.quantity + change;
          return { ...item, quantity: newQty > 0 ? newQty : 1 };
        }
        return item;
      });
    });
  }

  removeItem(skuId: string): void {
    this.cart.update((current) => current.filter((item) => item.skuId !== skuId));
  }

  clearCart(): void {
    this.cart.set([]);
  }

  simulateBarcodeScan(skuId: string): void {
    const existing = this.cart().find((i) => i.skuId === skuId);
    if (existing) {
      this.updateQty(skuId, 1);
    } else {
      const mockItem: CartItem =
        skuId === 'SHIRT-L-BLK'
          ? {
              skuId,
              name: 'Classic Linen Shirt',
              variantInfo: 'L / Black',
              unitPrice: 45.0,
              quantity: 1,
            }
          : {
              skuId,
              name: 'Slim Chino Trousers',
              variantInfo: 'M / Olive Green',
              unitPrice: 65.0,
              quantity: 1,
            };

      this.cart.update((current) => [...current, mockItem]);
    }
  }

  processCheckout(): void {
    if (this.checkoutForm.invalid || this.cart().length === 0) return;

    this.isProcessing.set(true);

    setTimeout(() => {
      console.log('Dispatched POS payload to server pipeline:', {
        items: this.cart(),
        meta: this.checkoutForm.value,
        totalPayable: this.subtotal(),
      });

      this.isProcessing.set(false);
      this.clearCart();
      this.checkoutForm.patchValue({ customerQuery: '', paymentMethod: 'CASH' });
    }, 1500);
  }
}
