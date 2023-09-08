import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { Ic21NavProvider } from "./ic21"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("Ic21NavProvider", () => {
  test("returns NAV for ic21", async () => {
    const provider = new Ic21NavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav()
    expect(nav).toBeGreaterThan(1)
  })
})
