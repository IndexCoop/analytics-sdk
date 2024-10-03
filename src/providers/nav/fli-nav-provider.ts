import { providers, utils } from "ethers"

import {
  getTokenByChainAndAddress,
  getTokenByChainAndSymbol,
} from "@nsorcell/exp-tokenlist"

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
    const componentSymbol =
      getTokenByChainAndAddress(1, address)?.symbol === "ETH2x-FLI"
        ? "ETH2X"
        : "BTC2X"
    const component = getTokenByChainAndSymbol(1, componentSymbol)
    const navProvider = new IndexNavProvider(provider, coingeckoService)
    const fliNav = await navProvider.getNav(component.address)
    const unit = utils.formatUnits(positions[0].unit.toString(), 18)
    const nav = Number(unit) * fliNav
    return nav
  }
}
