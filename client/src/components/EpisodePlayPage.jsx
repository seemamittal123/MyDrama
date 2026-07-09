import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer";
import axios from "axios";
import { server_Url } from "../App";
import loader from '../assets/loader.svg';
import { ChevronRight } from 'lucide-react';

export default function EpisodePlayerPage() {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const [episode, setEpisode] = useState(null);
  const [savedProgress, setSavedProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allEpisodes, setAllEpisodes] = useState([]);
  const [nextEpisode, setNextEpisode] = useState(null);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${server_Url}/api/episodes/episode/${id}`, { withCredentials: true });
        setEpisode(data.episode);

        // Fetch all episodes of this show
        const { data: episodesData } = await axios.get(
          `${server_Url}/api/episodes/show/${data.episode.show_id}/all/episodes`
        );
        setAllEpisodes(episodesData.episodes || []);

        // Find next episode
        if (episodesData.episodes) {
          const sortedEpisodes = episodesData.episodes.sort((a, b) => a.episode_number - b.episode_number);
          const currentIndex = sortedEpisodes.findIndex(ep => ep._id === id);
          if (currentIndex !== -1 && currentIndex < sortedEpisodes.length - 1) {
            setNextEpisode(sortedEpisodes[currentIndex + 1]);
          }
        }

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
      const response = await axios.post(
        `${server_Url}/api/users/watch-history/progress`,
        {
          episode_id: id,
          watched_duration,
          total_duration,
        },
        { withCredentials: true }
      );
    } catch (error) {
      console.log(" Progress error:", error?.response?.data);
    }
  };

  const handleNextEpisode = () => {
    if (nextEpisode && episode) {
      navigate(`/Drama/${slug}/episode/${nextEpisode._id}`);
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
        handleNextEpisode={handleNextEpisode}
        thumbnail_url={episode.thumbnail_url}
      />
    </div>
  );
}