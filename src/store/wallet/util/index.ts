export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const shortenAddress = (
  address: string | undefined,
  start?: number,
  end?: number
) => {
  if (!address) return ''
  if (address?.length <= 11) {
    return address
  }
  return (
    address && `${address.slice(0, start || 8)}...${address.slice(-(end || 8))}`
  )
}
