import { CommonModule } from '@angular/common';
import { Component, contentChild, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dev-app-quick-stat-row',
  imports: [CommonModule],
  host: { class: 'block' },
  template: `
    <div class="w-full grid gap-4 sm:grid-cols-2 lg:grid-cols-4 select-none">
      @for (item of statsData(); track item; let idx = $index) {
        <div
          class="p-5 rounded-2xl bg-[#1C2541]/40 border border-[#3A506B]/20 shadow-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all duration-200"
        >
          @if (cardTemplate()) {
            <ng-container
              *ngTemplateOutlet="cardTemplate(); context: { $implicit: item, index: idx }"
            />
          } @else {
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                {{ item.title }}
              </span>
              @if (item.icon) {
                <i
                  [class]="item.icon"
                  class="text-base text-slate-400 group-hover:text-blue-400 transition-colors duration-150"
                ></i>
              }
            </div>

            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-bold text-slate-100 tracking-tight">
                {{ item.value }}
              </span>
              @if (item.change) {
                <span
                  class="text-xs font-semibold"
                  [class]="item.isPositive ? 'text-emerald-400' : 'text-red-400'"
                >
                  {{ item.isPositive ? '↑' : '↓' }} {{ item.change }}
                </span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class DevAppQuickStatRow {
  // Input parameters arrays fed via signal parameters
  readonly statsData = input.required<any[]>();

  // Optional custom inner template block grabber
  readonly cardTemplate = contentChild<TemplateRef<any>>(TemplateRef);
}
