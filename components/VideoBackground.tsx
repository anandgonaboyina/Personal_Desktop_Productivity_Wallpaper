"use client";
import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "@/store/dashboardStore";

export default function VideoBackground() {
  const bgIndex = useDashboardStore((state) => state.bgIndex);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [backgrounds, setBackgrounds] = useState<{ type: string, src: string }[]>([
    { type: 'image', src: '/wallpapers/naruto.webp' } // Fallback initial state
  ]);
  const isVideoMuted = useDashboardStore((state) => state.isVideoMuted);
  const setIsVideoMuted = useDashboardStore((state) => state.setIsVideoMuted);
  const isVideoPlaying = useDashboardStore((state) => state.isVideoPlaying);
  const setIsVideoPlaying = useDashboardStore((state) => state.setIsVideoPlaying);

  // Fetch dynamic backgrounds
  useEffect(() => {
    fetch('/api/wallpapers')
      .then(res => res.json())
      .then(data => {
        if (data.backgrounds && data.backgrounds.length > 0) {
          setBackgrounds(data.backgrounds);
        }
      })
      .catch(err => console.error("Failed to load wallpapers:", err));
  }, []);

  const safeIndex = bgIndex % backgrounds.length;
  const currentBg = backgrounds[safeIndex];

  useEffect(() => {
    // Update global store so other components know if it's image or video
    if (currentBg) {
      useDashboardStore.getState().setCurrentBgType(currentBg.type as any);
    }
  }, [currentBg]);

  useEffect(() => {
    const syncVideoState = () => {
      if (currentBg && currentBg.type === 'video' && videoRef.current) {
        
        if (isVideoPlaying) {
          // Play muted first to bypass browser autoplay policies
          videoRef.current.muted = true;
          videoRef.current.play().then(() => {
            // Once playing successfully, restore the user's desired mute state
            if (videoRef.current) {
              videoRef.current.muted = isVideoMuted;
            }
          }).catch(e => {
            console.log("Video play failed", e);
            // DO NOT reset isVideoPlaying to false here, as it forces the user to manually click play again
          });
        } else {
          videoRef.current.pause();
          videoRef.current.muted = isVideoMuted;
        }
      }
    };

    syncVideoState();

    // Only attempt to sync when tab/wallpaper becomes visible again.
    // DO NOT force play if the user paused it previously.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        syncVideoState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [currentBg?.src, currentBg?.type, isVideoPlaying, isVideoMuted, setIsVideoPlaying]);

  if (!currentBg) return null;

  return (
    <>
      {currentBg.type === 'image' ? (
        <img
          key={currentBg.src} // Force re-render on src change
          src={currentBg.src}
          alt="Wallpaper"
          className="fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000"
        />
      ) : (
        <>
          <video
            key={currentBg.src} // Force reload video element
            ref={videoRef}
            src={currentBg.src}
            className="fixed inset-0 w-full h-full object-cover -z-20 transition-opacity duration-1000"
            loop
            autoPlay={isVideoPlaying}
            muted={isVideoMuted}
            playsInline
          />
          {/* Controls */}
          <div className="absolute top-6 left-20 z-50 flex gap-4">
            {/* Play/Pause Toggle Button */}
            <button
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl"
              title={isVideoPlaying ? "Pause Video" : "Play Video"}
            >
              {isVideoPlaying ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="4" height="16"></rect>
                  <rect x="14" y="4" width="4" height="16"></rect>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
            {/* Mute Toggle Button */}
            <button
              onClick={() => setIsVideoMuted(!isVideoMuted)}
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-white/20 hover:shadow-2xl"
              title={isVideoMuted ? "Unmute Video" : "Mute Video"}
            >
              {isVideoMuted ? (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <line x1="23" y1="9" x2="17" y2="15"></line>
                  <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                </svg>
              )}
            </button>
          </div>
        </>
      )}
    </>
  );
}
