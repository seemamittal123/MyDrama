import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  RotateCcw,
  RotateCw,
  Captions,
} from "lucide-react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

const MOBILE_QUERY = "(max-width: 768px)";
const PORTRAIT_QUERY = "(orientation: portrait)";

const VideoPlayer = ({
  thumbnail_url,
  videoUrl,
  subtitleUrl,
  onProgress,
  startTime = 0,
  handleNextEpisode,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const hideTimeoutRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ---- Mobile / rotation awareness ----
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );
  const [isPortrait, setIsPortrait] = useState(
    typeof window !== "undefined" ? window.matchMedia(PORTRAIT_QUERY).matches : false
  );
  // true once the player has been asked to go into forced-landscape viewing mode
  const [forceLandscape, setForceLandscape] = useState(false);

  const navigate = useNavigate();

  // ---- Load video / HLS ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    let hls;
    const setStartTime = () => {
      if (startTime > 0) {
        video.currentTime = startTime;
      }
    };

    if (videoUrl.endsWith(".m3u8") && Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, setStartTime);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", setStartTime);
    } else {
      video.src = videoUrl;
      video.addEventListener("loadedmetadata", setStartTime);
    }

    return () => {
      if (hls) hls.destroy();
      video.removeEventListener("loadedmetadata", setStartTime);
    };
  }, [videoUrl, startTime]);

  // ---- Progress ping every 15s ----
  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused && onProgress) {
        onProgress({
          watched_duration: Math.floor(video.currentTime),
          total_duration: Math.floor(video.duration || 0),
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [onProgress]);

  // ---- Track viewport size + device orientation ----
  useEffect(() => {
    const mobileMq = window.matchMedia(MOBILE_QUERY);
    const portraitMq = window.matchMedia(PORTRAIT_QUERY);

    const handleMobileChange = (e) => setIsMobile(e.matches);
    const handlePortraitChange = (e) => setIsPortrait(e.matches);

    mobileMq.addEventListener("change", handleMobileChange);
    portraitMq.addEventListener("change", handlePortraitChange);

    return () => {
      mobileMq.removeEventListener("change", handleMobileChange);
      portraitMq.removeEventListener("change", handlePortraitChange);
    };
  }, []);

  // ---- Landscape helpers ----
  // Tries the native Fullscreen + Screen Orientation APIs first (works on
  // Android Chrome). Where those aren't supported (iOS Safari, etc.) the
  // `video-player--rotated` CSS class rotates the player itself so it still
  // fills the screen in landscape while the phone stays physically portrait.
  const enterLandscapeMode = async () => {
    if (!isMobile) return;
    setForceLandscape(true);

    try {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape");
      }
    } catch (err) {
      // Native lock unavailable/blocked — the CSS rotation fallback covers it
      console.log("Orientation lock unavailable, using CSS fallback:", err?.message);
    }
  };

  const exitLandscapeMode = () => {
    setForceLandscape(false);
    try {
      window.screen?.orientation?.unlock?.();
    } catch (err) {
      // ignore
    }
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // ---- End / pause tracking ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onProgress?.({
        watched_duration: Math.floor(video.duration || 0),
        total_duration: Math.floor(video.duration || 0),
      });
      exitLandscapeMode();
    };

    const handlePause = () => {
      onProgress?.({
        watched_duration: Math.floor(video.currentTime),
        total_duration: Math.floor(video.duration || 0),
      });
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onProgress]);

  // ---- Fullscreen change listener ----
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      // If the user backs out of native fullscreen (e.g. Android back button),
      // drop the forced-landscape mode and any orientation lock with it.
      if (!isFs) {
        setForceLandscape(false);
        try {
          window.screen?.orientation?.unlock?.();
        } catch (err) {
          // ignore
        }
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // ---- Keyboard shortcuts ----
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea") return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowLeft":
          skip(-10);
          break;
        case "ArrowRight":
          skip(10);
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyM":
          toggleMute();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- AUTO-HIDE CONTROLS LOGIC ----
  // Controls show on mouse move / tap, or whenever the video is paused.
  // After 3s of inactivity while playing, they auto-hide.
  const resetHideTimer = () => {
    setShowControls(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    hideTimeoutRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleMouseMove = () => {
    resetHideTimer();
  };

  const handleMouseLeave = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    const video = videoRef.current;
    if (video && !video.paused) {
      setShowControls(false);
    }
  };

  // Play -> start the hide timer; pause -> always visible
  useEffect(() => {
    if (playing) {
      resetHideTimer();
    } else {
      setShowControls(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !video.src) return;

    if (video.paused) {
      video.play().catch((error) => console.log("Play error:", error.message));
      setPlaying(true);
      enterLandscapeMode();
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (!video.muted && volume === 0) {
      setVolume(1);
      video.volume = 1;
    }
  };

  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    video.muted = newVolume === 0;
    setMuted(newVolume === 0);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    setProgress(video.currentTime);
    setDuration(video.duration || 0);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setProgress(newTime);
  };

  const skip = (seconds) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(
      Math.max(0, video.currentTime + seconds),
      video.duration || Infinity
    );
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const toggleCaptions = () => {
    const track = videoRef.current?.textTracks?.[0];
    if (!track) return;
    const next = !captionsOn;
    track.mode = next ? "showing" : "hidden";
    setCaptionsOn(next);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const onCross = () => {
    exitLandscapeMode();
    navigate("/");
  };

  // Starting the next episode should also drop the viewer straight into
  // the rotated landscape view on a phone, same as pressing Play.
  const onNextEpisode = () => {
    handleNextEpisode?.();
    enterLandscapeMode();
  };

  const seekPercent = duration ? (progress / duration) * 100 : 0;

  // Only apply the CSS rotation hack when we actually need it: forced
  // landscape mode is on, we're on a phone-sized screen, AND the device is
  // still physically portrait (native orientation.lock already handles the
  // browsers that support it, so this only fires as the fallback).
  const isRotated = forceLandscape && isMobile && isPortrait;

  return (
    <div
      ref={containerRef}
      className={`video-player ${!showControls ? "video-player--hide-cursor" : ""} ${
        isRotated ? "video-player--rotated" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleMouseMove}
    >
      <div className={`video-player__cross ${showControls ? "visible" : ""}`} onClick={onCross}>
        <RxCross1 size={20} />
      </div>

      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        poster={thumbnail_url}
        controlsList="nodownload"
        preload="auto"
        playsInline
      >
        {subtitleUrl && (
          <track
            ref={trackRef}
            kind="subtitles"
            src={subtitleUrl}
            default
            label="English"
          />
        )}
      </video>

      <div className={`video-player__center-controls ${showControls ? "visible" : ""}`}>
        <button className="video-player__skip-btn" onClick={() => skip(-10)}>
          <RotateCcw size={24} />
          <span>10</span>
        </button>

        <button className="video-player__play-center" onClick={togglePlay}>
          {playing ? <Pause size={30} /> : <Play size={30} />}
        </button>

        <button className="video-player__skip-btn" onClick={() => skip(10)}>
          <RotateCw size={24} />
          <span>10</span>
        </button>
      </div>

      <div
        className={`video-player__controls ${
          showControls ? "video-player__controls--visible" : ""
        }`}
      >
        <div className="video-player__seek-row">
          <span className="video-player__time video-player__time--current">
            {formatTime(progress)}
          </span>
          <input
            type="range"
            className="video-player__seek"
            min={0}
            max={duration || 0}
            value={progress}
            onChange={handleSeek}
            style={{
              background: `linear-gradient(to right, var(--vp-accent) ${seekPercent}%, rgba(255,255,255,0.25) ${seekPercent}%)`,
            }}
          />
          <span className="video-player__time video-player__time--duration">
            {formatTime(duration)}
          </span>
        </div>

        <div className="video-player__row">
          <div className="video-player__left">
            <button className="video-player__btn" onClick={togglePlay}>
              {playing ? <Pause size={20} /> : <Play size={20} />}
            </button>

            <button className="video-player__btn" onClick={() => skip(-10)}>
              <RotateCcw size={17} />
            </button>
            <button className="video-player__btn" onClick={() => skip(10)}>
              <RotateCw size={17} />
            </button>

            <div className="video-player__volume">
              <button className="video-player__btn" onClick={toggleMute}>
                {muted || volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}
              </button>
              <input
                type="range"
                className="video-player__volume-slider"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                style={{
                  background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255,255,255,0.25) ${volume * 100}%)`,
                }}
              />
            </div>
          </div>

          <div className="video-player__right">
            {subtitleUrl && (
              <button
                className={`video-player__btn ${captionsOn ? "active" : ""}`}
                onClick={toggleCaptions}
                title="Toggle captions"
              >
                <Captions size={19} />
              </button>
            )}

            <button
              className="video-player__btn video-player__next"
              onClick={onNextEpisode}
            >
              <SkipForward size={17} />
              <span>Next Episode</span>
            </button>

            <button className="video-player__btn" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={19} /> : <Maximize size={19} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;