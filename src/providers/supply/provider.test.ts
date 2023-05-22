import { buildAlchemyProvider } from "../../utils"
import { IndexSupplyProvider } from "./provider"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("IndexSupplyProvider", () => {
  test("returns supply for icETH", async () => {
    const icEth = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"
    const provider = new IndexSupplyProvider(rpcProvider)
    const supply = await provider.getSupply(icEth)
    console.log(supply.toString())
    expect(supply.gt(0)).toBe(true)
  })

  test("returns supply for MVI", async () => {
    const mvi = "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7"
    const provider = new IndexSupplyProvider(rpcProvider)
    const supply = await provider.getSupply(mvi)
    console.log(supply.toString())
    expect(supply.gt(0)).toBe(true)
  })

  test("throws error for wrong address", async () => {
    const icEthWrong = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A"
    const provider = new IndexSupplyProvider(rpcProvider)
    await expect(provider.getSupply(icEthWrong)).rejects.toThrow()
  })
})
