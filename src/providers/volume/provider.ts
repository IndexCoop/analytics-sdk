import { CoinGeckoService, CoinGeckoUtils } from "../../utils"

interface VolumeProvider {
  get24hVolume(address: string, chainId: number): Promise<number>
}

export class IndexVolumeProvider implements VolumeProvider {
  constructor(private readonly coingeckoService: CoinGeckoService) {}

  async get24hVolume(address: string, chainId: number): Promise<number> {
    const baseCurrency = "usd"
    const priceRequest = {
      address,
      baseCurrency,
      chainId,
      include24hrVol: true,
    }
    const res = await this.coingeckoService.getTokenPrice(priceRequest)
    const label = CoinGeckoUtils.get24hVolumeLabel(baseCurrency)
    return res[address.toLowerCase()][label]
  }
}
