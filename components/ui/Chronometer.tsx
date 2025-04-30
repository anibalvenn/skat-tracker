// src/components/ui/Chronometer.tsx
import React, { useState, useEffect } from 'react';
import { Clock, Timer } from 'lucide-react'; // Import Timer icon

interface ChronometerProps {
  startTime: string;
  endTime?: string;
  isCompleted?: boolean;
  isJustCompleted?: boolean; // New prop to handle the "just completed" state
}

const Chronometer: React.FC<ChronometerProps> = ({
  startTime,
  endTime,
  isCompleted = false,
  isJustCompleted = false
}) => {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [finalTime, setFinalTime] = useState<string>('');
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Calculate and set the final time when list is completed
  useEffect(() => {
    if (isCompleted && endTime) {
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const duration = end - start;
      
      // Format and store the final time
      const formattedTime = duration > 3.5 * 60 * 60 * 1000
        ? 'over 3h30'
        : formatTime(duration);
        
      setFinalTime(formattedTime);
      setElapsedTime(formattedTime);
      
      // Ensure the timer stops and displays final time
      return () => {}; // Empty cleanup to prevent other effects from changing the time
    }
  }, [isCompleted, endTime, startTime]);
  
  // Handle the "just completed" animation
  useEffect(() => {
    if (isJustCompleted) {
      setShowAnimation(true);
      // Reset animation state after animation completes
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isJustCompleted]);
  
  // Regular timer for in-progress lists
  useEffect(() => {
    // If completed, don't start the timer
    if (isCompleted) {
      // For completed lists, ensure we always show the final time
      if (endTime) {
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        const duration = end - start;
        
        const formattedTime = duration > 3.5 * 60 * 60 * 1000
          ? 'over 3h30'
          : formatTime(duration);
          
        setElapsedTime(formattedTime);
      }
      return;
    }
    
    // Parse start time
    const start = new Date(startTime).getTime();
    
    // For active lists, update time every second
    const intervalId = setInterval(() => {
      const now = Date.now();
      const duration = now - start;
      
      // If over 3h30m, show special message and clear interval
      if (duration > 3.5 * 60 * 60 * 1000) {
        setElapsedTime('over 3h30');
        clearInterval(intervalId);
      } else {
        setElapsedTime(formatTime(duration));
      }
    }, 1000);
    
    // Initial calculation
    const initialDuration = Date.now() - start;
    if (initialDuration > 3.5 * 60 * 60 * 1000) {
      setElapsedTime('over 3h30');
    } else {
      setElapsedTime(formatTime(initialDuration));
    }
    
    // Cleanup interval
    return () => clearInterval(intervalId);
  }, [startTime, endTime, isCompleted]);
  
  // Format milliseconds to HH:MM:SS
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Determine the appropriate styling based on state
  const getContainerClasses = () => {
    let classes = 'flex items-center space-x-2 transition-all duration-300 ';
    
    // Adjust padding based on completion status
    if (isCompleted) {
      classes += 'py-1 pl-1 pr-2 rounded-md bg-blue-100 '; // Reduced padding when completed
    } else {
      classes += 'py-1 px-3 rounded-md bg-gray-100 '; // Regular padding for active timer
    }
    
    if (showAnimation) {
      classes += 'scale-125 shadow-lg ';
    }
    
    return classes;
  };
  
  const getTextClasses = () => {
    let classes = 'text-base font-bold font-mono ';
    
    if (isCompleted) {
      classes += 'text-blue-700 ';
    } else {
      classes += 'text-gray-800 ';
    }
    
    if (showAnimation) {
      classes += 'text-xl ';
    }
    
    return classes;
  };
  
  // Use Timer icon for active timers, Clock icon for completed lists
  const TimerIcon = Timer;
  
  return (
    <div className={getContainerClasses()}>
      <TimerIcon className={`w-5 h-5 ${isCompleted ? 'text-blue-600' : 'text-gray-700'} ${
        showAnimation ? 'animate-pulse' : ''
      }`} />
      <span className={getTextClasses()}>
        {elapsedTime}
      </span>
    </div>
  );
};

export default Chronometer;