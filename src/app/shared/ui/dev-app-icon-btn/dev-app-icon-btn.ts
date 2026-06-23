import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dev-app-icon-btn',
  imports: [],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="classes()"
      [attr.aria-label]="ariaLabel()"
    >
      @if (loading()) {
        <svg class="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      } @else {
        <ng-content />
      }
    </button>
  `,
})
export class DevAppIconBtn {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('ghost');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly shape = input<'square' | 'circle'>('square');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'submit' | 'button'>('button');
  readonly ariaLabel = input.required<string>(); // Crucial for icon-only accessibility

  readonly classes = computed(() => {
    const s = this.size();
    const v = this.variant();
    const h = this.shape();

    const base =
      'inline-flex items-center justify-center aspect-square transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B132B] disabled:pointer-events-none disabled:opacity-40 active:scale-[0.95] active:transition-transform';

    const shapes = {
      square: 'rounded-xl',
      circle: 'rounded-full',
    }[h];

    const sizes = {
      sm: 'p-2 text-xs h-8 w-8',
      md: 'p-2.5 text-sm h-10 w-10',
      lg: 'p-3 text-base h-12 w-12',
    }[s];

    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/15',
      secondary: 'bg-[#222E50] hover:bg-[#2C3B66] text-slate-200 border border-[#3A506B]/35',
      ghost: 'border border-[#3A506B]/30 hover:bg-[#1C2541]/60 text-slate-400 hover:text-slate-100',
      danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/15',
    }[v];

    return [sizes, shapes, variants, base].join(' ');
  });
}
