import { providers } from "ethers"

import { CoinGeckoService } from "utils/coingecko"
import { IcSmmtNavProvider } from "./icsmmt"

interface NavProvider {
  getNav(address: string): Promise<number>
}

const icSMMT = "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD"

export class IndexNavProvider implements NavProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getNav(address: string): Promise<number> {
    const { coingeckoService, provider } = this
    if (address.toLowerCase() === icSMMT.toLowerCase()) {
      const icSmmtProvider = new IcSmmtNavProvider(provider, coingeckoService)
      const nav = await icSmmtProvider.getNav()
      return nav
    }
    return 0
  }
}
