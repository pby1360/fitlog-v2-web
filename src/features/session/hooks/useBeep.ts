import { useEffect, useRef } from 'react';

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

// 짧은 비프음. enabled 가 false 면 소리를 내지 않는다
export function useBeep(enabled: boolean) {
  const beepRef = useRef<{ play: () => void } | null>(null);

  useEffect(() => {
    const audioContext = new (window.AudioContext || (window as WebkitWindow).webkitAudioContext!)();

    beepRef.current = {
      play: () => {
        if (!enabled) return;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    };

    return () => {
      audioContext.close();
    };
  }, [enabled]);

  return beepRef;
}
