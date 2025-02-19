import chainsSvgs from '@/assets'
import { IWeb3ChainType, IWeb3NetworkType, Web3Type } from '../../chainType'

const icon = chainsSvgs.tonSvg
const networkType: IWeb3NetworkType = 'test'

const chainInfo: IWeb3ChainType = {
  chain: {
    id: 1101,
    // @ts-ignore
    name: 'TON',
    // @ts-ignore
    nativeCurrency: { decimals: 9, name: 'TON', symbol: 'TON' },
  },
  id: 1101,
  type: Web3Type.TONTEST,
  name: 'TON Testnet',
  icon: icon,
  networkType,
}

export default chainInfo
