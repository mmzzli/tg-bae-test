import chainsSvgs from '@/assets'
import { IWeb3ChainType, IWeb3NetworkType } from '../../chainType'

const chain = {
  id: 503,
  name: 'SOL',
  nativeCurrency: {
    decimals: 9,
    name: 'SOL',
    symbol: 'SOL'
  }
}
const icon = chainsSvgs.solSvg
const networkType: IWeb3NetworkType = 'main'

const chainInfo: IWeb3ChainType = {
  chain: chain as any,
  id: 503,
  type: 'SOL',
  name: 'Solana Devnet',
  icon: icon,
  networkType
}

export default chainInfo
