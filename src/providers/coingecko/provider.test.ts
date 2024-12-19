import { CoinGeckoService } from "../../utils"
import { CoingeckoProvider } from "./provider"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)

describe("CoingeckoProvider", () => {
  test("returns token data for ETH", async () => {
    const provider = new CoingeckoProvider(coingeckoService)
    const data = await provider.getTokenStats("ETH")
    expect(data.symbol).toBe("ETH")
    expect(data.price).toBeGreaterThan(0)
    expect(typeof data.change24h).toBe("number")
    expect(data.low24h).toBeGreaterThan(0)
    expect(data.high24h).toBeGreaterThan(0)
  })

  test("returns token data for BTC", async () => {
    const provider = new CoingeckoProvider(coingeckoService)
    const data = await provider.getTokenStats("BTC")
    expect(data.symbol).toBe("BTC")
    expect(data.price).toBeGreaterThan(0)
    expect(typeof data.change24h).toBe("number")
    expect(data.low24h).toBeGreaterThan(0)
    expect(data.high24h).toBeGreaterThan(0)
  })

  test("returns token data for BTC/ETH ratio", async () => {
    const provider = new CoingeckoProvider(coingeckoService)
    const data = await provider.getTokenStats("BTC", "eth")
    console.log(data)
    expect(data.symbol).toBe("BTC")
    expect(data.price).toBeGreaterThan(0)
    expect(typeof data.change24h).toBe("number")
    expect(data.low24h).toBeGreaterThan(0)
    expect(data.high24h).toBeGreaterThan(0)
  })
})
