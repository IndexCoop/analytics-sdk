import { BigNumber, Contract, providers, utils } from "ethers"

import { CoinGeckoService } from "utils/coingecko"
import { getDecimals } from "../../utils/erc20"
import { getPositions } from "../../utils/positions"

type Position = {
  component: string
  unit: BigNumber
}

const Erc20Abi = ["function decimals() public view returns (uint8)"]

const mappingAddressCoingeckoId: { [key: string]: string } = {
  "0x399508A43d7E2b4451cd344633108b4d84b33B03": "avalanche-2",
  "0x3f67093dfFD4F0aF4f2918703C92B60ACB7AD78b": "bitcoin",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2": "ethereum",
  "0x1bE9d03BfC211D83CFf3ABDb94A75F9Db46e1334": "binancecoin",
  "0x0d3bd40758dF4F79aaD316707FcB809CD4815Ffe": "ripple",
  "0x9c05d54645306d4C4EAd6f75846000E1554c0360": "cardano",
  "0xb80a1d87654BEf7aD8eB6BBDa3d2309E31D4e598": "solana",
  "0x514910771AF9Ca656af840dff83E8264EcF986CA": "chainlink",
  "0x9F2825333aa7bC2C98c061924871B6C016e385F3": "litecoin",
  "0xF4ACCD20bFED4dFFe06d4C85A7f9924b1d5dA819": "polkadot",
  "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0": "matic-network",
  "0xFf4927e04c6a01868284F5C3fB9cba7F7ca4aeC0": "bitcoin-cash",
}

export class Ic21NavProvider {
  private baseCurrency = "usd"

  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getNav(): Promise<number> {
    const { provider } = this
    const ic21 = "0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65"
    const positions: Position[] = await getPositions(ic21, provider)
    const components = positions.map((p) => p.component)
    const decimalsPromises = components.map((c) => getDecimals(c, provider))
    const decimals = await Promise.all(decimalsPromises)
    const prices = await this.getPrices(positions)
    const usdValues = positions.map((p: Position, index: number) => {
      const unit = utils.formatUnits(p.unit.toString(), decimals[index])
      const units = Number(unit)
      const price = prices[index]
      return units * price
    })
    const nav = usdValues.reduce((prev, curr) => curr + prev, 0)
    return nav
  }

  private async getPrices(positions: Position[]) {
    const coingeckoIds = positions.map(
      (p: Position) => mappingAddressCoingeckoId[p.component],
    )
    const pricesResponse = await this.coingeckoService.getTokenPriceById({
      ids: coingeckoIds,
      baseCurrency: this.baseCurrency,
    })
    const prices = coingeckoIds.map((id) => pricesResponse[id].usd)
    return prices
  }
}
