import { NextResponse } from 'next/server';
import ExpenseModel from '@repo/lib/models/Vendor/Expense.model';
import _db from '@repo/lib/db';
import { withSubscriptionCheck } from '@/middlewareCrm';

await _db();

// GET all expenses for a vendor or doctor
export const GET = withSubscriptionCheck(async (req) => {
    try {
        const ownerId = req.user.userId;
        
        console.log(`Fetching expenses for owner: ${ownerId} (Role: ${req.user.role})`);
        
        const expenses = await ExpenseModel.find({ 
            vendorId: ownerId,
            status: 'Active'
        }).sort({ date: -1 });
        
        console.log(`Found ${expenses.length} expense(s).`);
        
        return NextResponse.json(expenses, { status: 200 });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        return NextResponse.json({ message: "Error fetching expenses", error: error.message }, { status: 500 });
    }
}, ['vendor', 'doctor', 'supplier']);

// POST a new expense
export const POST = withSubscriptionCheck(async (req) => {
    try {
        const ownerId = req.user.userId.toString();
        const userType = req.user.role === 'doctor' ? 'Doctor' : req.user.role === 'supplier' ? 'Supplier' : 'Vendor';
        const body = await req.json();
        
        console.log(`Creating expense for owner: ${ownerId} (Type: ${userType})`);
        console.log('Request payload:', body);

        // Validate required fields
        if (!body.expenseType || !body.date || !body.amount || !body.paymentMode) {
            return NextResponse.json({ 
                message: "Missing required fields: expenseType, date, amount, and paymentMode are required" 
            }, { status: 400 });
        }

        // Validate amount
        if (body.amount <= 0) {
            return NextResponse.json({ 
                message: "Amount must be greater than 0" 
            }, { status: 400 });
        }

        // Create new expense
        const newExpense = new ExpenseModel({
            ...body,
            vendorId: ownerId,
            createdBy: userType,
        });

        const savedExpense = await newExpense.save();
        console.log('Expense created successfully:', savedExpense._id);

        return NextResponse.json(savedExpense, { status: 201 });
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ 
            message: "Error creating expense", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor', 'doctor', 'supplier']);

// PUT (Update) an existing expense
export const PUT = withSubscriptionCheck(async (req) => {
    try {
        const ownerId = req.user.userId.toString();
        const body = await req.json();
        
        console.log(`Updating expense for owner: ${ownerId}`);
        console.log('Request payload:', body);

        if (!body._id) {
            return NextResponse.json({ message: "Expense ID is required" }, { status: 400 });
        }

        // Find the expense and verify ownership
        const expense = await ExpenseModel.findOne({ 
            _id: body._id, 
            vendorId: ownerId 
        });

        if (!expense) {
            return NextResponse.json({ 
                message: "Expense not found or you don't have permission to update it" 
            }, { status: 404 });
        }

        // Validate amount if provided
        if (body.amount !== undefined && body.amount <= 0) {
            return NextResponse.json({ 
                message: "Amount must be greater than 0" 
            }, { status: 400 });
        }

        // Update the expense
        const updatedExpense = await ExpenseModel.findByIdAndUpdate(
            body._id,
            { $set: body },
            { new: true, runValidators: true }
        );

        console.log('Expense updated successfully:', updatedExpense._id);

        return NextResponse.json(updatedExpense, { status: 200 });
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ 
            message: "Error updating expense", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor', 'doctor', 'supplier']);

// DELETE an expense (soft delete)
export const DELETE = withSubscriptionCheck(async (req) => {
    try {
        const ownerId = req.user.userId.toString();
        const body = await req.json();
        
        console.log(`Deleting expense for owner: ${ownerId}`);
        console.log('Request payload:', body);

        if (!body.id) {
            return NextResponse.json({ message: "Expense ID is required" }, { status: 400 });
        }

        // Find the expense and verify ownership
        const expense = await ExpenseModel.findOne({ 
            _id: body.id, 
            vendorId: ownerId 
        });

        if (!expense) {
            return NextResponse.json({ 
                message: "Expense not found or you don't have permission to delete it" 
            }, { status: 404 });
        }

        // Soft delete - set status to 'Deleted'
        expense.status = 'Deleted';
        await expense.save();

        console.log('Expense deleted successfully:', expense._id);

        return NextResponse.json({ 
            message: "Expense deleted successfully",
            expense 
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ 
            message: "Error deleting expense", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor', 'doctor', 'supplier']);
