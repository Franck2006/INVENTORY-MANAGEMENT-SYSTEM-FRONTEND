import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environment/env.environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private readonly supabase_url = environment.SUPABASE_URL;
  private readonly supabase_key = environment.SUPABASE_KEY;

  public readonly supabaseClient: SupabaseClient;

  constructor() {
    this.supabaseClient = createClient(this.supabase_url, this.supabase_key);
  }
}
