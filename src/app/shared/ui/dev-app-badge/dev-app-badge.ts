import { Component, computed, input } from '@angular/core';

export type DevAppBadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'slate';

@Component({
  selector: 'app-dev-app-badge',
  imports: [],
  template: `
    <span
      [class]="badgeClasses()"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border tracking-wide select-none transition-colors duration-150"
    >
      @if (icon()) {
        <i [class]="icon()" class="text-[10px] opacity-80"></i>
      }

      <span>
        {{ label() }}
      </span>
    </span>
  `,
})
export class DevAppBadge {
  readonly label = input.required<string>();
  readonly variant = input<DevAppBadgeVariant>('slate');
  readonly icon = input<string | null>(null);

  // Computes precise premium color matching rules for our system dashboard themes
  readonly badgeClasses = computed(() => {
    switch (this.variant()) {
      case 'primary':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'success':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'danger':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'slate':
      default:
        return 'bg-[#222E50]/60 text-slate-300 border-[#3A506B]/30';
    }
  });
}
