import { providers } from "ethers"

export function getAlchemySubdomain(chainId: number): string | null {
  switch (chainId) {
    case 1:
      return "eth"
    case 10:
      return "opt"
    case 137:
      return "polygon"
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
