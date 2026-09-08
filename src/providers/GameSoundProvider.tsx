"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { playAudio } from "@/utils/playAudio";

const COUNTDOWN_CUE_PATH = "/sounds/game-countdown-cue.wav";
const COUNTDOWN_START_CUE_PATH = "/sounds/game-countdown-start-cue.wav";
const PERFECT_CELEBRATION_PATH = "/sounds/perfect-game-celebration.wav";
const CORRECT_ANSWER_CUE_PATH = "/sounds/game-answer-correct-cue.wav";
const WRONG_ANSWER_CUE_PATH = "/sounds/game-answer-wrong-cue.wav";

type GameSoundContextType = {
  areSoundsReady: boolean;
  prepareCountdownCue: () => void;
  playCountdownCue: () => void;
  playCountdownStartCue: () => void;
  playPerfectCelebration: () => void;
  playCorrectAnswerCue: () => void;
  playWrongAnswerCue: () => void;
  playIncorrectAnswerCue: () => void;
};

const GameSoundContext = createContext<GameSoundContextType | null>(null);

type GameSoundProviderProps = {
  children: ReactNode;
};

export const GameSoundProvider = ({ children }: GameSoundProviderProps) => {
  const countdownCueRef = useRef<HTMLAudioElement | null>(null);
  const countdownCuePreparationIdRef = useRef(0);
  const countdownStartCueRef = useRef<HTMLAudioElement | null>(null);
  const perfectCelebrationRef = useRef<HTMLAudioElement | null>(null);
  const correctAnswerCueRef = useRef<HTMLAudioElement | null>(null);
  const wrongAnswerCueRef = useRef<HTMLAudioElement | null>(null);
  const [areSoundsReady, setAreSoundsReady] = useState(false);

  useEffect(() => {
    const countdownCue = new Audio(COUNTDOWN_CUE_PATH);
    const countdownStartCue = new Audio(COUNTDOWN_START_CUE_PATH);
    const perfectCelebration = new Audio(PERFECT_CELEBRATION_PATH);
    const correctAnswerCue = new Audio(CORRECT_ANSWER_CUE_PATH);
    const wrongAnswerCue = new Audio(WRONG_ANSWER_CUE_PATH);
    const gameSounds = [
      countdownCue,
      countdownStartCue,
      perfectCelebration,
      correctAnswerCue,
      wrongAnswerCue,
    ];

    countdownCue.preload = "auto";
    countdownCue.volume = 0.55;
    countdownStartCue.preload = "auto";
    countdownStartCue.volume = 0.6;
    perfectCelebration.preload = "auto";
    perfectCelebration.volume = 0.75;
    correctAnswerCue.preload = "auto";
    correctAnswerCue.volume = 0.65;
    wrongAnswerCue.preload = "auto";
    wrongAnswerCue.volume = 0.65;

    countdownCueRef.current = countdownCue;
    countdownStartCueRef.current = countdownStartCue;
    perfectCelebrationRef.current = perfectCelebration;
    correctAnswerCueRef.current = correctAnswerCue;
    wrongAnswerCueRef.current = wrongAnswerCue;

    const updateReadiness = () => {
      const areCountdownSoundsLoaded = [countdownCue, countdownStartCue].every(
        (gameSound) => gameSound.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA,
      );

      setAreSoundsReady(areCountdownSoundsLoaded);
    };

    gameSounds.forEach((gameSound) => {
      gameSound.addEventListener("canplaythrough", updateReadiness);
      gameSound.addEventListener("loadeddata", updateReadiness);
      gameSound.load();
    });
    updateReadiness();

    return () => {
      gameSounds.forEach((gameSound) => {
        gameSound.removeEventListener("canplaythrough", updateReadiness);
        gameSound.removeEventListener("loadeddata", updateReadiness);
        gameSound.pause();
      });
      countdownCueRef.current = null;
      countdownStartCueRef.current = null;
      perfectCelebrationRef.current = null;
      correctAnswerCueRef.current = null;
      wrongAnswerCueRef.current = null;
    };
  }, []);

  const prepareCountdownCue = useCallback(() => {
    const countdownCue = countdownCueRef.current;

    if (!countdownCue) return;

    const preparationId = countdownCuePreparationIdRef.current + 1;
    countdownCuePreparationIdRef.current = preparationId;
    countdownCue.pause();
    countdownCue.currentTime = 0;
    countdownCue.muted = true;

    void countdownCue.play().then(
      () => {
        if (countdownCuePreparationIdRef.current !== preparationId) return;

        countdownCue.pause();
        countdownCue.currentTime = 0;
        countdownCue.muted = false;
      },
      () => {
        if (countdownCuePreparationIdRef.current !== preparationId) return;

        countdownCue.muted = false;
      },
    );
  }, []);

  const playCountdownCue = useCallback(() => {
    const countdownCue = countdownCueRef.current;

    if (!countdownCue) return;

    countdownCuePreparationIdRef.current += 1;
    countdownCue.muted = false;
    playAudio(countdownCue);
  }, []);

  const playCountdownStartCue = useCallback(() => {
    const preloadedCue = countdownStartCueRef.current;

    if (!preloadedCue) return;

    const oneShotCue = preloadedCue.cloneNode(true) as HTMLAudioElement;
    oneShotCue.volume = preloadedCue.volume;

    const releaseOneShotCue = () => {
      oneShotCue.removeEventListener("ended", releaseOneShotCue);
      oneShotCue.removeEventListener("error", releaseOneShotCue);
    };

    oneShotCue.addEventListener("ended", releaseOneShotCue);
    oneShotCue.addEventListener("error", releaseOneShotCue);
    void oneShotCue.play().catch(releaseOneShotCue);
  }, []);

  const playPerfectCelebration = useCallback(() => {
    playAudio(perfectCelebrationRef.current);
  }, []);

  const playCorrectAnswerCue = useCallback(() => {
    playAudio(correctAnswerCueRef.current);
  }, []);

  const playWrongAnswerCue = useCallback(() => {
    playAudio(wrongAnswerCueRef.current);
  }, []);

  const playIncorrectAnswerCue = playWrongAnswerCue;

  const gameSoundContextValue = useMemo(
    () => ({
      areSoundsReady,
      prepareCountdownCue,
      playCountdownCue,
      playCountdownStartCue,
      playPerfectCelebration,
      playCorrectAnswerCue,
      playWrongAnswerCue,
      playIncorrectAnswerCue,
    }),
    [
      areSoundsReady,
      prepareCountdownCue,
      playCountdownCue,
      playCountdownStartCue,
      playPerfectCelebration,
      playCorrectAnswerCue,
      playWrongAnswerCue,
      playIncorrectAnswerCue,
    ],
  );

  return (
    <GameSoundContext.Provider value={gameSoundContextValue}>
      {children}
    </GameSoundContext.Provider>
  );
};

export const useGameSoundManager = () => {
  const context = useContext(GameSoundContext);

  if (!context) {
    throw new Error("useGameSoundManager must be used inside GameSoundProvider");
  }

  return context;
};
