import React from "react";
import { useIsMobile } from "../../hooks/useIsMobile";
import type { BackgroundProps } from "./types";
import doodlesSvg from "../../assets/backgrounds/doodles.svg";

/**
 * Background component that displays one of 4 doodle backgrounds based on screen size and mode.
 *
 * Organization of doodles.svg:
 * light (large) | dark (large)
 * light (small) | dark (small)
 *
 * Each doodle is 512x512 in the 1024x1024 viewBox.
 */
export const Background: React.FC<BackgroundProps> = ({
  mode = "light",
  children,
  className = "",
  ...props
}) => {
  const isMobile = useIsMobile();

  // Determine the background position based on mode and screen size
  // ViewBox is 1024x1024
  // Each quadrant is 512x512
  // light large: 0, 0
  // dark large: -512, 0
  // light small: 0, -512
  // dark small: -512, -512

  const getBackgroundPosition = () => {
    if (isMobile) {
      return mode === "light" ? "0% 100%" : "100% 100%";
    }
    return mode === "light" ? "0% 0%" : "100% 0%";
  };

  const containerStyle: React.CSSProperties = {
    backgroundImage: `url(${doodlesSvg})`,
    backgroundSize: "200% 200%", // Since there are 2x2 doodles
    backgroundPosition: getBackgroundPosition(),
    backgroundRepeat: "no-repeat",
    backgroundColor: mode === "light" ? "#FCFCFC" : "#1A1B1E", // Fallback colors
    width: "100%",
    height: "100%",
    position: "relative",
    transition:
      "background-position 0.3s ease-in-out, background-color 0.3s ease-in-out",
  };

  return (
    // <div
    //   className={`background-container ${className}`}
    //   style={containerStyle}
    //   {...props}
    // >
    //   {children}
    // </div>

    <>
      <div
        className={
          `absolute inset-0 isolate z-0 pointer-events-none`
        }
        
      >
        {/* dark overlay for dark mode */}
        <span className="size-full absolute inset-0 z-10 block opacity-[0.07]" style={{
          backgroundImage: "url(/chatroom-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}/>
        <span className="size-full block bg-gray-100 dark:bg-gray-800/100 z-0"/>
      </div>
      {children}
    </>
  );
};
