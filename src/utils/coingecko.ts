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

export type CoingeckoTokenPriceRequest = {
  address: string
  chainId: ChainId
  // A supported currency e.g. 'usd' or 'eur'
  baseCurrency: string
  include24hrChange?: boolean
  include24hrVol: boolean
}

export type CoingeckoTokenPriceByIdRequest = {
  // Find necessary id's on the coingecko token page
  ids: string[]
  // A supported currency e.g. 'usd' or 'eur'
  baseCurrency: string
}

export type CoingeckoTokenPriceResponse = {
  [key: string]: CurrencyCodePriceMap
}

export class CoinGeckoService {
  private readonly host = "https://pro-api.coingecko.com/api/v3"
  constructor(private readonly apiKey: string) {}

  async getTokenPrice(
    req: CoingeckoTokenPriceRequest,
  ): Promise<CoingeckoTokenPriceResponse> {
    const assetPlatform = this.getAssetPlatform(req.chainId)
    let path = `simple/token_price/${assetPlatform}?vs_currencies=${req.baseCurrency}&contract_addresses=${req.address}`
    if (req.include24hrChange) {
      path = `${path}&include_24hr_change=true`
    }
    if (req.include24hrVol) {
      path = `${path}&include_24hr_vol=true`
    }
    const res = await this.GET(path)
    return await res.json()
  }

  async getTokenPriceById(
    req: CoingeckoTokenPriceByIdRequest,
  ): Promise<CoingeckoTokenPriceResponse> {
    const path = `simple/price/?vs_currencies=${
      req.baseCurrency
    }&ids=${req.ids.toString()}`
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

export class CoinGeckoUtils {
  static get24hChangeLabel(baseCurrency: string) {
    return `${baseCurrency}_24h_change`
  }

  static get24hVolumeLabel(baseCurrency: string) {
    return `${baseCurrency}_24h_vol`
  }
}
