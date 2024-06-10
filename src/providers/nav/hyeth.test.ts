import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { HyEthNavProvider } from "./hyeth"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("HyEthNavProvider", () => {
  test("returns NAV for hyETH", async () => {
    const provider = new HyEthNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav()
    expect(nav).toBeGreaterThan(1)
  })
})
