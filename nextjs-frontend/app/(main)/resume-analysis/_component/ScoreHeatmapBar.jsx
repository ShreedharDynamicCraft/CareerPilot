import React, { useState, useEffect } from "react";
import styled from "styled-components";

// Styled Components

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-family: Arial, sans-serif;
  margin: 0.5em 0;
`;

const ProgressBarContainer = styled.div`
  width: 100%;
  height: 1.5em;
  // border-radius: 8px;
  border: 1px solid grey;
  background: linear-gradient(to right, #e74c3c, #f39c12, #f1c40f, #2ecc71);
  position: relative;
  margin: 10px auto;
`;

const ScoreMarker = styled.div`
  position: absolute;
  left: ${(props) => props.position}%;
  top: -20px;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: bold;
  color: black;
  white-space: nowrap;

  &::before {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid black; /* Pointer triangle */
  }
`;

const Labels = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 12px;
  font-weight: bold;
`;

const ScoreHeatmapBar = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 500; // 1 second animation
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

    return () => clearInterval(interval);
  }, [score]);

  return (
    <Container>
      <ProgressBarContainer>
        <ScoreMarker position={animatedScore}>YOUR RESUME</ScoreMarker>
      </ProgressBarContainer>
      <Labels>
        <span style={{color:"red"}}>Try Again!</span>
        <span style={{color:"green"}}>Perfect</span>
      </Labels>
    </Container>
  );
};

export default ScoreHeatmapBar;
