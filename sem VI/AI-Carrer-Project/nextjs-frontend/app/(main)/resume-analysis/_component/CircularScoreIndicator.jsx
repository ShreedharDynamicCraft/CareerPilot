import React, { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";

const getColor = (score) => {
  if (score < 40) return "#e74c3c"; // Red for low scores
  if (score < 70) return "#f1c40f"; // Yellow for mid scores
  return "#2ecc71"; // Green for high scores
};

const CircularContainer = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Svg = styled.svg`
  position: absolute;
  transform: rotate(-90deg); /* Rotate progress bar only */
`;

const CircleBackground = styled.circle`
  fill: none;
  stroke: #ddd;
  stroke-width: 10;
`;

const CircleProgress = styled.circle`
  fill: none;
  stroke: ${(props) => getColor(props.score)};
  stroke-width: 10;
  stroke-linecap: round;
  transition: stroke-dashoffset 1.5s ease-in-out; /* Smooth animation */
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

const ScoreText = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: ${(props) => getColor(props.score)};
  animation: ${fadeIn} 1s ease-in-out;
`;

const CircularScoreIndicator = ({ score }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const [animatedScore, setAnimatedScore] = useState(0);
  const [progress, setProgress] = useState(circumference);

  useEffect(() => {
    // Animate the number counting up
    let start = 0;
    const duration = 1000; // 1 second
    const stepTime = 10;
    const step = score / (duration / stepTime);

    const interval = setInterval(() => {
      start += step;
      if (start >= score) {
        start = score;
        clearInterval(interval);
      }
      setAnimatedScore(Math.round(start));
    }, stepTime);

    // Animate the progress bar
    setProgress(((100 - score) / 100) * circumference);
    
    return () => clearInterval(interval);
  }, [score, circumference]);

  return (
    <CircularContainer>
      <Svg width="200" height="200" viewBox="0 0 120 120">
        {/* Background Circle */}
        <CircleBackground cx="60" cy="60" r={radius} />

        {/* Progress Circle */}
        <CircleProgress
          cx="60"
          cy="60"
          r={radius}
          score={score}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </Svg>

      {/* Animated Score Text */}
      <ScoreText score={score}>{animatedScore}/100</ScoreText>
    </CircularContainer>
  );
};

export default CircularScoreIndicator;
