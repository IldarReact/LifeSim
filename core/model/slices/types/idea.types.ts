export interface IdeaSlice {
  // Actions
  generateIdea: () => void
  developIdea: (ideaId: string, investment: number) => void
  launchBusinessFromIdea: (ideaId: string) => void
  discardIdea: (ideaId: string) => void
}
