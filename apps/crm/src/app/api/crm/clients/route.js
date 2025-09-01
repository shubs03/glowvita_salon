import { NextResponse } from 'next/server';
import ClientModel from '../../../../../../../packages/lib/src/models/Vendor/Client.model.js';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm.js';

await _db();

// GET - Fetch all clients for a vendor
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id.toString();
        const url = new URL(req.url);
        const searchTerm = url.searchParams.get('search');
        const status = url.searchParams.get('status');
        const limit = parseInt(url.searchParams.get('limit')) || 100;
        const page = parseInt(url.searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;

        const query = { vendorId };
        
        if (status && status !== 'all') {
            query.status = status;
        }
        
        if (searchTerm) {
            query.$or = [
                { fullName: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { phone: { $regex: searchTerm, $options: 'i' } },
            ];
        }

        const clients = await ClientModel.find(query)
            .sort({ lastVisit: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-emergencyContact -socialMediaLinks -tags -notes')
            .lean();

        const total = await ClientModel.countDocuments(query);

        return NextResponse.json({ 
            success: true,
            data: clients,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ 
            success: false,
            message: "Failed to fetch clients", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// POST - Create a new client
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id.toString();
        const body = await req.json();

        // Validate required fields
        const requiredFields = ['fullName', 'email', 'phone'];
        for (const field of requiredFields) {
            if (!body[field]) {
                return NextResponse.json({ 
                    success: false,
                    message: `${field} is required` 
                }, { status: 400 });
            }
        }

        // Check for existing client with same email or phone
        const existingClient = await ClientModel.findOne({
            vendorId,
            $or: [
                { email: body.email.toLowerCase() },
                { phone: body.phone }
            ]
        });

        if (existingClient) {
            const conflictField = existingClient.email === body.email.toLowerCase() ? 'email' : 'phone';
            return NextResponse.json({ 
                success: false,
                message: `Client with this ${conflictField} already exists` 
            }, { status: 409 });
        }

        // Create client data
        const clientData = {
            vendorId,
            fullName: body.fullName.trim(),
            email: body.email.toLowerCase().trim(),
            phone: body.phone.trim(),
            birthdayDate: body.birthdayDate ? new Date(body.birthdayDate) : null,
            gender: body.gender || 'Other',
            country: body.country?.trim() || '',
            occupation: body.occupation?.trim() || '',
            profilePicture: body.profilePicture || '',
            address: body.address?.trim() || '',
            status: 'New'
        };

        const client = new ClientModel(clientData);
        await client.save();

        // Exclude removed fields from response
        const clientResponse = client.toObject();
        delete clientResponse.emergencyContact;
        delete clientResponse.socialMediaLinks;
        delete clientResponse.tags;
        delete clientResponse.notes;
        delete clientResponse.searchText;

        return NextResponse.json({ 
            success: true,
            message: "Client created successfully",
            data: clientResponse 
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating client:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false,
                message: `Client with this ${field} already exists` 
            }, { status: 409 });
        }
        
        return NextResponse.json({ 
            success: false,
            message: "Failed to create client", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// PUT - Update an existing client
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id.toString();
        const body = await req.json();
        const { _id: clientId, ...updateData } = body;

        if (!clientId) {
            return NextResponse.json({ 
                success: false,
                message: "Client ID is required" 
            }, { status: 400 });
        }

        // Find the client and verify ownership
        const client = await ClientModel.findOne({ _id: clientId, vendorId });
        if (!client) {
            return NextResponse.json({ 
                success: false,
                message: "Client not found" 
            }, { status: 404 });
        }

        // Check for conflicts if email or phone is being updated
        if (updateData.email || updateData.phone) {
            const conflictQuery = {
                vendorId,
                _id: { $ne: clientId }
            };

            const orConditions = [];
            if (updateData.email) {
                orConditions.push({ email: updateData.email.toLowerCase() });
            }
            if (updateData.phone) {
                orConditions.push({ phone: updateData.phone });
            }

            if (orConditions.length > 0) {
                conflictQuery.$or = orConditions;
                const existingClient = await ClientModel.findOne(conflictQuery);
                
                if (existingClient) {
                    const conflictField = existingClient.email === updateData.email?.toLowerCase() ? 'email' : 'phone';
                    return NextResponse.json({ 
                        success: false,
                        message: `Another client with this ${conflictField} already exists` 
                    }, { status: 409 });
                }
            }
        }

        // Prepare update data
        const sanitizedUpdateData = {};
        const allowedFields = [
            'fullName', 'email', 'phone', 'birthdayDate', 'gender', 
            'country', 'occupation', 'profilePicture', 'address', 
            'status'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (field === 'email') {
                    sanitizedUpdateData[field] = updateData[field].toLowerCase().trim();
                } else if (typeof updateData[field] === 'string') {
                    sanitizedUpdateData[field] = updateData[field].trim();
                } else {
                    sanitizedUpdateData[field] = updateData[field];
                }
            }
        });

        if (updateData.birthdayDate) {
            sanitizedUpdateData.birthdayDate = new Date(updateData.birthdayDate);
        }

        const updatedClient = await ClientModel.findByIdAndUpdate(
            clientId,
            sanitizedUpdateData,
            { new: true, runValidators: true }
        );

        // Exclude removed fields from response
        const clientResponse = updatedClient.toObject();
        delete clientResponse.emergencyContact;
        delete clientResponse.socialMediaLinks;
        delete clientResponse.tags;
        delete clientResponse.notes;
        delete clientResponse.searchText;

        return NextResponse.json({ 
            success: true,
            message: "Client updated successfully",
            data: clientResponse
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating client:', error);
        
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return NextResponse.json({ 
                success: false,
                message: `Another client with this ${field} already exists` 
            }, { status: 409 });
        }
        
        return NextResponse.json({ 
            success: false,
            message: "Failed to update client", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);

// DELETE - Delete a client
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user._id.toString();
        const body = await req.json();
        const { id: clientId } = body;

        if (!clientId) {
            return NextResponse.json({ 
                success: false,
                message: "Client ID is required" 
            }, { status: 400 });
        }

        const client = await ClientModel.findOneAndDelete({ 
            _id: clientId, 
            vendorId 
        });

        if (!client) {
            return NextResponse.json({ 
                success: false,
                message: "Client not found" 
            }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true,
            message: "Client deleted successfully" 
        }, { status: 200 });
    } catch (error) {
        console.error('Error deleting client:', error);
        return NextResponse.json({ 
            success: false,
            message: "Failed to delete client", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor']);