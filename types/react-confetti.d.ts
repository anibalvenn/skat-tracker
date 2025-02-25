// src/types/react-confetti.d.ts
declare module 'react-confetti' {
  import * as React from 'react';
  
  export interface ConfettiProps {
    width?: number;
    height?: number;
    numberOfPieces?: number;
    recycle?: boolean;
    run?: boolean;
    wind?: number;
    gravity?: number;
    tweenDuration?: number;
    tweenFunction?: (currentTime: number, currentValue: number, targetValue: number, duration: number, s?: number) => number;
    colors?: string[];
    opacity?: number;
    confettiSource?: {
      x?: number;
      y?: number;
      w?: number;
      h?: number;
    };
    drawShape?: (context: CanvasRenderingContext2D) => void;
    onConfettiComplete?: (confetti: Confetti) => void;
  }
  
  export default class Confetti extends React.Component<ConfettiProps> {}
}