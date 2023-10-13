import { CoinGeckoService } from "../../utils/coingecko"
import { IndexVolumeProvider } from "./provider"

describe("#IndexVolumeProvider", () => {
  let service: CoinGeckoService

  beforeEach(() => {
    /* eslint-disable  @typescript-eslint/no-non-null-assertion */
    service = new CoinGeckoService(process.env.COINGECKO_API_KEY!)
  })

  it("get24hVolume for icETH", async () => {
    const chainId = 1
    const icETH = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84"
    const res = await service.getTokenPrice({
      address: icETH,
      chainId,
      baseCurrency: "usd",
      include24hrVol: true,
    })
    const expectedResult = res[icETH.toLowerCase()]
    const provider = new IndexVolumeProvider(service)
    const volume = await provider.get24hVolume(icETH, chainId)
    expect(volume).not.toBeUndefined()
    expect(volume).toEqual(expectedResult["usd_24h_vol"])
  })

  it("get24hVolume for ic21", async () => {
    const chainId = 1
    const request = {
      address: "0x1B5E16C5b20Fb5EE87C61fE9Afe735Cca3B21A65",
      chainId,
      baseCurrency: "usd",
      include24hrVol: true,
    }
    const res = await service.getTokenPrice(request)
    const expectedResult = res[request.address.toLowerCase()]
    const provider = new IndexVolumeProvider(service)
    const volume = await provider.get24hVolume(request.address, chainId)
    expect(volume).not.toBeUndefined()
    expect(volume).toEqual(expectedResult["usd_24h_vol"])
  })
})
