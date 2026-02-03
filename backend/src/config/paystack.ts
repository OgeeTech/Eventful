import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

// Base Axios instance for Paystack
export const paystackClient = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
    }
});

// Helper functions
export const initializePayment = async (email: string, amount: number) => {
    const response = await paystackClient.post('/transaction/initialize', {
        email,
        amount: amount * 100, // Paystack expects amount in Kobo (N100 = 10000 kobo)
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
    });
    return response.data.data;
};

export const verifyPayment = async (reference: string) => {
    const response = await paystackClient.get(`/transaction/verify/${reference}`);
    return response.data.data;
};