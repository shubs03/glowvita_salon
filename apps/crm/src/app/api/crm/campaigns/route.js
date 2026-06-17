import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import _db from '../../../../../../../packages/lib/src/db.js';
import Campaign from '../../../../../../../packages/lib/src/models/Marketing/Campaign.model.js';
import { authMiddlewareCrm } from '../../../../middlewareCrm.js';
import ClientModel from '@repo/lib/models/Vendor/Client.model';
import UserModel from '@repo/lib/models/user';
import AppointmentModel from '@repo/lib/models/Appointment/Appointment.model';
import VendorModel from '@repo/lib/models/Vendor/Vendor.model';
import SupplierModel from '@repo/lib/models/Vendor/Supplier.model';
import SmsService from '../../../../../../../packages/lib/src/services/SmsService.js';

// Helper function to process campaign SMS sending, deduct balance and actually dispatch SMS
async function processCampaignSMS(campaign, vendorId, userRole) {
  // If campaign does not include SMS, set to Completed and save
  if (!campaign.type.includes('SMS')) {
    campaign.status = 'Completed';
    await campaign.save();
    return;
  }

  // 1. Fetch targeted phone numbers
  const query = { vendorId };
  if (campaign.targetAudience === 'New Customers') {
    query.status = 'New';
  } else if (campaign.targetAudience === 'Returning Customers') {
    query.status = 'Active';
  } else if (campaign.targetAudience === 'Inactive Customers') {
    query.status = 'Inactive';
  } else if (campaign.targetAudience === 'Premium Customers') {
    query.totalBookings = { $gte: 3 };
  }

  // Fetch offline clients
  const offlineClients = await ClientModel.find(query).select('phone').lean();
  let phones = offlineClients.map(c => c.phone).filter(Boolean);

  // Fetch online clients via appointment history
  const appointments = await AppointmentModel.find({
    vendorId,
    client: { $exists: true, $ne: null }
  }).select('client').lean();

  const userIds = [...new Set(appointments.map(appt => appt.client.toString()))];
  if (userIds.length > 0) {
    const onlineUsers = await UserModel.find({ _id: { $in: userIds } }).select('mobileNo').lean();
    const onlinePhones = onlineUsers.map(u => u.mobileNo).filter(Boolean);
    phones = [...new Set([...phones, ...onlinePhones])];
  }

  // If no recipients, mark completed with 0 metrics
  const recipientCount = phones.length;
  if (recipientCount === 0) {
    campaign.status = 'Completed';
    campaign.metrics = {
      messagesSent: 0, delivered: 0, opened: 0, clicked: 0,
      deliveryRate: 100, openRate: 0, clickRate: 0
    };
    await campaign.save();
    return;
  }

  // Calculate message segment cost (160 chars per SMS segment)
  const segments = Math.ceil(campaign.content.length / 160) || 1;
  const totalSmsRequired = recipientCount * segments;

  // 2. Check vendor/supplier SMS balance
  let vendorOrSupplier;
  if (userRole === 'supplier') {
    vendorOrSupplier = await SupplierModel.findById(vendorId);
  } else {
    vendorOrSupplier = await VendorModel.findById(vendorId);
  }

  if (!vendorOrSupplier) throw new Error('Vendor or Supplier not found');

  const currentBalance = vendorOrSupplier.smsBalance || 0;
  if (currentBalance < totalSmsRequired) {
    throw new Error(`Insufficient SMS balance. Required: ${totalSmsRequired}, Available: ${currentBalance}`);
  }

  // 3. Deduct balance before sending
  vendorOrSupplier.smsBalance = Math.max(0, currentBalance - totalSmsRequired);
  await vendorOrSupplier.save();

  // 4. Actually dispatch SMS via Fast2SMS (or mock in dev)
  console.log(`[Campaign SMS] Sending "${campaign.name}" to ${phones.length} recipients...`);
  const smsResult = await SmsService.sendBulkSms(phones, campaign.content);
  console.log(`[Campaign SMS] Gateway result:`, smsResult);

  const sent   = smsResult.sent   ?? (smsResult.success ? totalSmsRequired : 0);
  const failed = smsResult.failed ?? (smsResult.success ? 0 : totalSmsRequired);

  // If SMS gateway failed (non-mock), refund the balance
  if (!smsResult.success && !smsResult.mock) {
    vendorOrSupplier.smsBalance = Math.min(currentBalance, vendorOrSupplier.smsBalance + totalSmsRequired);
    await vendorOrSupplier.save();
    throw new Error(`SMS gateway error: ${smsResult.error || 'Unknown error'}`);
  }

  // 5. Update campaign metrics and mark Completed
  const total = sent + failed;
  campaign.status = 'Completed';
  campaign.metrics = {
    messagesSent: sent,
    delivered:    sent,
    opened:       0,
    clicked:      0,
    deliveryRate: total > 0 ? parseFloat(((sent / total) * 100).toFixed(1)) : 0,
    openRate:     0,
    clickRate:    0
  };
  await campaign.save();
}

// GET: Fetch all campaigns for CRM
export const GET = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received GET /api/crm/campaigns request');
    console.log('Auth context:', ctx);

    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');

    const { searchParams } = new URL(req.url);
    const vendorId = searchParams.get('vendorId') || req.user?.userId;
    const status   = searchParams.get('status');
    const page     = parseInt(searchParams.get('page'))  || 1;
    const limit    = parseInt(searchParams.get('limit')) || 10;

    console.log('Fetching campaigns with filters:', { vendorId, status, page, limit });

    const query = {};
    if (vendorId) {
      query.vendorId = vendorId;
    } else if (req.user?.userId) {
      query.vendorId = req.user.userId;
    }
    if (status) query.status = status;

    const total     = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v');

    console.log(`Found ${campaigns.length} campaigns in database`);

    return NextResponse.json(
      { success: true, data: campaigns, total, page, limit, totalPages: Math.ceil(total / limit) },
      { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store, max-age=0' } }
    );
  } catch (error) {
    console.error('Error in GET /api/crm/campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching campaigns', error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}, ['vendor', 'supplier']);

// POST: Create a new campaign
export const POST = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received POST /api/crm/campaigns request');

    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');

    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    if (!body.name || !body.content || !body.type || body.type.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: name, content, and type are required' },
        { status: 400 }
      );
    }

    if (!req.user?.userId) {
      return NextResponse.json(
        { success: false, message: 'User authentication required: Missing userId in request object' },
        { status: 401 }
      );
    }

    let templateId = null;
    if (body.templateId && body.templateId !== 'null' && body.templateId !== '') {
      if (mongoose.Types.ObjectId.isValid(body.templateId)) {
        templateId = new mongoose.Types.ObjectId(body.templateId);
      } else {
        return NextResponse.json({ success: false, message: 'Invalid template ID format' }, { status: 400 });
      }
    }

    if (!mongoose.Types.ObjectId.isValid(req.user.userId)) {
      return NextResponse.json({ success: false, message: 'Invalid user ID format' }, { status: 400 });
    }

    const campaignData = {
      name:           body.name,
      type:           Array.isArray(body.type) ? body.type : [body.type],
      templateId:     templateId,
      content:        body.content,
      status:         body.status || 'Draft',
      vendorId:       body.vendorId || req.user?.userId,
      createdBy:      req.user?.userId,
      targetAudience: body.targetAudience || 'All Customers',
      scheduledDate:  body.scheduledDate ? new Date(body.scheduledDate) : new Date(),
      budget:         body.budget || 0,
      metrics: { messagesSent: 0, delivered: 0, opened: 0, clicked: 0, deliveryRate: 0, openRate: 0, clickRate: 0 }
    };

    const campaign = await Campaign.create(campaignData);

    if (campaignData.status === 'Active') {
      try {
        await processCampaignSMS(campaign, campaignData.vendorId, req.user?.role);
      } catch (smsError) {
        await Campaign.findByIdAndDelete(campaign._id);
        return NextResponse.json({ success: false, message: smsError.message }, { status: 400 });
      }
    }

    console.log('Campaign created successfully:', campaign);

    return NextResponse.json(
      {
        success: true,
        data:    campaign,
        message: campaignData.status === 'Active' ? 'Campaign launched successfully' : 'Campaign created successfully'
      },
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in POST /api/crm/campaigns:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: validationErrors },
        { status: 400 }
      );
    }
    if (error.code === 11000) {
      return NextResponse.json({ success: false, message: 'A campaign with this name already exists' }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, message: 'Error creating campaign', error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}, ['vendor', 'supplier']);

// PUT: Update an existing campaign
export const PUT = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received PUT /api/crm/campaigns request');

    const db = await _db();
    console.log('Database connection status:', db ? 'Connected' : 'Not connected');

    const body = await req.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ success: false, message: 'Campaign ID is required for update' }, { status: 400 });
    }

    const campaign = await Campaign.findById(_id);
    if (!campaign) {
      return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 });
    }

    if (updateData.status === 'Active' && campaign.status !== 'Active' && campaign.status !== 'Completed') {
      try {
        if (updateData.name)           campaign.name           = updateData.name;
        if (updateData.content)        campaign.content        = updateData.content;
        if (updateData.targetAudience) campaign.targetAudience = updateData.targetAudience;
        campaign.status = 'Active';
        await processCampaignSMS(campaign, campaign.vendorId, req.user?.role);
      } catch (smsError) {
        return NextResponse.json({ success: false, message: smsError.message }, { status: 400 });
      }
    } else {
      Object.assign(campaign, updateData);
      campaign.updatedAt = new Date();
      await campaign.save();
    }

    console.log('Campaign updated successfully:', campaign);

    return NextResponse.json(
      { success: true, data: campaign, message: 'Campaign updated successfully' },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in PUT /api/crm/campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Error updating campaign', error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}, ['vendor', 'supplier']);

// DELETE: Delete a campaign
export const DELETE = authMiddlewareCrm(async (req, ctx) => {
  try {
    console.log('Received DELETE /api/crm/campaigns request');

    const db = await _db();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'Campaign ID is required for deletion' }, { status: 400 });
    }

    const deletedCampaign = await Campaign.findByIdAndDelete(id);
    if (!deletedCampaign) {
      return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Campaign deleted successfully' },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in DELETE /api/crm/campaigns:', error);
    return NextResponse.json(
      { success: false, message: 'Error deleting campaign', error: process.env.NODE_ENV === 'development' ? error.message : undefined },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}, ['vendor', 'supplier']);