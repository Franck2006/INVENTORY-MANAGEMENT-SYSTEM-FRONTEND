export namespace GeneralModel {
  interface ID {
    id: string;
  }

  interface Creadential {
    email: string;
    password: string;
  }

  export interface SignInCreadentials extends Creadential { }

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

  export interface Supplier extends ID {
    company_name: string;
    contactName: string;
    phone: string;
    email: string;

    // Add other supplier properties if they exist
  }

  export interface Product extends ID {
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
  // export interface  {
  //   sku: string;
  //   size: string;
  //   color: string;
  //   price: string;
  //   product_id: string
  // }

  export interface ProductVariant extends ID {
    sku: string
    size: string
    color: string
    price: string
    low_stock_threshold: number
    id: string
    product_id: string
    product: Product

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
