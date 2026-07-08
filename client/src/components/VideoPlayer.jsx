import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from "lucide-react";
import { RxCross1 } from "react-icons/rx";
import { useNavigate } from 'react-router-dom'
const VideoPlayer = ({ videoUrl, subtitleUrl, onProgress, startTime = 0,handleNextEpisode }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const navigate = useNavigate();

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
      hls.on(Hls.Events.MANIFEST_PARSED, setStartTime); // ✅ manifest load hone ke baad hi
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
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

  // Track when video ends or is paused
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (onProgress) {
        onProgress({
          watched_duration: Math.floor(video.duration || 0),
          total_duration: Math.floor(video.duration || 0),
        });
      }
    };

    const handlePause = () => {
      if (onProgress) {
        onProgress({
          watched_duration: Math.floor(video.currentTime),
          total_duration: Math.floor(video.duration || 0),
        });
      }
    };

    video.addEventListener("ended", handleEnded);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("pause", handlePause);
    };
  }, [onProgress]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !video.src) return;

    if (video.paused) {
      video.play().catch((error) => {
        console.log("Play error:", error.message);
      });
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    video.muted = !video.muted;
    setMuted(video.muted);
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

  const toggleFullscreen = () => {
    if (containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen();
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };


  const onCross = () => {
    navigate('/')
  }

  return (
    <div
      ref={containerRef}
      className="video-player"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="cross" onClick={() => onCross()}>
        <RxCross1 size={25} />
      </div>
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      >
        {subtitleUrl && (
          <track kind="subtitles" src={subtitleUrl} default label="English" />
        )}
      </video>

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
        />

        <div className="video-player__row">
          <div className="video-player__left">
            <button className="video-player__btn" onClick={togglePlay}>
              {playing ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button className="video-player__btn" onClick={toggleMute}>
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <span className="video-player__time">
              {formatTime(progress)} / {formatTime(duration)}
            </span>
          </div>

          <div className="video-player__right">
            <button className="video-player__btn video-player__next" onClick={() => handleNextEpisode()}>
              <SkipForward size={18} /> Next Episode
            </button>
            <button className="video-player__btn" onClick={toggleFullscreen}>
              <Maximize size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;