import fetch from 'node-fetch';
import crypto from 'crypto';

/**
 * Get Razorpay Auth Header
 */
export const getRazorpayAuth = (keyId, keySecret) => {
    return 'Basic ' + Buffer.from(keyId + ':' + keySecret).toString('base64');
};

/**
 * Create a Contact in Razorpay
 */
export const createRazorpayContact = async (userData, keyId, keySecret) => {
    try {
        const response = await fetch('https://api.razorpay.com/v1/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getRazorpayAuth(keyId, keySecret)
            },
            body: JSON.stringify({
                name: userData.name,
                email: userData.email,
                contact: userData.phone,
                type: 'customer',
                reference_id: userData.userId.toString()
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error('Razorpay Contact Error:', data.error);
            return null;
        }
        return data.id;
    } catch (error) {
        console.error('Error creating Razorpay contact:', error);
        return null;
    }
};

/**
 * Create a Fund Account in Razorpay
 */
export const createRazorpayFundAccount = async (contactId, bankDetails, keyId, keySecret) => {
    try {
        const body = {
            contact_id: contactId,
            account_type: bankDetails.upiId ? 'vpa' : 'bank_account'
        };

        if (bankDetails.upiId) {
            body.vpa = { address: bankDetails.upiId };
        } else {
            body.bank_account = {
                name: bankDetails.accountHolderName,
                ifsc: bankDetails.ifsc,
                account_number: bankDetails.accountNumber
            };
        }

        const response = await fetch('https://api.razorpay.com/v1/fund_accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getRazorpayAuth(keyId, keySecret)
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        if (data.error) {
            console.error('Razorpay Fund Account Error:', data.error);
            return null;
        }
        return data.id;
    } catch (error) {
        console.error('Error creating Razorpay fund account:', error);
        return null;
    }
};

/**
 * Initiate a Payout in Razorpay
 */
export const initiateRazorpayPayout = async (payoutData, keyId, keySecret) => {
    try {
        const response = await fetch('https://api.razorpay.com/v1/payouts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': getRazorpayAuth(keyId, keySecret)
            },
            body: JSON.stringify({
                account_number: payoutData.razorpayAccountNumber,
                fund_account_id: payoutData.fundAccountId,
                amount: Math.round(payoutData.amount * 100), // convert to paise
                currency: 'INR',
                mode: payoutData.mode || 'IMPS',
                purpose: 'payout',
                queue_if_low_balance: true,
                reference_id: payoutData.referenceId,
                narration: payoutData.narration || 'Wallet Withdrawal'
            })
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error initiating Razorpay payout:', error);
        return { error: { description: 'Network error or internal server error' } };
    }
};
