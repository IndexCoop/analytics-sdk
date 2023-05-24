import { buildAlchemyProvider, CoinGeckoService } from "../../utils"
import { IndexNavProvider } from "./provider"

/* eslint-disable  @typescript-eslint/no-non-null-assertion */
const coingeckoService = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
const rpcProvider = buildAlchemyProvider(1, process.env.ALCHEMY_API_KEY!)

describe("IndexSupplyProvider", () => {
  test("it returns the supply for icSMMT", async () => {
    const icSMMT = "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD"
    const provider = new IndexNavProvider(rpcProvider, coingeckoService)
    const nav = await provider.getNav(icSMMT)
    await expect(nav).toBeGreaterThan(0)
  })
})
