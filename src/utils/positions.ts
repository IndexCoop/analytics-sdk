import { Contract, providers } from "ethers"

type Providers = providers.JsonRpcProvider | providers.StaticJsonRpcProvider

export async function getPositions(address: string, provider: Providers) {
  const contract = new Contract(address, indexTokenAbi, provider)
  const positions = await contract.getPositions()
  return positions
}

const indexTokenAbi = [
  {
    inputs: [],
    name: "getPositions",
    outputs: [
      {
        components: [
          { internalType: "address", name: "component", type: "address" },
          { internalType: "address", name: "module", type: "address" },
          { internalType: "int256", name: "unit", type: "int256" },
          { internalType: "uint8", name: "positionState", type: "uint8" },
          { internalType: "bytes", name: "data", type: "bytes" },
        ],
        internalType: "struct ISetToken.Position[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
]
