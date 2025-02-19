// import { Web3Type } from '@/proviers/web3Provider/type'
// import { isValid } from 'date-fns'
import TonWeb from 'tonweb'
import * as bitcoin from 'bitcoinjs-lib'
import { Web3Type } from '../chainType'

const validateEvmAddress = (address: string) => {
  const evmRegex = /^0x[a-fA-F0-9]{40}$/
  return evmRegex.test(address)
}

const validateSolAddress = (address: string) => {
  const solRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
  return solRegex.test(address)
}
const validateTonAddress = (address: string) => {
  try {
    new TonWeb.Address(address)
    return true
  } catch (error) {
    return false
  }
}

const validateSuiAddress = (address: string) => {
  const suiRegex = /^0x[0-9A-HJ-NP-Za-km-z]{64}$/
  console.log(suiRegex.test(address), address, 'isValid')
  return suiRegex.test(address)
}

const validateTronAddress = (address: string) => {
  const tronRegex = /^T[1-9A-HJ-NP-Za-km-z]{33}$/
  return tronRegex.test(address)
}

const validateP2PKH = (address: string) => {
  const p2pkhRegex = /^(1|[mn])[1-9A-HJ-NP-Za-km-z]{25,34}$/
  return p2pkhRegex.test(address)
}
const validateP2WPKH = (address: string) => {
  const p2wpkhRegex = /^(bc1|tb1)[0-9a-z]{39,59}$/
  return p2wpkhRegex.test(address)
}

const validateP2TR = (address: string) => {
  const p2trRegex = /^(bc1p|tb1p)[0-9a-z]{39,59}$/
  return p2trRegex.test(address)
}
const validateP2SH = (address: string) => {
  const p2shRegex = /^(3|2)[1-9A-HJ-NP-Za-km-z]{25,34}$/
  return p2shRegex.test(address)
}

const validateBtcAddress = (address: string) => {
  return (
    validateP2PKH(address) ||
    validateP2WPKH(address) ||
    validateP2SH(address) ||
    validateP2TR(address)
  )
}

const validDogecoinAddress = (address: string) => {
  try {
    const decoded = bitcoin.address.fromBase58Check(address)

    if (address.startsWith('D') && decoded.version === 30) {
      // Dogecoin 地址版本为 30
      return true
    }
    return false
  } catch (error) {
    return false
  }
}

export const validateAddressFnMap = {
  [Web3Type.EVM]: validateEvmAddress,
  [Web3Type.BTC]: validateBtcAddress,
  [Web3Type.SOL]: validateSolAddress,
  [Web3Type.TON]: validateTonAddress,
  [Web3Type.TONTEST]: validateTonAddress,
  [Web3Type.TRON]: validateTronAddress,
  [Web3Type.SUI]: validateSuiAddress,
  [Web3Type.DOGE]: validDogecoinAddress,
}
