import { providers, utils } from "ethers"

import { isAddressEqual, tokenSymbolMap } from "@nsorcell/exp-tokenlist"

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
    const eth2xfliAddress = tokenSymbolMap[1]["ETH2x-FLI"].address
    const isEth2xFli = isAddressEqual(address, eth2xfliAddress)
    const component = isEth2xFli
      ? tokenSymbolMap[1]["ETH2X"].address
      : tokenSymbolMap[1]["BTC2X"].address
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const fliNav = await navProvider.getNav(component)
    const unit = utils.formatUnits(positions[0].unit.toString(), 18)
    const nav = Number(unit) * fliNav
    return nav
  }
}
