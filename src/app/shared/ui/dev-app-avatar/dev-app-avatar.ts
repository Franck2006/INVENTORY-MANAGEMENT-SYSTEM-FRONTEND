import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dev-app-avatar',
  standalone: true,
  imports: [],
  template: `
    <div class="relative inline-block select-none shrink-0">
      <div
        [class]="avatarClasses()"
        class="flex items-center justify-center rounded-xl font-bold uppercase overflow-hidden border border-[#3A506B]/30"
      >
        @if (imageUrl()) {
          <img
            [src]="imageUrl()"
            [alt]="name() || 'User avatar'"
            class="w-full h-full object-cover"
          />
        } @else {
          <span class="text-slate-200 tracking-wider">
            {{ initials() }}
          </span>
        }
      </div>

      @if (showStatus()) {
        <span
          [class]="status() === 'online' ? 'bg-emerald-500' : 'bg-slate-500'"
          class="absolute bottom-0 right-0 block rounded-full ring-2 ring-[#0B132B]"
          style="width: 10px; height: 10px;"
        ></span>
      }
    </div>
  `,
})
export class DevAppAvatar {
  readonly imageUrl = input<string | null>(null);
  readonly name = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly showStatus = input<boolean>(false);
  readonly status = input<'online' | 'offline'>('online');

  // Calculates sizes dynamically matching our framework layouts
  readonly avatarClasses = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 'w-8 h-8 text-xs bg-[#222E50]';
      case 'lg':
        return 'w-16 h-16 text-xl bg-[#222E50]';
      case 'md':
      default:
        return 'w-11 h-11 text-sm bg-[#222E50]';
    }
  });

  // Extracts professional 2-letter initials from name string inputs
  readonly initials = computed(() => {
    const parts = this.name().trim().split(' ');
    if (!parts || !parts[0]) return '?';
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`;
    }
    return parts[0].slice(0, 2);
  });
}
