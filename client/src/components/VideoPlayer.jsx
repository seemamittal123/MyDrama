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

  // ---- End / pause tracking ----
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      onProgress?.({
        watched_duration: Math.floor(video.duration || 0),
        total_duration: Math.floor(video.duration || 0),
      });
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
  }, [onProgress]);

  // ---- Fullscreen change listener ----
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
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
  // Controls dikhte hain: mouse move pe, ya jab video paused ho.
  // 3 sec inactivity ke baad (agar playing hai) auto-hide ho jate hain.
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

  // Jab play kiya jaye to timer start, jab pause ho to hamesha visible
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

  const onCross = () => navigate("/");

  const seekPercent = duration ? (progress / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`video-player ${!showControls ? "video-player--hide-cursor" : ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`video-player__cross ${showControls ? "visible" : ""}`} onClick={onCross}>
        <RxCross1 size={22} />
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
          <RotateCcw size={28} />
          <span>10</span>
        </button>

        <button className="video-player__play-center" onClick={togglePlay}>
          {playing ? <Pause size={34} /> : <Play size={34} />}
        </button>

        <button className="video-player__skip-btn" onClick={() => skip(10)}>
          <RotateCw size={28} />
          <span>10</span>
        </button>
      </div>

      <div
        className={`video-player__controls ${showControls ? "video-player__controls--visible" : ""
          }`}
      >
        <input
          type="range"
          className="video-player__seek"
          min={0}
          max={duration || 0}
          value={progress}
          onChange={handleSeek}
          style={{
            background: `linear-gradient(to right, #e50914 ${seekPercent}%, rgba(255,255,255,0.3) ${seekPercent}%)`,
          }}
        />

        <div className="video-player__row">
          <div className="video-player__left">
            <button className="video-player__btn" onClick={togglePlay}>
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>

            <button className="video-player__btn" onClick={() => skip(-10)}>
              <RotateCcw size={18} />
            </button>
            <button className="video-player__btn" onClick={() => skip(10)}>
              <RotateCw size={18} />
            </button>

            <div className="video-player__volume">
              <button className="video-player__btn" onClick={toggleMute}>
                {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
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
                  background: `linear-gradient(to right,
                       #ff0000 ${volume * 100}%,
                     #555 ${volume * 100}%)`,
                }}
              />
            </div>

            <span className="video-player__time">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>

          <div className="video-player__right">
            {subtitleUrl && (
              <button
                className={`video-player__btn ${captionsOn ? "active" : ""}`}
                onClick={toggleCaptions}
                title="Toggle captions"
              >
                <Captions size={20} />
              </button>
            )}

            <button
              className="video-player__btn video-player__next"
              onClick={() => handleNextEpisode()}
            >
              <SkipForward size={18} /> Next Episode
            </button>

            <button className="video-player__btn" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;