import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { DevAppInput } from '../../../shared/ui/dev-app-input/dev-app-input';
import { AppDevBtn } from '../../../shared/ui/app-dev-btn/app-dev-btn';

@Component({
  selector: 'app-sign-up',
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
        <div
          class="relative z-10 p-12 lg:p-24 flex flex-col h-full justify-center items-start w-full bg-gradient-to-t from-[#0B132B] via-[#0B132B]/60 to-transparent"
        >
          <div class="w-full max-w-lg mb-12">
            <div
              class="w-14 h-14 bg-indigo-500/20 border border-indigo-500/50 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(99,102,241,0.4)] backdrop-blur-sm"
            >
              <i class="fas fa-network-wired text-indigo-400 text-2xl"></i>
            </div>
            <h1
              class="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight"
            >
              Join the <br /><span
                class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-300"
                >Supply Chain Fabric</span
              >
            </h1>
          </div>
          
          <div
            class="space-y-5 max-w-sm w-full bg-[#1C2541]/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md shadow-lg"
          >
            <p class="text-slate-300 font-medium text-sm">
              Register as a verified operator to orchestrate distribution pipelines globally.
            </p>
            <div class="space-y-3">
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <i class="fas fa-lock text-emerald-400"></i>
                <span>Enterprise grade encryption</span>
              </div>
              <div class="flex items-center gap-3 text-sm text-slate-400">
                <i class="fas fa-chart-network text-emerald-400"></i>
                <span>Real-time logistics analytics</span>
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
          <div class="space-y-2">
            <h2 class="text-3xl font-bold text-white tracking-tight">Create your profile</h2>
            <p class="text-slate-400 text-sm leading-relaxed">
              Provision administrative access to the central operational matrix.
            </p>
          </div>

          <form [formGroup]="signUpForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <app-dev-app-input
                formControlName="firstName"
                label="First Name"
                placeholder="John"
              ></app-dev-app-input>
              <app-dev-app-input
                formControlName="lastName"
                label="Last Name"
                placeholder="Doe"
              ></app-dev-app-input>
            </div>

            <app-dev-app-input
              formControlName="email"
              label="Corporate Email Address"
              placeholder="operator@nexus.logistics.com"
              type="email"
            ></app-dev-app-input>

            <app-dev-app-input
              formControlName="password"
              label="Secure Passphrase"
              placeholder="••••••••"
              type="password"
            ></app-dev-app-input>
            
            <app-dev-app-input
              formControlName="confirmPassword"
              label="Confirm Passphrase"
              placeholder="••••••••"
              type="password"
            ></app-dev-app-input>

            <div class="pt-4 flex">
              <app-app-dev-btn
                variant="primary"
                size="lg"
                class="w-full block"
                [disabled]="signUpForm.invalid || isLoading()"
                [loading]="isLoading()"
                type="submit"
              >
                Provision Account
              </app-app-dev-btn>
            </div>
          </form>

          <!-- Footer -->
          <p class="text-center text-sm text-slate-400/80 mt-8 pt-8 border-t border-slate-700/50">
            Already authenticated?
            <a
              routerLink="/auth/sign-in"
              class="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors cursor-pointer"
              >Return to Login</a
            >
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SignUp {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly isLoading = signal<boolean>(false);

  readonly signUpForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    if (this.signUpForm.get('password')?.value !== this.signUpForm.get('confirmPassword')?.value) {
      alert('Passwords do not match');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      this.isLoading.set(false);
      this.router.navigate(['/auth/sign-in']);
    }, 1200);
  }
}
