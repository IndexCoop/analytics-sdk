// This is needed to make fetch work
/// <reference lib="dom" />
import { ChainId } from "../constants"

export type CurrencyCodePriceMap = {
  [key: string]: number
}

export type FindPricesRequest = {
  chainId: ChainId
  baseCurrency: string
  addresses: string[]
  includeDailyChange: boolean
}

export type FindPricesResponse = {
  [key: string]: CurrencyCodePriceMap
}

export type GetPriceRequest = {
  chainId: ChainId
  baseCurrency: string
  address: string
}

export type GetPriceResponse = {
  [key: string]: CurrencyCodePriceMap
}

export class CoinGeckoService {
  private readonly host = "https://pro-api.coingecko.com/api/v3"
  constructor(private readonly apiKey: string) {}

  async getPrice(req: GetPriceRequest): Promise<GetPriceResponse> {
    const assetPlatform = this.getAssetPlatform(req.chainId)
    const path = `simple/token_price/${assetPlatform}?vs_currencies=${req.baseCurrency}&contract_addresses=${req.address}`
    const res = await this.GET(path)
    return await res.json()
  }

  async findPrices(req: FindPricesRequest): Promise<FindPricesResponse> {
    const assetPlatform = this.getAssetPlatform(req.chainId)
    let path = `simple/token_price/${assetPlatform}?vs_currencies=${req.baseCurrency}&contract_addresses=${req.addresses}`
    if (req.includeDailyChange) {
      path = `${path}&include_24hr_change=true`
    }
    const res = await this.GET(path)
    return await res.json()
  }

  private async GET(path: string): Promise<Response> {
    const url = `${this.host}/${path}`
    const request = new Request(url, {
      headers: {
        "X-Cg-Pro-Api-Key": this.apiKey,
      },
      method: "GET",
    })
    const res = await fetch(request)
    return res
  }

  private getAssetPlatform(chainId: ChainId): string {
    switch (chainId) {
      case ChainId.Mainnet:
        return "ethereum"
      case ChainId.Optimism:
        return "optimistic-ethereum"
      case ChainId.Polygon:
        return "polygon-pos"
    }
  }
}
