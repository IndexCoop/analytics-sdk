interface SupplyProvider {
  getSupply(): BigInt;
}

export class IndexSupplyProvider implements SupplyProvider {
  getSupply(): BigInt {
    return BigInt(0);
  }
}
