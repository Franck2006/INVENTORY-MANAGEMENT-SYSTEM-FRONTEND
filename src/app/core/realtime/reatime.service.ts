import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { GeneralModel } from '../../models/general-model.type';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from '../supabase/supabasa.client';
@Injectable({
  providedIn: 'root',
})
export class RealtimeService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly supabase = inject(SupabaseService).supabaseClient;
  private productsRealtimeChannel!: RealtimeChannel;
  private categoryRealtimeChannel!: RealtimeChannel;
  private supplierRealtimeChannel!: RealtimeChannel;
  private purchaseOrdersRealtimeChannel!: RealtimeChannel;
  private purchaseOrderItemsRealtimeChannel!: RealtimeChannel;

  public readonly products = signal<GeneralModel.Product[]>([]);
  public readonly suppliers = signal<GeneralModel.Supplier[]>([]);
  public readonly category = signal<GeneralModel.Category[]>([]);
  public readonly product_variants = signal<GeneralModel.ProductVariant[]>([]);
  public readonly cart = signal<GeneralModel.Product[]>([]);
  public readonly customer = signal<GeneralModel.Customer[]>([]);
  public readonly orders = signal<GeneralModel.Order[]>([]);
  public readonly order_items = signal<GeneralModel.OrderItem[]>([]);
  public readonly stock_movement = signal<GeneralModel.StockMovement[]>([]);
  public readonly purchase_orders = signal<GeneralModel.PurchaseOrder[]>([]);
  public readonly purchase_order_items = signal<GeneralModel.PurchaseOrderItem[]>([]);

  constructor() {
    this.initRealtimeSync();
  }

  public async initRealtimeSync() {
    // 1. Fetch initial data
    await this.fetchInitialData();

    // 2. Set up Realtime listeners
    this.setupProductRealtime();
    this.setupCategoryRealtime();
    this.setupSupplierRealtime();
    this.setupPurchaseOrderRealtime();
    this.setupPurchaseOrderItemRealtime();

    console.log('Realtime synchronization initialized with Supabase.');
  }

  private async fetchInitialData() {
    // Fetch products with nested category and supplier
    const { data: productsData, error: productsError } = await this.supabase
      .from('products')
      .select('*, suppliers(*), categories(*)')
      .order('created_at', { ascending: false });

    if (productsError) {
      console.error('Error fetching initial products:', productsError);
    } else {
      this.products.set((productsData as GeneralModel.Product[]) || []);
    }

    // Fetch products with nested category and supplier
    const { data: productVariantsData, error: productVariantsError } = await this.supabase
      .from('product_variants')
      .select('* , products(categories(*))');

    if (productVariantsError) {
      console.error('Error fetching initial products:', productVariantsError);
    } else {
      this.product_variants.set((productVariantsData as GeneralModel.ProductVariant[]) || []);
    }

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = (await this.supabase
      .from('categories') // Corrected table name to 'categories'
      .select('*')) as { data: GeneralModel.Category[] | null; error: any };

    if (categoriesError) {
      console.error('Error fetching initial categories:', categoriesError);
    } else {
      this.category.set(categoriesData || []); // No need for explicit cast here as it's already typed
    }

    // Fetch suppliers
    const { data: suppliersData, error: suppliersError } = (await this.supabase
      .from('suppliers') // Corrected table name to 'suppliers'
      .select('*')) as { data: GeneralModel.Supplier[] | null; error: any };

    if (suppliersError) {
      console.error('Error fetching initial suppliers:', suppliersError);
    } else {
      this.suppliers.set(suppliersData || []); // No need for explicit cast here as it's already typed
    }

    // Fetch purchase order
    const { data: purchaseOrder, error: purchaseOrderError } = (await this.supabase
      .from('purchase_orders')
      .select('*,purchase_order_items(*)')) as {
      data: GeneralModel.PurchaseOrder[] | null;
      error: any;
    };

    if (purchaseOrderError) {
      console.error('Error fetching initial suppliers:', purchaseOrderError);
    } else {
      this.purchase_orders.set(purchaseOrder || []); // No need for explicit cast here as it's already typed
    }

    // Fetch purchase order
    const { data: purchaseOrderItems, error: purchaseOrderItemsError } = (await this.supabase
      .from('purchase_order_items')
      .select('*,purchase_orders(*), product_variants(*,products(*,suppliers(*)))')) as {
      data: GeneralModel.PurchaseOrderItem[] | null;
      error: any;
    };
    // .order('created_at', { ascending: false })) //

    if (purchaseOrderItemsError) {
      console.error('Error fetching initial suppliers:', purchaseOrderItemsError);
    } else {
      this.purchase_order_items.set(purchaseOrderItems || []); // No need for explicit cast here as it's already typed
    }

    console.log('Initial data fetched from Supabase.');
    console.log('  ');
    console.log('  ');
    console.log('Initial products:', this.products());
    console.log('Initial product_variant:', this.product_variants());
    console.log('Initial categories:', this.category());
    console.log('Initial suppliers:', this.suppliers());
    console.log('Initial purchase_order:', this.purchase_orders());
    console.log('Initial purchase_order_items:', this.purchase_order_items());
    console.log('  ');
    console.log('  ');
  }

  private setupProductRealtime() {
    this.productsRealtimeChannel = this.supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload: RealtimePostgresChangesPayload<GeneralModel.Product>) => {
          await this.handleProductEvent(payload);
        },
      )
      .subscribe((status, err) => {
        console.log('Product Realtime Status:', status);
        if (err) console.error('Product Realtime Error:', err);
      });
  }

  private setupCategoryRealtime() {
    this.categoryRealtimeChannel = this.supabase
      .channel('category-changes') // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload: RealtimePostgresChangesPayload<GeneralModel.Category>) => {
          this.handleCategoryEvent(payload); // Type is correctly inferred from method signature
        },
      )
      .subscribe((status, err) => {
        console.log('Category Realtime Status:', status);
        if (err) console.error('Category Realtime Error:', err);
      });
  }

  private setupSupplierRealtime() {
    this.supplierRealtimeChannel = this.supabase
      .channel('supplier-changes') // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suppliers' },
        (payload: RealtimePostgresChangesPayload<GeneralModel.Supplier>) => {
          this.handleSupplierEvent(payload); // Type is correctly inferred from method signature
        },
      )
      .subscribe((status, err) => {
        console.log('Supplier Realtime Status:', status);
        if (err) console.error('Supplier Realtime Error:', err);
      });
  }

  private setupPurchaseOrderRealtime() {
    this.purchaseOrdersRealtimeChannel = this.supabase
      .channel('purchase-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_orders' },
        async (payload: RealtimePostgresChangesPayload<GeneralModel.PurchaseOrder>) => {
          await this.handlePurchaseOrderEvent(payload);
        },
      )
      .subscribe((status, err) => {
        console.log('Purchase Order Realtime Status:', status);
        if (err) console.error('Purchase Order Realtime Error:', err);
      });
  }

  private setupPurchaseOrderItemRealtime() {
    this.purchaseOrderItemsRealtimeChannel = this.supabase
      .channel('purchase-order-items-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'purchase_order_items' },
        async (payload: RealtimePostgresChangesPayload<GeneralModel.PurchaseOrderItem>) => {
          await this.handlePurchaseOrderItemEvent(payload);
        },
      )
      .subscribe((status, err) => {
        console.log('Purchase Order Item Realtime Status:', status);
        if (err) console.error('Purchase Order Item Realtime Error:', err);
      });
  }

  private async handleProductEvent(payload: RealtimePostgresChangesPayload<GeneralModel.Product>) {
    const { eventType } = payload;
    let updatedProduct: GeneralModel.Product | undefined;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      // TypeScript knows payload.new is GeneralModel.Product here
      const newRecord = payload.new;
      // When a product is inserted or updated, the payload.new will NOT have nested category/supplier.
      // We need to re-fetch the full product with joins.
      const { data, error } = await this.supabase
        .from('products')
        .select('*, suppliers(*), categories(*)')
        .eq('id', newRecord.id)
        .single();

      if (error) {
        console.error('Error re-fetching product after realtime event:', error);
        return;
      }
      updatedProduct = data as GeneralModel.Product;
    }

    this.products.update((currentProducts) => {
      if (eventType === 'INSERT') {
        return [...currentProducts, updatedProduct!]; // updatedProduct is guaranteed here
      } else if (eventType === 'UPDATE') {
        return currentProducts.map((p) => (p.id === updatedProduct!.id ? updatedProduct! : p)); // updatedProduct is guaranteed here
      } else if (eventType === 'DELETE') {
        // TypeScript knows payload.old is GeneralModel.Product here
        const oldRecord = payload.old;
        return currentProducts.filter((p) => p.id !== oldRecord.id);
      }
      return currentProducts; // Should not happen
    });
  }

  private handleCategoryEvent(payload: RealtimePostgresChangesPayload<GeneralModel.Category>) {
    // TypeScript will correctly narrow the type of payload based on eventType
    this.category.update((currentCategories) => {
      if (payload.eventType === 'INSERT') {
        return [...currentCategories, payload.new];
      } else if (payload.eventType === 'UPDATE') {
        return currentCategories.map((c) => (c.id === payload.new.id ? payload.new : c));
      } else if (payload.eventType === 'DELETE') {
        return currentCategories.filter((c) => c.id !== payload.old.id);
      }
      return currentCategories;
    });
  }

  private handleSupplierEvent(payload: RealtimePostgresChangesPayload<GeneralModel.Supplier>) {
    // TypeScript will correctly narrow the type of payload based on eventType
    this.suppliers.update((currentSuppliers) => {
      if (payload.eventType === 'INSERT') {
        return [...currentSuppliers, payload.new];
      } else if (payload.eventType === 'UPDATE') {
        return currentSuppliers.map((s) => (s.id === payload.new.id ? payload.new : s));
      } else if (payload.eventType === 'DELETE') {
        return currentSuppliers.filter((s) => s.id !== payload.old.id);
      }
      return currentSuppliers;
    });
  }

  private async handlePurchaseOrderEvent(
    payload: RealtimePostgresChangesPayload<GeneralModel.PurchaseOrder>,
  ) {
    const { eventType } = payload;
    let updatedPurchaseOrder: GeneralModel.PurchaseOrder | undefined;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const { data, error } = await this.supabase
        .from('purchase_orders')
        .select('*, purchase_order_items(*)')
        .eq('id', payload.new.id)
        .single();

      if (error) {
        console.error('Error re-fetching purchase order after realtime event:', error);
        return;
      }

      updatedPurchaseOrder = data as GeneralModel.PurchaseOrder;
    }

    this.purchase_orders.update((currentPurchaseOrders) => {
      if (eventType === 'INSERT') {
        return [...currentPurchaseOrders, updatedPurchaseOrder!];
      } else if (eventType === 'UPDATE') {
        return currentPurchaseOrders.map((purchaseOrder) =>
          purchaseOrder.id === updatedPurchaseOrder!.id ? updatedPurchaseOrder! : purchaseOrder,
        );
      } else if (eventType === 'DELETE') {
        return currentPurchaseOrders.filter((purchaseOrder) => purchaseOrder.id !== payload.old.id);
      }

      return currentPurchaseOrders;
    });

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      await this.syncPurchaseOrderItemRows(payload.new.id, updatedPurchaseOrder);
    } else if (eventType === 'DELETE') {
      this.purchase_order_items.update((currentPurchaseOrderItems) =>
        currentPurchaseOrderItems.filter(
          (purchaseOrderItem) => purchaseOrderItem.purchase_order_id !== payload.old.id,
        ),
      );
    }
  }

  private async syncPurchaseOrderItemRows(
    purchaseOrderId: string,
    purchaseOrder?: GeneralModel.PurchaseOrder,
  ) {
    const { data, error } = await this.supabase
      .from('purchase_order_items')
      .select('*, purchase_orders(*), product_variants(*, products(*, suppliers(*)))')
      .eq('purchase_order_id', purchaseOrderId);

    if (error) {
      console.error(
        'Error re-fetching purchase order item rows after order realtime event:',
        error,
      );
      return;
    }

    const refreshedItems = ((data as GeneralModel.PurchaseOrderItem[] | null) || []).map(
      (item) => ({
        ...item,
        purchase_orders: item.purchase_orders ?? purchaseOrder,
      }),
    );

    this.purchase_order_items.update((currentPurchaseOrderItems) => [
      ...currentPurchaseOrderItems.filter(
        (purchaseOrderItem) => purchaseOrderItem.purchase_order_id !== purchaseOrderId,
      ),
      ...refreshedItems,
    ]);
  }

  private async handlePurchaseOrderItemEvent(
    payload: RealtimePostgresChangesPayload<GeneralModel.PurchaseOrderItem>,
  ) {
    const { eventType } = payload;
    let updatedPurchaseOrderItem: GeneralModel.PurchaseOrderItem | undefined;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      const { data, error } = await this.supabase
        .from('purchase_order_items')
        .select('*, purchase_orders(*), product_variants(*, products(*, suppliers(*)))')
        .eq('id', payload.new.id)
        .single();

      if (error) {
        console.error('Error re-fetching purchase order item after realtime event:', error);
        return;
      }

      updatedPurchaseOrderItem = data as GeneralModel.PurchaseOrderItem;
    }

    this.purchase_order_items.update((currentPurchaseOrderItems) => {
      if (eventType === 'INSERT') {
        return [...currentPurchaseOrderItems, updatedPurchaseOrderItem!];
      } else if (eventType === 'UPDATE') {
        return currentPurchaseOrderItems.map((purchaseOrderItem) =>
          purchaseOrderItem.id === updatedPurchaseOrderItem!.id
            ? updatedPurchaseOrderItem!
            : purchaseOrderItem,
        );
      } else if (eventType === 'DELETE') {
        return currentPurchaseOrderItems.filter(
          (purchaseOrderItem) => purchaseOrderItem.id !== payload.old.id,
        );
      }

      return currentPurchaseOrderItems;
    });
  }

  async ngOnDestroy() {
    if (this.productsRealtimeChannel) {
      await this.supabase.removeChannel(this.productsRealtimeChannel);
    }
    if (this.categoryRealtimeChannel) {
      await this.supabase.removeChannel(this.categoryRealtimeChannel);
    }
    if (this.supplierRealtimeChannel) {
      await this.supabase.removeChannel(this.supplierRealtimeChannel);
    }
    if (this.purchaseOrdersRealtimeChannel) {
      await this.supabase.removeChannel(this.purchaseOrdersRealtimeChannel);
    }
    if (this.purchaseOrderItemsRealtimeChannel) {
      await this.supabase.removeChannel(this.purchaseOrderItemsRealtimeChannel);
    }
  }
}
