import React from "react";
import type { BackgroundProps } from "./types";

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

  // Determine the background position based on mode and screen size
  // ViewBox is 1024x1024
  // Each quadrant is 512x512
  // light large: 0, 0
  // dark large: -512, 0
  // light small: 0, -512
  // dark small: -512, -512





  return (


    <>
      <div
        className={
          `absolute inset-0 isolate -z-10 pointer-events-none`
        }
        
      >
        {/* dark overlay for dark mode */}
        <span className="size-full absolute inset-0 z-10 block opacity-[0.07]" style={{
          backgroundImage: "url(/chatroom-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}/>
        <span className="size-full block bg-background z-0"/>
      </div>
      {children}
    </>
  );
};
