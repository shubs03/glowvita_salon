import admin from 'firebase-admin';
import _db from '../db.js';
import UserModel from '../models/user/User.model.js';
import VendorModel from '../models/Vendor/Vendor.model.js';
import DoctorModel from '../models/Vendor/Docters.model.js';
import SupplierModel from '../models/Vendor/Supplier.model.js';
import AdminModel from '../models/admin/AdminUser.model.js';
import StaffModel from '../models/Vendor/Staff.model.js';
import NotificationModel from '../models/Notification.model.js';
import { FIREBASE_SERVICE_ACCOUNT } from '@repo/config/config';
import { sendEmail } from '../emailService.js';
import SmsService from './SmsService.js';

/**
 * NotificationService
 * Optimized for Instant Delivery across Web and Mobile.
 */
class NotificationService {
    constructor() {
        this.initialize();
    }

    initialize() {
        if (!admin.apps.length) {
            try {
                if (!FIREBASE_SERVICE_ACCOUNT) {
                    console.warn('FIREBASE_SERVICE_ACCOUNT environment variable is missing.');
                    return;
                }

                let serviceAccount;
                try {
                    serviceAccount = typeof FIREBASE_SERVICE_ACCOUNT === 'string' 
                        ? JSON.parse(FIREBASE_SERVICE_ACCOUNT) 
                        : FIREBASE_SERVICE_ACCOUNT;
                } catch (parseError) {
                    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT. Ensure it is a valid JSON string.');
                    return;
                }
                
                if (serviceAccount && serviceAccount.project_id) {
                    admin.initializeApp({
                        credential: admin.credential.cert(serviceAccount)
                    });
                    console.log('Firebase Admin initialized successfully for project:', serviceAccount.project_id);
                } else {
                    console.warn('Firebase Service Account is invalid or missing project_id. Push notifications will not be sent.');
                }
            } catch (error) {
                console.error('Error during Firebase Admin initialization:', error);
            }
        }
    }

    /**
     * Send a notification to a specific user (Client or Vendor)
     * @param {string} userId - Mongo ID of the user
     * @param {string} userType - 'client' | 'vendor'
     * @param {Object} payload - { title, body, data, image }
     * @param {string} priority - 'high' | 'normal'
     */
    async sendToUser(userId, userType, payload, priority = 'high') {
        try {
            await _db();
            
            const title = payload.title || 'GlowVita Alert';
            const body = payload.body || payload.message || '';
            const type = payload.type || 'system';

            // Save to database first so the user has history even if push fails
            const savedNotification = await NotificationModel.create({
                recipient: userId,
                recipientRole: userType,
                title: title,
                body: body,
                type: type,
                data: payload.data || {},
                isRead: false
            });

            const roleToModel = {
                'client': UserModel,
                'vendor': VendorModel,
                'doctor': DoctorModel,
                'supplier': SupplierModel,
                'staff': StaffModel,
                'admin': AdminModel
            };

            const Model = roleToModel[userType];
            if (!Model) {
                console.error(`Invalid userType: ${userType}`);
                return;
            }

            const user = await Model.findById(userId).select('fcmTokens notificationPreferences email emailAddress mobileNo phone');

            if (!user) {
                console.warn(`[NotificationService] Recipient not found: ID=${userId}, Role=${userType}. Skipping notification.`);
                return;
            }

            const requestedChannels = payload.channels || ['Push'];

            // 1. Handle Push Notification
            if (requestedChannels.includes('Push') || requestedChannels.includes('Notification')) {
                if (!user.fcmTokens || user.fcmTokens.length === 0) {
                    console.log(`[NotificationService] No FCM tokens for ${userType} ${userId}.`);
                } else if (user.notificationPreferences && !user.notificationPreferences.pushEnabled) {
                    console.log(`Push notifications disabled for user: ${userId}`);
                } else {
                    const messagePayload = {
                        notification: (userType === 'client' || userType === 'vendor' || userType === 'staff' || userType === 'admin') ? undefined : { 
                            title, 
                            body, 
                            sound: 'default',
                            ...(payload.image && { imageUrl: payload.image }) 
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                title,
                                body,
                                sound: 'default',
                                channelId: 'glowvita_alerts',
                                icon: 'notification_icon',
                                color: '#FF0000',
                                ...(payload.image && { imageUrl: payload.image }) 
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    alert: { title, body },
                                    sound: 'default',
                                    badge: 1
                                }
                            }
                        },
                        webpush: {
                            headers: {
                                Urgency: 'high'
                            },
                            // IMPORTANT: No top-level notification block for WebPush
                            // This ensures onMessage and onBackgroundMessage fire reliably
                            data: {
                                title: String(title),
                                body: String(body),
                                type: String(type),
                                play_sound: "true",
                                ...(payload.data ? Object.keys(payload.data).reduce((acc, k) => ({ ...acc, [k]: String(payload.data[k]) }), {}) : {})
                            }
                        },
                        data: { 
                            title: String(title),
                            body: String(body),
                            type: String(type), 
                            click_action: 'FLUTTER_NOTIFICATION_CLICK',
                            play_sound: "true",
                            ...(payload.data ? Object.keys(payload.data).reduce((acc, k) => ({ ...acc, [k]: String(payload.data[k]) }), {}) : {})
                        },
                        tokens: user.fcmTokens,
                    };
                    try {
                        const response = await admin.messaging().sendEachForMulticast(messagePayload);
                        console.log(`FCM Result: ${response.successCount} success, ${response.failureCount} failure`);
                        if (response.failureCount > 0) {
                            const failedTokens = response.responses
                                .map((resp, idx) => (!resp.success && (resp.error?.code === 'messaging/invalid-registration-token' || resp.error?.code === 'messaging/registration-token-not-registered') ? user.fcmTokens[idx] : null))
                                .filter(Boolean);
                            if (failedTokens.length > 0) {
                                await Model.findByIdAndUpdate(userId, { $pull: { fcmTokens: { $in: failedTokens } } });
                            }
                        }
                    } catch (err) { console.error('FCM Send Error:', err); }
                }
            }

            // 2. Handle Email
            if (requestedChannels.includes('Email')) {
                const recipientEmail = user.emailAddress || user.email;
                if (recipientEmail) {
                    try {
                        await sendEmail({
                            to: recipientEmail,
                            subject: title,
                            text: body,
                            html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
                                    <h2 style="color: #333;">${title}</h2>
                                    <p style="color: #555; line-height: 1.5;">${body}</p>
                                   </div>`
                        });
                        console.log(`Email sent to ${recipientEmail}`);
                    } catch (err) { console.error('Email Send Error:', err); }
                } else {
                    console.warn(`No email found for ${userType} ${userId}`);
                }
            }

            // 3. Handle SMS
            if (requestedChannels.includes('SMS')) {
                const recipientPhone = user.mobileNo || user.phone;
                if (recipientPhone) {
                    try {
                        await SmsService.sendSms(recipientPhone, `${title}: ${body}`);
                        console.log(`SMS sent to ${recipientPhone}`);
                    } catch (err) { console.error('SMS Send Error:', err); }
                } else {
                    console.warn(`No phone number found for ${userType} ${userId}`);
                }
            }

        } catch (error) {
            console.error('NotificationService.sendToUser Error:', error);
        }
    }

    /**
     * Send instant appointment update
     */
    async sendAppointmentAlert(userId, recipientRole, appointment, status) {
        const isVendor = recipientRole !== 'client';
        
        const clientCopyMap = {
            'scheduled': {
                title: 'New Request! 💇‍♀️',
                body: `Your booking for ${appointment.serviceName} is being reviewed.`
            },
            'confirmed': {
                title: 'It\'s a date! ✨',
                body: `Your appointment at ${appointment.vendorName || 'the salon'} is confirmed for ${appointment.startTime}.`
            },
            'completed': {
                title: 'You look stunning! 💅',
                body: 'Hope you loved your session. Don\'t forget to leave a review!'
            },
            'cancelled': {
                title: 'Booking Cancelled 🔄',
                body: 'Your appointment has been cancelled. Tap to re-book.'
            },
            'reminder': {
                title: 'See you today! ✂️',
                body: `Just a reminder of your appointment today at ${appointment.startTime}.`
            }
        };

        const vendorCopyMap = {
            'confirmed': {
                title: 'New Booking! 📅',
                body: `New appointment from ${appointment.clientName || 'a customer'} for ${appointment.serviceName} at ${appointment.startTime}.`
            },
            'cancelled': {
                title: 'Appointment Cancelled ⚠️',
                body: `Appointment for ${appointment.clientName || 'a customer'} at ${appointment.startTime} has been cancelled.`
            },
            'reminder': {
                title: 'Busy Day Ahead! 👔',
                body: `You have an appointment with ${appointment.clientName || 'a customer'} today at ${appointment.startTime}.`
            }
        };

        const copyMap = isVendor ? vendorCopyMap : clientCopyMap;
        const copy = copyMap[status] || { title: 'Update', body: `Appointment status shifted to ${status}: ${appointment.serviceName}` };

        await this.sendToUser(userId, recipientRole, {
            ...copy,
            type: 'appointment',
            data: {
                type: 'appointment_update',
                appointmentId: appointment._id.toString(),
                status: status
            }
        });
    }

    /**
     * Send consultation related notifications
     */
    async sendConsultationAlert(userId, recipientRole, consultation, status) {
        const isClient = recipientRole === 'client';
        
        const clientTitle = status === 'cancelled' ? 'Consultation Cancelled ❌' : 'Consultation Booked! 🩺';
        const clientBody = status === 'cancelled' 
            ? `Your consultation with ${consultation.doctorName || 'Doctor'} on ${new Date(consultation.appointmentDate).toLocaleDateString()} at ${consultation.appointmentTime} has been cancelled.`
            : `Your consultation with ${consultation.doctorName || 'Doctor'} is scheduled for ${new Date(consultation.appointmentDate).toLocaleDateString()} at ${consultation.appointmentTime}.`;

        const doctorTitle = status === 'cancelled' ? 'Consultation Cancelled 🔄' : 'New Consultation Booked! 🩺';
        const doctorBody = status === 'cancelled'
            ? `Consultation with ${consultation.patientName} on ${new Date(consultation.appointmentDate).toLocaleDateString()} was cancelled.`
            : `You have a new consultation with ${consultation.patientName} on ${new Date(consultation.appointmentDate).toLocaleDateString()} at ${consultation.appointmentTime}.`;

        await this.sendToUser(userId, recipientRole, {
            title: isClient ? clientTitle : doctorTitle,
            body: isClient ? clientBody : doctorBody,
            type: 'appointment',
            data: {
                type: 'consultation_update',
                consultationId: consultation._id.toString(),
                status: status
            }
        });
    }

    /**
     * Send order related notifications
     */
    async sendOrderAlert(userId, recipientRole, order, status) {
        const isClient = recipientRole === 'client';
        
        const clientCopyMap = {
            'placed': {
                title: 'Order Placed! 📦',
                body: `Your order #${order.orderId || order._id} has been received and is being processed.`
            },
            'confirmed': {
                title: 'Order Confirmed! ✅',
                body: `Your order #${order.orderId || order._id} has been confirmed and will be dispatched soon.`
            },
            'shipped': {
                title: 'Order Dispatched! 🚚',
                body: `Great news! Your order #${order.orderId || order._id} has been dispatched.`
            },
            'delivered': {
                title: 'Order Delivered! 🎉',
                body: `Your package for order #${order.orderId || order._id} has been delivered and received.`
            },
            'cancelled': {
                title: 'Order Cancelled ❌',
                body: `Your order #${order.orderId || order._id} has been cancelled.`
            }
        };

        const vendorCopyMap = {
            'placed': {
                title: 'New Order Received! 🛍️',
                body: `You have a new order #${order.orderId || order._id}. check it in your dashboard.`
            },
            'confirmed': {
                title: 'Order Confirmed ✅',
                body: `Order #${order.orderId || order._id} has been confirmed.`
            },
            'shipped': {
                title: 'Order Dispatched! 🚚',
                body: `Order #${order.orderId || order._id} has been marked as dispatched.`
            },
            'delivered': {
                title: 'Order Delivered 🎉',
                body: `Order #${order.orderId || order._id} status is now delivered.`
            },
            'cancelled': {
                title: 'Order Cancelled 🔄',
                body: `Order #${order.orderId || order._id} was cancelled.`
            }
        };

        const copyMap = isClient ? clientCopyMap : vendorCopyMap;
        const copy = copyMap[status] || { title: 'Order Update', body: `Status for order #${order._id} updated to ${status}` };

        await this.sendToUser(userId, recipientRole, {
            ...copy,
            type: 'order',
            data: {
                type: 'order_update',
                orderId: order._id.toString(),
                status: status
            }
        });
    }

    /**
     * Send referral related notifications
     */
    async sendReferralAlert(userId, recipientRole, data) {
        const { referrerName, rewardAmount, status } = data;
        
        const copyMap = {
            'pending': {
                title: 'Referral Linked! 🤝',
                body: `You've been successfully referred by ${referrerName}. complete your first purchase to unlock rewards!`
            },
            'completed': {
                title: 'Bonus Received! 💸',
                body: `Congratulations! Your referral bonus of ₹${rewardAmount} has been credited to your account.`
            },
            'new_referral': {
                title: 'New Referral! 🌟',
                body: `Your friend has joined using your code. You'll get ₹${rewardAmount} once they complete their first order.`
            }
        };

        const copy = copyMap[status];
        if (!copy) return;

        await this.sendToUser(userId, recipientRole, {
            ...copy,
            type: 'referral',
            data: { type: 'referral_update', status }
        });
    }

    /**
     * Send registration confirmation alerts
     */
    async sendRegistrationAlert(userId, recipientRole, data) {
        const { name, role } = data;
        
        await this.sendToUser(userId, recipientRole, {
            title: 'Welcome to GlowVita! ✨',
            body: `Hello ${name}, your registration as a ${role} has been successful. Welcome aboard!`,
            type: 'welcome',
            data: { type: 'welcome', role }
        });
    }

    /**
     * Send offer and promotion alerts
     */
    async sendOfferAlert(userId, recipientRole, offer) {
        await this.sendToUser(userId, recipientRole, {
            title: offer.title || `New Offer: ${offer.code || 'Special'} 🎁`,
            body: offer.message || offer.description || `Claim your ${offer.value || offer.discountValue}${ (offer.type || offer.discountType) === 'percentage' ? '%' : ' OFF'} now!`,
            type: 'offer',
            data: { 
                type: 'offer', 
                offerId: offer._id?.toString(),
                code: offer.code || offer.offerCode 
            }
        });
    }

    /**
     * Send offer expiry reminders
     */
    async sendOfferReminder(userId, recipientRole, offer) {
        await this.sendToUser(userId, recipientRole, {
            title: `Ending Soon: ${offer.code || 'Offer'} ⏳`,
            body: `Don't miss out! Your offer ${offer.code || ''} is about to expire. Use it today!`,
            type: 'offer',
            data: { 
                type: 'offer_reminder', 
                offerId: offer._id?.toString(),
                code: offer.code 
            }
        });
    }

    /**
     * Send inactivity reminders
     */
    async sendInactivityReminder(userId, recipientRole, data) {
        await this.sendToUser(userId, recipientRole, {
            title: 'We Miss You! ❤️',
            body: `Hey ${data.name || 'friend'}, it's been a while since your last visit. We have some special offers just for you!`,
            type: 'system',
            data: { type: 're-engagement' }
        });
    }

    /**
     * Send account approval alert
     */
    async sendApprovalAlert(userId, role, status, message = '') {
        const isApproved = status.toLowerCase() === 'approved';
        const title = isApproved ? 'Account Approved! 🎉' : 'Account Update 📋';
        const body = message || (isApproved 
            ? `Congratulations! Your account with GlowVita has been approved. You can now access all features.`
            : `There is an update regarding your account status: ${status}.`);

        await this.sendToUser(userId, role, {
            title,
            body,
            type: 'system',
            data: { type: 'approval_update', status }
        });
    }

    /**
     * Send document approval alert
     */
    async sendDocumentAlert(userId, role, documentName, status, reason = '') {
        const isApproved = status.toLowerCase() === 'approved';
        const title = isApproved ? 'Document Approved! ✅' : 'Document Rejected! ❌';
        let body = `Your ${documentName} has been ${status}.`;
        if (!isApproved && reason) body += ` Reason: ${reason}`;

        await this.sendToUser(userId, role, {
            title,
            body,
            type: 'system',
            data: { type: 'document_update', documentName, status }
        });
    }

    /**
     * Send marketplace order notification (Vendor <-> Supplier)
     */
    async sendMarketplaceOrderAlert(userId, role, order, status) {
        const copyMap = {
            'placed': {
                title: 'New Marketplace Order! 📦',
                body: `A new order #${order.orderId || order._id} has been placed.`
            },
            'confirmed': {
                title: 'Marketplace Order Confirmed! ✅',
                body: `Order #${order.orderId || order._id} has been confirmed.`
            },
            'shipped': {
                title: 'Marketplace Order Dispatched! 🚚',
                body: `Order #${order.orderId || order._id} is on its way.`
            },
            'delivered': {
                title: 'Marketplace Order Delivered! 🎉',
                body: `Order #${order.orderId || order._id} has been successfully delivered.`
            }
        };

        const copy = copyMap[status] || { title: 'Marketplace Update', body: `Order #${order.orderId || order._id} status is now ${status}.` };

        await this.sendToUser(userId, role, {
            ...copy,
            type: 'order',
            data: { type: 'marketplace_order', orderId: order._id.toString(), status }
        });
    }

    /**
     * Send subscription related notifications
     */
    async sendSubscriptionAlert(userId, role, planName, daysLeft) {
        const title = daysLeft <= 0 ? 'Subscription Expired! ⚠️' : 'Subscription Ending Soon! ⏳';
        const body = daysLeft <= 0 
            ? `Your ${planName} has expired. Please renew to continue using GlowVita services.`
            : `Your ${planName} will expire in ${daysLeft} days. Renew now to avoid interruption.`;

        await this.sendToUser(userId, role, {
            title,
            body,
            type: 'system',
            data: { type: 'subscription_expiry', planName, daysLeft }
        });
    }

    /**
     * Send settlement notification
     */
    async sendSettlementAlert(userId, role, amount, status) {
        const title = 'Settlement Update 💰';
        const body = `Your settlement of ₹${amount} has been ${status}.`;

        await this.sendToUser(userId, role, {
            title,
            body,
            type: 'system',
            data: { type: 'settlement_update', amount, status }
        });
    }

    /**
     * Send admin alerts for new registrations
     */
    async sendAdminAlert(action, details) {
        // Find all super admins to notify
        try {
            const admins = await AdminModel.find({ roleName: 'SUPER_ADMIN' }).select('_id');
            const adminIds = admins.map(a => a._id.toString());
            
            if (adminIds.length > 0) {
                await this.sendMassNotification(adminIds, 'admin', {
                    title: `Admin Alert: ${action} 🔔`,
                    body: details,
                    type: 'system',
                    data: { type: 'admin_alert', action }
                });
            }
        } catch (err) {
            console.error('Admin Alert Error:', err);
        }
    }

    /**
     * Send mass notification to selected people (Admin/CRM feature)
     */
    async sendMassNotification(userIds, recipientRole, payload) {
        console.log(`Mass Notification: Sending to ${userIds.length} ${recipientRole}s via [${(payload.channels || ['Push']).join(', ')}]`);
        
        // Ensure initialized
        if (!admin.apps.length) this.initialize();

        // Limit concurrent sends to avoid overwhelming the server or hitting limits
        const batchSize = 10;
        const results = [];
        
        for (let i = 0; i < userIds.length; i += batchSize) {
            const batch = userIds.slice(i, i + batchSize);
            console.log(`[NotificationService] Sending batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(userIds.length/batchSize)}`);
            
            const batchPromises = batch.map(userId => 
                this.sendToUser(userId, recipientRole, payload)
            );
            const batchResults = await Promise.allSettled(batchPromises);
            results.push(...batchResults);

            // Add a small delay between batches to respect SMTP rate limits
            if (i + batchSize < userIds.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`[NotificationService] Mass send completed. Successes: ${results.filter(r => r.status === 'fulfilled').length}, Failures: ${results.filter(r => r.status === 'rejected').length}`);
        return results;
    }

    /**
     * Broadcast to a topic (Promotional)
     */
    async broadcast(topic, payload) {
        // Implement topic-based broadcast for marketing
        const message = {
            topic: topic,
            notification: {
                title: payload.title,
                body: payload.body || payload.message || ''
            },
            data: payload.data,
        };

        try {
            await admin.messaging().send(message);
            console.log(`Broadcast sent to topic: ${topic}`);
        } catch (error) {
            console.error('Broadcast Error:', error);
        }
    }
}

export default new NotificationService();
