import { CoinGeckoService, CoinGeckoUtils } from "../../utils/"

interface TokenStatsResponse {
  symbol: string
  price: number
  change24h: number
  low: number
  high: number
}

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

  async getTokenStats(symbol: string): Promise<TokenStatsResponse> {
    const { coingeckoService } = this
    const baseCurrency = "usd"
    const coinId = getCoingeckoId(symbol)
    const simplePriceData = (
      await coingeckoService.getTokenPriceById({
        ids: [coinId],
        baseCurrency,
      })
    )[coinId]
    const historicData24h = (
      await coingeckoService.getHistoricalChartDataById({
        coinId,
        baseCurrency,
      })
    ).prices
    const change24h =
      simplePriceData[CoinGeckoUtils.get24hChangeLabel(baseCurrency)]
    const prices = historicData24h.map((price) => price[1]) // Extract prices
    const low = Math.min(...prices)
    const high = Math.max(...prices)
    return {
      symbol,
      price: simplePriceData[baseCurrency],
      change24h,
      low,
      high,
    }
  }
}
