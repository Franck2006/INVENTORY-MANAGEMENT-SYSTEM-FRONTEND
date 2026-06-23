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
import { COUNTRIES } from '../../../data/phone/phone-number-code.data';

interface CountryCode {
  code: string;
  dialCode: string;
  flag: string;
  name: string;
}

@Component({
  selector: 'app-dev-app-phone-input',
  imports: [ReactiveFormsModule],
  template: `
    <div class="relative w-full">
      <div
        class="flex items-center rounded-xl bg-[#1C2541] border transition-all duration-200 focus-within:ring-2"
        [class]="containerClasses()"
      >
        <button
          type="button"
          [disabled]="isDisabled()"
          (click)="toggleDropdown($event)"
          class="flex items-center gap-1.5 h-12 pl-4 pr-3 border-r border-[#3A506B]/30 hover:bg-[#222E50]/50 transition-colors text-sm font-medium text-slate-200 cursor-pointer disabled:pointer-events-none"
        >
          <span>{{ currentFlag() }}</span>
          <span class="text-slate-300 font-semibold">{{ selectedDialCode() }}</span>
          <svg
            class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200"
            [class.rotate-180]="isDropdownOpen()"
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

        <div class="relative flex-1">
          <input
            [id]="id()"
            type="tel"
            placeholder=" "
            [disabled]="isDisabled()"
            [value]="localNumber()"
            (input)="onNumberChange($event)"
            (blur)="onInputBlur()"
            class="peer w-full h-12 pt-4 pb-1.5 px-3 rounded-r-xl font-medium text-sm text-slate-100 bg-transparent border-none outline-none focus:ring-0 placeholder-transparent disabled:pointer-events-none"
          />
          <label
            [for]="id()"
            class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-sm text-slate-400/80 transition-all duration-200 
                   peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm 
                   peer-focus:top-2.5 peer-focus:text-xs peer-focus:text-blue-500
                   [:not(:placeholder-shown)]:top-2.5 [:not(:placeholder-shown)]:text-xs [:not(:placeholder-shown)]:text-slate-400"
          >
            {{ label() }}
          </label>
        </div>
      </div>

      @if (isDropdownOpen()) {
        <div
          class="absolute left-0 right-0 mt-2 p-2 bg-[#1C2541] border border-[#3A506B]/50 rounded-xl shadow-xl z-50 animate-fade-in max-h-64 flex flex-col"
        >
          <div class="relative mb-2 shrink-0">
            <input
              type="text"
              placeholder="Search code or country..."
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

          <div class="overflow-y-auto flex-1 space-y-0.5 custom-scrollbar">
            @for (c of filteredCountries(); track c.code) {
              <button
                type="button"
                (click)="selectCountry(c)"
                class="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-300 hover:bg-[#222E50] hover:text-slate-100 rounded-lg transition-colors cursor-pointer text-left"
              >
                <div class="flex items-center gap-2">
                  <span>{{ c.flag }}</span>
                  <span class="truncate max-w-[180px]">{{ c.name }}</span>
                </div>
                <span class="text-blue-400 font-semibold shrink-0 ml-2">{{ c.dialCode }}</span>
              </button>
            } @empty {
              <div class="text-center py-4 text-xs text-slate-500">
                No country codes match your search
              </div>
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
      input:focus ~ label,
      input:not(:placeholder-shown) ~ label {
        top: 0.65rem !important;
        font-size: 0.75rem !important;
        transform: translateY(0) !important;
      }
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
      useExisting: forwardRef(() => DevAppPhoneInput),
      multi: true,
    },
  ],
})
export class DevAppPhoneInput implements ControlValueAccessor {
  private readonly elementRef = inject(ElementRef);

  readonly id = input<string>('phone-' + Math.random().toString(36).substring(2, 9));
  readonly label = input<string>('Phone Number');
  readonly errorText = input<string | null>(null);
  readonly hintText = input<string | null>(null);

  readonly countries: CountryCode[] = COUNTRIES;
  // Component states
  readonly selectedDialCode = signal<string>('+243');
  readonly localNumber = signal<string>('');
  readonly isDisabled = signal<boolean>(false);
  readonly isDropdownOpen = signal<boolean>(false);
  readonly searchQuery = signal<string>('');

  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  // Computed selector values
  readonly currentFlag = computed(() => {
    return this.countries.find((c) => c.dialCode === this.selectedDialCode())?.flag || '🌐';
  });

  readonly filteredCountries = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.countries;
    return this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.dialCode.includes(query) ||
        c.code.toLowerCase().includes(query),
    );
  });

  readonly containerClasses = computed(() => {
    const hasError = !!this.errorText();
    const disabledState = this.isDisabled() ? 'pointer-events-none opacity-40' : '';
    const statusBorders = hasError
      ? 'border-red-500/50 focus-within:border-red-500 focus-within:ring-red-500/20'
      : 'border-[#3A506B]/40 focus-within:border-blue-500 focus-within:ring-blue-500/20';

    return [statusBorders, disabledState].join(' ');
  });

  // Closes dropdown when clicking completely outside the element context
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
      this.searchQuery.set('');
    }
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    if (!this.isDisabled()) {
      this.isDropdownOpen.update((prev) => !prev);
      this.searchQuery.set('');
    }
  }

  selectCountry(country: CountryCode): void {
    this.selectedDialCode.set(country.dialCode);
    this.isDropdownOpen.set(false);
    this.searchQuery.set('');
    this.emitValue(country.dialCode, this.localNumber());
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onNumberChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.localNumber.set(target.value);
    this.emitValue(this.selectedDialCode(), target.value);
  }

  onInputBlur(): void {
    this.onTouched();
  }

  private emitValue(dial: string, num: string): void {
    const clean = num.replace(/\s+/g, '');
    this.onChange(clean ? `${dial}${clean}` : '');
  }

  writeValue(val: string): void {
    if (!val) {
      this.localNumber.set('');
      return;
    }
    const match = this.countries
      .slice()
      .sort((a, b) => b.dialCode.length - a.dialCode.length)
      .find((c) => val.startsWith(c.dialCode));

    if (match) {
      this.selectedDialCode.set(match.dialCode);
      this.localNumber.set(val.substring(match.dialCode.length));
    } else {
      this.localNumber.set(val);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
