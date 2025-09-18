import React, { useEffect, useRef, useState } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

const SplashScreen: React.FC = () => {
  const [mode, setMode] = useState<"static" | "gif" | "lottie">("static");
  const [animData, setAnimData] = useState<any>(null);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    let cancelled = false;
    const detect = async () => {
      try {
        const resJson = await fetch(base + "logo-animation.json", { cache: "no-store" });
        if (!cancelled && resJson.ok) {
          const data = await resJson.json();
          if (!cancelled) {
            setAnimData(data);
            setMode("lottie");
            return;
          }
        }
      } catch {}

      try {
        const resGif = await fetch(base + "logo.gif", { cache: "no-store" });
        if (!cancelled && resGif.ok) {
          setMode("gif");
          return;
        }
      } catch {}

      if (!cancelled) setMode("static");
    };
    detect();
    return () => { cancelled = true; };
  }, [base]);

  // Smoother feel: Lottie playback at 0.65x
  useEffect(() => {
    if (mode === "lottie" && lottieRef.current) {
      try { lottieRef.current.setSpeed(0.65); } catch {}
    }
  }, [mode]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center">
        {mode === "lottie" && animData ? (
          <Lottie animationData={animData} loop autoplay style={{ height: 96 }} lottieRef={lottieRef} />
        ) : mode === "gif" ? (
          <img src={base + "logo.gif"} alt="Make-Up Lounge" className="h-24 w-auto" />
        ) : (
          <img src={base + "logo.png"} alt="Make-Up Lounge" className="h-20 w-auto animate-pulse" />
        )}
        <div className="mt-6 h-1 w-40 bg-accent/50 overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary animate-[slide_1.8s_ease_infinite]"></div>
        </div>
      </div>
      <style>
        {`
        @keyframes slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(300%); }
        }
        `}
      </style>
    </div>
  );
};

export default SplashScreen;
