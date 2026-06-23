import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { DevAppInput } from '../../../shared/ui/dev-app-input/dev-app-input';
import { AppDevBtn } from '../../../shared/ui/app-dev-btn/app-dev-btn';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, DevAppInput, AppDevBtn],
  template: `
    <div class="min-h-screen w-full flex flex-col md:flex-row bg-[#0B132B]">
      <!-- Left Side: Illustration -->
      <div
        class="hidden md:flex md:w-1/2 relative bg-[#0B132B] items-center justify-center overflow-hidden"
      >
        <!-- Artificial background image rendering via assets directly -->
        <img
          src="assets/images/sign_in_illustration.png"
          alt="Inventory Logic Nexus"
          class="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-screen scale-105"
        />
        <!-- Content Overlay -->
        <div
          class="relative z-10 p-12 flex flex-col h-full justify-between items-start w-full bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent"
        >
          <div class="w-full">
            <div
              class="w-14 h-14 bg-indigo-500/20 border border-indigo-500/50 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-sm"
            >
              <i class="fas fa-cubes text-indigo-400 text-2xl"></i>
            </div>
            <h1 class="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Logistics <br /><span
                class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300"
                >Nexus Hub</span
              >
            </h1>
          </div>

          <div
            class="space-y-5 max-w-sm w-full bg-[#1C2541]/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg"
          >
            <p class="text-slate-300 font-medium text-sm">
              Authorize to synchronize fleet parameters and operational distribution channels.
            </p>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <i class="fas fa-check-circle text-emerald-400"></i>
                <span>Secure biometric handshakes</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <i class="fas fa-check-circle text-emerald-400"></i>
                <span>End-to-End Ledger Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side: Form -->
      <div
        class="w-full md:w-1/2 min-h-screen p-8 md:p-12 lg:p-24 flex flex-col justify-center relative bg-[#0B132B] md:bg-[#0f172a]/60"
      >
        <div class="max-w-md w-full mx-auto space-y-10">
          <!-- Header -->
          <div class="space-y-2">
            <h2 class="text-3xl font-bold text-white tracking-tight">Welcome back</h2>
            <p class="text-slate-400 text-sm leading-relaxed">
              Submit your credentials to instantiate a secure administrative session tunnel.
            </p>
          </div>

          <!-- Action Form built with ReactiveFormsModule -->
          <form [formGroup]="signInForm" (ngSubmit)="onSubmit()" class="space-y-6">
            <app-dev-app-input
              formControlName="email"
              label="Registered Email Address"
              placeholder="operator@nexus.logistics.com"
              type="email"
            ></app-dev-app-input>

            <div class="space-y-2">
              <app-dev-app-input
                formControlName="password"
                label="Secure Passphrase"
                placeholder="••••••••"
                type="password"
              ></app-dev-app-input>

              <div class="flex justify-end px-1">
                <a
                  href="javascript:void(0)"
                  class="text-[11px] font-semibold tracking-wider uppercase text-indigo-400 hover:text-indigo-300 transition-colors"
                  >Recover Keys?</a
                >
              </div>
            </div>

            <div class="pt-2 flex">
              <app-app-dev-btn
                variant="primary"
                size="lg"
                class="w-full block"
                [disabled]="signInForm.invalid || isLoading()"
                [loading]="isLoading()"
                type="submit"
              >
                Authenticate Connection
              </app-app-dev-btn>
            </div>
          </form>

          <!-- Footer Node -->
          <p class="text-center text-sm text-slate-400/80 mt-8 pt-8 border-t border-slate-700/50">
            Lacking credentials?
            <a
              routerLink="/auth/sign-up"
              class="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors cursor-pointer"
              >Provision an account</a
            >
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SignIn {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);

  readonly isLoading = signal<boolean>(false);

  readonly signInForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    const { email, password } = this.signInForm.value;
    if (!email || !password) {
      this.signInForm.markAllAsTouched();
      return;
    }

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }

    console.log({ email, password });
    this.isLoading.set(true);
    this.auth.signIn({ email, password }).subscribe({
      next: (creadential) => {
        this.isLoading.set(false);
        this.router.navigate(['/products']);
      },
      error: (creadential) => {
        this.isLoading.set(false);

        console.log(creadential);
      },
    });
  }
}
