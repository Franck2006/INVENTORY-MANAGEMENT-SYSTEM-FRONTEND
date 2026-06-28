import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../core/environment/env.environment';
import { GeneralModel } from '../../models/general-model.type';
interface Supplier {
    companyName: string;
    contactName: string;
    phone: string;
    email: string;
}
@Injectable({
    providedIn: 'root',
})
export class SupplierService {
    constructor(private readonly http: HttpClient) { }


    createSupplier(supplierData: Partial<Supplier>) {
        return this.http.post<Supplier>(environment.LOCAL_BACKEND_URL + '/supplier/create-supplier', supplierData);
    }

    updateSupplier(supplierId: string, supplierData: Partial<Supplier>) {
        return this.http.patch<Supplier>(environment.LOCAL_BACKEND_URL + `/supplier/update-supplier/${supplierId}`, supplierData);
    }

    deleteSupplier(supplierId: string) {
        return this.http.delete(environment.LOCAL_BACKEND_URL + `/supplier/delete-supplier/${supplierId}`);
    }
}