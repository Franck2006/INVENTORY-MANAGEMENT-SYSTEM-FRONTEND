import { Component, computed, inject, signal } from '@angular/core';
import { DevAppIconBtn } from '../../shared/ui/dev-app-icon-btn/dev-app-icon-btn';
import { AppDevBtn } from '../../shared/ui/app-dev-btn/app-dev-btn';
import { DevAppInput } from '../../shared/ui/dev-app-input/dev-app-input';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DevAppPhoneInput } from '../../shared/ui/dev-app-phone-input/dev-app-phone-input';
import { DevAppTextarea } from '../../shared/ui/dev-app-textarea/dev-app-textarea';
import { DevAppSelect, DevAppSelectOption } from '../../shared/ui/dev-app-select/dev-app-select';
import { DevAppSwitch } from '../../shared/ui/dev-app-switch/dev-app-switch';
import { DevAppTable } from '../../shared/ui/dev-app-table/dev-app-table';
import { DevAppTablePagination } from '../../shared/ui/dev-app-table-pagination/dev-app-table-pagination';
import { DevAppQuickStatRow } from '../../shared/ui/dev-app-quick-stat-row/dev-app-quick-stat-row';
import { DevAppCard } from '../../shared/ui/dev-app-card/dev-app-card';
import { DevAppAvatar } from '../../shared/ui/dev-app-avatar/dev-app-avatar';
import { DevAppBadge } from '../../shared/ui/dev-app-badge/dev-app-badge';
import { DevAppEmptyState } from '../../shared/ui/dev-app-empty-state/dev-app-empty-state';
import { DevAppSkeleton } from '../../shared/ui/dev-app-skeleton/dev-app-skeleton';
import {
  DevAppMenuItem,
  DevAppActionMenu,
} from '../../shared/ui/dev-app-action-menu/dev-app-action-menu';
import { DevAppModal } from '../../shared/ui/dev-app-modal/dev-app-modal';
import { DevAppConfirmDialog } from '../../shared/ui/dev-app-confirm-dialog/dev-app-confirm-dialog';
import {
  DevAppToastType,
  ToastModel,
  DevAppToast,
} from '../../shared/ui/dev-app-toast/dev-app-toast';
import { DevAppTooltip } from '../../shared/ui/dev-app-tooltip/dev-app-tooltip';
import { Dashboard } from '../../shared/ui-model/dashboard/dashboard';
import {
  DevAppSelectInput,
  SelectInputOption,
} from '../../shared/ui/dev-app-select-input/dev-app-select-input';

@Component({
  selector: 'app-trying-page',
  imports: [
    DevAppIconBtn,
    AppDevBtn,
    DevAppInput,
    ReactiveFormsModule,
    DevAppPhoneInput,
    DevAppTextarea,
    DevAppSelect,
    DevAppSwitch,
    DevAppTable,
    DevAppTablePagination,
    DevAppQuickStatRow,
    DevAppCard,
    DevAppAvatar,
    DevAppBadge,
    DevAppEmptyState,
    FormsModule,
    DevAppSkeleton,
    DevAppActionMenu,
    DevAppModal,
    DevAppConfirmDialog,
    DevAppToast,
    DevAppTooltip,
    Dashboard,
    DevAppSelectInput,
  ],
  templateUrl: './trying-page.html',
  styleUrl: './trying-page.css',
})
export class TryingPage {
  private readonly fb = inject(FormBuilder);

  // Build the structure with formBuilder & validation rules
  readonly myForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
  });

  // Helper method to safely pull validation messages
  getErrorMessage(controlName: string): string | null {
    const control = this.myForm.get(controlName);
    if (!control || !control.touched || !control.errors) return null;

    if (control.errors['required']) return 'This field is highly required';
    if (control.errors['email']) return 'Please format as a valid email';
    if (control.errors['minlength'])
      return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;

    return null;
  }

  onSubmit() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    }
    console.log('Valid Form Data Submitted:', this.myForm.value);
  }

  // ========================> phone input
  private readonly fomr = inject(FormBuilder);

  readonly profileForm: FormGroup = this.fomr.group({
    phone: ['+243815550123', [Validators.required, Validators.minLength(7)]],
  });

  getPhoneError(): string | null {
    const ctrl = this.profileForm.get('phone');
    if (!ctrl || !ctrl.touched || !ctrl.errors) return null;
    if (ctrl.errors['required']) return 'Phone number is required';
    if (ctrl.errors['minlength']) return 'Number entry is too short';
    return null;
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    console.log('Submitted Clean Full Phone String:', this.profileForm.value.phone);
  }

  // private readonly fb = inject(FormBuilder);

  readonly accountForm: FormGroup = this.fb.group({
    phoneNumber: ['+243810000000', [Validators.required]],
  });

  // ===================> this for the textarea
  readonly feedbackForm: FormGroup = this.fb.group({
    description: ['', [Validators.required, Validators.minLength(10)]],
  });

  getDescriptionError(): string | null {
    const ctrl = this.feedbackForm.get('description');
    if (!ctrl || !ctrl.touched || !ctrl.errors) return null;
    if (ctrl.errors['required']) return 'Please write a brief description';
    if (ctrl.errors['minlength']) return 'Description must be at least 10 characters';
    return null;
  }

  submitFeedback() {
    if (this.feedbackForm.invalid) {
      this.feedbackForm.markAllAsTouched();
      return;
    }
    console.log('Textarea Value Submitted:', this.feedbackForm.value.description);
  }

  // =========================> this is for the select input
  // Framework data arrays
  private readonly fomra = inject(FormBuilder);
  readonly techOptions: DevAppSelectOption[] = [
    { value: 'angular', label: 'Angular 19/21 Framework' },
    { value: 'nestjs', label: 'NestJS Backend API' },
    { value: 'supabase', label: 'Supabase BaaS' },
    { value: 'prisma', label: 'Prisma ORM Layers' },
  ];

  readonly projectForm: FormGroup = this.fomra.group({
    framework: ['angular', [Validators.required]],
  });

  // ==========================> this is for the switch btn
  readonly configForm: FormGroup = this.fomra.group({
    syncActive: [true],
    logsEnabled: [false],
  });

  printValues() {
    console.log('Current Form Output Data:', this.configForm.value);
  }

  // ===============================> this is for the table

  readonly columns = ['Product Name', 'SKU ID', 'Stock Status', 'Actions', 'options'];

  readonly inventoryItems = signal([
    { name: 'ThinkPad Core Shell', sku: 'THINK-X1-C2', status: 'In Stock', price: '$1,200' },
    { name: 'Micro-Controller Board v2', sku: 'IOT-J5-ESP', status: 'Low Stock', price: '$45' },
    {
      name: 'Premium SaaS Engine Module',
      sku: 'NG-NEST-PRIS',
      status: 'Out of Stock',
      price: '$350',
    },
  ]);

  editItem(item: any) {
    console.log('Editing target item details:', item);
  }

  // ==========================> this is for the paginator
  readonly headers = ['Id', 'Username', 'Role'];

  // Reactive signals for layout tracking state
  readonly activePage = signal(1);
  readonly itemsPerPage = signal(10); // Default items per page match selection

  // Raw mock user collection array loop entries
  readonly rawUsers = signal(
    Array.from({ length: 45 }, (_, i) => ({
      id: `#USR-${i + 100}`,
      username: `Operator_User_${i + 1}`,
      role: i % 3 === 0 ? 'Admin' : i % 3 === 1 ? 'Manager' : 'User',
    })),
  );

  // Slices your dataset reactively using the state of both signals
  readonly paginatedData = computed(() => {
    const start = (this.activePage() - 1) * this.itemsPerPage();
    const end = start + this.itemsPerPage();
    return this.rawUsers().slice(start, end);
  });

  // Handles dynamic adjustment when user alters row scale settings
  onPageSizeChanged(newSize: number) {
    this.itemsPerPage.set(newSize);
    this.activePage.set(1); // Crucial: Reset to first page to avoid index calculation bugs
  }

  onPageChanged(newPage: number) {
    this.activePage.set(newPage);
  }

  // =======================> this is the quick stat row
  readonly metricsSummary = signal([
    {
      title: 'Total Revenue',
      value: '$24,500',
      change: '12%',
      isPositive: true,
      icon: 'fas fa-house',
    },
    { title: 'Active Products', value: '1,240', change: '3%', isPositive: true, icon: '📦' },
    { title: 'Low Stock Alarms', value: '14 Items', change: '8%', isPositive: false, icon: '⚠️' },
    { title: 'Completed Shipments', value: '382', change: '24%', isPositive: true, icon: '🚚' },
  ]);

  // ==========================? this is for the empty state
  // Clear search input tracking text
  readonly searchQuery = signal<string>('');

  // 2. Your raw master list of data items
  readonly allProducts = signal([
    { id: 'P01', name: 'ThinkPad Laptop Core Shell', sku: 'THINK-X1-C2' },
    { id: 'P02', name: 'Micro-Controller Board v2', sku: 'IOT-J5-ESP' },
    { id: 'P03', name: 'Premium SaaS Engine Module', sku: 'NG-NEST-PRIS' },
  ]);

  // 3. Reactively filter products based on the user's search query string
  readonly filteredProducts = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.allProducts();
    }

    return this.allProducts().filter(
      (product) =>
        product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query),
    );
  });

  // 4. The explicit action handler triggered by clicking the projected button
  resetSearchFilters(): void {
    this.searchQuery.set(''); // Clears the query signal string instantly
  }

  // ======================= this is for the menu
  readonly rowActionsConfig = signal<DevAppMenuItem[]>([
    { id: 'view', label: 'View Analytics', icon: 'fas fa-eye' },
    { id: 'edit', label: 'Edit Parameters', icon: 'fas fa-pen' },
    { id: 'delete', label: 'Delete Records', icon: 'fas fa-trash-alt', variant: 'danger' },
  ]);

  handleRowAction(event: { itemId: string; context: any }) {
    const { itemId, context } = event;
    console.log(`Executing operation link [${itemId}] on entry:`, context);

    if (itemId === 'delete') {
      // Trigger deletion sequencing safely
    }
  }

  // ===================================> this is for the dev modal
  readonly isItemModalOpen = signal<boolean>(false);

  openCreationDialog(): void {
    this.isItemModalOpen.set(true);
  }

  closeCreationDialog(): void {
    this.isItemModalOpen.set(false);
  }

  saveNewItem(): void {
    // Process business logics safely
    this.closeCreationDialog();
  }

  // =================================> readonly isDeleteConfirmOpen = signal<boolean>(false);

  readonly isDeleteConfirmOpen = signal<boolean>(false);

  // Track context record reference currently staged for execution processing
  readonly userIdTarget = signal<string | null>(null);

  stageUserDeletion(userId: string): void {
    this.userIdTarget.set(userId);
    this.isDeleteConfirmOpen.set(true);
  }

  onDeleteAborted(): void {
    this.isDeleteConfirmOpen.set(false);
    this.userIdTarget.set(null);
  }

  onDeleteExecuted(): void {
    const target = this.userIdTarget();
    if (target) {
      console.log(`Permanently purging database record link index: ${target}`);
      // Perform your Prisma ORM API fetch pipeline operations here safely
    }
    this.onDeleteAborted(); // Terminate loop visibility state
  }

  // ======================> this is for the toats
  // Reactive tracking signal containing all live overlay messages
  readonly activeToasts = signal<ToastModel[]>([]);

  triggerNotification(type: DevAppToastType, title: string, message: string) {
    const newToast: ToastModel = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      duration: 4000, // Default duration for auto-dismiss
    };

    // Push clean trace index to the signal chain array
    this.activeToasts.update((current) => [...current, newToast]);
  }

  removeToastId(toastId: string) {
    this.activeToasts.update((current) => current.filter((t) => t.id !== toastId));
  }

  // =======================> this is for the select input
  readonly coachesList = signal<SelectInputOption[]>([
    { id: 'c1', label: 'Franck Amani', sublabel: 'Full-Stack Engine / English Coach' },
    { id: 'c2', label: 'Sarah Connor', sublabel: 'Cybersecurity Systems Specialist' },
    { id: 'c3', label: 'Alex Mercer', sublabel: 'IoT Solutions Architect' },
  ]);

  onCoachSelected(option: SelectInputOption): void {
    console.log('Selected Suggestion Payload Data Node Target:', option);
    // Bind option.id cleanly to your database request schemas here
  }
}
