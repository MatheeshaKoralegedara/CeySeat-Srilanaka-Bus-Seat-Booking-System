import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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

        window.payhere.onCompleted = function () {
            setStatus('success');
        };
        window.payhere.onDismissed = function () {
            setStatus('dismissed');
        };
        window.payhere.onError = function (error) {
            setStatus('error');
            console.error('PayHere error:', error);
        };
    }, [hashData]);

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

    if (!hashData) {
        return (
            <div className="max-w-md mx-auto text-center py-16 text-gray-400">
                Loading payment details...
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-3xl mx-auto mb-4">
                    ✓
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful</h1>
                <p className="text-gray-500 mb-8">Your seat is confirmed. Safe travels!</p>
                <Link
                    to="/schedules"
                    className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                    Back to Buses
                </Link>
            </div>
        );
    }

    if (status === 'dismissed' || status === 'error') {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-4">
                    ✕
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {status === 'dismissed' ? 'Payment Cancelled' : 'Something Went Wrong'}
                </h1>
                <p className="text-gray-500 mb-8">
                    {status === 'dismissed'
                        ? 'You closed the payment window before completing checkout.'
                        : 'Your payment could not be processed. Please try again.'}
                </p>
                <button
                    onClick={() => setStatus('idle')}
                    className="bg-accent-500 hover:bg-accent-600 text-brand-900 font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                <p className="text-gray-500 text-sm mb-1">Total amount</p>
                <p className="text-4xl font-bold text-brand-700 mb-8">Rs. {hashData.amount}</p>

                <button
                    onClick={pay}
                    disabled={status === 'processing'}
                    className="w-full bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 text-brand-900 font-semibold py-4 rounded-xl transition-colors"
                >
                    {status === 'processing' ? 'Processing...' : 'Pay with PayHere'}
                </button>

                <p className="text-xs text-gray-400 mt-4">
                    Secure payment powered by PayHere
                </p>
            </div>
        </div>
    );
}