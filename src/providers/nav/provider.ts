import { BigNumber, Contract, providers, utils } from "ethers"

import { CoinGeckoService, FindPricesResponse } from "utils/coingecko"
import { IcSmmtNavProvider } from "./icsmmt"

interface NavProvider {
  getNav(address: string): Promise<number>
}

interface Position {
  component: string
  unit: BigNumber
}

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
    // icSMMT specific calculation
    if (address.toLowerCase() === icSMMT.toLowerCase()) {
      const icSmmtProvider = new IcSmmtNavProvider(provider, coingeckoService)
      const nav = await icSmmtProvider.getNav()
      return nav
    }
    // Any other Index token
    const contract = new Contract(address, indexTokenAbi, provider)
    const positions: Position[] = await contract.getPositions()
    const positionPrices = await this.getPositionPrices(positions, chainId)
    const usdValues = positions.map((p: Position) => {
      const priceUsd = positionPrices[p.component.toLowerCase()]?.[baseCurrency]
      const unit = utils.formatUnits(p.unit.toString())
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

const indexTokenAbi = [
  {
    inputs: [],
    name: "getPositions",
    outputs: [
      {
        components: [
          { internalType: "address", name: "component", type: "address" },
          { internalType: "address", name: "module", type: "address" },
          { internalType: "int256", name: "unit", type: "int256" },
          { internalType: "uint8", name: "positionState", type: "uint8" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        internalType: "struct ISetToken.Position[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]
