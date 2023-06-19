import { BigNumber, Contract, providers, utils } from "ethers"

const AaveProtocolDataProvider = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3"
const rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393"

const AaveProtocolDataProviderAbi = [
  "function getATokenTotalSupply(address asset) external view returns (uint256)",
  "function getReserveCaps(address asset) external view returns (uint256 borrowCap, uint256 supplyCap)",
]

interface IcREthSupplyData {
  availableSupply: number
  cap: number
  totalSupply: number
}

export class IndexREthProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
  ) {}

  async getSupplyData(): Promise<IcREthSupplyData> {
    const contract = new Contract(
      AaveProtocolDataProvider,
      AaveProtocolDataProviderAbi,
      this.provider,
    )
    const aTokenTotalSupply = await contract.getATokenTotalSupply(rETH)
    const totalSupply = Math.ceil(Number(utils.formatUnits(aTokenTotalSupply)))
    const res: { borrowCap: BigNumber; supplyCap: BigNumber } =
      await contract.getReserveCaps(rETH)
    const cap = Number(res.supplyCap.toString())

    const availableSupply = cap - totalSupply
    return {
      availableSupply,
      cap,
      totalSupply,
    }
  }
}
