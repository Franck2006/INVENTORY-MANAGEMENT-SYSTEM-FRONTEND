import { CommonModule } from '@angular/common';
import { Component, model } from '@angular/core';

@Component({
  selector: 'app-aside-mobile',
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isLeftBarOpen()"
      class="inset-0 md:hidden fixed z-99 backdrop-blur-md bg-slate-950/60"
      (click)="isLeftBarOpen.set(false)"
    >
      <ng-content />
    </div>
  `,
})
export class AsideMobile {
  isLeftBarOpen = model(false);
}
