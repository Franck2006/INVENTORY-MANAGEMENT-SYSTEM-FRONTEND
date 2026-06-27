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



  export interface PurchaseOrder {
    id: string;
    orderAt: Date;
    total_cost: number;
    status: OrderStatus; // Now using the enum type
    expected_delivery: Date | null;
    supplierId: string;
    totalItems: number;

    // i will delete this later
    order_date: Date
    vendor_name: string
    purchase_order_items?: PurchaseOrderItem[];


    // Optional database relations
    supplier?: Supplier;
    // items?: PurchaseOrderItem[];
  }


  export interface PurchaseOrderItem {
    id: string;
    quantityOrdered: number;
    quantityReceived: number;
    unitCost: number;
    purchaseOrderId: string;
    productVariantId: string;

    // Relations (Optional, populated when using Prisma's `include`)
    purchaseOrder?: PurchaseOrder;
    productVariant?: ProductVariant;
  }

  export enum OrderStatus {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    RECEIVED = 'RECEIVED',
    CANCELLED = 'CANCELLED',
  }
}

export namespace HardCodedDataInterface {
  export interface TokenModels {
    access_token: string;
    refresh_token: string;
  }
}
