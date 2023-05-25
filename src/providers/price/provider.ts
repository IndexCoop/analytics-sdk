import { CoinGeckoService } from "../../utils"

interface PriceProvider {
  getPrice(address: string, chainId: number): Promise<number>
}

export class IndexPriceProvider implements PriceProvider {
  constructor(private readonly coingeckoService: CoinGeckoService) {}

  async getPrice(address: string, chainId: number): Promise<number> {
    const baseCurrency = "usd"
    const { coingeckoService } = this
    const priceRequest = {
      address,
      baseCurrency,
      chainId,
      include24hrVol: false,
    }
    const res = await coingeckoService.getTokenPrice(priceRequest)
    return res[address.toLowerCase()][baseCurrency]
  }
}
