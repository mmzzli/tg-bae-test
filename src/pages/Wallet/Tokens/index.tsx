import Cryptos from "./components/Cryptos"
import WalletHeader from "./components/WalletHeader"

const Tokens = () => {
  return (
    <div className="h-full bg-bg1 px-[20px] pb-[16px] pt-[4px]">
      <WalletHeader />
      <Cryptos />
    </div>
  )
}

export default Tokens