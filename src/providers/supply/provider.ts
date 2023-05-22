interface SupplyProvider {
  getSupply(): bigint
}

export class IndexSupplyProvider implements SupplyProvider {
  getSupply(): bigint {
    return BigInt(0)
  }
}
