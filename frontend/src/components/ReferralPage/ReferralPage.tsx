import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import './ReferralPage.css';
import { useAuth } from '../../contexts/AuthContext';

const ReferralPage: React.FC = () => {
  const [referralLink, setReferralLink] = useState('');
  const [referrals, setReferrals] = useState<{ username: string; date: string }[]>([]);
  const { authFetch } = useAuth();

  useEffect(() => {
    const fetchReferralData = async () => {
      try {
        const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/referrals`);
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
    <div className="referral-page">
      <h2 className="referral-title">Referral Page</h2>
      <p className="referral-info">Get 50000 points and 10 gems for each referral!</p>
      <div className="referral-link-section">
        <label className="referral-label">Your Referral Link:</label>
        <input
          type="text"
          readOnly
          value={referralLink}
          className="referral-input"
        />
        <button
          onClick={handleCopy}
          className="referral-button copy-button"
        >
          Copy
        </button>
        <button
          onClick={handleShare}
          className="referral-button share-button"
        >
          Share
        </button>
      </div>
      <div className="referrals-section">
        <h3 className="referrals-title">Your Referrals</h3>
        <ul className="referrals-list">
          {referrals.map((referral, index) => (
            <li key={index} className="referral-item">
              {referral.username} - {referral.date}
            </li>
          ))}
        </ul>
      </div>
      <Link
        to="/"
        className="back-button"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default ReferralPage;
