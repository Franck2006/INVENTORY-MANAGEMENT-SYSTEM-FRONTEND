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

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'trying-page',
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
  },
  {
    path: 'main-dashboard',
    component: MainDashboard,
  },
  {
    path: 'pos',
    component: Pos,
  },
  {
    path: 'products',
    component: Products,
  },
  {
    path: 'products/:product-id',
    component: ProductDetail,
  },
  {
    path: 'inventory',
    component: Inventory,
  },
  {
    path: 'purchase-orders',
    component: PurchaseOrders,
  },
  {
    path: 'customers',
    component: Customers,
  },
  {
    path: 'suppliers',
    component: Suppliers,
  },
  {
    path: 'settings',
    component: Settings,
  },
];
