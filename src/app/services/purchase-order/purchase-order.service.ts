import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../core/environment/env.environment";

@Injectable({
    providedIn: 'root'

})

export class PurchaseOrderService {
    constructor(private readonly http: HttpClient) { }

    createOrderService(purchase_order_data: any) {
        return this.http.post(environment.LOCAL_BACKEND_URL + "/purchase-orders/create-purchase-order", purchase_order_data)
    }

    updateOrderService(purchase_order_data: any, id: string | undefined) {
        return this.http.patch(environment.LOCAL_BACKEND_URL + `/purchase-orders/update-purchase-order/${id}`, purchase_order_data)
    }

    deleteOrderService(id: any) {
        return this.http.delete(environment.LOCAL_BACKEND_URL + `/purchase-orders/delete-purchase-order/${id}`)
    }


}