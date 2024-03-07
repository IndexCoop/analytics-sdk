import { CoinGeckoService, CoinGeckoUtils } from "../../utils/"

function getCoingeckoId(symbol: string) {
  switch (symbol) {
    case "BTC":
      return "bitcoin"
    default:
      return "ethereum"
  }
}

export class CoingeckoProvider {
  constructor(private readonly coingeckoService: CoinGeckoService) {}

  // TODO: define response
  async getTokenStats(symbol: string): Promise<any> {
    const { coingeckoService } = this
    const baseCurrency = "usd"
    const coinId = getCoingeckoId(symbol)
    const simplePriceData = (
      await coingeckoService.getTokenPriceById({
        ids: [coinId],
        baseCurrency,
      })
    )[coinId]
    const change24h =
      simplePriceData[CoinGeckoUtils.get24hChangeLabel(baseCurrency)]
    const price = simplePriceData[baseCurrency]
    return {
      symbol,
      price,
      change24h,
    }
  }
}
