// frontend/src/components/BalanceInfo/BalanceInfo.tsx

import React, { useEffect, useState } from 'react';

const BalanceInfo = () => {
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    const storedBalance = localStorage.getItem('balance');
    if (storedBalance) {
      setBalance(parseFloat(storedBalance));
    }
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Your balance: ${balance.toFixed(2)}</h2>
    </div>
  );
};

export default BalanceInfo;
