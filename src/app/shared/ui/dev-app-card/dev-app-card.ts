import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dev-app-card',
  imports: [],
  standalone: true,
  host: { class: 'block' },
  template: `
    <div
      class="w-full flex flex-col rounded-2xl bg-[#1C2541]/40 border border-[#3A506B]/20 shadow-xl transition-all duration-200"
      [class.hover:border-[#3A506B]/40]="hoverable()"
    >
      @if (cardTitle()) {
        <div class="px-6 py-4 border-b border-[#3A506B]/15 flex items-center justify-between gap-4">
          <div>
            <h3 class="text-sm font-bold text-slate-100 tracking-wide">
              {{ cardTitle() }}
            </h3>
            @if (cardSubtitle()) {
              <p class="text-xs text-slate-400 mt-0.5">
                {{ cardSubtitle() }}
              </p>
            }
          </div>

          <div class="flex items-center gap-2">
            <ng-content select="[card-header-actions]"></ng-content>
          </div>
        </div>
      }

      <div class="p-6 flex-1">
        <ng-content></ng-content>
      </div>

      <div
        class="empty:hidden px-6 py-4 bg-[#0B132B]/30 border-t border-[#3A506B]/15 rounded-b-2xl flex items-center justify-end gap-3"
      >
        <ng-content select="[card-footer]"></ng-content>
      </div>
    </div>
  `,
})
export class DevAppCard {
  readonly cardTitle = input<string | null>(null);
  readonly cardSubtitle = input<string | null>(null);
  readonly hoverable = input<boolean>(false);
}
