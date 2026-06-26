import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'

})

export class PurchaseOrderItemService {
    constructor(private readonly http: HttpClient) { }
}