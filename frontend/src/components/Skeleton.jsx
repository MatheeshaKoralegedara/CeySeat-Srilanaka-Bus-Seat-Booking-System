import React from 'react';

export function SkeletonBlock({ className = '' }) {
    return <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
            <div className="space-y-2 flex-1">
                <SkeletonBlock className="h-5 w-40" />
                <SkeletonBlock className="h-4 w-56" />
            </div>
            <div className="space-y-2 flex flex-col items-end">
                <SkeletonBlock className="h-7 w-20" />
                <SkeletonBlock className="h-9 w-28 rounded-lg" />
            </div>
        </div>
    );
}

export default SkeletonCard;
