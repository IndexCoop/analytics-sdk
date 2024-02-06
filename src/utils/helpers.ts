import { BigNumber } from "ethers"
import { CoingeckoTokenPriceResponse } from "./coingecko"

type SettledResponse = BigNumber | CoingeckoTokenPriceResponse | number | null

export function getFulfilledValueOrNull(res: PromiseSettledResult<SettledResponse>): SettledResponse {
  return res.status === 'fulfilled' ? res.value : null
}