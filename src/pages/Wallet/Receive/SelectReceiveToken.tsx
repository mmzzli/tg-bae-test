import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AssetsToken } from '@/store/wallet/tokenType/AssetsToken'
import { ZERO_ADDRESS } from '@/store/wallet/util/tokenHelper'
import SelectToken from '../Send/components/SelectToken'
import { useStore } from '@/store'

function SelectReceiveToken() {
  const [urlSearchStr] = useSearchParams()
  const chainId = urlSearchStr.get('chainId')
  const navigate = useNavigate()
  const tokenList = useStore((state) => state.tokenList)
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
    navigate(`/wallet/receive/receive/${token.chainId}/${token.address || ZERO_ADDRESS}`)
  }

  return (
    <>
      <SelectToken
        tokens={renderTokens}
        onSearch={onSearch}
        onClick={clickItem}
        title={'Select currency'}
      />
    </>
  )
}

export default SelectReceiveToken
