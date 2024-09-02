import { providers } from "ethers"

import { ChainId } from "../constants"

export function getAlchemySubdomain(chainId: number): string | null {
  switch (chainId) {
    case ChainId.Arbitrum:
      return "arb"
    case ChainId.Base:
      return "base"
    case ChainId.Mainnet:
      return "eth"
    case ChainId.Optimism:
      return "opt"
    case ChainId.Polygon:
      return "polygon"
    default:
      return null
  }
}

export function buildAlchemyProvider(
  chainId: number,
  apiKey: string,
  skipFetchSetup?: boolean,
): providers.JsonRpcProvider {
  const url = buildAlchemyProviderUrl(chainId, apiKey)
  return new providers.JsonRpcProvider({ url, skipFetchSetup })
}

export function buildAlchemyProviderUrl(
  chainId: number,
  apiKey: string,
): string {
  const subdomain = getAlchemySubdomain(chainId)
  const url = `https://${subdomain}-mainnet.g.alchemy.com/v2/${apiKey}`
  return url
}

export function getRpcProvider(rpcUrl: string, skipFetchSetup?: boolean) {
  return new providers.JsonRpcProvider({ url: rpcUrl, skipFetchSetup })
}
