import { BigNumber } from "ethers"
import { CoingeckoTokenPriceResponse } from "./coingecko"

type SettledResponse = BigNumber | CoingeckoTokenPriceResponse | number | null

// Returns the fulfilled value in case of success and otherwise
// returns null and logs the reason for rejection
export function getFulfilledValueOrNull(
  res: PromiseSettledResult<SettledResponse>,
): SettledResponse {
  if (res.status === "rejected") {
    console.error(res.reason)
  }

  return res.status === "fulfilled" ? res.value : null
}
