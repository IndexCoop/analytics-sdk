import { BigNumber, Contract, providers, utils } from "ethers"

import { CoinGeckoService, FindPricesResponse } from "utils/coingecko"
import { getPositions } from "../../utils/positions"

const icSMMT = "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD"

type Position = {
  component: string
  unit: BigNumber
}

export class IcSmmtNavProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getNav(): Promise<number> {
    const { coingeckoService, provider } = this
    const stables = [
      "0x6B175474E89094C44Da98b954EedeAC495271d0F", // DAI
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
    ]
    const prices = await coingeckoService.findPrices({
      addresses: stables,
      chainId: 1,
      baseCurrency: "usd",
      includeDailyChange: false,
    })
    const positions = await getPositions(icSMMT, provider)
    const navPromises = positions.map((pos: Position) =>
      this.getPositionNav(pos.component, pos.unit, prices, provider),
    )
    const navs = await Promise.all(navPromises)
    const nav: number = navs.reduce(
      (prevValue, currValue) => prevValue + currValue,
      0,
    )
    return nav
  }

  private async getPositionNav(
    token: string,
    units: BigNumber,
    stablesPrices: FindPricesResponse,
    provider: providers.StaticJsonRpcProvider,
  ): Promise<number> {
    const contract = new Contract(token, erc4626Abi, provider)
    const underlyingAsset: string = await contract.asset()
    const isDai =
      underlyingAsset === "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    const underlyingDecimals = isDai ? 18 : 6
    const priceUsd = stablesPrices[underlyingAsset.toLowerCase()].usd
    const componentAssets: BigNumber = await contract.convertToAssets(units)
    const nav =
      Number(utils.formatUnits(componentAssets, underlyingDecimals)) * priceUsd
    return nav
  }
}

const erc4626Abi = [
  "function asset() view returns (address)",
  "function convertToAssets(uint256 shares) view returns (uint256 assets)",
  "function convertToShares(uint256 assets) view returns (uint256 shares)",
  "function decimals() view returns (uint256)",
  "function totalAssets() view returns (uint256)",
  "function totalSupply() view returns (uint256)",
]
