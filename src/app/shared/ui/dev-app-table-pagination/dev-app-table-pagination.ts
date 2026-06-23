import { Component, computed, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DevAppSelect, DevAppSelectOption } from '../dev-app-select/dev-app-select';

@Component({
  selector: 'app-dev-app-table-pagination',
  imports: [ReactiveFormsModule, DevAppSelect],
  template: `
    <div
      class="w-full flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-[#1C2541]/40 border border-[#3A506B]/20 rounded-xl select-none"
    >
      <div
        class="flex items-center flex-wrap gap-4 text-xs font-medium text-slate-400 w-full sm:w-auto justify-between sm:justify-start"
      >
        <div class="flex items-center gap-2 min-w-[110px]">
          <span class="shrink-0 text-slate-400">Show</span>
          <app-dev-app-select
            [formControl]="sizeControl"
            [options]="pageSizeOptions"
            label="Size"
            class="w-20"
          />
        </div>

        <div class="whitespace-nowrap">
          Showing
          <span class="text-slate-200 font-semibold">{{ rangeStart() }}</span>
          to
          <span class="text-slate-200 font-semibold">{{ rangeEnd() }}</span>
          of
          <span class="text-slate-200 font-semibold">{{ totalItems() }}</span> entries
        </div>
      </div>

      <div class="flex items-center gap-1.5 justify-center w-full sm:w-auto">
        <button
          type="button"
          (click)="setPage(1)"
          [disabled]="currentPage() === 1"
          class="flex items-center justify-center w-8 h-8 rounded-lg border border-[#3A506B]/30 bg-[#1C2541] text-slate-400 hover:text-slate-100 hover:bg-[#222E50] disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11 19l-7-7 7-7M17 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          (click)="setPage(currentPage() - 1)"
          [disabled]="currentPage() === 1"
          class="flex items-center justify-center w-8 h-8 rounded-lg border border-[#3A506B]/30 bg-[#1C2541] text-slate-400 hover:text-slate-100 hover:bg-[#222E50] disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        @for (p of visiblePages(); track p) {
          <button
            type="button"
            (click)="setPage(p)"
            class="w-8 h-8 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer"
            [class]="
              p === currentPage()
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : 'border-[#3A506B]/30 bg-[#1C2541] text-slate-300 hover:text-slate-100 hover:bg-[#222E50]'
            "
          >
            {{ p }}
          </button>
        }

        <button
          type="button"
          (click)="setPage(currentPage() + 1)"
          [disabled]="currentPage() === totalPages()"
          class="flex items-center justify-center w-8 h-8 rounded-lg border border-[#3A506B]/30 bg-[#1C2541] text-slate-400 hover:text-slate-100 hover:bg-[#222E50] disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          type="button"
          (click)="setPage(totalPages())"
          [disabled]="currentPage() === totalPages()"
          class="flex items-center justify-center w-8 h-8 rounded-lg border border-[#3A506B]/30 bg-[#1C2541] text-slate-400 hover:text-slate-100 hover:bg-[#222E50] disabled:opacity-30 disabled:pointer-events-none transition-colors duration-150 cursor-pointer"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 5l7 7-7 7M7 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class DevAppTablePagination {
  readonly totalItems = input.required<number>();
  readonly pageSize = input<number>(10);
  readonly currentPage = input<number>(1);

  // Separate tracking output emitters
  readonly pageChange = output<number>();
  readonly pageSizeChange = output<number>(); // Emits back new rows target scale

  // Internal selector data source matching our specific mapping layout rules
  readonly pageSizeOptions: DevAppSelectOption[] = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
  ];

  // Self-contained component form control linked cleanly with our Custom Select component
  readonly sizeControl = new FormControl(this.pageSize());

  constructor() {
    // Listen for dropdown selection changes and bubble them up to the parent wrapper
    this.sizeControl.valueChanges.subscribe((val) => {
      if (val) this.pageSizeChange.emit(val);
    });
  }

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalItems() / this.pageSize())));
  readonly rangeStart = computed(() =>
    this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1,
  );
  readonly rangeEnd = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems()),
  );

  readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const maxVisible = 3;

    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  });

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
