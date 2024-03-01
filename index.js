const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());
var global_OTP

const users = [
    { id: 1, name: 'Shannon Pereira', email: 'shannonpereira971@gmail.com', orders: [{ id: 1, status: 'pending' }] },
];

const sendOTP = async (email) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'nithinn9980@gmail.com',
            pass: 'pjiushphjpmtvbob'
        }
    });

    const otp = Math.floor(100000 + Math.random() * 900000);

    const mailOptions = {
        from: 'nithinn9980@gmail.com',
        to: email,
        subject: 'Order Delivery Confirmation OTP',
        text: `Your OTP for order delivery confirmation is: ${otp}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('OTP sent successfully');
        return otp;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
};

app.get('/orders', (req, res) => {
    res.json(users);
});

app.post('/order/:userId/:orderId/deliver', async (req, res) => {
    const { userId, orderId } = req.params;
    const user = users.find(user => user.id == userId);
    if (!user) {
        return res.status(404).send('User not found');
    }

    const order = user.orders.find(order => order.id == orderId);
    if (!order) {
        return res.status(404).send('Order not found');
    }

    if (order.status !== 'delivered') {
        order.status = 'delivered';
        const otp = await sendOTP(user.email);
        global_OTP = otp
        return res.send(`Order delivered. OTP sent to ${user.email} for verification.`);
    } else {
        return res.status(400).send('Order has already been delivered');
    }
});

app.post('/order/:userId/:orderId/verifyotp', (req, res) => {
  const { userId, orderId } = req.params;
  const { otp } = req.body;
  const user = users.find(user => user.id == userId);
  if (!user) {
      return res.status(404).send('User not found');
  }

  const order = user.orders.find(order => order.id == orderId);
  if (!order) {
      return res.status(404).send('Order not found');
  }

  const expectedOTP = global_OTP;
  if (otp === expectedOTP) {
      return res.send('OTP verification successful. Order delivery confirmed.');
  } else {
      return res.status(400).send('Invalid OTP. Order delivery confirmation failed.');
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
