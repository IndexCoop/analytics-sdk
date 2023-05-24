import { BigNumber, Contract, providers, utils } from "ethers"

import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { IndexNavProvider } from "./provider"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("IndexSupplyProvider", () => {
  test("returns the supply for icSMMT", async () => {
    const icSMMT = "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD"
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(icSMMT)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the supply for icETH", async () => {
    const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"
    const expectedNav = await getNav(icETH, 1)
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(icETH)
    await expect(nav).toBeCloseTo(expectedNav)
  })
})

async function getNav(address: string, chainId: number) {
  const contract = new Contract(address, indexTokenAbi, rpcProvider)
  const positions = await contract.getPositions()
  const positionPrices = await coingeckoService.findPrices({
    addresses: positions.map((p: any) => p.component),
    chainId,
    baseCurrency: "usd",
    includeDailyChange: false,
  })
  const usdValues = positions.map((p: any, index: number) => {
    const priceUsd = positionPrices[p.component.toLowerCase()]?.["usd"]
    const unit = utils.formatUnits(p.unit.toString())
    return priceUsd * Number(unit)
  })
  const nav = usdValues.reduce((prev: number, curr: number) => curr + prev, 0)
  return nav
}

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
