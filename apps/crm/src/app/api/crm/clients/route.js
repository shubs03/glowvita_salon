import { NextResponse } from 'next/server';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import UserModel from '@repo/lib/models/user';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import _db from '@repo/lib/db';
import { authMiddlewareCrm } from '@/middlewareCrm';
import { uploadBase64, deleteFile } from '@repo/lib/utils/upload';

await _db();

// GET - Fetch all clients for a vendor or a single client by ID
// GET - Fetch all clients for a vendor (both offline and online)
export const GET = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
        const url = new URL(req.url);
        const clientId = url.searchParams.get('id');
        
        // If client ID is provided, fetch single client with all details
        if (clientId) {
            const client = await ClientModel.findOne({ _id: clientId, vendorId }).lean();

            if (!client) {
                return NextResponse.json({ 
                    success: false,
                    message: "Client not found" 
                }, { status: 404 });
            }

            // Ensure birthdayDate is included in the response
            return NextResponse.json({ 
                success: true,
                data: client
            }, { status: 200 });
        }
        
        // Otherwise fetch all clients (existing functionality)
        const searchTerm = url.searchParams.get('search');
        const status = url.searchParams.get('status');
        const limit = parseInt(url.searchParams.get('limit')) || 100;
        const page = parseInt(url.searchParams.get('page')) || 1;
        const skip = (page - 1) * limit;
        const source = url.searchParams.get('source') || 'all'; // 'offline', 'online', or 'all'

        // Fetch offline clients from ClientModel
        if (source === 'offline' || source === 'all') {
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

            // Add source field to identify offline clients
            const clientsWithSource = clients.map(client => ({
                ...client,
                source: 'offline'
            }));

            return NextResponse.json({ 
                success: true,
                data: clientsWithSource,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }, { status: 200 });
        }

        // Fetch online clients (users who booked appointments)
        if (source === 'online') {
            try {
                // Find all unique user IDs who have appointments with this vendor
                const appointments = await AppointmentModel.find({ 
                    vendorId: vendorId,
                    client: { $exists: true, $ne: null }
                }).select('client').lean();
                
                const userIds = [...new Set(appointments.map(appt => appt.client.toString()))];
                
                // Fetch user details for these IDs
                const query = { _id: { $in: userIds } };
                
                if (searchTerm) {
                    query.$or = [
                        { firstName: { $regex: searchTerm, $options: 'i' } },
                        { lastName: { $regex: searchTerm, $options: 'i' } },
                        { emailAddress: { $regex: searchTerm, $options: 'i' } },
                        { mobileNo: { $regex: searchTerm, $options: 'i' } },
                    ];
                }

                const users = await UserModel.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('firstName lastName emailAddress mobileNo createdAt')
                    .lean();

                const total = await UserModel.countDocuments(query);

                // Transform users to match client structure
                const onlineClients = users.map((user) => ({
                    _id: user._id,
                    fullName: `${user.firstName} ${user.lastName}`,
                    email: user.emailAddress,
                    phone: user.mobileNo,
                    birthdayDate: null,
                    gender: 'Other',
                    country: '',
                    occupation: '',
                    profilePicture: '',
                    address: '',
                    lastVisit: user.createdAt,
                    totalBookings: 0, // Will be calculated in frontend
                    totalSpent: 0,    // Will be calculated in frontend
                    status: 'Active',
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    source: 'online'
                }));

                return NextResponse.json({ 
                    success: true,
                    data: onlineClients,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }, { status: 200 });
            } catch (error) {
                console.error('Error fetching online clients:', error);
                return NextResponse.json({ 
                    success: false,
                    message: "Failed to fetch online clients", 
                    error: error.message 
                }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            success: false,
            message: "Invalid source parameter" 
        }, { status: 400 });
    } catch (error) {
        console.error('Error fetching clients:', error);
        return NextResponse.json({ 
            success: false,
            message: "Failed to fetch clients", 
            error: error.message 
        }, { status: 500 });
    }
}, ['vendor', 'supplier']);

// POST - Create a new client
export const POST = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
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

        // Handle profile picture upload if provided
        let profilePictureUrl = body.profilePicture || '';
        if (body.profilePicture) {
            const fileName = `client-${vendorId}-${Date.now()}`;
            const imageUrl = await uploadBase64(body.profilePicture, fileName);
            
            if (!imageUrl) {
                return NextResponse.json(
                    { success: false, message: "Failed to upload profile picture" },
                    { status: 500 }
                );
            }
            
            profilePictureUrl = imageUrl;
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
            profilePicture: profilePictureUrl,
            address: body.address?.trim() || '',
            status: 'New'
        };

        const client = new ClientModel(clientData);
        await client.save();

        // Include all fields in response for view action
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
}, ['vendor', 'supplier']);

// PUT - Update an existing client
export const PUT = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
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

        // Handle profile picture upload if provided
        if (updateData.profilePicture !== undefined) {
            if (updateData.profilePicture) {
                // Upload new image to VPS
                const fileName = `client-${vendorId}-${Date.now()}`;
                const imageUrl = await uploadBase64(updateData.profilePicture, fileName);
                
                if (!imageUrl) {
                    return NextResponse.json(
                        { success: false, message: "Failed to upload profile picture" },
                        { status: 500 }
                    );
                }
                
                // Delete old image from VPS if it exists
                if (client.profilePicture) {
                    await deleteFile(client.profilePicture);
                }
                
                sanitizedUpdateData.profilePicture = imageUrl;
            } else {
                // If image is null/empty, remove it
                sanitizedUpdateData.profilePicture = '';
                
                // Delete old image from VPS if it exists
                if (client.profilePicture) {
                    await deleteFile(client.profilePicture);
                }
            }
        }

        if (updateData.birthdayDate) {
            sanitizedUpdateData.birthdayDate = new Date(updateData.birthdayDate);
        }

        const updatedClient = await ClientModel.findByIdAndUpdate(
            clientId,
            sanitizedUpdateData,
            { new: true, runValidators: true }
        );

        // Include all fields in response for view action
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
}, ['vendor', 'supplier']);

// DELETE - Delete a client
export const DELETE = authMiddlewareCrm(async (req) => {
    try {
        const vendorId = req.user.userId.toString();
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
        
        // Delete profile picture from VPS if it exists
        if (client.profilePicture) {
            await deleteFile(client.profilePicture);
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
}, ['vendor', 'supplier']);