import { CoinGeckoService, CoinGeckoUtils } from "../../utils/"

interface TokenStatsResponse {
  symbol: string
  price: number
  change24h: number
  low24h: number
  high24h: number
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

  async getTokenStats(
    symbol: string,
    baseCurrency: string = "usd",
  ): Promise<TokenStatsResponse> {
    const { coingeckoService } = this
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
    return {
      symbol,
      price: simplePriceData[baseCurrency],
      change24h,
      low24h: Math.min(...prices),
      high24h: Math.max(...prices),
    }
  }
}
