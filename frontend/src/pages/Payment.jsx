import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';

export default function Payment() {
    const { bookingId } = useParams();
    const [hashData, setHashData] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | processing | success | error | dismissed

    useEffect(() => {
        client.post('/payments/hash', { bookingId }).then((res) => setHashData(res.data));
    }, [bookingId]);

    useEffect(() => {
        if (window.payhere) return;
        if (document.getElementById('payhere-sdk')) return;

        const script = document.createElement('script');
        script.id = 'payhere-sdk';
        script.src = 'https://www.payhere.lk/lib/payhere.js';
        document.body.appendChild(script);
    }, []);

    useEffect(() => {
        if (!window.payhere) return;

        window.payhere.onCompleted = function (orderId) {
            setStatus('success');
        };

        window.payhere.onDismissed = function () {
            setStatus('dismissed');
        };

        window.payhere.onError = function (error) {
            setStatus('error');
            console.error('PayHere error:', error);
        };
    }, [hashData]); // re-attach once SDK/hash are ready

    function pay() {
        setStatus('processing');
        window.payhere.startPayment({
            sandbox: true,
            merchant_id: hashData.merchantId,
            notify_url: 'https://earpiece-extinct-bucktooth.ngrok-free.dev/api/payments/notify',
            order_id: hashData.orderId,
            items: 'Bus seat booking',
            amount: hashData.amount,
            currency: hashData.currency,
            first_name: 'Test',
            last_name: 'User',
            email: 'passenger@example.com',
            phone: '0771234567',
            address: 'Colombo',
            city: 'Colombo',
            country: 'Sri Lanka',
            hash: hashData.hash,
        });
    }

    if (!hashData) return <p>Loading payment details...</p>;

    if (status === 'success') {
        return (
            <div>
                <h2>✅ Payment Successful</h2>
                <p>Your seat is confirmed. Booking ID: {bookingId}</p>
            </div>
        );
    }

    if (status === 'dismissed') {
        return (
            <div>
                <p>Payment was cancelled.</p>
                <button onClick={() => setStatus('idle')}>Try Again</button>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div>
                <p style={{ color: 'red' }}>Something went wrong with the payment.</p>
                <button onClick={() => setStatus('idle')}>Try Again</button>
            </div>
        );
    }

    return (
        <div>
            <h2>Pay Rs. {hashData.amount}</h2>
            <button onClick={pay} disabled={status === 'processing'}>
                {status === 'processing' ? 'Processing...' : 'Pay with PayHere'}
            </button>
        </div>
    );
}