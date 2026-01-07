export interface FamilySlice {
  // Actions
  addFamilyMember: (
    name: string,
    type: 'wife' | 'husband' | 'child' | 'pet',
    age: number,
    income: number,
    expenses: number,
  ) => void
  removeFamilyMember: (id: string) => void
  updateLifeGoal: (goalId: string, progress: number) => void
  completeLifeGoal: (goalId: string) => void

  // Relationship Actions
  startDating: () => void
  acceptPartner: () => void
  rejectPartner: () => void
  tryForBaby: () => void
  adoptPet: (petType: 'dog' | 'cat' | 'hamster', name: string, cost: number) => void
  setMemberFoodPreference: (memberId: string, foodId: string) => void
  setMemberTransportPreference: (memberId: string, transportId: string) => void
}
