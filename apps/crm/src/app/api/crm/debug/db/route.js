
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import _db from '@repo/lib/db';

export async function GET(req) {
    await _db();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const vendor = await VendorModel.findById(id);
    const supplier = await SupplierModel.findById(id);

    return NextResponse.json({
        id,
        inVendorCollection: !!vendor,
        inSupplierCollection: !!supplier,
        vendorCollectionName: VendorModel.collection.name,
        supplierCollectionName: SupplierModel.collection.name,
        vendorDoc: vendor,
        supplierDoc: supplier,
        modelsAreSame: VendorModel === SupplierModel
    });
}
