// src/app/models/general-model.type.ts

export namespace GeneralModel {
  interface Creadential {
    email: string;
    password: string;
  }

  export interface SignInCreadentials extends Creadential {}

  export interface SignUpCreadentials extends Creadential {
    name: string;
    lastname: string;
  }

  export interface Category {
    id: string;
    name: string;
    slug: string;
    created_at?: string;
    // Add other category properties if they exist
  }

  export interface Supplier {
    id: string;
    name: string;
    created_at?: string;
    // Add other supplier properties if they exist
  }

  export interface Product {
    id: string;
    name: string;
    description: string;
    base_price: number;
    category_id: string;
    supplier_id: string;
    created_at: string;
    categories: Category | null; // Nested category, can be null if no match
    suppliers: Supplier | null; // Nested supplier, can be null if no match
    // Add other product properties if they exist
  }

  // Placeholder for other models if they exist, otherwise remove or define them
  export interface ProductVariant {
    /* Define properties */
  }
  export interface Customer {
    /* Define properties */
  }
  export interface Order {
    /* Define properties */
  }
  export interface OrderItem {
    /* Define properties */
  }
  export interface StockMovement {
    /* Define properties */
  }
}

export namespace HardCodedDataInterface {
  export interface TokenModels {
    access_token: string;
    refresh_token: string;
  }
}
