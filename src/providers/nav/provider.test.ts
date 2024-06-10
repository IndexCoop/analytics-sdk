import { BigNumber, Contract, utils } from "ethers"

import { ChainId } from "../../constants"
import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { FliNavProvider } from "./fli-nav-provider"
import { IndexNavProvider } from "./provider"
import { Ic21NavProvider } from "./ic21"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)
const rpcProviderArbitrum = buildAlchemyProvider(
  ChainId.Arbitrum,
  process.env.ALCHEMY_API_KEY!,
)

describe("IndexSupplyProvider (Mainnet)", () => {
  test("returns the NAV for cdETI", async () => {
    const cdETI = "0x55b2CFcfe99110C773f00b023560DD9ef6C8A13B"
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(cdETI)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for BTC2xFLI", async () => {
    const btc2xfli = "0x0B498ff89709d3838a063f1dFA463091F9801c2b"
    const fliNavProvider = new FliNavProvider(rpcProvider, coingeckoService)
    const expectedNav = await fliNavProvider.getNav(btc2xfli)
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(btc2xfli)
    await expect(nav).toBeCloseTo(expectedNav)
  })

  test("returns the NAV for ETH2xFLI", async () => {
    const eth2xfli = "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD"
    const fliNavProvider = new FliNavProvider(rpcProvider, coingeckoService)
    const expectedNav = await fliNavProvider.getNav(eth2xfli)
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(eth2xfli)
    await expect(nav).toBeCloseTo(expectedNav)
  })

  test("returns the NAV for hyETH", async () => {
    const hyeth = "0xc4506022Fb8090774E8A628d5084EED61D9B99Ee"
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(hyeth)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for ic21", async () => {
    const ic21 = "0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65"
    const ic21NavProvider = new Ic21NavProvider(rpcProvider, coingeckoService)
    const expectedNav = await ic21NavProvider.getNav()
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(ic21)
    await expect(nav).toBeCloseTo(expectedNav)
  })

  test.skip("returns the NAV for icSMMT", async () => {
    const icSMMT = "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD"
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(icSMMT)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for icETH", async () => {
    const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"
    const expectedNav = await getNav(icETH, 1)
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(icETH)
    await expect(nav).toBeCloseTo(expectedNav)
  })
})

describe("IndexSupplyProvider (Arbitrum)", () => {
  test("returns the NAV for BTC2X", async () => {
    const btc2x = "0xeb5bE62e6770137beaA0cC712741165C594F59D7"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(btc2x)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for BTC3X", async () => {
    const btc3x = "0x3bDd0d5c0C795b2Bf076F5C8F177c58e42beC0E6"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(btc3x)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for ETH2X", async () => {
    const eth2x = "0x26d7D3728C6bb762a5043a1d0CeF660988Bca43C"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(eth2x)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for ETH3X", async () => {
    const eth3x = "0xA0A17b2a015c14BE846C5d309D076379cCDfa543"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(eth3x)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for iBTC1X", async () => {
    const ibtc1x = "0x80e58AEA88BCCaAE19bCa7f0e420C1387Cc087fC"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(ibtc1x)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for iETH1X", async () => {
    const ieth1x = "0x749654601a286833aD30357246400D2933b1C89b"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(ieth1x)
    await expect(nav).toBeGreaterThan(0)
  })
})

interface Position {
  component: string
  unit: BigNumber
}

async function getNav(address: string, chainId: number) {
  const contract = new Contract(address, indexTokenAbi, rpcProvider)
  const positions = await contract.getPositions()
  const positionPrices = await coingeckoService.findPrices({
    addresses: positions.map((p: Position) => p.component),
    chainId,
    baseCurrency: "usd",
    includeDailyChange: false,
  })
  const usdValues = positions.map((p: Position) => {
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
