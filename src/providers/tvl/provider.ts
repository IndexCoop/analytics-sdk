import { providers } from "ethers"

import { IndexMarketCapProvider } from "../marketcap"
import { CoinGeckoService } from "../../utils"

interface TvlProvider {
  getTvl(): Promise<number>
}

const indices = [
  "0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6", // BED
  "0x72e364F2ABdC788b7E918bc238B21f109Cd634D7", // MVI
  "0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b", // DPI
  "0x0B498ff89709d3838a063f1dFA463091F9801c2b", // ETH2x-FLI
  "0xAa6E8127831c9DE45ae56bB1b0d4D4Da6e5665BD", // BTC2x-FLI
  "0xc30FBa978743a43E736fc32FBeEd364b8A2039cD", // MMI
  "0x36c833Eed0D376f75D1ff9dFDeE260191336065e", // gtcETH
  "0x341c05c0E9b33C0E38d64de76516b2Ce970bB3BE", // dsETH
  "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84", // icETH
]

export class IndexTvlProvider implements TvlProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
    private readonly coingeckoService: CoinGeckoService,
  ) {}

  async getTvl(): Promise<number> {
    const marketCapProvider = new IndexMarketCapProvider(
      this.provider,
      this.coingeckoService,
    )
    const promises = indices.map((index) =>
      marketCapProvider.getMarketCap(index),
    )
    const results = await Promise.all(promises)
    const tvl = results.reduce(
      (prevValue, currValue) => prevValue + currValue,
      0,
    )
    return tvl
  }
}
