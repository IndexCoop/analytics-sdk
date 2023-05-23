interface NavProvider {
  getNav(): Promise<number>
}

export class IndexNavProvider implements NavProvider {
  async getNav(): Promise<number> {
    return 0
  }
}
