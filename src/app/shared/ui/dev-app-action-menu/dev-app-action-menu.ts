import { Component, ElementRef, HostListener, input, output, signal, OnInit, OnDestroy } from '@angular/core';

export interface DevAppMenuItem {
  id: string;
  label: string;
  icon?: string; // FontAwesome class string
  variant?: 'default' | 'danger';
}

@Component({
  selector: 'app-dev-app-action-menu',
  imports: [],
  template: `
    <div class="relative inline-block text-left relative-menu-container">
      <button
        type="button"
        (click)="toggleMenu($event)"
        class="flex items-center justify-center w-8 h-8 rounded-lg border border-[#3A506B]/20 bg-[#1C2541]/40 text-slate-400 hover:text-slate-100 hover:bg-[#222E50] hover:border-[#3A506B]/40 transition-all duration-150 cursor-pointer focus:outline-none"
        aria-haspopup="true"
        [aria-expanded]="isOpen()"
      >
        <i class="fas fa-ellipsis-v text-xs"></i>
      </button>

      @if (isOpen()) {
        <div
          class="fixed w-44 rounded-xl border border-[#3A506B]/25 bg-[#0B132B] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] z-[9999] py-1.5 focus:outline-none animate-fade-in"
          [style.top.px]="menuPosition().top"
          [style.left.px]="menuPosition().left"
          role="menu"
        >
          @for (item of items(); track item.id) {
            <button
              type="button"
              (click)="handleActionClick(item, $event)"
              class="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors duration-150 text-left cursor-pointer focus:outline-none"
              [class]="
                item.variant === 'danger'
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-slate-300 hover:bg-[#222E50]/60 hover:text-slate-100'
              "
              role="menuitem"
            >
              @if (item.icon) {
                <i [class]="item.icon" class="w-4 text-center text-[11px] opacity-80"></i>
              }
              <span>{{ item.label }}</span>
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
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      .animate-fade-in {
        animation: fadeIn 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
    `,
  ],
})
export class DevAppActionMenu implements OnInit, OnDestroy {
  readonly items = input.required<DevAppMenuItem[]>();
  readonly actionTriggered = output<{ itemId: string; context: any }>();

  // Optional context context (e.g., passing down the active table row entity data)
  readonly rowContext = input<any>(null);

  readonly isOpen = signal<boolean>(false);
  readonly menuPosition = signal<{ top: number; left: number }>({ top: 0, left: 0 });

  private scrollListener = () => {
    if (this.isOpen()) {
      this.isOpen.set(false);
    }
  };

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    window.addEventListener('scroll', this.scrollListener, true);
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollListener, true);
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    
    if (!this.isOpen()) {
      const button = event.currentTarget as HTMLElement;
      const rect = button.getBoundingClientRect();
      const menuWidth = 176; // w-44 is 11rem = 176px
      
      let top = rect.bottom + 6;
      let left = rect.right - menuWidth;
      
      // Prevent menu from overflowing bottom of window
      const estimatedMenuHeight = this.items().length * 36 + 16; // 36px per item + py-1.5 padding approx
      if (top + estimatedMenuHeight > window.innerHeight) {
        top = rect.top - estimatedMenuHeight - 6;
      }

      this.menuPosition.set({ top, left });
      this.isOpen.set(true);
    } else {
      this.isOpen.set(false);
    }
  }

  handleActionClick(item: DevAppMenuItem, event: Event): void {
    event.stopPropagation();
    this.actionTriggered.emit({ itemId: item.id, context: this.rowContext() });
    this.isOpen.set(false); // Close dropdown on execution completion
  }

  // Closes the open menu channel instantly if user clicks outside of the element
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    // If the click is inside the host element (like the toggle button or the menu itself), we don't close here
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
    }
  }
}
