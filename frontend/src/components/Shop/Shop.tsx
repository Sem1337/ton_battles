import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuth } from '../../contexts/AuthContext';
import { authFetch } from '../../utils/auth';
import WebApp from '@twa-dev/sdk';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';

interface ShopItem {
  itemId: number;
  name: string;
  type: number;
  description: string;
  points: number | null;
  gems: number | null;
  stars: number | null;
  TON: number | null;
}

const Shop: React.FC = () => {
  const costTypes = ['points', 'gems', 'stars', 'TON'];
  const [activeTab, setActiveTab] = useState<'boosts' | 'points' | 'gems'>('boosts');
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isBuying, setIsBuying] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const { token } = useAuth();
  const { sendMessage } = useSocket();
  const navigate = useNavigate(); // Get navigate function from useNavigate hook

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/shop/items`, token);
        const data = await response.json();
        setShopItems(data);
      } catch (error) {
        console.error('Error fetching shop items:', error);
      }
    };

    fetchShopItems();
  }, []);

  const openModal = (item: ShopItem) => {
    setSelectedItem(item);
  };

  const closeModal = () => {
    setSelectedItem(null);
  };


  const handleBuy = async (costType: keyof ShopItem) => {
    if (!selectedItem) return;

    setIsBuying(true);
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/buy`, token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: selectedItem.itemId, costType }),
      });
      const data = await response.json();
      if (data.success) {
        switch (costType) {
          case 'stars':
            WebApp.openInvoice(data.invoiceURL);
            break;

          default:
            break;
        }

        console.log('openned invoiceURL');
      } else {
        console.log('Failed to proceed payment.', data.message);
      }
    } catch (error) {
      console.error('Error purchasing item:', error);
    } finally {
      setIsBuying(false);
      sendMessage('UPDATE_POINTS');
      closeModal();
    }
  };

  const filteredItems = shopItems.filter(item => {
    switch (activeTab) {
      case 'boosts':
        return item.type === 1;
      case 'points':
        return item.type === 2;
      case 'gems':
        return item.type === 3;
      default:
        return false;
    }
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-center mb-4">Shop</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Close
        </button>
      </div>
      <div className="flex justify-center space-x-4 mb-8">
        <button onClick={() => setActiveTab('boosts')} className={`py-2 px-4 rounded ${activeTab === 'boosts' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Boosts</button>
        <button onClick={() => setActiveTab('points')} className={`py-2 px-4 rounded ${activeTab === 'points' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Points</button>
        <button onClick={() => setActiveTab('gems')} className={`py-2 px-4 rounded ${activeTab === 'gems' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Gems</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.itemId} className="p-4 bg-white rounded shadow" onClick={() => openModal(item)}>
            <h3 className="text-xl font-bold">{item.name}</h3>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
      {selectedItem && (
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Item Info"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="overlay-custom-style"
        >
          <div className="relative bg-white p-6 rounded shadow-lg max-w-md w-full">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{selectedItem.name}</h2>
            <p className="mb-4">{selectedItem.description}</p>
            <div className="mb-4">
              <p>Cost:</p>
              {Object.entries(selectedItem).filter(([key, value]) => costTypes.includes(key) && value !== null).map(([key, value]) => (
                <p key={key}>{key}: {value}</p>
              ))}
            </div>
            <div className="flex space-x-4">
              {Object.entries(selectedItem).filter(([key, value]) => costTypes.includes(key) && value !== null).map(([key]) => (
                <button
                  key={key}
                  onClick={() => handleBuy(key as keyof ShopItem)}
                  disabled={isBuying}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  {isBuying ? 'Processing...' : `Buy with ${key}`}
                </button>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

Modal.setAppElement('#root'); // To avoid screen readers issues

export default Shop;
