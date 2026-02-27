import { NextResponse } from 'next/server';

/**
 * M-Pesa Daraja API STK Push Integration
 * This endpoint handles:
 * 1. OAuth Token Generation
 * 2. STK Push Request to Safaricom
 */

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_PAYBILL || '174379'; // Test Paybill
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

async function getAccessToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  
  const data = await response.json();
  return data.access_token;
}

export async function POST(req: Request) {
  try {
    const { amount, phone, orderId } = await req.json();

    // 1. Format Phone Number (Ensure it starts with 254)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.startsWith('0')) formattedPhone = '254' + formattedPhone.slice(1);
    if (formattedPhone.startsWith('+')) formattedPhone = formattedPhone.slice(1);
    if (!formattedPhone.startsWith('254')) formattedPhone = '254' + formattedPhone;

    // 2. Generate Access Token
    const accessToken = await getAccessToken();

    // 3. Prepare STK Push Parameters
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const stkBody = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: `Payment for BarPOS Order ${orderId}`
    };

    // 4. Send STK Push
    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stkBody)
    });

    const stkData = await stkResponse.json();

    if (stkData.ResponseCode === "0") {
      return NextResponse.json({ success: true, checkoutRequestId: stkData.CheckoutRequestID });
    } else {
      return NextResponse.json({ success: false, message: stkData.CustomerMessage || 'STK Push failed' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('M-Pesa STK Error:', error);
    return NextResponse.json({ success: false, message: 'Server error processing payment' }, { status: 500 });
  }
}
