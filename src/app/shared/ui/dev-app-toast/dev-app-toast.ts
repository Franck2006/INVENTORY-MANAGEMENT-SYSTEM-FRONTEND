import { CommonModule } from '@angular/common';
import { Component, computed, input, OnInit, output } from '@angular/core';

export type DevAppToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastModel {
  id: string;
  type: DevAppToastType;
  title?: string; // Made optional
  message: string;
  duration?: number; // Optional: time in ms before auto-dismiss
}

@Component({
  selector: 'app-dev-app-toast', // Renamed selector to avoid conflict and clarify purpose
  standalone: true,
  imports: [CommonModule], // CommonModule is needed for @if
  template: `
    <div
      [class]="toastClasses()"
      class="flex items-start gap-3.5 p-4 rounded-xl border bg-[#1C2541] shadow-2xl max-w-sm w-full select-none pointer-events-auto animate-slide-in"
      role="alert"
    >
      <div [class]="iconColorClass()" class="text-sm mt-0.5 shrink-0">
        <i [class]="iconClass()"></i>
      </div>

      <div class="flex-1 space-y-0.5">
        @if (title()) {
          <h4 class="text-xs font-bold text-slate-100 tracking-wide">
            {{ title() }}
          </h4>
        }
        <p class="text-xs text-slate-300 leading-relaxed">
          {{ message() }}
        </p>
      </div>

      <button
        type="button"
        (click)="dismiss()"
        class="text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer shrink-0"
      >
        <i class="fas fa-times text-[10px]"></i>
      </button>
    </div>
  `,
  styles: [
    `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(1rem) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      .animate-slide-in {
        animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `,
  ],
})
export class DevAppToast implements OnInit {
  // Renamed class
  readonly id = input.required<string>();
  readonly type = input<DevAppToastType>('info');
  readonly title = input<string | null>(null);
  readonly message = input.required<string>();
  readonly duration = input<number>(4000); // Auto-dismiss after 4 seconds

  readonly close = output<string>(); // Emits toast ID back to global manager channel

  ngOnInit(): void {
    if (this.duration() > 0) {
      setTimeout(() => this.dismiss(), this.duration());
    }
  }

  dismiss(): void {
    this.close.emit(this.id());
  }

  readonly toastClasses = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'border-emerald-500/20 shadow-emerald-950/10';
      case 'error':
        return 'border-red-500/20 shadow-red-950/10';
      case 'warning':
        return 'border-amber-500/20 shadow-amber-950/10';
      case 'info':
      default:
        return 'border-[#3A506B]/20 shadow-slate-950/10';
    }
  });

  readonly iconClass = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
      default:
        return 'fas fa-info-circle';
    }
  });

  readonly iconColorClass = computed(() => {
    switch (this.type()) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-amber-400';
      case 'info':
      default:
        return 'text-blue-400';
    }
  });
}
