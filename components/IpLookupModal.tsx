import React, { useState, useEffect } from 'react';
import { IpInfo } from '../types';

interface IpLookupModalProps {
    ip: string | null;
    onClose: () => void;
}

const IpLookupModal: React.FC<IpLookupModalProps> = ({ ip, onClose }) => {
    const [ipData, setIpData] = useState<IpInfo | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ip) {
            setIpData(null);
            return;
        }

        const fetchIpInfo = async () => {
            setIsLoading(true);
            setError(null);
            // In a real app, you would not use this API for high volume, and would hide any API keys.
            // This is a free endpoint with no key required.
            // Avoid looking up private IPs as it will fail.
            const isPrivateIp = /^(?:10|127|172\.(?:16|17|18|19|20|21|22|23|24|25|26|27|28|29|30|31)|192\.168)\./.test(ip);

            if (isPrivateIp) {
                setIpData({
                    status: 'success',
                    query: ip,
                    country: 'Private Network',
                    city: 'N/A',
                    isp: 'Private Range',
                    org: 'LAN/VPC',
                });
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`https://ip-api.com/json/${ip}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data: IpInfo = await response.json();
                if (data.status === 'fail') {
                    throw new Error(data.message || 'Failed to fetch IP information');
                }
                setIpData(data);
            } catch (err: any) {
                setError(err.message || 'An unexpected error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchIpInfo();
    }, [ip]);

    if (!ip) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ip-lookup-title"
        >
            <div 
                className="bg-gray-850 rounded-lg shadow-2xl p-6 w-full max-w-md m-4 border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="ip-lookup-title" className="text-2xl font-bold text-indigo-400">IP Lookup Details</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">&times;</button>
                </div>
                
                <p className="font-mono text-lg bg-gray-900 p-2 rounded-md text-center mb-6">{ip}</p>
                
                {isLoading && <div className="text-center">Loading...</div>}
                {error && <div className="text-center text-red-400 p-3 bg-red-900/50 rounded-md">{error}</div>}
                {ipData && !isLoading && !error && (
                    <div className="space-y-3 text-gray-300">
                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                            <span className="font-semibold text-gray-400">Country:</span>
                            <span>{ipData.country || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                            <span className="font-semibold text-gray-400">City:</span>
                            <span>{ipData.city || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700/50 pb-2">
                            <span className="font-semibold text-gray-400">ISP:</span>
                            <span>{ipData.isp || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-semibold text-gray-400">Organization:</span>
                            <span className="text-right">{ipData.org || 'N/A'}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IpLookupModal;