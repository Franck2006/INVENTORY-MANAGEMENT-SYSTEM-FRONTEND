import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-dev-app-switch',
  standalone: true,
  imports: [],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DevAppSwitch),
      multi: true,
    },
  ],
  template: `
    <label
      [id]="id() + '-label'"
      class="flex items-center gap-3 cursor-pointer select-none"
      [class.opacity-40]="isDisabled()"
      style="display: inline-flex !important; align-items: center !important; position: relative;"
    >
      <input
        type="checkbox"
        [id]="id()"
        [checked]="checked()"
        [disabled]="isDisabled()"
        (change)="onToggleChange($event)"
        (blur)="onInputBlur()"
        class="absolute opacity-0 pointer-events-none w-0 h-0 m-0 p-0"
        style="position: absolute !important; width: 0 !important; height: 0 !important; opacity: 0 !important;"
      />

      <div
        class="relative rounded-full transition-colors duration-200 shrink-0 border"
        [class]="trackClasses()"
        style="width: 44px !important; height: 24px !important; position: relative !important; display: block !important;"
      >
        <div
          class="absolute bg-white rounded-full shadow transition-transform duration-200"
          [class.translate-x-[20px]]="checked()"
          style="width: 18px !important; height: 18px !important; top: 2px !important; left: 2px !important; position: absolute !important;"
        ></div>
      </div>

      @if (label()) {
        <span class="text-sm font-medium text-slate-200" style="display: inline-block !important;">
          {{ label() }}
        </span>
      }
    </label>
  `,
})
export class DevAppSwitch implements ControlValueAccessor {
  readonly id = input<string>('switch-' + Math.random().toString(36).substring(2, 9));
  readonly label = input<string | null>(null);

  // Core functional reactive signals
  readonly checked = signal<boolean>(false);
  readonly isDisabled = signal<boolean>(false);

  onChange: (value: boolean) => void = () => {};
  onTouched: () => void = () => {};

  readonly trackClasses = computed(() => {
    // Dynamic theme colors matching your deep navy / premium slate dashboard aesthetic
    return this.checked() ? 'bg-blue-600 border-blue-600' : 'bg-[#222E50] border-[#3A506B]/35';
  });

  onToggleChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.checked.set(inputElement.checked);
    this.onChange(inputElement.checked);
  }

  onInputBlur(): void {
    this.onTouched();
  }

  writeValue(val: boolean): void {
    this.checked.set(!!val);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
