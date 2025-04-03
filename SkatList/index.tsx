// src/components/SkatList/index.tsx
import React from 'react';
import { Card } from 'components/ui/card';
import { useGameState } from 'hooks/useGameState';
import { Game, SkatListProps } from 'types';

interface GameHeaderProps {
  seriesId: string | null;
  tischId: string | null;
}

const GameHeader: React.FC<GameHeaderProps> = ({ seriesId, tischId }) => (
  <div className="grid grid-cols-3 mb-4 border-b pb-2">
    <div>Date: {new Date().toLocaleDateString()}</div>
    <div className="text-center">Series: {seriesId}</div>
    <div className="text-right">Table: {tischId}</div>
  </div>
);

interface PlayerListProps {
  players: string[];
}

const PlayerList: React.FC<PlayerListProps> = ({ players }) => (
  <div className="grid" style={{ gridTemplateColumns: '200px repeat(4, 1fr)' }}>
    <div className="font-bold">Game Type</div>
    {players.map((player, index) => (
      <div key={index} className="text-center font-bold">
        {player || `Player ${index + 1}`}
      </div>
    ))}
  </div>
);

interface GameControlsProps {
  currentGame: Game;
  setCurrentGame: React.Dispatch<React.SetStateAction<Game>>;
  handleGameComplete: () => Promise<void>;
  displayPlayers: string[];
}

const GameControls: React.FC<GameControlsProps> = ({
  currentGame,
  setCurrentGame,
  handleGameComplete,
  displayPlayers
}) => {
  if (currentGame.player === null) {
    return (
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
            onClick={async () => {
              setCurrentGame(prev => ({
                ...prev,
                gameType: 'eingepasst'
              }));
              await handleGameComplete();
            }}
            className="px-6 py-3 rounded-md bg-yellow-200 hover:bg-yellow-300"
          >
            Eingepasst
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!currentGame.gameType ? (
        <div>
          <h2 className="text-xl text-center font-semibold">What game is played?</h2>
          <div className="flex justify-center space-x-4">
            {['♣', '♠', '♥', '♦', 'G', 'N'].map(type => (
              <button
                key={type}
                onClick={() => setCurrentGame(prev => ({ 
                  ...prev, 
                  gameType: type as Game['gameType']
                }))}
                className={`px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300 text-2xl 
                  ${(type === '♥' || type === '♦') ? 'text-red-600' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setCurrentGame(prev => ({
              ...prev,
              hand: !prev.hand
            }))}
            className={`px-6 py-3 rounded-md ${
              currentGame.hand ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Hand
          </button>
          <button
            onClick={() => setCurrentGame(prev => ({
              ...prev,
              schneider: !prev.schneider
            }))}
            className={`px-6 py-3 rounded-md ${
              currentGame.schneider ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Schneider
          </button>
          <button
            onClick={() => setCurrentGame(prev => ({
              ...prev,
              schwarz: !prev.schwarz
            }))}
            className={`px-6 py-3 rounded-md ${
              currentGame.schwarz ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
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
      )}
    </div>
  );
};

export const SkatListDisplay: React.FC<SkatListProps> = ({ 
  numPlayers = 4, 
  players = [], 
  totalGames = 48,
  seriesId = null,
  tischId = null 
}) => {
  const displayPlayers = players.length > 0 ? players : Array(numPlayers).fill('');
  const { 
    currentGame, 
    setCurrentGame, 
    games, 
    playerCounts, 
    handleGameComplete 
  } = useGameState({
    numPlayers,
    totalGames,
    seriesId,
    tischId
  });

  return (
    <div className="flex flex-col h-[100dvh]">
      <div className="flex-grow overflow-auto p-4">
        <Card className="p-4">
          <GameHeader seriesId={seriesId} tischId={tischId} />
          <PlayerList players={displayPlayers} />
          
          {/* Games list */}
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
          
          <GameControls 
            currentGame={currentGame}
            setCurrentGame={setCurrentGame}
            handleGameComplete={handleGameComplete}
            displayPlayers={displayPlayers}
          />
        </div>
      </div>
    </div>
  );
};

export default SkatListDisplay;