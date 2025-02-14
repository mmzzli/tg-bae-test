import Cryptos from './components/Cryptos'
import WalletHeader from './components/WalletHeader'

const Tokens = () => {
  return (
    <div className="size-full bg-bg1 px-[20px] pb-[16px] pt-[24px] overflow-y-auto">
      <WalletHeader />
      <Cryptos />
    </div>
  )
}

export default Tokens
