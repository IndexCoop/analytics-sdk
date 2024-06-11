import { BigNumber, providers, utils } from "ethers"

import { CoinGeckoService, FindPricesResponse } from "utils/coingecko"
import { getDecimals } from "../../utils/erc20"
import { getPositions } from "../../utils/positions"
import { FliNavProvider } from "./fli-nav-provider"
import { HyEthNavProvider } from "./hyeth"
import { IcSmmtNavProvider } from "./icsmmt"
import { Ic21NavProvider } from "./ic21"

interface NavProvider {
  getNav(address: string): Promise<number>
}

interface Position {
  component: string
  unit: BigNumber
}

const btc2xfli = "0x0B498ff89709d3838a063f1dFA463091F9801c2b"
const eth2xfli = "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD"
const hyETH = "0xc4506022Fb8090774E8A628d5084EED61D9B99Ee"
const ic21 = "0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65"
const icSMMT = "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD"

export class IndexNavProvider implements NavProvider {
  private baseCurrency = "usd"
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getNav(address: string): Promise<number> {
    const { baseCurrency, coingeckoService, provider } = this
    const network = await provider.getNetwork()
    const chainId = network.chainId
    // FLI specific
    if (
      address.toLowerCase() === eth2xfli.toLowerCase() ||
      address.toLowerCase() === btc2xfli.toLowerCase()
    ) {
      const fliNavProvider = new FliNavProvider(provider, coingeckoService)
      const nav = await fliNavProvider.getNav(address)
      return nav
    }
    // hyETH specific calculation
    if (address.toLowerCase() === hyETH.toLowerCase()) {
      const hyEthProvider = new HyEthNavProvider(provider, coingeckoService)
      const nav = await hyEthProvider.getNav()
      return nav
    }
    // ic21 specific calculation
    if (address.toLowerCase() === ic21.toLowerCase()) {
      const ic21Provider = new Ic21NavProvider(provider, coingeckoService)
      const nav = await ic21Provider.getNav()
      return nav
    }
    // icSMMT specific calculation
    if (address.toLowerCase() === icSMMT.toLowerCase()) {
      const icSmmtProvider = new IcSmmtNavProvider(provider, coingeckoService)
      const nav = await icSmmtProvider.getNav()
      return nav
    }
    // Any other Index token
    const positions: Position[] = await getPositions(address, provider)
    const positionPrices = await this.getPositionPrices(positions, chainId)
    const decimalsForPositionPromises = positions.map((p: Position) => {
      return getDecimals(p.component, provider)
    })
    const decimalsForPosition = await Promise.all(decimalsForPositionPromises)
    const usdValues = positions.map((p: Position, index) => {
      const priceUsd = positionPrices[p.component.toLowerCase()]?.[baseCurrency]
      const unit = utils.formatUnits(
        p.unit.toString(),
        decimalsForPosition[index],
      )
      return priceUsd * Number(unit)
    })
    const nav = usdValues.reduce((prev, curr) => curr + prev, 0)
    return nav
  }

  private async getPositionPrices(
    positions: Position[],
    chainId: number,
  ): Promise<FindPricesResponse> {
    return await this.coingeckoService.findPrices({
      addresses: positions.map((p) => p.component),
      chainId,
      baseCurrency: this.baseCurrency,
      includeDailyChange: false,
    })
  }
}
