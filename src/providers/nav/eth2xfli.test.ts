import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { Eth2xFliNavProvider } from "./eth2xfli"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("Eth2xFliNavProvider", () => {
  test("returns NAV for ETH2xFLI", async () => {
    const provider = new Eth2xFliNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav()
    expect(nav).toBeGreaterThan(1)
  })
})
