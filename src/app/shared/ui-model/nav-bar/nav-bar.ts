import { Component, HostListener, signal } from '@angular/core';
import { AsideMobile } from '../aside-mobile/aside-mobile';
import { AsideBar } from '../aside-bar/aside-bar';
import { AppDevBtn } from '../../ui/app-dev-btn/app-dev-btn';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [AsideMobile, AsideBar, AppDevBtn, RouterLink],
  template: `
    <div class="flex items-center justify-between w-full h-full">
      <!-- these are the mobile bars -->
      <div>
        <button
          (click)="isLeftBarOpen.set(true)"
          class="md:hidden p-2 text-gray-400 hover:text-[#f3f4f6]  bg-[#1e2640] border border-[#2d3748] rounded-xl mr-2 focus:outline-none transition duration-150  hover:bg-[#1e2640]"
        >
          <span class="sr-only">Ouvrir le menu mobile</span>
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 12h18M3 6h18M3 18h18"></path>
          </svg>
        </button>
      </div>

      <!-- Left Section: Search Bar -->
      <div class="flex items-center flex-1 max-w-md">
        <div class="relative w-full group">
          <div
            class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400 group-focus-within:text-indigo-400 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="w-5 h-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search articles, tags, or developers... (Press '/' to focus)"
            class="w-full hidden md:block h-10 pl-10 pr-4 text-sm rounded-lg bg-slate-950/60 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>
      </div>

      <!-- Right Section: Actions & User Profile -->
      <div class="flex items-center gap-4">
        <!-- Action Button: Create Post -->
        <app-app-dev-btn variant="primary" size="sm" [routerLink]="['/customers']">
       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 3.75H6A2.25 2.25 0 0 0 3.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0 1 20.25 6v1.5m0 9V18A2.25 2.25 0 0 1 18 20.25h-1.5m-9 0H6A2.25 2.25 0 0 1 3.75 18v-1.5M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
</svg>

          <span>view customers</span>
        </app-app-dev-btn>

        <!-- Notification Bell -->
        <button
          class="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke="currentColor"
            class="w-5 h-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 0 1-5.714 0"
            />
          </svg>
          <!-- Unread indicator dot -->
          <span
            class="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900"
          ></span>
        </button>

        <!-- Divider Line -->
        <div class="w-px h-6 bg-slate-800"></div>

        <!-- User Dropdown Control Component -->
        <div class="relative">
          <button
            (click)="toggleDropdown()"
            class="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded-full"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
              alt="User avatar"
              class="w-9 h-9 rounded-full object-cover border border-slate-700 hover:border-slate-500 transition-colors"
            />
          </button>

          <!-- Dropdown Menu Box -->
          @if (isDropdownOpen) {
            <div
              class="absolute z-index right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl text-slate-300 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div class="px-3 py-2 border-b border-slate-800/60 mb-1">
                <p class="text-xs text-slate-500 font-medium">Signed in as</p>
                <p class="text-sm font-semibold text-slate-200 truncate">developer_dev</p>
              </div>

              <button
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left hover:bg-slate-800 hover:text-white transition-colors"
              >
                My Profile
              </button>
              <button
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left hover:bg-slate-800 hover:text-white transition-colors"
              >
                Dashboard
              </button>
              <button
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left hover:bg-slate-800 hover:text-white transition-colors"
              >
                Settings
              </button>

              <div class="h-px bg-slate-800/60 my-1"></div>

              <button
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
              >
                Sign out
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- <div class="inset-0 fixed z-99 backdrop-blur-md bg-slate-950/60"></div> -->
    <app-aside-mobile [(isLeftBarOpen)]="isLeftBarOpen">
      <app-aside-bar />
    </app-aside-mobile>

    <!-- <app-sign-out-model /> -->
  `,
  styles: [
    `
      .z-index {
        z-index: 99;
      }
    `,
  ],
})
export class NavBar {
  isDropdownOpen = false;
  isLeftBarOpen = signal(false);

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Closes dropdown automatically if the user clicks anywhere outside of it
  @HostListener('document:click', ['$event'])
  closeDropdownOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.isDropdownOpen = false;
    }
  }
}
