import { providers, utils } from "ethers"

import { getIndexTokenData } from "@indexcoop/tokenlists"

import { CoinGeckoService } from "utils/coingecko"
import { getPositions } from "../../utils/positions"

import { IndexNavProvider } from "./provider"

export class FliNavProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getNav(address: string): Promise<number> {
    const { coingeckoService, provider } = this
    const positions = await getPositions(address, provider)
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const isEth2xFli =
      address.toLowerCase() ===
      getIndexTokenData("ETH2x-FLI")!.address.toLowerCase()
    const component = getIndexTokenData(isEth2xFli ? "ETH2X" : "BTC2X")!.address
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const fliNav = await navProvider.getNav(component)
    const unit = utils.formatUnits(positions[0].unit.toString(), 18)
    const nav = Number(unit) * fliNav
    return nav
  }
}
