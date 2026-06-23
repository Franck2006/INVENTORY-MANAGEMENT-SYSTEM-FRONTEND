import { Component, computed, forwardRef, input, model, signal } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-dev-app-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder() || ' '"
        [disabled]="isDisabled()"
        [value]="value()"
        (input)="onInputChange($event)"
        (blur)="onInputBlur()"
        [class]="classes()"
      />

      <label
        [for]="id()"
        class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-400/80 transition-all duration-200 
               peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
               peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-blue-500
               [:not(:placeholder-shown)]:top-2.5 [:not(:placeholder-shown)]:text-xs [:not(:placeholder-shown)]:text-slate-400"
      >
        {{ label() }}
      </label>

      @if (errorText()) {
        <p class="mt-1.5 text-xs font-medium text-red-400 animate-fade-in pl-1">
          {{ errorText() }}
        </p>
      } @else if (hintText()) {
        <p class="mt-1.5 text-xs text-slate-500 pl-1">
          {{ hintText() }}
        </p>
      }
    </div>
  `,
  styles: [
    `
      input:focus ~ label,
      input:not(:placeholder-shown) ~ label {
        top: 0.65rem !important;
        font-size: 0.75rem !important;
        transform: translateY(0) !important;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DevAppInput),
      multi: true,
    },
  ],
})
export class DevAppInput implements ControlValueAccessor {
  // Configuration inputs using signal APIs
  readonly id = input<string>('input-' + Math.random().toString(36).substring(2, 9));
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'password' | 'number'>('text');
  readonly errorText = input<string | null>(null);
  readonly hintText = input<string | null>(null);

  // Internal state tracking for ControlValueAccessor
  readonly value = signal<string>('');
  readonly isDisabled = signal<boolean>(false);

  // ControlValueAccessor Callbacks
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  readonly classes = computed(() => {
    const hasError = !!this.errorText();

    const base =
      'peer w-full h-12 pt-4 pb-1.5 px-4 rounded-xl font-medium text-sm text-slate-100 bg-[#1C2541] border transition-all duration-200 outline-none focus:ring-2 disabled:pointer-events-none disabled:opacity-40 placeholder-transparent';

    const statusBorders = hasError
      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
      : 'border-[#3A506B]/40 focus:border-blue-500 focus:ring-blue-500/20';

    return [base, statusBorders].join(' ');
  });

  // Handle value updates from the template input element
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  onInputBlur(): void {
    this.onTouched();
  }

  // Angular lifecycle control values writes
  writeValue(val: string): void {
    this.value.set(val || '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
