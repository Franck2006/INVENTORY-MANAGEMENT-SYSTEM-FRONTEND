import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../core/environment/env.environment";

@Injectable({
    providedIn: 'root'

})

export class PurchaseOrderService {
    constructor(private readonly http: HttpClient) { }

    createOrderService(purchase_order_data: any) {
        return this.http.post(environment.LOCAL_BACKEND_URL + "/purchase_order/create-purchase-order", purchase_order_data)
    }

    updateOrderService(purchase_order_data: any, id: string) {
        return this.http.post(environment.LOCAL_BACKEND_URL + `/purchase_order/update-purchase-order/${id}`, purchase_order_data)
    }

    deleteOrderService(id: any) {
        return this.http.delete(environment.LOCAL_BACKEND_URL + `/purchase_order/delete-purchase-order/${id}`)
    }


}