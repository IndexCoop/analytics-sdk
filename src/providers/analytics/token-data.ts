import { getIndexTokenData } from "@indexcoop/tokenlists"

interface Token {
  decimals: number
  name: string
  symbol: string
}

const btc2x = getIndexTokenData("BTC2X")!
const eth2x = getIndexTokenData("ETH2X")!

// TODO: might be able to use tokenlists here in the future
// Add addresses lowercased!!
export const TokenData: { [key: string]: Token } = {
  "0xd2ac55ca3bbd2dd1e9936ec640dcb4b745fde759": {
    ...btc2x,
  },
  "0x2aF1dF3AB0ab157e1E2Ad8F88A7D04fbea0c7dc6": {
    decimals: 18,
    name: "Bankless BED Index",
    symbol: "BED",
  },
  "0x0b498ff89709d3838a063f1dfa463091f9801c2b": {
    decimals: 18,
    name: "BTC 2x Flexible Leverage Index",
    symbol: "BTC2x-FLI",
  },
  "0x55b2cfcfe99110c773f00b023560dd9ef6c8a13b": {
    decimals: 18,
    name: "Index Coop CoinDesk ETH Trend Index",
    symbol: "cdETI",
  },
  "0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b": {
    decimals: 18,
    name: "DefiPulse Index",
    symbol: "DPI",
  },
  "0x341c05c0e9b33c0e38d64de76516b2ce970bb3be": {
    decimals: 18,
    name: "Diversified Staked ETH Index",
    symbol: "dsETH",
  },
  "0x65c4c0517025ec0843c9146af266a2c5a2d148a2": {
    ...eth2x,
  },
  "0xaa6e8127831c9de45ae56bb1b0d4d4da6e5665bd": {
    decimals: 18,
    name: "ETH 2x Flexible Leverage Index",
    symbol: "ETH2x-FLI",
  },
  "0x36c833eed0d376f75d1ff9dfdee260191336065e": {
    decimals: 18,
    name: "Gitcoin Staked ETH Index",
    symbol: "gtcETH",
  },
  "0x1b5e16c5b20fb5ee87c61fe9afe735cca3b21a65": {
    decimals: 18,
    name: "Index Coop Large Cap Index",
    symbol: "ic21",
  },
  "0x7c07f7abe10ce8e33dc6c5ad68fe033085256a84": {
    decimals: 18,
    name: "Interest Compounding ETH Index",
    symbol: "icETH",
  },
  "0x72e364f2abdc788b7e918bc238b21f109cd634d7": {
    decimals: 18,
    name: "Metaverse Index",
    symbol: "MVI",
  },
}
