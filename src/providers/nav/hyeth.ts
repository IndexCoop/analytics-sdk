import { BigNumber, Contract, providers, utils } from "ethers"

import { CoinGeckoService } from "utils/coingecko"
import { isSameAddress } from "../../utils/addresses"
// import { getDecimals } from "../../utils/erc20"
import { getPositions } from "../../utils/positions"

interface Component {
  address: string
  unit: string
  usd: number
}

interface Position {
  component: string
  unit: BigNumber
}

export class HyEthNavProvider {
  private baseCurrency = "usd"
  private weth = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"

  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  isAcross(token: string) {
    return isSameAddress(token, "0x28F77208728B0A45cAb24c4868334581Fe86F95B")
  }

  isInstdapp(token: string) {
    return isSameAddress(token, "0xA0D3707c569ff8C87FA923d3823eC5D81c98Be78")
  }

  isMorpho(token: string) {
    return isSameAddress(token, "0x701907283a57FF77E255C3f1aAD790466B8CE4ef")
  }

  isPendle(token: string) {
    const pendleTokens: string[] = [
      "0x1c085195437738d73d75DC64bC5A3E098b7f93b1",
      "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d",
      "0xf7906F274c174A52d444175729E3fa98f9bde285",
      "0x7aa68E84bCD8d1B4C9e10B1e565DB993f68a3E09",
    ]
    return pendleTokens.some((pendleToken) => isSameAddress(pendleToken, token))
  }

  async getAcrossEthAmount(unit: BigNumber) {
    const acrossPool = "0xc186fA914353c44b2E33eBE05f21846F1048bEda"
    const abi = [
      "function exchangeRateCurrent(address l1Token) public returns (uint256)",
    ]
    const contract = new Contract(acrossPool, abi, this.provider)
    const exchangeRate: BigNumber =
      await contract.callStatic.exchangeRateCurrent(this.weth)
    // const roundingError = BigInt(10)
    const ethAmount = exchangeRate
      .mul(unit)
      .div(BigNumber.from("1000000000000000000")) // .add(roundingError)
    return ethAmount
  }

  async getInstadappAmount(component: string, unit: BigNumber) {
    const abi = [
      "function previewMint(uint256 shares) public view returns (uint256)",
    ]
    // https://etherscan.io/address/0xa0d3707c569ff8c87fa923d3823ec5d81c98be78#readProxyContract
    const tokenContract = new Contract(component, abi, this.provider)
    const stEthAmount: BigNumber = await tokenContract.previewMint(unit)
    return stEthAmount
  }

  async getMorphoAmount(component: string, unit: BigNumber) {
    const abi = [
      "function previewMint(uint256 shares) public view returns (uint256)",
    ]
    const tokenContract = new Contract(component, abi, this.provider)
    const ethAmount: BigNumber = await tokenContract.previewMint(unit)
    return ethAmount
  }

  async getPendleAmount(component: string, unit: BigNumber) {
    const abi = [
      "function pendleMarkets(address addr) public view returns (address)",
    ]
    const routerAbi = [
      "function getPtToAssetRate(address market) public view returns (uint256)",
    ]
    const fmHyEth = new Contract(
      "0xCb1eEA349f25288627f008C5e2a69b684bddDf49",
      abi,
      this.provider,
    )
    const market = await fmHyEth.pendleMarkets(component)
    const routerStaticMainnet = "0x263833d47eA3fA4a30f269323aba6a107f9eB14C"
    const routerContract = new Contract(
      routerStaticMainnet,
      routerAbi,
      this.provider,
    )
    const assetRate: BigNumber = await routerContract.getPtToAssetRate(market)
    const ethAmount = unit
      .mul(assetRate)
      .div(BigNumber.from("1000000000000000000"))
    return ethAmount
  }

  async getComponentsUnitsPrices(): Promise<Component[]> {
    const { baseCurrency, provider } = this
    const hyeth = "0xc4506022Fb8090774E8A628d5084EED61D9B99Ee"
    const positions: Position[] = await getPositions(hyeth, provider)
    // const components = positions.map((p) => p.component)
    // const decimalsPromises = components.map((c) => getDecimals(c, provider))
    // const decimals = await Promise.all(decimalsPromises)
    // console.log(decimals)
    const ethCoingeckoId = "ethereum"
    const results = await this.coingeckoService.getTokenPriceById({
      ids: [ethCoingeckoId],
      baseCurrency,
    })
    const ethPrice = results[ethCoingeckoId].usd
    const denominations = await this.getEthDenominations(positions)
    const usdValues = denominations.map((den: BigNumber) => {
      const unit = utils.formatUnits(den, 18)
      return Number(unit) * ethPrice
    })
    const components = positions.map((position: Position, index: number) => {
      const usd = usdValues[index]
      return {
        address: position.component,
        unit: position.unit.toString(),
        usd,
      }
    })
    return components
  }

  async getNav(): Promise<number> {
    const components = await this.getComponentsUnitsPrices()
    const nav = components.reduce((prev, curr) => curr.usd + prev, 0)
    return nav
  }

  private async getEthDenominations(
    positions: Position[],
  ): Promise<BigNumber[]> {
    const promises = positions.map((position: Position) => {
      const { component, unit } = position
      if (this.isAcross(component)) {
        return this.getAcrossEthAmount(unit)
      }
      if (this.isInstdapp(component)) {
        return this.getInstadappAmount(component, unit)
      }
      if (this.isMorpho(component)) {
        return this.getMorphoAmount(component, unit)
      }
      if (this.isPendle(component)) {
        return this.getPendleAmount(component, unit)
      }
      return BigNumber.from("0")
    })
    const denominations = await Promise.all(promises)
    return denominations
  }
}
