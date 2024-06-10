import { Contract, providers } from "ethers"

export async function getDecimals(
  address: string,
  provider: providers.JsonRpcProvider,
) {
  const Erc20Abi = ["function decimals() public view returns (uint8)"]
  const contract = new Contract(address, Erc20Abi, provider)
  const decimals = await contract.decimals()
  return decimals
}
