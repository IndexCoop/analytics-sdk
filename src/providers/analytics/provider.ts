import { providers, utils } from "ethers"

import { CoinGeckoService, CoinGeckoUtils } from "../../utils"
import { IndexMarketCapProvider } from "../marketcap"
import { IndexNavProvider } from "../nav"
import { IndexSupplyProvider } from "../supply"

import { TokenData } from "./token-data"

interface IndexAnalytics {
  name: string
  symbol: string
  decimals: number
  address: string
  totalSupply?: string
  marketPrice: number
  navPrice: number
  marketCap: number
  change24h: number
  volume24h?: number
}

interface IndexAnalyticsOptions {
  includeTotalSupply?: boolean
  include24hrVolume?: boolean
}

interface AnalyticsProvider {
  getAnalytics(
    address: string,
    options?: IndexAnalyticsOptions,
  ): Promise<IndexAnalytics>
}

export class IndexAnalyticsProvider implements AnalyticsProvider {
  private baseCurrency = "usd"
  // For now we can save time by always assuming Ethereum
  private chainId = 1

  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getAnalytics(
    address: string,
    options: IndexAnalyticsOptions = {
      includeTotalSupply: true,
      include24hrVolume: true,
    },
  ): Promise<IndexAnalytics> {
    const { baseCurrency, chainId, coingeckoService, provider } = this
    const marketCapProvider = new IndexMarketCapProvider(
      provider,
      coingeckoService,
    )
    const navProvider = new IndexNavProvider(provider, coingeckoService)

    const supplyPromise = options.includeTotalSupply
      ? new IndexSupplyProvider(provider).getSupply(address)
      : Promise.resolve(null)
    const marketCapPromise = marketCapProvider.getMarketCap(address)
    const navPricePromise = navProvider.getNav(address)
    const coingeckoPromise = coingeckoService.getTokenPrice({
      address,
      chainId,
      baseCurrency,
      include24hrChange: true,
      include24hrVol: options.include24hrVolume ?? false,
    })

    const [totalSupply, marketCap, navPrice, coingeckoRes] = await Promise.all([
      supplyPromise,
      marketCapPromise,
      navPricePromise,
      coingeckoPromise
    ])
    const coingeckoData = coingeckoRes[address.toLowerCase()]
    const token = TokenData[address.toLowerCase()]

    return {
      symbol: token.symbol,
      address,
      name: token.name,
      decimals: token.decimals,
      totalSupply: options.includeTotalSupply ? utils.formatUnits(totalSupply!.toString()) : undefined,
      marketPrice: coingeckoData?.[baseCurrency] ?? 0,
      navPrice,
      marketCap,
      change24h: coingeckoData?.[CoinGeckoUtils.get24hChangeLabel(baseCurrency)] ?? 0,
      volume24h: options.include24hrVolume
        ? coingeckoData?.[CoinGeckoUtils.get24hVolumeLabel(baseCurrency)] ?? 0
        : undefined,
    }
  }
}
