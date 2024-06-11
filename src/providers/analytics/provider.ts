import { utils } from "ethers"
import { getIndexTokenDataByAddress } from "@indexcoop/tokenlists"

import {
  CoinGeckoService,
  CoinGeckoUtils,
  CoingeckoTokenPriceResponse,
  getFulfilledValueOrNull,
  getRpcProvider,
} from "../../utils"
import { IndexMarketCapProvider } from "../marketcap"
import { IndexNavProvider } from "../nav"
import { IndexSupplyProvider } from "../supply"

interface IndexAnalytics {
  name: string
  symbol: string
  decimals: number
  address: string
  totalSupply: string | null
  marketPrice: number | null
  navPrice: number | null
  marketCap: number | null
  change24h: number | null
  volume24h: number | null
}

interface IndexAnalyticsOptions {
  includeMarketCap?: boolean
  includeTotalSupply?: boolean
  include24hrChange?: boolean
  include24hrVolume?: boolean
}

interface AnalyticsProvider {
  getAnalytics(
    address: string,
    chainId: number,
    options?: IndexAnalyticsOptions,
  ): Promise<IndexAnalytics>
}

export class IndexAnalyticsProvider implements AnalyticsProvider {
  private baseCurrency = "usd"

  constructor(
    private readonly coingeckoService: CoinGeckoService,
    private readonly rpcUrl: string,
  ) {}

  async getAnalytics(
    address: string,
    chainId: number = 1,
    options: IndexAnalyticsOptions = {
      includeMarketCap: true,
      includeTotalSupply: true,
      include24hrChange: true,
      include24hrVolume: true,
    },
  ): Promise<IndexAnalytics> {
    const token = getIndexTokenDataByAddress(address, chainId)
    if (!token) {
      throw new Error("Unknown index token or wrong chainId")
    }

    const provider = getRpcProvider(this.rpcUrl)
    const { baseCurrency, coingeckoService } = this
    const supplyProvider = new IndexSupplyProvider(provider)
    const marketCapProvider = new IndexMarketCapProvider(
      provider,
      coingeckoService,
    )
    const navProvider = new IndexNavProvider(provider, coingeckoService)

    const supplyPromise = options.includeTotalSupply
      ? supplyProvider.getSupply(address)
      : null
    const marketCapPromise = options.includeMarketCap
      ? marketCapProvider.getMarketCap(address)
      : null
    const navPricePromise = navProvider.getNav(address)
    const coingeckoPromise = coingeckoService.getTokenPrice({
      address,
      chainId,
      baseCurrency,
      include24hrChange: options.include24hrChange ?? false,
      include24hrVol: options.include24hrVolume ?? false,
    })

    const [totalSupply, marketCap, navPrice, coingeckoRes] =
      await Promise.allSettled([
        supplyPromise,
        marketCapPromise,
        navPricePromise,
        coingeckoPromise,
      ])
    const totalSupplyValue = getFulfilledValueOrNull(totalSupply)
    const coingeckoData = (
      getFulfilledValueOrNull(
        coingeckoRes,
      ) as CoingeckoTokenPriceResponse | null
    )?.[address.toLowerCase()]

    const change24hLabel = CoinGeckoUtils.get24hChangeLabel(baseCurrency)
    const volume24hLabel = CoinGeckoUtils.get24hVolumeLabel(baseCurrency)

    return {
      symbol: token.symbol,
      address,
      name: token.name,
      decimals: token.decimals,
      totalSupply: totalSupplyValue
        ? utils.formatUnits(totalSupplyValue.toString())
        : null,
      marketPrice: coingeckoData?.[baseCurrency] ?? null,
      navPrice: getFulfilledValueOrNull(navPrice) as number | null,
      marketCap: getFulfilledValueOrNull(marketCap) as number | null,
      change24h: coingeckoData?.[change24hLabel] ?? null,
      volume24h: coingeckoData?.[volume24hLabel] ?? null,
    }
  }
}
