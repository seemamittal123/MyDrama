import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import axios from "axios";
import { server_Url } from "../App";
import loader from '../assets/loader.svg';

export default function EpisodePlayerPage() {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${server_Url}/api/episodes/episode/${id}`, { withCredentials: true });
        setEpisode(data.episode);
        const { data: progressData } = await axios.get(
          `${server_Url}/api/users/watch-history/progress/${id}`,
          { withCredentials: true }
        );
        setSavedProgress(progressData.history);

      } catch (error) {
        console.log("Fetch episode error:", error.response);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodeData();
  }, [id]);

  const handleProgress = async ({ watched_duration, total_duration }) => {
    try {
      await axios.post(
        `${server_Url}/api/users/watch-history/progress`,
        {
          episode_id: id,
          watched_duration,
          total_duration,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log(error?.response);
    }
  };

  if (loading) {
    return (
      <div className="spinner">
        <img src={loader} alt="" />
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="spinner">
        <p>Episode not found.</p>
      </div>
    );
  }
  return (
    <div className="episode-player-page">
      <VideoPlayer
        videoUrl={episode.video_url}
        subtitleUrl={episode.subtitle_url}
        startTime={savedProgress?.watched_duration || 0}
        onProgress={handleProgress}
      />

      <div className="episode-player-page__info">
        <h2>{episode.title}</h2>
        <p>Episode {episode.episode_number}</p>
      </div>
    </div>
  );
}