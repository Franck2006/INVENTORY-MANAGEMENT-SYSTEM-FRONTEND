import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dev-app-skeleton',
  standalone: true,
  imports: [],
  template: `
    <div
      [class]="skeletonClasses()"
      class="animate-pulse bg-[#222E50]/40 border border-[#3A506B]/10"
    ></div>
  `,
  styles: [
    `
      @keyframes pulse {
        0%,
        100% {
          opacity: 0.6;
        }
        50% {
          opacity: 0.3;
        }
      }
      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }
    `,
  ],
})
export class DevAppSkeleton {
  // Shape configurations: lines, circle (avatars), or block/card layouts
  readonly variant = input<'line' | 'text' | 'circle' | 'block'>('line');

  // Custom height/width overrides if explicit dimensions are needed
  readonly width = input<string | null>(null);
  readonly height = input<string | null>(null);

  readonly skeletonClasses = computed(() => {
    const classes: string[] = [];

    // Apply geometry based on variants
    switch (this.variant()) {
      case 'circle':
        classes.push('rounded-full shrink-0');
        break;
      case 'text':
        classes.push('rounded-md h-3 w-3/4 my-1.5');
        break;
      case 'block':
        classes.push('rounded-2xl w-full h-32');
        break;
      case 'line':
      default:
        classes.push('rounded-lg h-4 w-full');
        break;
    }

    // Apply layout dimension overrides if signals are explicitly provided
    if (this.width()) classes.push(`!w-[${this.width()}]`);
    if (this.height()) classes.push(`!h-[${this.height()}]`);

    return classes.join(' ');
  });
}
