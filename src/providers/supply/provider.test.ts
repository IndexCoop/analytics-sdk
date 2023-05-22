import { IndexSupplyProvider } from "./provider"

describe("IndexSupplyProvider", () => {
  test("it works", async () => {
    const provider = new IndexSupplyProvider()
    const supply = await provider.getSupply()
    expect(supply).toBe(BigInt(0))
  })
})
