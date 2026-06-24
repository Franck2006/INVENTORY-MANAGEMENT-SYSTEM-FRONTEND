import { inject, Injectable, OnDestroy, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from '../supabase/supabase.client'; // Corrected typo: supabasa.client -> supabase.client
import { GeneralModel } from '../../models/general-model.type';
import { RealtimeChannel } from '@supabase/supabase-js';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class RealtimeService implements OnDestroy {
  private readonly supabase = inject(SupabaseService).supabaseClient;
  private readonly http = inject(HttpClient);
  private productsRealtimeChannel!: RealtimeChannel;
  private categoryRealtimeChannel!: RealtimeChannel;
  private supplierRealtimeChannel!: RealtimeChannel;

  public readonly products = signal<any[]>([]); // Using any[] as requested
  public readonly suppliers = signal<any[]>([]); // Added missing suppliers signal
  public readonly category = signal<any[]>([]); // Using any[] as requested
  public readonly product_variant = signal<GeneralModel.ProductVariant | null>(null);
  public readonly customer = signal<GeneralModel.Customer | null>(null);
  public readonly orders = signal<GeneralModel.Order | null>(null);
  public readonly order_items = signal<GeneralModel.OrderItem | null>(null);
  public readonly stock_movement = signal<GeneralModel.StockMovement | null>(null);

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

    console.log('Realtime synchronization initialized with Supabase.');
  }

  private async fetchInitialData() {
    // Fetch products with nested category and supplier
    const { data: productsData, error: productsError } = await this.supabase
      .from('products')
      .select('*, categories(*), suppliers(*)')
      .order('created_at', { ascending: false }); // Corrected column name to 'created_at'

    if (productsError) {
      console.error('Error fetching initial products:', productsError);
    } else {
      this.products.set(productsData || []);
    }

    // Fetch categories
    const { data: categoriesData, error: categoriesError } = await this.supabase
      .from('categories') // Corrected table name to 'categories'
      .select('*');

    if (categoriesError) {
      console.error('Error fetching initial categories:', categoriesError);
    } else {
      this.category.set(categoriesData || []);
    }

    // Fetch suppliers
    const { data: suppliersData, error: suppliersError } = await this.supabase
      .from('suppliers') // Corrected table name to 'suppliers'
      .select('*');

    if (suppliersError) {
      console.error('Error fetching initial suppliers:', suppliersError);
    } else {
      this.suppliers.set(suppliersData || []);
    }

    console.log('Initial data fetched from Supabase.');
    console.log('Initial products:', this.products());
    console.log('Initial categories:', this.category());
    console.log('Initial suppliers:', this.suppliers());
  }

  private setupProductRealtime() {
    this.productsRealtimeChannel = this.supabase
      .channel('products-changes') // Unique channel name
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        async (payload) => {
          console.log('Product Realtime Event:', payload);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        console.log('Category Realtime Event:', payload);
        this.handleCategoryEvent(payload);
      })
      .subscribe((status, err) => {
        console.log('Category Realtime Status:', status);
        if (err) console.error('Category Realtime Error:', err);
      });
  }

  private setupSupplierRealtime() {
    this.supplierRealtimeChannel = this.supabase
      .channel('supplier-changes') // Unique channel name
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, (payload) => {
        console.log('Supplier Realtime Event:', payload);
        this.handleSupplierEvent(payload);
      })
      .subscribe((status, err) => {
        console.log('Supplier Realtime Status:', status);
        if (err) console.error('Supplier Realtime Error:', err);
      });
  }

  private async handleProductEvent(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    let updatedProduct: any;

    if (eventType === 'INSERT' || eventType === 'UPDATE') {
      // When a product is inserted or updated, the payload.new will NOT have nested category/supplier.
      // We need to re-fetch the full product with joins.
      const { data, error } = await this.supabase
        .from('products')
        .select('*, categories(*), suppliers(*)') // Corrected to plural table names
        .eq('id', newRecord.id)
        .single();

      if (error) {
        console.error('Error re-fetching product after realtime event:', error);
        return;
      }
      updatedProduct = data;
    }

    this.products.update((currentProducts) => {
      if (eventType === 'INSERT') {
        return [...currentProducts, updatedProduct];
      } else if (eventType === 'UPDATE') {
        return currentProducts.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
      } else if (eventType === 'DELETE') {
        return currentProducts.filter((p) => p.id !== oldRecord.id);
      }
      return currentProducts; // Should not happen
    });
  }

  private handleCategoryEvent(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    this.category.update((currentCategories) => {
      if (eventType === 'INSERT') {
        return [...currentCategories, newRecord];
      } else if (eventType === 'UPDATE') {
        return currentCategories.map((c) => (c.id === newRecord.id ? newRecord : c));
      } else if (eventType === 'DELETE') {
        return currentCategories.filter((c) => c.id !== oldRecord.id);
      }
      return currentCategories;
    });
  }

  private handleSupplierEvent(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    this.suppliers.update((currentSuppliers) => {
      if (eventType === 'INSERT') {
        return [...currentSuppliers, newRecord];
      } else if (eventType === 'UPDATE') {
        return currentSuppliers.map((s) => (s.id === newRecord.id ? newRecord : s));
      } else if (eventType === 'DELETE') {
        return currentSuppliers.filter((s) => s.id !== oldRecord.id);
      }
      return currentSuppliers;
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
  }
}
