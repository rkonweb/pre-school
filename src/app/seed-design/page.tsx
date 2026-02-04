'use client';

import { useState } from 'react';
import { seedDesignAction } from '../actions/seed-action';

export default function SeedPage() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSeed = async () => {
        setStatus('loading');
        try {
            const result = await seedDesignAction();
            if (result.success) {
                setStatus('success');
                setMessage('✅ Update Successful! Refresh the homepage to see the new design.');
            } else {
                setStatus('error');
                setMessage(`❌ Error: ${result.error}`);
            }
        } catch (e) {
            setStatus('error');
            setMessage('❌ Unexpected error occurred.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
                <div className="h-16 w-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto text-2xl">
                    🌊
                </div>

                <h1 className="text-2xl font-bold text-gray-900">Update Live Design</h1>
                <p className="text-gray-600">
                    Click below to update the database with the "Refreshing Summer Fun" content.
                </p>

                {status === 'idle' && (
                    <button
                        onClick={handleSeed}
                        className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-lg transition-colors shadow-md"
                    >
                        Update Now
                    </button>
                )}

                {status === 'loading' && (
                    <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                )}

                {status === 'success' && (
                    <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                        {message}
                        <div className="mt-4">
                            <a href="/" className="text-sm font-bold underline hover:text-green-800">
                                Go to Homepage →
                            </a>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-sm break-words">
                        {message}
                        <button
                            onClick={() => setStatus('idle')}
                            className="mt-2 text-xs underline"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
