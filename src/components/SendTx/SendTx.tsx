import { useIsConnectionRestored, useTonConnectUI, useTonWallet } from "@tonconnect/ui-react"
import { useState } from "react";

export const SendTx = () => {
    const isConnectionRestored = useIsConnectionRestored();
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [txInProgress, setTxInProgress] = useState(false);

    let content: string;
    switch (true) {
        case !isConnectionRestored:
            content = 'Loading...';
            break;
        case !!wallet:
            content = 'Send transaction';
            break;
        case txInProgress:
            content = 'Tx in progress';
            break;
        case !wallet:
        default:
            content = 'Connect Wallet';
            break;
    }

    const onClick = () => {
        if (!wallet) {
            tonConnectUI.openModal();
        } else {
            setTxInProgress(true);
            try {
                await tonConnectUI.sendTransaction({
                    validUntil: Math.floor(Date.now() / 1000) + 360,
                    messages: [
                        {
                            amount: '1000000',
                            address: 'UQCuzcR3-BXHkYHk7mN5ghbsUAX74mj-6BLn0wzvvXKHLXKx'
                        }
                    ]
                });
            } catch (e) {
                console.log(e);
            }
            setTxInProgress(false);
        }
    }

    return (
        <button disabled={!isConnectionRestored || txInProgress} onClick={onClick}>
            {content}
        </button>
    );
}