import { Contract, providers, utils } from "ethers"

import { CoinGeckoService } from "utils"
import { IndexPriceProvider } from "../price"
import { IndexMarketCapProvider } from "../marketcap"
import { IndexNavProvider } from "../nav"
import { IndexSupplyProvider } from "../supply"
import { IndexVolumeProvider } from "../volume"

interface IndexAnalytics {
  name: string
  symbol: string
  decimals: number
  address: string
  totalSupply: string
  marketPrice: number
  navPrice: number
  marketCap: number
  volume: number
}

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
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getAnalytics(address: string): Promise<IndexAnalytics> {
    const { coingeckoService, provider } = this
    const contract = new Contract(address, Erc20Abi, this.provider)
    const marketCapProvider = new IndexMarketCapProvider(
      provider,
      coingeckoService,
    )
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const priceProvider = new IndexPriceProvider(coingeckoService)
    const supplyProvider = new IndexSupplyProvider(provider)
    const volumeProvider = new IndexVolumeProvider(coingeckoService)
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const name = await contract.name()
    const symbol = await contract.symbol()
    const decimals = await contract.decimals()
    const totalSupply = await supplyProvider.getSupply(address)
    const volume = await volumeProvider.get24hVolume(address, chainId)
    const marketCap = await marketCapProvider.getMarketCap(address)
    const marketPrice = await priceProvider.getPrice(address, chainId)
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
      volume,
    }
  }
}
