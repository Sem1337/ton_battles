import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useAuthFetch } from '../../utils/auth';
import WebApp from '@twa-dev/sdk';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../contexts/SocketContext';
import { beginCell, toNano } from '@ton/core';
import { useTonConnectUI } from '@tonconnect/ui-react';
import './Shop.css';

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
  const { sendMessage } = useSocket();
  const [tonConnectUI] = useTonConnectUI();
  const navigate = useNavigate(); // Get navigate function from useNavigate hook
  const { authFetch } = useAuthFetch();

  useEffect(() => {
    const fetchShopItems = async () => {
      try {
        const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/shop/items`);
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

  const proceedTonPayment = async (txPayload: string, cost: number) => {
    const body = beginCell()
      .storeUint(0, 32) // write 32 zero bits to indicate that a text comment will follow
      .storeStringTail(txPayload) // write our text comment
      .endCell();
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
      messages: [
        {
          address: 'UQCn0VvM7Rx7t3IJ38RBUnCFEpqUfOval4SJ2mV8HQOV79O3', // replace with your main wallet address
          amount: toNano(cost).toString(),
          payload: body.toBoc().toString("base64")
        }
      ]
    };
    await tonConnectUI.sendTransaction(transaction);
  }

  const handleBuy = async (costType: keyof ShopItem) => {
    if (!selectedItem) return;

    setIsBuying(true);
    try {
      const response = await authFetch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/buy`,{
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
          case 'TON': {
            const txPayload = data.txPayload;
            const cost = data.cost;
            await proceedTonPayment(txPayload, cost);
          }
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
    <div className="shop-container">
      <div className="shop-header">
        <h2 className="shop-title">Shop</h2>
        <button
          onClick={() => navigate('/')}
          className="shop-button close-button"
        >
          Close
        </button>
      </div>
      <div className="shop-tabs">
        <button
          onClick={() => setActiveTab('boosts')}
          className={`shop-tab ${activeTab === 'boosts' ? 'active-tab' : ''}`}
        >
          Boosts
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={`shop-tab ${activeTab === 'points' ? 'active-tab' : ''}`}
        >
          Points
        </button>
        <button
          onClick={() => setActiveTab('gems')}
          className={`shop-tab ${activeTab === 'gems' ? 'active-tab' : ''}`}
        >
          Gems
        </button>
      </div>
      <div className="shop-items">
        {filteredItems.map(item => (
          <div key={item.itemId} className="shop-item" onClick={() => openModal(item)}>
            <h3 className="item-title">{item.name}</h3>
            <p className="item-description">{item.description}</p>
          </div>
        ))}
      </div>
      {selectedItem && (
        <Modal
          isOpen={true}
          onRequestClose={closeModal}
          contentLabel="Item Info"
          className="modal-content"
          overlayClassName="modal-overlay"
        >
          <div className="modal-body">
            <button
              onClick={closeModal}
              className="modal-close-button"
            >
              &times;
            </button>
            <h2 className="modal-title">{selectedItem.name}</h2>
            <p className="modal-description">{selectedItem.description}</p>
            <div className="modal-cost">
              <p>Cost:</p>
              {Object.entries(selectedItem)
                .filter(([key, value]) => costTypes.includes(key) && value !== null)
                .map(([key, value]) => (
                  <p key={key}>{key}: {value}</p>
                ))}
            </div>
            <div className="modal-buttons">
              {Object.entries(selectedItem)
                .filter(([key, value]) => costTypes.includes(key) && value !== null)
                .map(([key]) => (
                  <button
                    key={key}
                    onClick={() => handleBuy(key as keyof ShopItem)}
                    disabled={isBuying}
                    className="modal-button"
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
