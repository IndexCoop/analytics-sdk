import { BigNumber, Contract, providers, utils } from "ethers"

import { buildAlchemyProvider } from "../../utils"
import { IndexREthProvider } from "./reth"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

const AaveProtocolDataProvider = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3"
const rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393"

const AaveProtocolDataProviderAbi = [
  "function getATokenTotalSupply(address asset) external view returns (uint256)",
  "function getReserveCaps(address asset) external view returns (uint256 borrowCap, uint256 supplyCap)",
]

describe("IndexSupplyProvider", () => {
  test("returns supply for icETH", async () => {
    const contract = new Contract(
      AaveProtocolDataProvider,
      AaveProtocolDataProviderAbi,
      rpcProvider,
    )

    const aTokenTotalSupply = await contract.getATokenTotalSupply(rETH)
    const totalSupply = Math.ceil(Number(utils.formatUnits(aTokenTotalSupply)))
    const res: { borrowCap: BigNumber; supplyCap: BigNumber } =
      await contract.getReserveCaps(rETH)
    const cap = Number(res.supplyCap.toString())

    const provider = new IndexREthProvider(rpcProvider)
    const supplyData = await provider.getSupplyData()
    expect(supplyData.cap).toBe(cap)
    expect(supplyData.totalSupply).toBe(totalSupply)
  })
})
