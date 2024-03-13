import { getIndexTokenData } from "@indexcoop/tokenlists"

import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { FliNavProvider } from "./fli-nav-provider"

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("FliNavProvider", () => {
  test("returns NAV for BTC2x-FLI", async () => {
    const btc2xfli = getIndexTokenData("BTC2x-FLI")!.address
    const provider = new FliNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(btc2xfli)
    expect(nav).toBeGreaterThan(1)
  })

  test("returns NAV for ETH2xFLI", async () => {
    const eth2xfli = getIndexTokenData("ETH2x-FLI")!.address
    const provider = new FliNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(eth2xfli)
    expect(nav).toBeGreaterThan(1)
  })
})
