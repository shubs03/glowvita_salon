import { NextResponse } from 'next/server';
import SuperDataModel from '@repo/lib/models/admin/SuperData.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// GET SuperData items by type (for dropdowns)
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        
        if (!type) {
            return NextResponse.json({ 
                message: "Type parameter is required" 
            }, { status: 400 });
        }
        
        console.log(`Fetching SuperData items of type: ${type}`);
        
        const items = await SuperDataModel.find({ type }).sort({ name: 1 });
        
        console.log(`Found ${items.length} item(s) of type ${type}.`);
        
        return NextResponse.json(items, { status: 200 });
    } catch (error) {
        console.error('Error fetching SuperData:', error);
        return NextResponse.json({ 
            message: "Error fetching data", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor', 'doctor', 'supplier']);
