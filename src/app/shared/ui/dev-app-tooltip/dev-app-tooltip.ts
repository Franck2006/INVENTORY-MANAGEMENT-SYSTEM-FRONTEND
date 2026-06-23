import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dev-app-tooltip',
  imports: [],
  template: `
    <div class="relative inline-block group/tooltip">
      <ng-content></ng-content>

      <div
        [class]="positionClasses()"
        class="absolute z-[60] scale-95 opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-hover/tooltip:pointer-events-auto transition-all duration-150 ease-out select-none"
        role="tooltip"
      >
        <div
          class="px-2.5 py-1.5 rounded-lg bg-[#0B132B] border border-[#3A506B]/40 text-[11px] font-medium text-slate-200 shadow-2xl tracking-wide whitespace-nowrap"
        >
          {{ content() }}
        </div>
      </div>
    </div>
  `,
})
export class DevAppTooltip {
  readonly content = input.required<string>();
  readonly position = input<'top' | 'bottom' | 'left' | 'right'>('top');

  readonly positionClasses = computed(() => {
    switch (this.position()) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-1.5';
      case 'left':
        return 'top-1/2 right-full -translate-y-1/2 mr-1.5';
      case 'right':
        return 'top-1/2 left-full -translate-y-1/2 ml-1.5';
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-1.5';
    }
  });
}
