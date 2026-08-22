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
  PictureInPicture2,
  Loader2,
} from "lucide-react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from "react-router-dom";

const MOBILE_QUERY = "(max-width: 768px)";
const PORTRAIT_QUERY = "(orientation: portrait)";
const SPEED_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

// ---- Cross-browser fullscreen helpers (iOS Safari needs webkit-prefixed
// APIs, and old iOS only supports native fullscreen on the <video> tag
// itself rather than a wrapping div). ----
const requestFullscreenCompat = (el, videoEl) => {
  if (!el) return Promise.reject(new Error("No element"));
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  if (videoEl?.webkitEnterFullscreen) {
    videoEl.webkitEnterFullscreen();
    return Promise.resolve();
  }
  return Promise.reject(new Error("Fullscreen API not supported"));
};

const exitFullscreenCompat = () => {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  return Promise.resolve();
};

const isDocFullscreen = () =>
  !!(document.fullscreenElement || document.webkitFullscreenElement);

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
  const lastTapRef = useRef({ time: 0, side: null });

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [skipFlash, setSkipFlash] = useState(null); // { side: 'left'|'right' } transient tap feedback
  const [showCaptionsMenu, setShowCaptionsMenu] = useState(false);
  const captionsMenuRef = useRef(null);

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
  // NOTE: the CSS rotation fallback is applied unconditionally (it isn't
  // gated behind the fullscreen/orientation-lock promises), so the player
  // still visually flips to landscape even on browsers that block
  // requestFullscreen/orientation.lock outside of a direct user gesture.
  const enterLandscapeMode = async () => {
    if (!isMobile) return;
    setForceLandscape(true);

    try {
      await requestFullscreenCompat(containerRef.current, videoRef.current);
      if (window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape");
      }
    } catch (err) {
      // Native lock unavailable/blocked (often because this wasn't called
      // synchronously from a user gesture) — the CSS rotation fallback
      // above still covers it.
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
    if (isDocFullscreen()) {
      exitFullscreenCompat().catch(() => {});
    }
  };

  // ---- Rotate into landscape the moment an episode loads, before the
  // user even presses play (mobile only). ----
  useEffect(() => {
    if (isMobile && videoUrl) {
      enterLandscapeMode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl, isMobile]);

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

    const handleWaiting = () => setBuffering(true);
    const handlePlaying = () => setBuffering(false);
    const handleCanPlay = () => setBuffering(false);

    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("canplay", handleCanPlay);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("canplay", handleCanPlay);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onProgress]);

  // ---- Fullscreen change listener (standard + webkit-prefixed) ----
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = isDocFullscreen();
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
    document.addEventListener("webkitfullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      document.removeEventListener("webkitfullscreenchange", handleFsChange);
    };
  }, []);

  // ---- Keep the <track> mode in sync with captionsOn, instead of relying
  // solely on the `default` attribute (unreliable across browsers). ----
  useEffect(() => {
    const track = trackRef.current?.track;
    if (!track) return;
    track.mode = captionsOn ? "showing" : "hidden";
  }, [subtitleUrl, captionsOn]);

  // ---- Close the captions menu on outside click or Escape ----
  useEffect(() => {
    if (!showCaptionsMenu) return;

    const handleOutsideClick = (e) => {
      if (captionsMenuRef.current && !captionsMenuRef.current.contains(e.target)) {
        setShowCaptionsMenu(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowCaptionsMenu(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showCaptionsMenu]);

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
        case "KeyC":
          setCaptionsOn((prev) => !prev);
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

  const toggleFullscreen = async () => {
    if (!isDocFullscreen()) {
      try {
        await requestFullscreenCompat(containerRef.current, videoRef.current);
      } catch (err) {
        console.log("Fullscreen request failed:", err?.message);
      }
    } else {
      exitFullscreenCompat().catch(() => {});
    }
  };

  const toggleCaptionsMenu = () => {
    setShowCaptionsMenu((prev) => !prev);
  };

  const selectCaptionsOption = (on) => {
    setCaptionsOn(on);
    setShowCaptionsMenu(false);
  };

  const togglePip = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.log("Picture-in-picture unavailable:", err?.message);
    }
  };

  const cycleSpeed = () => {
    const video = videoRef.current;
    if (!video) return;
    const currentIndex = SPEED_STEPS.indexOf(playbackRate);
    const next = SPEED_STEPS[(currentIndex + 1) % SPEED_STEPS.length];
    video.playbackRate = next;
    setPlaybackRate(next);
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

  // ---- Mobile double-tap zones: single tap toggles controls, double tap
  // on the left/right third skips -10/+10s (like most streaming apps). ----
  const handleZoneTap = (side) => {
    if (!isMobile) return;
    const now = Date.now();
    const last = lastTapRef.current;

    if (last.side === side && now - last.time < 320) {
      skip(side === "left" ? -10 : 10);
      setSkipFlash(side);
      setTimeout(() => setSkipFlash(null), 400);
      lastTapRef.current = { time: 0, side: null };
    } else {
      lastTapRef.current = { time: now, side };
      resetHideTimer();
    }
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
        onClick={!isMobile ? togglePlay : undefined}
        onDoubleClick={!isMobile ? toggleFullscreen : undefined}
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

      {buffering && (
        <div className="video-player__spinner">
          <Loader2 size={40} className="video-player__spinner-icon" />
        </div>
      )}

      {/* Invisible tap zones for mobile: left third = -10s (double tap),
          right third = +10s (double tap), single tap toggles controls. */}
      {isMobile && (
        <div className="video-player__tap-zones">
          <div
            className="video-player__tap-zone video-player__tap-zone--left"
            onClick={() => handleZoneTap("left")}
          >
            {skipFlash === "left" && (
              <span className="video-player__tap-flash">
                <RotateCcw size={22} /> 10
              </span>
            )}
          </div>
          <div
            className="video-player__tap-zone video-player__tap-zone--center"
            onClick={togglePlay}
          />
          <div
            className="video-player__tap-zone video-player__tap-zone--right"
            onClick={() => handleZoneTap("right")}
          >
            {skipFlash === "right" && (
              <span className="video-player__tap-flash">
                <RotateCw size={22} /> 10
              </span>
            )}
          </div>
        </div>
      )}

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
            <button
              className="video-player__btn video-player__speed"
              onClick={cycleSpeed}
              title="Playback speed"
            >
              {playbackRate}x
            </button>

            {subtitleUrl && (
              <div className="video-player__captions-wrap" ref={captionsMenuRef}>
                <button
                  className={`video-player__btn ${captionsOn ? "active" : ""}`}
                  onClick={toggleCaptionsMenu}
                  title="Captions"
                  aria-haspopup="menu"
                  aria-expanded={showCaptionsMenu}
                >
                  <Captions size={19} />
                </button>

                {showCaptionsMenu && (
                  <div className="video-player__captions-menu" role="menu">
                    <button
                      className={`video-player__captions-option ${
                        !captionsOn ? "selected" : ""
                      }`}
                      onClick={() => selectCaptionsOption(false)}
                      role="menuitemradio"
                      aria-checked={!captionsOn}
                    >
                      Off
                    </button>
                    <button
                      className={`video-player__captions-option ${
                        captionsOn ? "selected" : ""
                      }`}
                      onClick={() => selectCaptionsOption(true)}
                      role="menuitemradio"
                      aria-checked={captionsOn}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>
            )}

            {document.pictureInPictureEnabled && (
              <button
                className="video-player__btn"
                onClick={togglePip}
                title="Picture in picture"
              >
                <PictureInPicture2 size={18} />
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