import { Component } from '@angular/core';
import { AsideBar } from '../aside-bar/aside-bar';
import { NavBar } from '../nav-bar/nav-bar';

@Component({
  selector: 'app-dashboard',
  imports: [AsideBar, NavBar],
  template: `
    <div
      class="flex h-screen w-full  bg-slate-950 text-slate-50 antialiased selection:bg-indigo-500 selection:text-white"
    >
      <aside class="hidden md:flex md:w-64 md:flex-col border-r border-slate-800 bg-slate-900/50 ">
        <app-aside-bar class="h-full w-full"></app-aside-bar>
      </aside>

      <div class="flex flex-1 flex-col ">
        <header class="h-16 border-b border-slate-800 bg-slate-900/40 flex items-center px-6 ">
          <!-- z-10 -->
          <app-nav-bar class="w-full"></app-nav-bar>
        </header>

        <main
          class="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-7xl w-full mx-auto focus:outline-none"
        >
          <ng-content></ng-content>
        </main>
      </div>
    </div>
  `,
})
export class Dashboard {}
