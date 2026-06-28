import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../core/environment/env.environment";

@Injectable({
    providedIn: 'root'
})

export class PurchaseOrderItemService {
    constructor(private readonly http: HttpClient) { }

    createPurchaseOrderItem(purchase_order_item_data: any) {
        return this.http.post(environment.LOCAL_BACKEND_URL + "/purchase-order-items/create-order-item", purchase_order_item_data)
    }

    updatePurchaseOrderItem(purchase_order_item_data: any, id: string) {
        return this.http.patch(environment.LOCAL_BACKEND_URL + `/purchase-order-items/update-order-item/${id}`, purchase_order_item_data)
    }

    deletePurchaseOrderItem(id: any) {
        return this.http.delete(environment.LOCAL_BACKEND_URL + `/purchase-order-items/delete-order-item/${id}`)
    }
}