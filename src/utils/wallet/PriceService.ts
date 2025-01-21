class PriceService {
  private static instance: PriceService
  private prices: { [key: string]: number } = {}
  private updateTimer?: NodeJS.Timer
  private readonly UPDATE_INTERVAL = 30000

  private constructor() {
    this.startAutoUpdate()
  }

  private async updatePrices() {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=usd-coin,tether,binancecoin,ethereum&vs_currencies=usd'
      )
      const data = await response.json()

      this.prices = {
        USDC: data['usd-coin'].usd,
        USDT: data.tether.usd,
        BNB: data.binancecoin.usd,
        ETH: data.ethereum.usd,
      }
    } catch (error) {
      console.error('update price error:', error)
    }
  }

  private startAutoUpdate() {
    this.updatePrices()
    if (this.updateTimer) {
      clearInterval(this.updateTimer as unknown as number)
      this.updateTimer = undefined
    }
    this.updateTimer = setInterval(() => {
      this.updatePrices()
    }, this.UPDATE_INTERVAL)
  }

  public stopAutoUpdate() {
    if (this.updateTimer) {
      clearInterval(this.updateTimer as unknown as number)
      this.updateTimer = undefined
    }
  }

  getPrices() {
    return this.prices
  }

  getPrice(token: string) {
    return this.prices[token]
  }

  static init() {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService()
    }
  }

  static getInstance() {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService()
    }
    return PriceService.instance
  }
}

export default PriceService
