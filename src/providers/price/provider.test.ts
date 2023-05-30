import { CoinGeckoService } from "../../utils/coingecko"
import { IndexPriceProvider } from "./provider"

const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"

describe("#IndexPriceProvider", () => {
  let service: CoinGeckoService

  beforeEach(() => {
    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    service = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
  })

  it("getPrice", async () => {
    const chainId = 1
    const res = await service.getTokenPrice({
      address: icETH,
      chainId,
      baseCurrency: "usd",
      include24hrVol: false,
    })
    const expectedResult = res[icETH.toLowerCase()]
    const expectedPrice = expectedResult["usd"]
    const provider = new IndexPriceProvider(service)
    const price = await provider.getPrice(icETH, chainId)
    expect(price).toEqual(expectedPrice)
  })
})
