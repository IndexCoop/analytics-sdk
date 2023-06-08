import { providers, utils } from "ethers"

import { CoinGeckoService } from "utils"
import { IndexNavProvider } from "../nav"
import { IndexSupplyProvider } from "../supply"

interface MarketCapProvider {
  getMarketCap(address: string): Promise<number>
}

export class IndexMarketCapProvider implements MarketCapProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getMarketCap(address: string): Promise<number> {
    const { coingeckoService, provider } = this
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const nav = await navProvider.getNav(address)
    const supplyProvider = new IndexSupplyProvider(provider)
    const supply = await supplyProvider.getSupply(address)
    const supplyFormatted = utils.formatUnits(supply.toString())
    return nav * Number(supplyFormatted)
  }
}
