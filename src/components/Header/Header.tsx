import {TonConnectButton} from "@tonconnect/ui-react";

export const Header = () => {
    return (
        <header style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px'}}>
            <TonConnectButton />
        </header>
    );
  };