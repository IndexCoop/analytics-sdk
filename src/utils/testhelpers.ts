import { providers } from "ethers"

import { CoinGeckoService } from "./coingecko"
import { getAlchemySubdomain } from "./providers"

export function buildAlchemyProviderPredefined(
  chainId: number,
): providers.JsonRpcProvider {
  const subdomain = getAlchemySubdomain(chainId)
  /* eslint-disable  @typescript-eslint/no-non-null-assertion */
  const url = `https://${subdomain}-mainnet.g.alchemy.com/v2/${process.env
    .ALCHEMY_API_KEY!}`
  return new providers.JsonRpcProvider(url)
}

export function buildCoingeckoServicePredefined(): CoinGeckoService {
  return new CoinGeckoService(process.env.COINGECKO_API_KEY!)
}
