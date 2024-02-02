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
  totalSupply: string
  marketPrice: number
  navPrice: number
  marketCap: number
  change24h: number
  volume24h: number
}

interface AnalyticsProvider {
  getAnalytics(address: string): Promise<IndexAnalytics>
}

export class IndexAnalyticsProvider implements AnalyticsProvider {
  private baseCurrency = "usd"

  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getAnalytics(address: string): Promise<IndexAnalytics> {
    const { baseCurrency, coingeckoService, provider } = this
    const marketCapProvider = new IndexMarketCapProvider(
      provider,
      coingeckoService,
    )
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const supplyProvider = new IndexSupplyProvider(provider)
    // For now we can save time by always assuming Ethereum
    const chainId = 1
    // Token data fetched statically to avoid lengthy contract interactions
    const token = TokenData[address.toLowerCase()]
    const totalSupply = await supplyProvider.getSupply(address)
    const coingeckoRes = await coingeckoService.getTokenPrice({
      address,
      chainId,
      baseCurrency,
      include24hrChange: true,
      include24hrVol: true,
    })
    const coingeckoData = coingeckoRes[address.toLowerCase()]
    const change24hLabel = CoinGeckoUtils.get24hChangeLabel(baseCurrency)
    const change24h =
      coingeckoData === undefined ? 0 : coingeckoData[change24hLabel]
    const marketPrice =
      coingeckoData === undefined ? 0 : coingeckoData[baseCurrency]
    const volume24hLabel = CoinGeckoUtils.get24hVolumeLabel(baseCurrency)
    const volume24h =
      coingeckoData === undefined ? 0 : coingeckoData[volume24hLabel]
    const marketCap = await marketCapProvider.getMarketCap(address)
    const navPrice = await navProvider.getNav(address)
    const supplyFormatted = utils.formatUnits(totalSupply.toString())
    return {
      symbol: token.symbol,
      address,
      name: token.name,
      decimals: token.decimals,
      totalSupply: supplyFormatted,
      marketPrice,
      navPrice,
      marketCap,
      change24h,
      volume24h,
    }
  }
}
