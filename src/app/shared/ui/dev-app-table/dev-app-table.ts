import { CommonModule } from '@angular/common';
import { Component, contentChild, input, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-dev-app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!--  overflow-y-visible -->
    <div
      class="w-full overflow-x-auto   overflow-y-visible   rounded-xl border border-[#3A506B]/20 bg-[#1C2541]/30 custom-scrollbar shadow-xl"
    >
      <table class="w-full border-collapse text-left text-sm text-slate-300">
        <thead
          class="bg-[#0B132B] text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-[#3A506B]/30 select-none"
        >
          <tr>
            @for (header of headers(); track header) {
              <th scope="col" class="px-6 py-4 font-semibold">
                {{ header }}
              </th>
            }
          </tr>
        </thead>

        <tbody class="divide-y divide-[#3A506B]/10 bg-transparent">
          @for (row of data(); track row.orderItemId; let lines = $index) {
            <tr
              class="transition-colors duration-150 ease-in-out"
              [class.bg-[#1C2541]/40]="lines % 2 === 0"
              [class.bg-[#222E50]/30]="lines % 2 !== 0"
              [class.hover:bg-[#222E50]/60]="true"
            >
              @if (rowTemplate()) {
                <ng-container
                  *ngTemplateOutlet="rowTemplate(); context: { $implicit: row, index: lines }"
                />
              } @else {
                @for (header of headers(); track header) {
                  <td class="px-6 py-4 whitespace-nowrap text-slate-300">
                    {{ row[header.toLowerCase()] }}
                  </td>
                }
              }
            </tr>
          } @empty {
            <tr class="bg-[#1C2541]/40">
              <td
                [attr.colspan]="headers().length"
                class="px-6 py-12 text-center text-slate-500 font-medium"
              >
                No record chains matching the parameters were found.
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .custom-scrollbar::-webkit-scrollbar {
        height: 6px;
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
export class DevAppTable {
  // Input tracking structures using clear signal tokens
  readonly headers = input.required<string[]>();
  readonly data = input.required<any[]>();

  // Grabs the custom template definition supplied between the tags
  readonly rowTemplate = contentChild<TemplateRef<any>>(TemplateRef);
}
