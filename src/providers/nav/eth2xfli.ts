import { BigNumber, Contract, providers, utils } from "ethers"

import { CoinGeckoService, FindPricesResponse } from "utils/coingecko"
import { getPositions } from "../../utils/positions"

type Position = {
  component: string
  unit: BigNumber
}

export class Eth2xFliNavProvider {
  private baseCurrency = "usd"

  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getNav(): Promise<number> {
    const { coingeckoService, provider } = this
    const ceth = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5"
    const eth2xfli = "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD"
    const usdc = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
    const positions = await getPositions(eth2xfli, provider)
    const prices = await coingeckoService.findPrices({
      addresses: positions.map((p: Position) => p.component),
      chainId: 1,
      baseCurrency: this.baseCurrency,
      includeDailyChange: false,
    })
    const cethNav = this.getComponentNav(ceth, 1e8, positions, prices)
    const usdcNav = this.getComponentNav(usdc, 1e6, positions, prices)
    const nav = cethNav + usdcNav
    return nav
  }

  private getComponentNav(
    address: string,
    decimals: number,
    positions: Position[],
    prices: FindPricesResponse,
  ): number {
    const rawUnits: BigNumber = positions.filter(
      (p: Position) => p.component.toLowerCase() === address.toLowerCase(),
    )[0].unit
    const price = prices[address.toLowerCase()]?.[this.baseCurrency]
    const units = Number(rawUnits.toString()) / decimals
    const nav = price * units
    return nav
  }
}
