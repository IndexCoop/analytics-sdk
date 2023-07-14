import { BigNumber, Contract, utils } from "ethers"

import { buildAlchemyProviderPredefined } from "../../utils/testhelpers"
import { IndexREthProvider } from "./reth"

const rpcProvider = buildAlchemyProviderPredefined(1)

const AaveProtocolDataProvider = "0x7B4EB56E7CD4b454BA8ff71E4518426369a138a3"
const SupplyCapIssuanceHook = "0xED072061e94b035B8D712c64875A469f5Dd407E6"
const icRETH = "0xe8888Cdbc0A5958C29e7D91DAE44897c7e64F9BC"
const rETH = "0xae78736Cd615f374D3085123A210448E74Fc6393"

const AaveProtocolDataProviderAbi = [
  "function getATokenTotalSupply(address asset) external view returns (uint256)",
  "function getReserveCaps(address asset) external view returns (uint256 borrowCap, uint256 supplyCap)",
]

const Erc20Abi = ["function totalSupply() public view returns (uint256)"]

const SupplyCapIssuanceHookAbi = [
  "function supplyCap() public view returns (uint256)",
]

describe("IndexREthProvider", () => {
  test("returns supply data for icRETH", async () => {
    // icRETH
    const icRethContract = new Contract(icRETH, Erc20Abi, rpcProvider)
    const icRethTotalSupplyBn = await icRethContract.totalSupply()
    const icRethTotalSupply = Number(utils.formatUnits(icRethTotalSupplyBn))
    const supplyCapIssuanceHookContract = new Contract(
      SupplyCapIssuanceHook,
      SupplyCapIssuanceHookAbi,
      rpcProvider,
    )
    const icRethSupplyCapBn = await supplyCapIssuanceHookContract.supplyCap()
    const icRethSupplyCap = Number(utils.formatUnits(icRethSupplyCapBn))
    // rETH
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
    expect(supplyData.icreth.availableSupply).toBe(
      icRethSupplyCap - icRethTotalSupply,
    )
    expect(supplyData.icreth.cap).toBe(icRethSupplyCap)
    expect(supplyData.icreth.totalSupply).toBe(icRethTotalSupply)
    expect(supplyData.reth.availableSupply).toBe(cap - totalSupply)
    expect(supplyData.reth.cap).toBe(cap)
    expect(supplyData.reth.totalSupply).toBe(totalSupply)
  })
})
