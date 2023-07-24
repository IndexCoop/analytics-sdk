import { utils } from "ethers"

import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { IndexMarketCapProvider } from "../marketcap"
import { IndexNavProvider } from "../nav"
import { IndexPriceProvider } from "../price"
import { IndexSupplyProvider } from "../supply"
import { IndexVolumeProvider } from "../volume"
import { IndexAnalyticsProvider } from "./provider"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("IndexSupplyProvider", () => {
  test("returns complete analytics data", async () => {
    const address = "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7" // MVI
    const provider = new IndexAnalyticsProvider(rpcProvider, coingeckoService)
    const analyticsData = await provider.getAnalytics(address)
    const marketCap = await new IndexMarketCapProvider(
      rpcProvider,
      coingeckoService,
    ).getMarketCap(address)
    const marketPrice = await new IndexPriceProvider(coingeckoService).getPrice(
      address,
      1,
    )
    const navPrice = await new IndexNavProvider(
      rpcProvider,
      coingeckoService,
    ).getNav(address)
    const supplyProvider = new IndexSupplyProvider(rpcProvider)
    const totalSupply = await supplyProvider.getSupply(address)
    const volume = await new IndexVolumeProvider(coingeckoService).get24hVolume(
      address,
      1,
    )
    console.log(analyticsData)
    expect(analyticsData.address).toEqual(address)
    expect(analyticsData.name).toEqual("Metaverse Index")
    expect(analyticsData.symbol).toEqual("MVI")
    expect(analyticsData.decimals).toEqual(18)
    expect(analyticsData.marketCap).toEqual(marketCap)
    expect(analyticsData.marketPrice).toEqual(marketPrice)
    expect(analyticsData.navPrice).toEqual(navPrice)
    expect(analyticsData.totalSupply).toEqual(
      utils.formatUnits(totalSupply.toString()),
    )
    expect(analyticsData.volume).toEqual(volume)
  })
})
