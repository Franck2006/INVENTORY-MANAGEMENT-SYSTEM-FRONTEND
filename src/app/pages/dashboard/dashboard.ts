import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { DevAppQuickStatRow } from '../../shared/ui/dev-app-quick-stat-row/dev-app-quick-stat-row';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';

import { SalesOverviewChart, SalesDataPoint } from '../../features/charts/sales-chart';
import { StockStatusChart, StockStatusData } from '../../features/charts/stock-status-chart';
import { TopProductsList, TopProduct } from '../../features/charts/top-products-list';

interface LowStockItem {
  sku: string;
  productName: string;
  size: string;
  color: string;
  currentStock: number;
  threshold: number;
  locationName: string;
}

interface RecentActivity {
  id: string;
  time: string;
  description: string;
  type: 'sale' | 'restock' | 'damaged';
  amount?: string;
}

@Component({
  selector: 'app-main-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    DevAppQuickStatRow, 
    DevAppCard, 
    DevAppBadge, 
    Dashboard,
    SalesOverviewChart,
    StockStatusChart,
    TopProductsList
  ],
  template: `
    <app-dashboard>
      <div class="space-y-6 pt-4 pb-8 px-6 bg-[#0B132B] min-h-screen text-slate-100">
        <div class="flex flex-col gap-1 select-none">
          <h1 class="text-xl font-bold tracking-tight text-white">Operational Dashboard</h1>
          <p class="text-xs text-slate-400">
            Real-time status overview of multi-location retail and stock channels.
          </p>
        </div>

        <app-dev-app-quick-stat-row [statsData]="kpiMetrics()" />

        <!-- ROW 1: Trends & Distribution -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <app-sales-overview-chart [data]="salesData()"></app-sales-overview-chart>
          </div>
          <div class="lg:col-span-1">
            <div class="h-full flex flex-col space-y-6">
              <app-stock-status-chart [data]="stockStatusData()"></app-stock-status-chart>
            </div>
          </div>
        </div>

        <!-- ROW 2: Alerts & Top Products -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2 space-y-6">
            <app-dev-app-card
              cardTitle="Low Stock Radar Alerts"
              cardSubtitle="Active variants falling below safety thresholds"
            >
              <div class="w-full overflow-x-auto overflow-y-visible custom-scrollbar">
                <table class="w-full border-collapse text-left text-xs text-slate-300">
                  <thead
                    class="bg-[#0B132B] text-slate-400 font-semibold border-b border-[#3A506B]/20"
                  >
                    <tr>
                      <th class="px-4 py-3">Variant SKU</th>
                      <th class="px-4 py-3">Product Title</th>
                      <th class="px-4 py-3">Location</th>
                      <th class="px-4 py-3 text-center">In Stock</th>
                      <th class="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#3A506B]/10">
                    @for (item of lowStockAlerts(); track item.sku) {
                      <tr class="hover:bg-[#222E50]/20 transition-colors">
                        <td class="px-4 py-3.5 font-mono text-blue-400 font-medium">
                          {{ item.sku }}
                        </td>
                        <td class="px-4 py-3.5">
                          <div class="flex flex-col">
                            <span class="font-semibold text-slate-200">{{ item.productName }}</span>
                            <span class="text-[10px] text-slate-400"
                              >Size: {{ item.size }} | Color: {{ item.color }}</span
                            >
                          </div>
                        </td>
                        <td class="px-4 py-3.5 text-slate-300">{{ item.locationName }}</td>
                        <td class="px-4 py-3.5 text-center font-bold text-red-400">
                          {{ item.currentStock }}
                          <span class="text-slate-500 font-normal">/ {{ item.threshold }}</span>
                        </td>
                        <td class="px-4 py-3.5 text-right overflow-visible">
                          <app-dev-app-badge
                            label="Critical"
                            variant="danger"
                            icon="fas fa-exclamation-triangle"
                          />
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="px-4 py-8 text-center text-slate-500 font-medium">
                          All clothing variant counts currently clear of critical risk parameters.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </app-dev-app-card>

            <app-dev-app-card
              cardTitle="Live Transaction Log"
              cardSubtitle="Recent multi-store audit events"
            >
              <div class="space-y-4 pt-2 pb-2">
                @for (activity of recentActivities(); track activity.id) {
                  <div
                    class="flex items-start gap-3 p-2.5 rounded-xl bg-[#1C2541]/20 border border-[#3A506B]/10 hover:border-[#3A506B]/30 transition-all"
                  >
                    <div
                      [class]="getActivityIconClass(activity.type)"
                      class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[10px]"
                    >
                      <i
                        [class]="
                          activity.type === 'sale'
                            ? 'fas fa-shopping-cart'
                            : activity.type === 'restock'
                              ? 'fas fa-boxes'
                              : 'fas fa-heart-broken'
                        "
                      ></i>
                    </div>
                    <div class="flex-1 min-w-0 space-y-0.5">
                      <p class="text-xs font-medium text-slate-200 truncate leading-snug">
                        {{ activity.description }}
                      </p>
                      <span class="text-[10px] text-slate-500 font-mono">{{ activity.time }}</span>
                    </div>
                    @if (activity.amount) {
                      <span
                        class="text-xs font-bold text-emerald-400 whitespace-nowrap self-center"
                        >{{ activity.amount }}</span
                      >
                    }
                  </div>
                }
              </div>
            </app-dev-app-card>
          </div>

          <div class="lg:col-span-1 space-y-6">
            <app-top-products-list [data]="topProductsData()"></app-top-products-list>
          </div>
        </div>
      </div>
    </app-dashboard>
  `,
})
export class MainDashboard {
  // Chart Data Mock Signals mapped to Prisma Schema (Order totals per day)
  readonly salesData = signal<SalesDataPoint[]>([
    { label: 'Mon', amount: 840.50 },
    { label: 'Tue', amount: 1102.20 },
    { label: 'Wed', amount: 935.00 },
    { label: 'Thu', amount: 1450.75 },
    { label: 'Fri', amount: 2100.00 },
    { label: 'Sat', amount: 2855.50 },
    { label: 'Sun', amount: 1980.25 },
  ]);

  // Chart Data Mock Signals mapped to InventoryLevels vs lowStockThresholds
  readonly stockStatusData = signal<StockStatusData>({
    healthy: 1240,
    lowStock: 45,
    outOfStock: 12
  });

  // Chart Data Mock Signals mapped to OrderItems + ProductVariants
  readonly topProductsData = signal<TopProduct[]>([
    { name: 'Classic Linen Shirt', variantSku: 'LNN-SHT-WHT-L', quantitySold: 145, totalRevenue: 6525.00 },
    { name: 'Slim Chino Trousers', variantSku: 'CHN-TRSR-NVY-S', quantitySold: 98, totalRevenue: 5390.00 },
    { name: 'Essential Cotton Tee', variantSku: 'TEE-BLK-M', quantitySold: 210, totalRevenue: 4200.00 },
    { name: 'Denim Jacket', variantSku: 'DNM-JKT-BLU-L', quantitySold: 42, totalRevenue: 3570.00 },
    { name: 'Leather Loafers', variantSku: 'LFR-BRN-42', quantitySold: 28, totalRevenue: 2380.00 },
  ]);

  readonly lowStockAlerts = signal<LowStockItem[]>([
    {
      sku: 'LNN-SHT-WHT-M',
      productName: 'Classic Linen Shirt',
      size: 'M',
      color: 'White',
      currentStock: 2,
      threshold: 5,
      locationName: 'Main Boutique',
    },
    {
      sku: 'CHN-TRSR-NVY-S',
      productName: 'Slim Chino Trousers',
      size: 'S',
      color: 'Deep Navy',
      currentStock: 1,
      threshold: 6,
      locationName: 'Warehouse A',
    },
    {
      sku: 'OVR-COAT-SLT-XL',
      productName: 'Winter Overcoat',
      size: 'XL',
      color: 'Slate',
      currentStock: 0,
      threshold: 3,
      locationName: 'Main Boutique',
    },
  ]);

  readonly recentActivities = signal<RecentActivity[]>([
    {
      id: 'act-1',
      time: '10 mins ago',
      description: 'Sold 2x Slim Chinos (Deep Navy - S)',
      type: 'sale',
      amount: '+$78.00',
    },
    {
      id: 'act-2',
      time: '24 mins ago',
      description: 'Restocked 50x Linen Shirts via PO #104',
      type: 'restock',
    },
    {
      id: 'act-3',
      time: '1 hr ago',
      description: 'Logged 1x Damaged Item (Linen Shirt - White - M)',
      type: 'damaged',
    },
    {
      id: 'act-4',
      time: '3 hrs ago',
      description: 'Cash Checkout Order #4092 completed',
      type: 'sale',
      amount: '+$145.50',
    },
  ]);

  // Derived metric mappings passed directly into dev-app-quick-stat-row primitives
  readonly kpiMetrics = computed(() => [
    {
      label: 'Total Revenue Today',
      value: '$2,855.50',
      icon: 'fas fa-dollar-sign',
      trend: '+14.2% versus yesterday',
      isTrendPositive: true,
    },
    {
      label: 'Units Currently Staged',
      value: '1,297 pcs',
      icon: 'fas fa-tshirt',
      trend: 'Across 2 open locations',
      isTrendPositive: true,
    },
    {
      label: 'Low Stock Risks',
      value: this.lowStockAlerts().length.toString(),
      icon: 'fas fa-exclamation-triangle',
      trend: 'Variants requiring replenishment POs',
      isTrendPositive: this.lowStockAlerts().length === 0,
    },
  ]);

  getActivityIconClass(type: 'sale' | 'restock' | 'damaged'): string {
    switch (type) {
      case 'sale':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'restock':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'damaged':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
    }
  }
}
