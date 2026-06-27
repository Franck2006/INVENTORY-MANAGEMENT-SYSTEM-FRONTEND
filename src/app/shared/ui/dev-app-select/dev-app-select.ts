import {
  Component,
  computed,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

export interface DevAppSelectOption {
  value: any;
  label: string;
}

@Component({
  selector: 'app-dev-app-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <button
        type="button"
        [id]="id()"
        [disabled]="isDisabled()"
        (click)="toggleDropdown($event)"
        [class]="triggerClasses()"
      >
        <span [class]="selectedLabel() ? 'text-slate-100' : 'text-slate-400/80'">
          {{ selectedLabel() || label() }}
        </span>

        <svg
          class="w-4 h-4 text-slate-400 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      @if (isOpen()) {
        <div
          class="absolute left-0 right-0 mt-2 p-2 bg-[#1C2541] border border-[#3A506B]/50 rounded-xl shadow-xl z-50 animate-fade-in max-h-64 flex flex-col"
        >
          @if (withSearch()) {
            <div class="relative mb-2 shrink-0">
              <input
                type="text"
                placeholder="Search options..."
                [value]="searchQuery()"
                (input)="onSearchInput($event)"
                class="w-full h-9 pl-8 pr-3 rounded-lg bg-[#0B132B] border border-[#3A506B]/30 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500"
              />
              <svg
                class="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          }

          <div class="overflow-y-auto flex-1 space-y-0.5 custom-scrollbar">
            @for (opt of filteredOptions(); track opt.value) {
              <button
                type="button"
                (click)="selectOption(opt)"
                class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer text-left"
                [class]="
                  opt.value === value()
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-slate-300 hover:bg-[#222E50] hover:text-slate-100'
                "
              >
                <span>{{ opt.label }}</span>
                @if (opt.value === value()) {
                  <svg
                    class="w-4 h-4 text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                }
              </button>
            } @empty {
              <div class="text-center py-4 text-xs text-slate-500">No options found</div>
            }
          </div>
        </div>
      }

      @if (errorText()) {
        <p class="mt-1.5 text-xs font-medium text-red-400 pl-1">
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
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #3a506b;
        border-radius: 99px;
      }
    `,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DevAppSelect),
      multi: true,
    },
  ],
})
export class DevAppSelect implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  readonly id = input<string>('select-' + Math.random().toString(36).substring(2, 9));
  readonly label = input<string>('Select option');
  readonly options = input.required<DevAppSelectOption[]>();
  readonly withSearch = input<boolean>(false); // Conditional search input trigger
  readonly errorText = input<string | null>(null);
  readonly hintText = input<string | null>(null);

  // Component states
  readonly value = signal<any>(null);
  readonly isOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly isDisabled = signal<boolean>(false);

  onChange: (value: any) => void = () => { };
  onTouched: () => void = () => { };

  // Find label of active item
  readonly selectedLabel = computed(() => {
    return this.options().find((o) => o.value === this.value())?.label || null;
  });

  // Filter list reactively
  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query || !this.withSearch()) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(query));
  });

  readonly triggerClasses = computed(() => {
    const hasError = !!this.errorText();
    const base =
      'w-full h-12 px-4 flex items-center justify-between rounded-xl font-medium text-sm bg-[#1C2541] border text-left outline-none transition-all duration-200 focus:ring-2 disabled:pointer-events-none disabled:opacity-40 cursor-pointer';

    return hasError
      ? `${base} border-red-500/50 focus:border-red-500 focus:ring-red-500/20`
      : `${base} border-[#3A506B]/40 focus:border-blue-500 focus:ring-blue-500/20`;
  });

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.searchQuery.set('');
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (!this.isDisabled()) {
      this.isOpen.update((prev) => !prev);
      this.searchQuery.set('');
    }
  }

  selectOption(option: DevAppSelectOption): void {
    this.value.set(option.value);
    this.onChange(option.value);
    this.onTouched();
    this.isOpen.set(false);
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  writeValue(val: any): void {
    this.value.set(val ?? null);
  }
  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
