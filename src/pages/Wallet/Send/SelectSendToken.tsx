import { useNavigate, useSearchParams } from 'react-router-dom'
import SelectToken from './components/SelectToken'
import { useState } from 'react'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { BackButton } from '@vkruglikov/react-telegram-web-app'
import { useTokenStore } from '@/store/wallet/walletToken'

function SelectSendToken() {
  const [urlSearchStr] = useSearchParams()
  const chainId = urlSearchStr.get('chainId')
  const navigate = useNavigate()
  const { tokenList } = useTokenStore()
  const [tokens, setTokens] = useState(tokenList || [])
  const onSearch = (search: string) => {
    const filterTokens = tokenList.filter((token) => {
      return (
        token.symbol.toUpperCase().includes(search.toUpperCase()) ||
        token.address.toUpperCase().includes(search.toUpperCase())
      )
    })
    setTokens(filterTokens)
  }

  const renderTokens = tokens.filter(() => {
    if (chainId == null) return tokens
    return tokens.filter((token) => token.chainId === Number(chainId))
  })

  const clickItem = (token: AssetsToken) => {
    navigate(`/wallet/send/input-address?chainId=${token.chainId}&address=${token.address || ''}`)
  }

  return (
    <>
      <SelectToken
        tokens={renderTokens}
        onSearch={onSearch}
        onClick={clickItem}
        title={'Select send tokens'}
      />
    </>
  )
}

export default SelectSendToken
