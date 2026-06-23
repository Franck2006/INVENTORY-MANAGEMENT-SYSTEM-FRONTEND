import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';

export interface SelectInputOption {
  id: string;
  label: string;
  sublabel?: string;
}

@Component({
  selector: 'app-dev-app-select-input',
  standalone: true,
  imports: [],
  template: `
    <div class="w-full flex flex-col gap-1.5 text-left select-none relative">
      @if (label()) {
        <label [for]="id()" class="text-xs font-semibold text-slate-300 tracking-wide">
          {{ label() }}
        </label>
      }

      <div class="relative w-full flex items-center">
        @if (prefixIcon()) {
          <div
            class="absolute left-3.5 text-slate-500 pointer-events-none flex items-center justify-center text-xs"
          >
            <i [class]="prefixIcon()"></i>
          </div>
        }

        <input
          [id]="id()"
          type="text"
          [placeholder]="placeholder()"
          [value]="searchQuery()"
          (input)="handleInput($event)"
          (focus)="isOpen.set(true)"
          (keydown)="handleKeyDown($event)"
          [class]="prefixIcon() ? 'pl-10' : 'px-4'"
          class="w-full text-xs font-medium h-10 bg-[#1C2541]/40 border border-[#3A506B]/20 rounded-xl text-slate-200 placeholder-slate-500 transition-all focus:outline-none focus:border-blue-500/60 focus:bg-[#1C2541]/70"
          autocomplete="off"
        />

        <div
          class="absolute right-3.5 text-slate-500 pointer-events-none transition-transform duration-150 text-[10px]"
          [class.rotate-180]="isOpen()"
        >
          <i class="fas fa-chevron-down"></i>
        </div>
      </div>

      @if (isOpen() && filteredOptions().length > 0) {
        <div
          class="absolute left-0 top-[calc(100%+4px)] w-full rounded-xl border border-[#3A506B]/25 bg-[#0B132B] shadow-2xl z-50 py-1.5 max-h-52 overflow-y-auto custom-scrollbar animate-fade-in"
        >
          @for (option of filteredOptions(); track option.id; let idx = $index) {
            <button
              type="button"
              (click)="selectOption(option)"
              [class.bg-[#222E50]/60]="idx === activeIndex()"
              class="w-full flex flex-col px-4 py-2 text-left cursor-pointer transition-colors duration-150 group focus:outline-none"
            >
              <span class="text-xs font-semibold text-slate-200 group-hover:text-white">
                {{ option.label }}
              </span>
              @if (option.sublabel) {
                <span class="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5">
                  {{ option.sublabel }}
                </span>
              }
            </button>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.12s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
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
export class DevAppSelectInput {
  readonly id = input<string>(`select-input-${Math.random().toString(36).substr(2, 4)}`);
  readonly label = input<string | null>(null);
  readonly placeholder = input<string>('Type to search suggestions...');
  readonly prefixIcon = input<string | null>(null);
  readonly options = input.required<SelectInputOption[]>();

  readonly optionSelected = output<SelectInputOption>();

  readonly searchQuery = signal<string>('');
  readonly isOpen = signal<boolean>(false);
  readonly activeIndex = signal<number>(-1); // Tracks keyboard navigation highlight position

  constructor(private elementRef: ElementRef) {}

  // Filter list matching characters in real-time
  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.options();
    return this.options().filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) || opt.sublabel?.toLowerCase().includes(query),
    );
  });

  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.activeIndex.set(-1); // Reset highlight indexing pointer
    this.isOpen.set(true);
  }

  selectOption(option: SelectInputOption): void {
    this.searchQuery.set(option.label);
    this.optionSelected.emit(option);
    this.isOpen.set(false);
  }

  // Complete accessibility mapping overrides
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      if (event.key === 'ArrowDown') this.isOpen.set(true);
      return;
    }

    const maxIndices = this.filteredOptions().length - 1;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex.set(this.activeIndex() >= maxIndices ? 0 : this.activeIndex() + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex.set(this.activeIndex() <= 0 ? maxIndices : this.activeIndex() - 1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.activeIndex() >= 0 && this.activeIndex() <= maxIndices) {
          this.selectOption(this.filteredOptions()[this.activeIndex()]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        break;
    }
  }

  // Dismiss overlay panel if context focus is dropped
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
