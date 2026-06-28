import { Routes } from '@angular/router';
import { TryingPage } from './pages/trying-page/trying-page';
import { MainDashboard } from './pages/dashboard/dashboard';
import { Pos } from './pages/pos/pos';
import { Products } from './pages/products/products';
import { ProductDetail } from './pages/product-detail/product-detail';
import { Inventory } from './pages/inventory/inventory';
import { PurchaseOrders } from './pages/purchase-orders/purchase-orders';
import { Customers } from './pages/customers/customers';
import { Suppliers } from './pages/suppliers/suppliers';
import { Settings } from './pages/settings/settings';
import { SignIn } from './core/auth/sign-in/sign-in';
import { SignUp } from './core/auth/sign-up/sign-up';
import { authGuard } from './core/guard/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',

  },
  {
    path: 'sign-in',
    component: SignIn,
  },
  {
    path: 'sign-up',
    component: SignUp,
  },
  {
    path: 'trying-page',
    component: TryingPage,
    canActivate: [authGuard]
  },
  {
    path: 'main-dashboard',
    component: MainDashboard,
    canActivate: [authGuard]
  },
  {
    path: 'pos',
    component: Pos,
    canActivate: [authGuard]
  },
  {
    path: 'products',
    component: Products,
    canActivate: [authGuard]
  },
  {
    path: 'products/:product-id',
    component: ProductDetail,
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    component: Inventory,
    canActivate: [authGuard]
  },
  {
    path: 'purchase-orders',
    component: PurchaseOrders,
    canActivate: [authGuard]
  },
  {
    path: 'customers',
    component: Customers,
    canActivate: [authGuard]
  },
  {
    path: 'suppliers',
    component: Suppliers,
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    component: Settings,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  }
];
