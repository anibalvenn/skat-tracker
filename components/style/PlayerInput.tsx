import React from 'react';

const playerColors = {
  0: 'focus:ring-blue-400 bg-blue-50',
  1: 'focus:ring-green-400 bg-green-50',
  2: 'focus:ring-yellow-400 bg-yellow-50',
  3: 'focus:ring-orange-400 bg-orange-50'
};

interface PlayerInputProps {
  value: string;
  index: number;
  onChange: (value: string) => void;
  error: boolean;
  isValid: boolean;
}

const PlayerInput: React.FC<PlayerInputProps> = ({
  value,
  index,
  onChange,
  error,
  isValid
}) => {
  const colorClass = playerColors[index as keyof typeof playerColors];
  
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Player ${index + 1}`}
        className={`w-full p-3 rounded-lg border transition-colors duration-150
          ${error ? 'border-red-500 bg-red-50' 
          : isValid ? 'border-gray-300 ' + colorClass
          : 'border-gray-300 bg-white'} 
          focus:outline-none focus:ring-2`}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">
          Minimum 3 characters required
        </p>
      )}
    </div>
  );
};

export default PlayerInput;