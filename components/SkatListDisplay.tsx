"use client";
import React, { useState } from 'react';
import { Card } from 'components/ui/card';
import { GameType } from 'types';

const gameTypes: GameType[] = ['♣', '♠', '♥', '♦', 'G', 'N'];
type GameBasePoints = { [K in Exclude<GameType, 'eingepasst'>]: number } & { NH: number };

// Game scoring constants
const GAME_BASE_POINTS: GameBasePoints = {
  '♣': 12,
  '♠': 11,
  '♥': 10,
  '♦': 9,
  'G': 24,
  'N': 23,
  'NH': 35
};

interface Game {
  gameNumber: number;
  dealer: number;
  player: number | null;
  gameType: GameType | '';
  hand: boolean;
  schneider: boolean;
  schwarz: boolean;
  played: boolean;
  won: boolean;
  points?: number;
}

interface PlayerCount {
  wonCount: number;
  lostCount: number;
  points: number;
}
interface PlayerCount {
  wonCount: number;
  lostCount: number;
  points: number;
}

const SkatListDisplay: React.FC<{
  numPlayers?: number;
  players?: string[];
  totalGames?: number;
  seriesId?: string | null;
  tischId?: string | null;
}> = ({
  numPlayers = 4,
  players = [],
  totalGames = 48,
  seriesId = null,
  tischId = null
}) => {
    const displayPlayers = players.length > 0 ? players : Array(numPlayers).fill('') as string[];

    const [currentGame, setCurrentGame] = useState<Game>({
      gameNumber: 1,
      dealer: 0,
      player: null,
      gameType: '',
      hand: false,
      schneider: false,
      schwarz: false,
      played: false,
      won: false
    });

    const [games, setGames] = useState<Game[]>(
      Array(totalGames).fill(null).map(() => ({
        won: null,
        lost: null,
        gameType: '',
        hand: false,
        schneider: false,
        schwarz: false,
        points: 0,
        played: false
      } as unknown as Game))
    );

    const [playerCounts, setPlayerCounts] = useState<PlayerCount[]>(
      Array(numPlayers).fill(null).map(() => ({
        wonCount: 0,
        lostCount: 0,
        points: 0
      }))
    );

    const calculatePoints = (game: Game): number => {
      if (!game.gameType || game.gameType === 'eingepasst') return 0;

      // Type guard to ensure game.gameType is a valid key
      if (!(game.gameType in GAME_BASE_POINTS)) return 0;

      let points = GAME_BASE_POINTS[game.gameType as keyof GameBasePoints];
      if (game.hand) points *= 2;
      if (game.schneider) points *= 2;
      if (game.schwarz) points *= 2;
      return points;
    };

    const handleGameTypeSelect = (type: GameType) => {
      setCurrentGame(prev => ({
        ...prev,
        gameType: type
      }));
    };

    const handleGameComplete = async (): Promise<void> => {
      if (!currentGame.player && currentGame.gameType !== 'eingepasst') return;

      const gameIndex = currentGame.gameNumber - 1;
      const newGames = [...games];
      const newPlayerCounts = [...playerCounts];

      if (currentGame.gameType !== 'eingepasst' && currentGame.player !== null) {
        const points = calculatePoints(currentGame);
        newPlayerCounts[currentGame.player].points += points;
        newPlayerCounts[currentGame.player].wonCount += 1;

        newGames[gameIndex] = {
          ...currentGame,
          points,
          played: true
        };
      }

      // Update server if we have IDs
      if (seriesId && tischId) {
        try {
          await fetch('/update_player_points', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              playerId: currentGame.player,
              seriesId,
              total_points: newPlayerCounts[currentGame.player!].points,
              won_games: newPlayerCounts[currentGame.player!].wonCount,
              lost_games: newPlayerCounts[currentGame.player!].lostCount
            })
          });
        } catch (err) {
          console.error('Failed to update points:', err);
        }
      }

      setGames(newGames);
      setPlayerCounts(newPlayerCounts);

      setCurrentGame({
        gameNumber: currentGame.gameNumber + 1,
        dealer: (currentGame.dealer + 1) % numPlayers,
        player: null,
        gameType: '',
        hand: false,
        schneider: false,
        schwarz: false,
        played: false,
        won: false
      });
    };
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-grow overflow-auto p-4">
          <Card className="p-4">
            {/* Header */}
            <div className="grid grid-cols-3 mb-4 border-b pb-2">
              <div>Date: {new Date().toLocaleDateString()}</div>
              <div className="text-center">Series: {seriesId}</div>
              <div className="text-right">Table: {tischId}</div>
            </div>

            {/* Players */}
            <div className="grid" style={{ gridTemplateColumns: '200px repeat(4, 1fr)' }}>
              <div className="font-bold">Game Type</div>
              {displayPlayers.map((player, index) => (
                <div key={index} className="text-center font-bold">
                  {player || `Player ${index + 1}`}
                </div>
              ))}
            </div>

            {/* Games */}
            <div className="overflow-auto">
              {games.map((game, index) => (
                <div key={index} className="grid" style={{ gridTemplateColumns: '200px repeat(4, 1fr)' }}>
                  <div className="flex items-center space-x-2 text-sm">
                    {game.played && (
                      <>
                        <span>{game.gameType}</span>
                        {game.hand && <span>Hand</span>}
                        {game.schneider && <span>Schn</span>}
                        {game.schwarz && <span>Schw</span>}
                      </>
                    )}
                  </div>
                  {displayPlayers.map((_, playerIndex) => (
                    <div key={playerIndex} className="grid grid-cols-2 gap-1 p-1">
                      <div className="text-center">{playerCounts[playerIndex].wonCount}</div>
                      <div className="text-center">{playerCounts[playerIndex].lostCount}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Game Controls */}
        <div className="bg-gray-100 border-t p-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-lg mb-4 flex justify-between">
              <div>
                <span>Dealer: </span>
                <span className="font-bold">
                  {displayPlayers[currentGame.dealer] || `Player ${currentGame.dealer + 1}`}
                </span>
              </div>
              {currentGame.player !== null && (
                <div>
                  <span>Playing: </span>
                  <span className="font-bold">
                    {displayPlayers[currentGame.player] || `Player ${currentGame.player + 1}`}
                  </span>
                </div>
              )}
            </div>

            {currentGame.player === null ? (
              <div className="space-y-4">
                <h2 className="text-xl text-center font-semibold">Who plays?</h2>
                <div className="flex justify-center space-x-4">
                  {displayPlayers.map((player, index) => {
                    if (index === currentGame.dealer) return null;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentGame(prev => ({
                          ...prev,
                          player: index
                        }))}
                        className="px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300"
                      >
                        {player || `Player ${index + 1}`}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => {
                      setCurrentGame(prev => ({
                        ...prev,
                        gameType: 'eingepasst'
                      }));
                      handleGameComplete();
                    }}
                    className="px-6 py-3 rounded-md bg-yellow-200 hover:bg-yellow-300"
                  >
                    Eingepasst
                  </button>
                </div>
              </div>
            ) : !currentGame.gameType ? (
              <div className="space-y-4">
                <h2 className="text-xl text-center font-semibold">What game is played?</h2>
                <div className="flex justify-center space-x-4">
                  {gameTypes.map((type) => (
                    <button
                      key={type}
                      onClick={() => handleGameTypeSelect(type)} // No need for type assertion here
                      className={`px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-2xl 
    ${(type === '♥' || type === '♦') ? 'text-red-600' : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => setCurrentGame(prev => ({
                      ...prev,
                      hand: !prev.hand
                    }))}
                    className={`px-6 py-3 rounded-md ${currentGame.hand ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    Hand
                  </button>
                  <button
                    onClick={() => setCurrentGame(prev => ({
                      ...prev,
                      schneider: !prev.schneider
                    }))}
                    className={`px-6 py-3 rounded-md ${currentGame.schneider ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    Schneider
                  </button>
                  <button
                    onClick={() => setCurrentGame(prev => ({
                      ...prev,
                      schwarz: !prev.schwarz
                    }))}
                    className={`px-6 py-3 rounded-md ${currentGame.schwarz ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                  >
                    Schwarz
                  </button>
                  <button
                    onClick={handleGameComplete}
                    className="px-6 py-3 rounded-md bg-green-500 hover:bg-green-600 text-white"
                  >
                    Complete Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default SkatListDisplay;