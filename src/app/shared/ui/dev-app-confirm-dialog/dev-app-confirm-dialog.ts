import { Component, input, model, output } from '@angular/core';
import { DevAppModal } from '../dev-app-modal/dev-app-modal';

@Component({
  selector: 'app-dev-app-confirm-dialog',
  imports: [DevAppModal],
  template: `
    <app-dev-app-modal [isOpen]="isOpen()" [title]="title()" size="sm" (close)="handleCancel()">
      <div class="flex items-start gap-4 select-none">
        <div
          [class]="
            variant() === 'danger'
              ? 'bg-red-500/10 text-red-400 border-red-500/20'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
          "
          class="flex items-center justify-center w-10 h-10 rounded-xl border shrink-0 text-sm"
        >
          <i
            [class]="variant() === 'danger' ? 'fas fa-exclamation-triangle' : 'fas fa-info-circle'"
          ></i>
        </div>

        <div class="space-y-1.5 flex-1">
          <p class="text-xs text-slate-300 leading-relaxed">
            {{ message() }}
          </p>
        </div>
      </div>

      <div modal-footer>
        <button
          type="button"
          (click)="handleCancel()"
          class="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
        >
          {{ cancelLabel() }}
        </button>
        <button
          type="button"
          (click)="handleConfirm()"
          [class]="
            variant() === 'danger'
              ? 'bg-red-600 hover:bg-red-500 shadow-red-600/10'
              : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/10'
          "
          class="px-4 py-2 text-xs font-bold text-white rounded-xl transition-all shadow-lg focus:outline-none cursor-pointer"
        >
          {{ confirmLabel() }}
        </button>
      </div>
    </app-dev-app-modal>
  `,
})
export class DevAppConfirmDialog {
  readonly isOpen = input.required<boolean>();
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>(
    'Are you sure you want to proceed with this operation? This change cannot be undone.',
  );

  readonly variant = input<'primary' | 'danger'>('primary');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  handleConfirm(): void {
    this.confirm.emit();
  }

  handleCancel(): void {
    this.cancel.emit();
  }
}
