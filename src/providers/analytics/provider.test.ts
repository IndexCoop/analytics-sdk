import { utils } from "ethers"

import { ChainId } from "../../constants"
import {
  buildAlchemyProvider,
  buildAlchemyProviderUrl,
  CoinGeckoService,
} from "../../utils"
import { IndexMarketCapProvider } from "../marketcap"
import { IndexNavProvider } from "../nav"
import { IndexSupplyProvider } from "../supply"

import { IndexAnalyticsProvider } from "./provider"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)
const rpcUrl = buildAlchemyProviderUrl(1, process.env.ALCHEMY_API_KEY!)

describe("IndexAnalyticsProvider", () => {
  test("returns complete analytics data", async () => {
    const address = "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7" // MVI
    const provider = new IndexAnalyticsProvider(coingeckoService, rpcUrl)
    const analyticsData = await provider.getAnalytics(address)
    const marketCap = await new IndexMarketCapProvider(
      rpcProvider,
      coingeckoService,
    ).getMarketCap(address)
    const navPrice = await new IndexNavProvider(
      rpcProvider,
      coingeckoService,
    ).getNav(address)
    const supplyProvider = new IndexSupplyProvider(rpcProvider)
    const totalSupply = await supplyProvider.getSupply(address)
    const coingeckoRes = await coingeckoService.getTokenPrice({
      address,
      chainId: ChainId.Mainnet,
      baseCurrency: "usd",
      include24hrChange: true,
      include24hrVol: true,
    })
    const change24h = coingeckoRes[address.toLowerCase()]["usd_24h_change"]
    const marketPrice = coingeckoRes[address.toLowerCase()]["usd"]
    const volume = coingeckoRes[address.toLowerCase()]["usd_24h_vol"]
    expect(analyticsData.address).toEqual(address)
    expect(analyticsData.name).toEqual("Metaverse Index")
    expect(analyticsData.symbol).toEqual("MVI")
    expect(analyticsData.decimals).toEqual(18)
    expect(analyticsData.marketCap).toEqual(marketCap)
    expect(analyticsData.marketPrice).toEqual(marketPrice)
    expect(analyticsData.navPrice).toBeCloseTo(navPrice)
    expect(analyticsData.totalSupply).toEqual(
      utils.formatUnits(totalSupply.toString()),
    )
    expect(analyticsData.change24h).toEqual(change24h)
    expect(analyticsData.volume24h).toEqual(volume)
  })

  test("returns complete analytics data (hyETH)", async () => {
    const address = "0xc4506022Fb8090774E8A628d5084EED61D9B99Ee"
    const provider = new IndexAnalyticsProvider(coingeckoService, rpcUrl)
    const analyticsData = await provider.getAnalytics(address, 1)
    const marketCap = await new IndexMarketCapProvider(
      rpcProvider,
      coingeckoService,
    ).getMarketCap(address)
    const navPrice = await new IndexNavProvider(
      rpcProvider,
      coingeckoService,
    ).getNav(address)
    const supplyProvider = new IndexSupplyProvider(rpcProvider)
    const totalSupply = await supplyProvider.getSupply(address)
    const coingeckoRes = await coingeckoService.getTokenPrice({
      address,
      chainId: ChainId.Mainnet,
      baseCurrency: "usd",
      include24hrChange: true,
      include24hrVol: true,
    })
    const change24h = coingeckoRes[address.toLowerCase()]["usd_24h_change"]
    const marketPrice = coingeckoRes[address.toLowerCase()]["usd"]
    const volume = coingeckoRes[address.toLowerCase()]["usd_24h_vol"]
    expect(analyticsData.address).toEqual(address)
    expect(analyticsData.name).toEqual("High Yield ETH Index")
    expect(analyticsData.symbol).toEqual("hyETH")
    expect(analyticsData.decimals).toEqual(18)
    expect(analyticsData.marketCap).toEqual(marketCap)
    expect(analyticsData.marketPrice).toEqual(marketPrice)
    expect(analyticsData.navPrice).toBeCloseTo(navPrice)
    expect(analyticsData.totalSupply).toEqual(
      utils.formatUnits(totalSupply.toString()),
    )
    expect(analyticsData.change24h).toEqual(change24h)
    expect(analyticsData.volume24h).toEqual(volume)
  })

  test("returns complete analytics data - arbitrum", async () => {
    const address = "0x3bDd0d5c0C795b2Bf076F5C8F177c58e42beC0E6" // BTC3X
    const chainId = ChainId.Arbitrum
    const rpcProvider = buildAlchemyProvider(
      chainId,
      process.env.ALCHEMY_API_KEY!,
    )
    const rpcUrl = buildAlchemyProviderUrl(
      chainId,
      process.env.ALCHEMY_API_KEY!,
    )
    const provider = new IndexAnalyticsProvider(coingeckoService, rpcUrl)
    const analyticsData = await provider.getAnalytics(address, chainId)
    const marketCap = await new IndexMarketCapProvider(
      rpcProvider,
      coingeckoService,
    ).getMarketCap(address)
    const navPrice = await new IndexNavProvider(
      rpcProvider,
      coingeckoService,
    ).getNav(address)
    const supplyProvider = new IndexSupplyProvider(rpcProvider)
    const totalSupply = await supplyProvider.getSupply(address)
    // Token is currently not on Coingecko. Activate once available.
    // const coingeckoRes = await coingeckoService.getTokenPrice({
    //   address,
    //   chainId,
    //   baseCurrency: "usd",
    //   include24hrChange: true,
    //   include24hrVol: true,
    // })
    // const change24h = coingeckoRes[address.toLowerCase()]["usd_24h_change"]
    // const marketPrice = coingeckoRes[address.toLowerCase()]["usd"]
    // const volume = coingeckoRes[address.toLowerCase()]["usd_24h_vol"]
    expect(analyticsData.address).toEqual(address)
    expect(analyticsData.name).toEqual("Index Coop Bitcoin 3x Index")
    expect(analyticsData.symbol).toEqual("BTC3X")
    expect(analyticsData.decimals).toEqual(18)
    expect(analyticsData.marketCap).toEqual(marketCap)
    // expect(analyticsData.marketPrice).toEqual(marketPrice)
    expect(analyticsData.navPrice).toBeCloseTo(navPrice)
    expect(analyticsData.totalSupply).toEqual(
      utils.formatUnits(totalSupply.toString()),
    )
    // expect(analyticsData.change24h).toEqual(change24h)
    // expect(analyticsData.volume24h).toEqual(volume)
  })

  test("returns minimum analytics data", async () => {
    const address = "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7" // MVI
    const chainId = ChainId.Mainnet
    const provider = new IndexAnalyticsProvider(coingeckoService, rpcUrl)
    const analyticsData = await provider.getAnalytics(address, chainId, {})
    const navPrice = await new IndexNavProvider(
      rpcProvider,
      coingeckoService,
    ).getNav(address)
    const coingeckoRes = await coingeckoService.getTokenPrice({
      address,
      chainId,
      baseCurrency: "usd",
      include24hrChange: false,
      include24hrVol: false,
    })
    const marketPrice = coingeckoRes[address.toLowerCase()]["usd"]
    expect(analyticsData.address).toEqual(address)
    expect(analyticsData.name).toEqual("Metaverse Index")
    expect(analyticsData.symbol).toEqual("MVI")
    expect(analyticsData.decimals).toEqual(18)
    expect(analyticsData.marketPrice).toEqual(marketPrice)
    expect(analyticsData.navPrice).toBeCloseTo(navPrice)
    expect(analyticsData.marketCap).toEqual(null)
    expect(analyticsData.totalSupply).toEqual(null)
    expect(analyticsData.change24h).toEqual(null)
    expect(analyticsData.volume24h).toEqual(null)
  })

  test("throws if index token does not exist", async () => {
    const address = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
    const provider = new IndexAnalyticsProvider(coingeckoService, rpcUrl)
    await expect(provider.getAnalytics(address)).rejects.toThrow(
      "Unknown index token or wrong chainId",
    )
  })
})
