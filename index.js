const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

app.post('/api/stkpush', async (req, res) => {
  const { phone, amount } = req.body;

  // Obtain access token
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const tokenResponse = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: { Authorization: `Basic ${auth}` }
  });
  const accessToken = tokenResponse.data.access_token;

  // Prepare STK Push request
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
  const password = Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');

  const stkPushResponse = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phone,
    PartyB: shortCode,
    PhoneNumber: phone,
    CallBackURL: 'https://yourdomain.com/api/callback',
    AccountReference: 'Ref001',
    TransactionDesc: 'Payment Description'
  }, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  res.json({ message: 'Payment request sent. Check your phone to complete the transaction.' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
