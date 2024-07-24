import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authFetch } from '../../utils/auth';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ReferralPage: React.FC = () => {
  const { token } = useAuth();
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<{ username: string; date: string }[]>([]);

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/referrals`, token);
        if (response.ok) {
          const data = await response.json();
          setReferralLink(data.referralLink);
          setReferrals(data.referrals);
        } else {
          console.error('Failed to fetch referral data');
        }
      } catch (error) {
        console.error('Error fetching referral data:', error);
      }
    };

    fetchReferralData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink).then(
      () => toast.success('Referral link copied to clipboard!'),
      (_err) => toast.error('Failed to copy referral link!')
    );
  };

  const handleShare = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(
      'Join me on TON Battles!'
    )}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Referral Page</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Your Referral Link:</label>
        <input
          type="text"
          readOnly
          value={referralLink}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        <button
          onClick={handleCopy}
          className="ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Copy
        </button>
        <button
          onClick={handleShare}
          className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Share
        </button>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Your Referrals</h3>
        <ul className="list-disc list-inside">
          {referrals.map((referral, index) => (
            <li key={index}>
              {referral.username} - {referral.date}
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/"
        className="mt-4 inline-block bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ReferralPage;
