import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../core/environment/env.environment';

export interface ProductVariant {
    sku: string;
    size: string;
    color: string;
    price: string;
    lowStockThreshold: number;
    id: string;
    productId: string;
}

@Injectable({
    providedIn: 'root',
})
export class ProductVariantService {
    constructor(private readonly http: HttpClient) { }

    createProductVariant(productVariantData: Partial<ProductVariant>) {
        return this.http.post<ProductVariant>(environment.LOCAL_BACKEND_URL + '/product-variants/create-product-variant', productVariantData);
    }

    updateProductVariant(productVariantId: string, productVariantData: Partial<ProductVariant>) {
        return this.http.patch<ProductVariant>(
            environment.LOCAL_BACKEND_URL + `/product-variants/update-product-variant/${productVariantId}`,
            productVariantData,
        );
    }

    deleteProductVariant(productVariantId: string) {
        return this.http.delete(environment.LOCAL_BACKEND_URL + `/product-variants/delete-product-variant/${productVariantId}`);
    }
}