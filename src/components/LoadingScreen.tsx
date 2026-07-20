import React from "react";

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen = ({ message = "Loading...", fullScreen = true }: LoadingScreenProps) => {
  const content = (
    <div className="relative flex flex-col items-center gap-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-primary animate-spin [animation-duration:1.5s]" />
        <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <p className="text-lg font-semibold text-foreground tracking-tight">ConnectAngel</p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full flex-1 min-h-[400px]">
      {content}
    </div>
  );
};

export default LoadingScreen;
