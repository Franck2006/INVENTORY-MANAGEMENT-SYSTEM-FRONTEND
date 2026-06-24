import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../core/environment/env.environment';
import { GeneralModel } from '../../models/general-model.type';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  public createProduct(product: GeneralModel.Product | any) {
    return this.http.post(environment.LOCAL_BACKEND_URL + '/product/create-product', product);
  }

  public updateProduct(product: any) {
    return this.http.put(environment.LOCAL_BACKEND_URL + '/product/update-product', product);
  }

  public deleteProduct(productId: string) {
    return this.http.delete(environment.LOCAL_BACKEND_URL + '/product/delete-product' + productId);
  }
}
