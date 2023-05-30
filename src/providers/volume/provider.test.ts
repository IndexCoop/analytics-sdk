import { CoinGeckoService } from "../../utils/coingecko"
import { IndexVolumeProvider } from "./provider"

const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"

describe("#IndexVolumeProvider", () => {
  let service: CoinGeckoService

  beforeEach(() => {
    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    service = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
  })

  it("get24hVolume", async () => {
    const chainId = 1
    const res = await service.getTokenPrice({
      address: icETH,
      chainId,
      baseCurrency: "usd",
      include24hrVol: true,
    })
    const expectedResult = res[icETH.toLowerCase()]
    const provider = new IndexVolumeProvider(service)
    const volume = await provider.get24hVolume(icETH, chainId)
    expect(volume).toEqual(expectedResult["usd_24h_vol"])
  })
})
