import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center">
        <img
          src={import.meta.env.BASE_URL + 'logo.png'}
          alt="Make-Up Lounge"
          className="h-20 w-auto animate-pulse"
        />
        <div className="mt-6 h-1 w-40 bg-accent/50 overflow-hidden rounded-full">
          <div className="h-full w-1/3 bg-primary animate-[slide_1.2s_ease_infinite]"></div>
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
