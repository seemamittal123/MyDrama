import { createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { server_Url } from '../App';
import axios from 'axios';

export const showContext = createContext({
  showDetails: {}, episodes: [], toggle: false,
  handleShow: () => { }, fetchEpisodes: () => { }, onClose: () => { }
});

const ShowProvider = ({ children }) => {
  const [showDetails, setShowDetails] = useState({});
  const [related, setRelated] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const { allShows, tranding, latest, popular } = useSelector(state => state.show);

  const onClose = () => {
    setToggle(false)
  }

  const fetchEpisodes = async (showId) => {
    try {
      setLoading1(true);

      const { data } = await axios.get(`${server_Url}/api/episodes/show/${showId}/all/episodes`);
      if (data.success) {
        setEpisodes(data.episodes);
      }

    } catch (error) {
      console.log(error.response);
    }
    finally {
      setLoading1(false)
    }
  }

  const fetchRelatedShows = async (show) => {
    try {
      setLoading2(true);
      const { data } = await axios.get(`${server_Url}/api/shows/filter/shows?q=${show?.genre.join("&")}&limit=6`)
      if (data.success) {
        const filterData = data.shows.filter((s) => s._id.toString() != show._id.toString())
        setRelated(filterData);
      }
    } catch (error) {
      console.log(error.response);
    }
    finally {
      setLoading2(false);
    }
  }

  const handleShow = (showOrId) => {
    const show = typeof showOrId === 'object'
      ? showOrId
      : [...allShows, ...tranding, ...latest, ...popular].find(
        (item) => item?._id?.toString() === showOrId?.toString()
      );

    if (!show?._id) return;

    setToggle(true);
    setShowDetails(show);
    fetchEpisodes(show._id);
    fetchRelatedShows(show)
  }


  return (
    <showContext.Provider value={{ showDetails, episodes, toggle, handleShow, fetchEpisodes, onClose, loading1, loading2, related }}>
      {children}
    </showContext.Provider>
  );
}

export default ShowProvider;