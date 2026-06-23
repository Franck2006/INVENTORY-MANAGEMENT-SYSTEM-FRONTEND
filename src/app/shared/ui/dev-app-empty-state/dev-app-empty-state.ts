import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dev-app-empty-state',
  imports: [],
  template: `
    <div
      class="w-full flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[#3A506B]/25 bg-[#1C2541]/10 select-none animate-fade-in"
    >
      @if (iconClass()) {
        <div
          class="mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1C2541]/60 border border-[#3A506B]/20 text-slate-400"
        >
          <i [class]="iconClass()" class="text-xl"></i>
        </div>
      }

      <h3 class="text-base font-bold text-slate-200 tracking-wide">
        {{ title() }}
      </h3>

      @if (description()) {
        <p class="mt-1.5 text-xs text-slate-400 max-w-sm leading-relaxed">
          {{ description() }}
        </p>
      }

      <div class="mt-6 empty:hidden">
        <ng-content></ng-content>
      </div>
    </div>
  `,
})
export class DevAppEmptyState {
  readonly title = input<string>('No records found');
  readonly description = input<string | null>(null);
  readonly iconClass = input<string>('fas fa-folder-open'); // Fallback FontAwesome icon class string
}
