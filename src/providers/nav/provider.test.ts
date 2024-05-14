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
    const btc2x = "0xfa69F1e2e48B411b98a105fb693fb381764Dc857"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(btc2x)
    console.log(nav)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for BTC3X", async () => {
    const btc3x = "0x53765a7cF4933bc939e32fA560FFf3D8E1d63473"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(btc3x)
    console.log(nav)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for ETH2X", async () => {
    const eth2x = "0x67d2373f0321Cd24a1b58e3c81fC1b6Ef15B205C"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(eth2x)
    console.log(nav)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for ETH3X", async () => {
    const eth3x = "0x0bef95Cc308027C9a754D7674DE0844AE1dcD5b1"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(eth3x)
    console.log(nav)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for iBTC1X", async () => {
    const ibtc1x = "0xCaD2B03e289260cCF59209CF059778342d1Cf33b"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(ibtc1x)
    console.log(nav)
    await expect(nav).toBeGreaterThan(0)
  })

  test("returns the NAV for iETH1X", async () => {
    const ieth1x = "0xaa61DDA963d0Cf89dA3C13FE635C84a1B8B6B988"
    const provider = new IndexNavProvider(rpcProviderArbitrum, coingeckoService)
    const nav = await provider.getNav(ieth1x)
    console.log(nav)
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
