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
                        notification: { 
                            title, 
                            body, 
                            sound: 'default',
                            ...(payload.image && { imageUrl: payload.image }) 
                        },
                        android: {
                            priority: 'high',
                            notification: {
                                sound: 'default',
                                channelId: 'glowvita_alerts',
                                icon: 'notification_icon',
                                color: '#FF0000'
                            }
                        },
                        apns: {
                            payload: {
                                aps: {
                                    sound: 'default',
                                    badge: 1
                                }
                            }
                        },
                        webpush: {
                            headers: {
                                Urgency: 'high'
                            },
                            notification: {
                                icon: '/logo.png',
                                badge: '/badge.png',
                                sound: 'default',
                                vibrate: [300, 100, 400],
                                renormalize: true,
                                requireInteraction: true,
                                actions: [
                                    {
                                        action: 'open',
                                        title: 'View Details'
                                    }
                                ]
                            }
                        },
                        data: { 
                            type: String(type), 
                            click_action: 'FLUTTER_NOTIFICATION_CLICK',
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
            'shipped': {
                title: 'Order Shipped! 🚚',
                body: `Great news! Your order #${order.orderId || order._id} is on its way.`
            },
            'delivered': {
                title: 'Order Delivered! 🎉',
                body: `Your package for order #${order.orderId || order._id} has been delivered.`
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
            'shipped': {
                title: 'Order Shipped 🚚',
                body: `Order #${order.orderId || order._id} has been marked as shipped.`
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
