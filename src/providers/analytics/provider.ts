import { Contract, providers, utils } from "ethers"

import { CoinGeckoService, CoinGeckoUtils } from "../../utils"
import { IndexMarketCapProvider } from "../marketcap"
import { IndexNavProvider } from "../nav"
import { IndexSupplyProvider } from "../supply"

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

interface IndexAnalyticsSummary {
  address: string
  navPrice: number
  marketCap: number
  change24h: number
}

const MAINNET_CHAIN_ID = 1

interface AnalyticsProvider {
  getAnalytics(address: string): Promise<IndexAnalytics>
}

const Erc20Abi = [
  "function decimals() public view returns (uint8)",
  "function name() public view returns (string memory)",
  "function symbol() public view returns (string memory)",
  "function totalSupply() public view returns (uint256)",
]

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
    const contract = new Contract(address, Erc20Abi, this.provider)
    const marketCapProvider = new IndexMarketCapProvider(
      provider,
      coingeckoService,
    )
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const supplyProvider = new IndexSupplyProvider(provider)
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const name = await contract.name()
    const symbol = await contract.symbol()
    const decimals = await contract.decimals()
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
      symbol,
      address,
      name,
      decimals,
      totalSupply: supplyFormatted,
      marketPrice,
      navPrice,
      marketCap,
      change24h,
      volume24h,
    }
  }

  async getAnalyticsSummary(address: string): Promise<IndexAnalyticsSummary> {
    const { baseCurrency, coingeckoService, provider } = this
    const marketCapProvider = new IndexMarketCapProvider(
      provider,
      coingeckoService,
    )
    const navProvider = new IndexNavProvider(provider, coingeckoService)

    const [marketCap, navPrice, coingeckoRes] = await Promise.all([
      marketCapProvider.getMarketCap(address),
      navProvider.getNav(address),
      coingeckoService.getTokenPrice({
        address,
        chainId: MAINNET_CHAIN_ID,
        baseCurrency,
        include24hrChange: true,
        include24hrVol: false,
      }),
    ])

    const coingeckoData = coingeckoRes[address.toLowerCase()] ?? null

    return {
      address,
      navPrice,
      marketCap,
      change24h: coingeckoData?.[CoinGeckoUtils.get24hChangeLabel(baseCurrency)] ?? 0,
    }
  }
}
