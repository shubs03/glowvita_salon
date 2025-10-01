import { NextResponse } from 'next/server';
import StaffModel from '@repo/lib/models/vendor/Staff.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';

await _db();

// Debug endpoint to check database state
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id.toString();
        
        // Get all indexes
        const collection = StaffModel.collection;
        const indexes = await collection.indexes();
        
        // Get all staff for this vendor
        const staff = await StaffModel.find({ vendorId: vendorId });
        
        // Get all staff globally (for debugging)
        const allStaff = await StaffModel.find({}).select('vendorId emailAddress mobileNo fullName');
        
        const debugInfo = {
            vendorId: vendorId,
            indexes: indexes.map(idx => ({
                name: idx.name,
                key: idx.key,
                unique: idx.unique || false
            })),
            staffForVendor: staff.map(s => ({
                _id: s._id,
                fullName: s.fullName,
                emailAddress: s.emailAddress,
                mobileNo: s.mobileNo,
                vendorId: s.vendorId
            })),
            allStaffCount: allStaff.length,
            duplicateEmails: [],
            duplicateMobiles: []
        };
        
        // Check for duplicate emails across all vendors
        const emailCounts = {};
        allStaff.forEach(s => {
            if (emailCounts[s.emailAddress]) {
                emailCounts[s.emailAddress].push({ vendorId: s.vendorId, fullName: s.fullName });
            } else {
                emailCounts[s.emailAddress] = [{ vendorId: s.vendorId, fullName: s.fullName }];
            }
        });
        
        Object.keys(emailCounts).forEach(email => {
            if (emailCounts[email].length > 1) {
                debugInfo.duplicateEmails.push({ email, instances: emailCounts[email] });
            }
        });
        
        // Check for duplicate mobile numbers across all vendors
        const mobileCounts = {};
        allStaff.forEach(s => {
            if (mobileCounts[s.mobileNo]) {
                mobileCounts[s.mobileNo].push({ vendorId: s.vendorId, fullName: s.fullName });
            } else {
                mobileCounts[s.mobileNo] = [{ vendorId: s.vendorId, fullName: s.fullName }];
            }
        });
        
        Object.keys(mobileCounts).forEach(mobile => {
            if (mobileCounts[mobile].length > 1) {
                debugInfo.duplicateMobiles.push({ mobile, instances: mobileCounts[mobile] });
            }
        });
        
        return NextResponse.json(debugInfo, { status: 200 });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        return NextResponse.json({ 
            message: "Debug endpoint error", 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
}, ['vendor']);

// Clear problematic indexes
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const collection = StaffModel.collection;
        const indexes = await collection.indexes();
        
        // Drop old global unique indexes
        const droppedIndexes = [];
        
        for (const index of indexes) {
            // Drop any index on mobileNo that doesn't include vendorId
            if (index.key.mobileNo === 1 && !index.key.vendorId && index.unique) {
                await collection.dropIndex(index.name);
                droppedIndexes.push(index.name);
            }
        }
        
        return NextResponse.json({ 
            message: "Cleaned up old indexes",
            droppedIndexes 
        }, { status: 200 });
    } catch (error) {
        console.error('Index cleanup error:', error);
        return NextResponse.json({ 
            message: "Index cleanup error", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);