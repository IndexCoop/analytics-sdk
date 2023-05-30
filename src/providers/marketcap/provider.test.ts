import { utils } from "ethers"

import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { IndexSupplyProvider } from "../supply"
import { IndexMarketCapProvider } from "./provider"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("IndexMarketCapProvider", () => {
  test("returns the the market cap for icETH", async () => {
    const baseCurrency = "usd"
    const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"

    const res = await coingeckoService.getTokenPrice({
      address: icETH,
      chainId: 1,
      baseCurrency,
      include24hrVol: false,
    })
    const price = res[icETH.toLowerCase()][baseCurrency]
    const supplyProvider = new IndexSupplyProvider(rpcProvider)
    const supply = await supplyProvider.getSupply(icETH)
    const supplyFormatted = utils.formatUnits(supply.toString())
    const expectedMarketCap = price * Number(supplyFormatted)

    const provider = new IndexMarketCapProvider(rpcProvider, coingeckoService)
    const marketCap = await provider.getMarketCap(icETH)
    await expect(marketCap).toEqual(expectedMarketCap)
  })
})
