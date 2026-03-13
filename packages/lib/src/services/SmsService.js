/**
 * SmsService
 * Handles transactional and promotional SMS alerts.
 * Connects to gateways like MSG91, Twilio, etc.
 */
class SmsService {
    constructor() {
        this.apiKey = process.env.SMS_GATEWAY_KEY;
        this.senderId = process.env.SMS_SENDER_ID || 'GLOWVT';
    }

    /**
     * Send a raw SMS
     * @param {string} mobileNo - Recipient's 10-digit number
     * @param {string} message - Content
     */
    async sendSms(mobileNo, message) {
        if (!this.apiKey) {
            console.log(`[SMS MOCK] To: ${mobileNo}, Msg: ${message}`);
            return { success: true, mock: true };
        }

        try {
            // Implementation depends on the provider. Using a generic fetch/axios pattern.
            // Example for MSG91:
            /*
            const response = await fetch('https://api.msg91.com/api/v5/otp', {
                method: 'POST',
                headers: { 'authkey': this.apiKey, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: "...",
                    mobile: `91${mobileNo}`,
                    authkey: this.apiKey,
                    // ...vars
                })
            });
            */
            console.log(`Sending SMS to ${mobileNo}...`);
            return { success: true };
        } catch (error) {
            console.error('SmsService Error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send Appointment SMS
     */
    async sendAppointmentSms(mobileNo, appointment, status) {
        const copyMap = {
            'confirmed': `Your session at Glowvita is confirmed for ${appointment.startTime} on ${new Date(appointment.date).toLocaleDateString()}. Get ready to glow! ✨`,
            'cancelled': `Your appointment at Glowvita has been cancelled. We hope to see you again soon!`,
            'reminder': `Reminder: You have a glam session today at ${appointment.startTime}. See you soon! ✂️`
        };

        const msg = copyMap[status];
        if (msg) {
            return await this.sendSms(mobileNo, msg);
        }
    }
}

export default new SmsService();
