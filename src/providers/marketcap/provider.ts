import { providers, utils } from "ethers"

import { IndexSupplyProvider } from "../supply"
import { CoinGeckoService } from "utils"

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
    const baseCurrency = "usd"
    const { coingeckoService, provider } = this
    const network = await provider.getNetwork()
    const chainId = network.chainId
    const supplyProvider = new IndexSupplyProvider(provider)
    const res = await coingeckoService.getTokenPrice({
      address,
      chainId,
      baseCurrency,
      include24hrVol: false,
    })
    const price = res[address.toLowerCase()][baseCurrency]
    const supply = await supplyProvider.getSupply(address)
    const supplyFormatted = utils.formatUnits(supply.toString())
    return price * Number(supplyFormatted)
  }
}
