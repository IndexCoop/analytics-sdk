# AnalyticsSDK

Please consider this SDK in `beta` until version 1.0.

Pricing data is powered by [CoinGecko](https://www.coingecko.com).

## Setup

0. Make sure to use Node.js 18+
1. `npm install`
2. `cp .env.example .env`

## Development

```
npm test:watch
```

### Releasing a new index token

When releasing a new index token make sure to add it to the [tvl provider](./src/providers/tvl/provider.ts). So that the provider reflects the total TVL over all Index's products.

Additionally, make sure it's added in the [static token data](./src/providers/analytics/token-data.ts).

### New components for an index token

Make sure to check the different custom providers for necessary changes e.g.

- add/update components for ic21 in the [nav provider](./src/providers/nav/ic21.ts)

## Examples

Each indicator has its own [provider](./src/providers/). The following indicators are currently provided and return the according data for an Index token.

- Market Cap (NAV \* supply)
- Market Price
- Net Asset Value (NAV)
- (Current) Supply
- TVL (for all Index products)
- (24h) Volume

With just a few lines you can setup any of the providers and fetch the required data.

The first example shows a full example with imports etc. Those are left out for all following ones.

### MarketCap

```typescript
import { providers } from "ethers"
import {
  CoinGeckoService,
  IndexMarketCapProvider,
} from "@indexcoop/analytics-sdk"
const index = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84" // icETH
const rpcProvider = new providers.JsonRpcProvider(url)
const coingecko = new CoinGeckoService(coingeckoApiKey)
const provider = new IndexMarketCapProvider(rpcProvider, coingecko)
const marketCap = await provider.getMarketCap(index)
```

### Markt Price

```typescript
const coingecko = new CoinGeckoService(coingeckoApiKey)
const provider = new IndexPriceProvider(coingecko)
const price = await provider.getPrice(index, chainId)
```

### NAV

```typescript
const coingecko = new CoinGeckoService(coingeckoApiKey)
const provider = new IndexNavProvider(rpcProvider, coingecko)
const nav = await provider.getNav(index)
```

### Supply

```typescript
const provider = new IndexSupplyProvider(rpcProvider)
const supply = await provider.getSupply(index)
```

### 24h Volume

```typescript
import { CoinGeckoService, IndexVolumeProvider } from "@indexcoop/analytics-sdk"
const chainId = 1
const index = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84" // icETH
const coingecko = new CoinGeckoService(coingeckoApiKey)
const provider = new IndexVolumeProvider(coingecko)
const volume = await provider.get24hVolume(index, chainId)
```

## AnalyticsProvider

To fetch all analytics data for a token at once use the `IndexAnalyticsProvider`.

```typescript
const address = "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84" // icETH
const provider = new IndexAnalyticsProvider(rpcProvider, coingeckoService)
const analyticsData = await provider.getAnalytics(address)
```

### TVL

Returns TVL for all of the Index products combined.

```typescript
const provider = new IndexTvlProvider(rpcProvider, coingeckoService)
const supply = await provider.getTvl()
```

## License

[MIT](./LICENSE)
