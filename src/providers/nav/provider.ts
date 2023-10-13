import { BigNumber, Contract, providers, utils } from "ethers"

import { CoinGeckoService, FindPricesResponse } from "utils/coingecko"
import { Eth2xFliNavProvider } from "./eth2xfli"
import { IcSmmtNavProvider } from "./icsmmt"
import { Ic21NavProvider } from "./ic21"

interface NavProvider {
  getNav(address: string): Promise<number>
}

interface Position {
  component: string
  unit: BigNumber
}

const eth2xfli = "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD"
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
    // ETH2xFLI specific
    if (address.toLowerCase() === eth2xfli.toLowerCase()) {
      const eth2xfliProvider = new Eth2xFliNavProvider(
        provider,
        coingeckoService,
      )
      const nav = await eth2xfliProvider.getNav()
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
    const contract = new Contract(address, indexTokenAbi, provider)
    const positions: Position[] = await contract.getPositions()
    const positionPrices = await this.getPositionPrices(positions, chainId)
    const decimalsForPositionPromises = positions.map((p: Position) => {
      return this.getDecimals(p.component)
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

  private async getDecimals(address: string): Promise<number> {
    const contract = new Contract(address, Erc20Abi, this.provider)
    return await contract.decimals()
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

const Erc20Abi = ["function decimals() public view returns (uint8)"]

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
