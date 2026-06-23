import { inject, Injectable, OnDestroy, OnInit, signal, WritableSignal } from '@angular/core';
import { SupabaseService } from '../supabase/supabasa.client';
import { GeneralModel } from '../../models/general-model.type';
import { RealtimeChannel } from '@supabase/supabase-js';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/env.environment';

@Injectable({
  providedIn: 'root',
})
export class RealtimeService implements OnDestroy {
  private readonly supabase = inject(SupabaseService).supabaseClient;
  private readonly http = inject(HttpClient);
  private realTime!: RealtimeChannel;

  public readonly products = signal<GeneralModel.Product[] | any[]>([]);
  public readonly product_variant = signal<GeneralModel.ProductVariant | null>(null);
  public readonly customer = signal<GeneralModel.Customer | null>(null);
  public readonly orders = signal<GeneralModel.Order | null>(null);
  public readonly order_items = signal<GeneralModel.OrderItem | null>(null);
  public readonly stock_movement = signal<GeneralModel.StockMovement | null>(null);

  constructor() {
    // this.initRealtimeSync();
  }

  public initRealtimeSync() {
    this.realTime = this.supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('==========================');
        console.log('');
        console.log(payload);
        console.log('');
        console.log('==========================');

        this.handleEvent(payload, this.products); // Pass corrected payload
      })
      .subscribe((status, err) => {
        console.log('STATUS:', status);

        if (err) {
          console.error(err);
        }
      });

    // console.log(this.realTime);
  }

  private handleEvent(payload: any, stateSignal: WritableSignal<GeneralModel.Product[]>) {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    if (eventType === 'INSERT') {
      // Corrected: Removed duplicate line
      stateSignal.update((items) => [...items, newRecord as GeneralModel.Product]);
    } else if (eventType === 'UPDATE') {
      // Corrected: Removed duplicate line
      stateSignal.update((items) =>
        items.map((item) =>
          item.id === newRecord.id ? (newRecord as GeneralModel.Product) : item,
        ),
      );
    } else if (eventType === 'DELETE') {
      // Corrected: Removed duplicate line
      stateSignal.update((items) => items.filter((item) => item.id !== oldRecord.id));
    }
  }

  async ngOnDestroy() {
    if (this.realTime) {
      await this.supabase.removeChannel(this.realTime);
    }
  }
  // getAllProducts() {
  //   return this.http.get(`${environment.LOCAL_BACKEND_URL}/product/get-all-products`);
  // }
}
