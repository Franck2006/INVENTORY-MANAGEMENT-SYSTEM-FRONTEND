import { Component, computed, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'app-dev-app-modal',
  imports: [],
  template: `
    @if (isOpen()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto select-none"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="fixed inset-0 bg-[#0B132B]/80 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
          (click)="closeModal()"
        ></div>

        <div
          [class]="sizeClasses()"
          class="relative w-full rounded-2xl bg-[#1C2541] border border-[#3A506B]/25 shadow-2xl transition-all duration-200 transform z-10 animate-scale-up flex flex-col max-h-[90vh]"
        >
          <div
            class="px-6 py-4.5 border-b border-[#3A506B]/15 flex items-center justify-between shrink-0"
          >
            <h3 class="text-sm font-bold text-slate-100 tracking-wide">
              {{ title() }}
            </h3>
            <button
              type="button"
              (click)="closeModal()"
              class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#222E50] transition-colors cursor-pointer focus:outline-none"
              aria-label="Close modal configuration"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>

          <div class="p-6 overflow-y-auto custom-scrollbar flex-1 text-sm text-slate-300">
            <ng-content></ng-content>
          </div>

          <div
            class="empty:hidden px-6 py-4 bg-[#0B132B]/20 border-t border-[#3A506B]/15 rounded-b-2xl flex items-center justify-end gap-3 shrink-0"
          >
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .animate-scale-up {
        animation: scaleUp 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      }

      .custom-scrollbar::-webkit-scrollbar {
        width: 5px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: rgba(58, 80, 107, 0.3);
        border-radius: 99px;
      }
    `,
  ],
})
export class DevAppModal {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('Modal Dialog Context');
  readonly size = input<'sm' | 'md' | 'lg'>('md');

  readonly close = output<void>();

  // Scales horizontal footprint sizes safely based on signals parameters definitions
  readonly sizeClasses = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'md':
      default:
        return 'max-w-lg';
    }
  });

  closeModal(): void {
    this.close.emit();
  }

  // Intercepts structural escape keys configurations dynamically
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen()) {
      this.closeModal();
    }
  }
}
