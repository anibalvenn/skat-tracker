export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateListAccess = (
  players: string[],
  mode: '3er' | '4er'
): ValidationResult => {
  // Check if players data exists
  if (!players || !Array.isArray(players)) {
    return {
      isValid: false,
      error: 'No player data found. Please set up your game first.'
    };
  }

  // Validate player count
  const requiredPlayers = mode === '3er' ? 3 : 4;
  if (players.length !== requiredPlayers) {
    return {
      isValid: false,
      error: `Invalid player count. ${mode} mode requires exactly ${requiredPlayers} players.`
    };
  }

  // Validate player names (optional but recommended)
  const invalidPlayers = players.filter(player => !player || player.length < 3);
  if (invalidPlayers.length > 0) {
    return {
      isValid: false,
      error: 'All players must have names with at least 3 characters.'
    };
  }

  return { isValid: true };
};