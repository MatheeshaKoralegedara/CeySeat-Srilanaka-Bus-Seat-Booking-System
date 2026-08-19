import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function VerifyAccount() {
    const { user, verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();

    const [code, setCode] = useState('');
    const [verified, setVerified] = useState(false);
    const [error, setError] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    if (!user) {
        navigate('/login');
        return null;
    }

    async function handleVerify() {
        setError('');
        setVerifying(true);
        try {
            const res = await verifyOtp(user.email, code);
            setVerified(res.data.emailVerified);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not verify code');
        } finally {
            setVerifying(false);
        }
    }

    async function handleResend() {
        setError('');
        setResending(true);
        try {
            await resendOtp(user.email);
        } catch (err) {
            setError(err.response?.data?.error || 'Could not resend code');
        } finally {
            setResending(false);
        }
    }

    return (
        <div className="max-w-sm mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg shadow-brand-900/5 border border-gray-100 dark:border-gray-700 p-8">
                <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1 text-center">Verify your email</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center">
                    We need to confirm your email before you can book a seat.
                </p>

                {verified ? (
                    <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900 rounded-lg px-4 py-3">
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Email verified</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                    </div>
                ) : (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">A 6-digit code was sent to {user.email}</p>
                        <div className="flex gap-2">
                            <input
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                inputMode="numeric"
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 tracking-widest text-center font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                            <button
                                onClick={handleVerify}
                                disabled={verifying || code.length !== 6}
                                className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
                            >
                                {verifying ? 'Checking...' : 'Verify'}
                            </button>
                        </div>
                        <button
                            onClick={handleResend}
                            disabled={resending}
                            className="text-xs font-semibold text-brand-600 dark:text-brand-300 hover:underline mt-2 disabled:text-gray-400"
                        >
                            {resending ? 'Sending...' : 'Resend code'}
                        </button>
                        {error && <p className="text-xs text-red-600 dark:text-red-400 mt-2">{error}</p>}
                    </div>
                )}

                <button
                    onClick={() => navigate('/schedules')}
                    disabled={!verified}
                    className="w-full mt-6 bg-accent-500 hover:bg-accent-600 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-brand-900 font-semibold py-3 rounded-xl transition-colors"
                >
                    {verified ? 'Continue' : 'Verify to continue'}
                </button>
            </div>
        </div>
    );
}
