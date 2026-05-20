import confetti from "canvas-confetti";

export function confettiBasic() {
  confetti({
    particleCount: 120,
    spread: 60,
    origin: { y: 0.8 }, // Fire it slightly lower so it cascades over the footer
    colors: ["#a855f7", "#3b82f6", "#10b981"], // Optional: pass your custom brand colors
  });
}

export function fireFireworks() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) =>
    Math.random() * (max - min) + min;

  const interval = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);
    // Pop off random bursts
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

export function fireSides() {
  const end = Date.now() + 2 * 1000; // Fire for 2 seconds

  (function frame() {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 }, // Left side edge
    });
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 }, // Right side edge
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}
