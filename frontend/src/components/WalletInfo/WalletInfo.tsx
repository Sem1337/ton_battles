import { WalletInfoWithOpenMethod, useTonWallet } from "@tonconnect/ui-react"

export const WalletInfo = () => {
    const wallet = useTonWallet();

    if (!wallet) {
        return null;
    }

    return (
        <div style={{marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center'}}>
            <img src={(wallet as WalletInfoWithOpenMethod).imageUrl} height="30px" width="30px" />
            { (wallet as WalletInfoWithOpenMethod).name }
        </div>
    );
}