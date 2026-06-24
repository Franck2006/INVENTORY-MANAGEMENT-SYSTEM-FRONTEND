export namespace GeneralModel {
  interface ID {
    id?: string;
  }

  interface CreatedAt {
    createdAt?: Date;
  }

  interface UpdatedAt {
    updatedAt?: Date;
  }

  interface Creadentials {
    email: string;
    password: string;
  }

  export interface SignUpCreadentials extends Creadentials {
    name: string;
    lastname: string;
  }

  export interface SignInCreadentials extends Creadentials {}

  export interface Product extends ID, CreatedAt {
    name: string;
    description: string;
    basePrice: number;
    categoryId: string;
    supplierId: string;
  }

  export interface ProductVariant extends ID, CreatedAt {
    sku: string;
    size: string;
    color: string;
    price: string;
    lowStockThreshold: number;
    productId: string;
  }

  export interface Customer extends ID, CreatedAt {
    name: string;
    phone: string;
    email: string;
    loyaltyPoints: number;
  }

  export interface Order {
    userId: string;
    customerId: string;
    locationId: string;
    discountId: string;
    paymentMethod: string;
    totalAmount: number;
    location: string[];
    customer: Customer;
    discount: string[];
  }

  export interface OrderItem {
    quantity: number;
    unitPrice: number;
    orderId: string;
    productVariantId: string;
    order: Order;
    productVariant: ProductVariant;
  }

  export interface StockMovement {
    quantity: number;
    type: MovementType;
    reason: string;
    productVariantId: string;
    locationId: string;
    userId: string;
    location: string[];
    productVariant: ProductVariant[];
    user: any;
  }

  export interface Category {
    name: string;
    slug: string;
  }

  enum MovementType {
    SALE = 'SALE',
    RESTOCK = 'RESTOCK',
    RETURN = 'RETURN',
    DAMAGED = 'DAMAGED',
  }
}

export namespace HardCodedDataInterface {
  export interface TokenModels {
    access_token: string | null;
    refresh_token: string | null;
  }
}
