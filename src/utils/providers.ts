import { providers } from "ethers"

import { ChainId } from "../constants"

export function getAlchemySubdomain(chainId: number): string | null {
  switch (chainId) {
    case ChainId.Mainnet:
      return "eth"
    case ChainId.Optimism:
      return "opt"
    case ChainId.Polygon:
      return "polygon"
    case ChainId.Arbitrum:
      return "arb"
    default:
      return null
  }
}

export function buildAlchemyProvider(
  chainId: number,
  apiKey: string,
): providers.JsonRpcProvider {
  const subdomain = getAlchemySubdomain(chainId)
  const url = `https://${subdomain}-mainnet.g.alchemy.com/v2/${apiKey}`
  return new providers.JsonRpcProvider(url)
}
