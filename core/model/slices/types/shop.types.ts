export interface ShopSlice {
  buyItem: (itemId: string) => void
  setLifestyle: (category: string, itemId: string | undefined) => void
  setPlayerHousing: (housingId: string) => void
}
