import { CoinGeckoService } from "./coingecko"

const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"
const mnye = "0x0Be27c140f9Bdad3474bEaFf0A413EC7e19e9B93"
const mvi = "0xfe712251173A2cd5F5bE2B46Bb528328EA3565E1"

describe("#CoinGeckoService", () => {
  let service: CoinGeckoService

  beforeEach(() => {
    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    service = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
  })

  it("getPrice", async () => {
    const res = await service.getTokenPrice({
      address: icETH,
      chainId: 1,
      baseCurrency: "usd",
      include24hrVol: false,
    })
    const result = res[icETH.toLowerCase()]
    expect(result.usd).toBeGreaterThan(0)
  })

  it("getPrice w/ 24h volume", async () => {
    const res = await service.getTokenPrice({
      address: icETH,
      chainId: 1,
      baseCurrency: "usd",
      include24hrVol: true,
    })
    const result = res[icETH.toLowerCase()]
    console.log(result)
    expect(result.usd).toBeGreaterThan(0)
    expect(result["usd_24h_vol"]).toBeDefined()
    expect(result["usd_24h_vol"]).toBeGreaterThan(0)
  })

  it("getPrice on Optimism", async () => {
    const res = await service.getTokenPrice({
      address: mnye,
      chainId: 10,
      baseCurrency: "usd",
      include24hrVol: false,
    })
    const result = res[mnye.toLowerCase()]
    expect(result.usd).toBeGreaterThan(0)
  })

  it("getPrice on Polygon", async () => {
    const res = await service.getTokenPrice({
      address: mvi,
      chainId: 137,
      baseCurrency: "usd",
      include24hrVol: false,
    })
    const result = res[mvi.toLowerCase()]
    expect(result.usd).toBeGreaterThan(0)
  })

  it("findPrices", async () => {
    const res = await service.findPrices({
      chainId: 1,
      baseCurrency: "usd",
      addresses: [icETH],
      includeDailyChange: true,
    })
    const result = res[icETH.toLowerCase()]
    expect(result.usd).toBeGreaterThan(0)
    expect(result.usd_24h_change).toBeDefined()
  })

  it("throws an error when platform/chain is unsupported", async () => {
    service = new CoinGeckoService("")
    const res = await service.findPrices({
      chainId: 1,
      baseCurrency: "usd",
      addresses: [icETH],
      includeDailyChange: true,
    })
    expect(res.status.error_code).toEqual(10002)
    expect(res.status.error_message).toEqual("API Key Missing")
  })
})
