import allChain from './wagmiConfig/allChain'
import bsc from './wagmiConfig/bsc'
import ethereum from './wagmiConfig/ethereum'
import solana from './wagmiConfig/solana'
import ton from './wagmiConfig/ton'

export const okxChains = [
  ethereum,
  bsc,
  solana
]

const chains = {
  allChain,
  solana,
  bsc,
  ethereum,
  ton,
}

export default chains