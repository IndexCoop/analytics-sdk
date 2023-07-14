import { BigNumber, Contract, providers, utils } from "ethers"
import { IndexSupplyProvider } from "./provider"

const AaveProtocolDataProvider = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3"
const SupplyCapIssuanceHook = "0xED072061e94b035B8D712c64875A469f5Dd407E6"
const icRETH = "0xe8888Cdbc0A5958C29e7D91DAE44897c7e64F9BC"
const rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393"

const AaveProtocolDataProviderAbi = [
  "function getATokenTotalSupply(address asset) external view returns (uint256)",
  "function getReserveCaps(address asset) external view returns (uint256 borrowCap, uint256 supplyCap)",
]

const SupplyCapIssuanceHookAbi = [
  "function supplyCap() public view returns (uint256)",
]
interface IcREthSupplyData {
  icreth: {
    availableSupply: number
    cap: number
    totalSupply: number
  }
  reth: {
    availableSupply: number
    cap: number
    totalSupply: number
  }
}

export class IndexREthProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
  ) {}

  async getSupplyData(): Promise<IcREthSupplyData> {
    // icRETH
    const supplyProvider = new IndexSupplyProvider(this.provider)
    const icRethTotalSupplyBn = await supplyProvider.getSupply(icRETH)
    const icRethTotalSupply = Number(utils.formatUnits(icRethTotalSupplyBn))
    const contract = new Contract(
      AaveProtocolDataProvider,
      AaveProtocolDataProviderAbi,
      this.provider,
    )
    const supplyCapIssuanceHookContract = new Contract(
      SupplyCapIssuanceHook,
      SupplyCapIssuanceHookAbi,
      this.provider,
    )
    const icRethSupplyCapBn = await supplyCapIssuanceHookContract.supplyCap()
    const icRethSupplyCap = Number(utils.formatUnits(icRethSupplyCapBn))
    const icRethAvailable = icRethSupplyCap - icRethTotalSupply
    // rETH
    const aTokenTotalSupply = await contract.getATokenTotalSupply(rETH)
    const totalSupply = Math.ceil(Number(utils.formatUnits(aTokenTotalSupply)))
    const res: { borrowCap: BigNumber; supplyCap: BigNumber } =
      await contract.getReserveCaps(rETH)
    const cap = Number(res.supplyCap.toString())
    const availableSupply = cap - totalSupply
    return {
      icreth: {
        availableSupply: icRethAvailable,
        cap: icRethSupplyCap,
        totalSupply: icRethTotalSupply,
      },
      reth: {
        availableSupply,
        cap,
        totalSupply,
      },
    }
  }
}
