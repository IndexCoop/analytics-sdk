import { providers } from "ethers"

import { CoinGeckoService } from "../../utils/coingecko"
import {
  buildAlchemyProviderPredefined,
  buildCoingeckoServicePredefined,
} from "../../utils/testhelpers"
import { IndexTvlProvider } from "./provider"

describe("#IndexTvlProvider", () => {
  let rpcProvider: providers.JsonRpcProvider
  let coingeckoService: CoinGeckoService

  beforeEach(() => {
    coingeckoService = buildCoingeckoServicePredefined()
    rpcProvider = buildAlchemyProviderPredefined(1)
  })

  it("getTvl", async () => {
    const provider = new IndexTvlProvider(rpcProvider, coingeckoService)
    const tvl = await provider.getTvl()
    expect(tvl).toBeGreaterThan(0)
  })
})
