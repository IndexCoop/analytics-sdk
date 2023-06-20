import { providers } from "ethers"

function getAlchemySubdomain(chainId: number): string | null {
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

export function buildAlchemyProviderPredefined(
  chainId: number,
): providers.JsonRpcProvider {
  const subdomain = getAlchemySubdomain(chainId)
  /* eslint-disable  @typescript-eslint/no-non-null-assertion */
  const url = `https://${subdomain}-mainnet.g.alchemy.com/v2/${process.env
    .ALCHEMY_API_KEY!}`
  return new providers.JsonRpcProvider(url)
}
