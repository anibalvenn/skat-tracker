// lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Game-related utility functions
export type GameType = '♣' | '♠' | '♥' | '♦' | 'G' | 'N'

export interface GameState {
  gameNumber: number
  dealer: number
  player: number | null
  gameType: GameType | ''
  hand: boolean
  schneider: boolean
  schneiderAnnounced: boolean
  schwarz: boolean
  schwarzAnnounced: boolean
  offen: boolean
}

export interface PlayerCount {
  wonCount: number
  lostCount: number
}

export function calculateGamePoints(game: GameState): number {
  // This is a placeholder - implement actual Skat scoring rules
  let basePoints = 0
  
  switch (game.gameType) {
    case '♣':
      basePoints = 12
      break
    case '♠':
      basePoints = 11
      break
    case '♥':
      basePoints = 10
      break
    case '♦':
      basePoints = 9
      break
    case 'G':
      basePoints = 24
      break
    case 'N':
      return game.hand ? 35 : 23
  }

  let multiplier = 1
  if (game.hand) multiplier++
  if (game.schneider) multiplier++
  if (game.schneiderAnnounced) multiplier++
  if (game.schwarz) multiplier++
  if (game.schwarzAnnounced) multiplier++
  if (game.offen) multiplier++

  return basePoints * multiplier
}