import { BigNumber, Contract, providers } from "ethers"

interface SupplyProvider {
  getSupply(address: string): Promise<BigNumber>
}

const Erc20Abi = ["function totalSupply() public view returns (uint256)"]

export class IndexSupplyProvider implements SupplyProvider {
  constructor(
    private readonly provider:
      | providers.JsonRpcProvider
      | providers.StaticJsonRpcProvider,
  ) {}

  async getSupply(address: string): Promise<BigNumber> {
    try {
      const contract = new Contract(address, Erc20Abi, this.provider)
      const supply: BigNumber = await contract.totalSupply()
      return supply
    } catch (error: any) {
      throw error
    }
  }
}
