import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { IcSmmtNavProvider } from "./icsmmt"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("IcSmmtNavProvder", () => {
  test("returns supply for icSMMT", async () => {
    const provider = new IcSmmtNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav()
    expect(nav).toBeGreaterThan(0)
  })
})
