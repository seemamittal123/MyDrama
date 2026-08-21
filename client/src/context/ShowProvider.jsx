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
  const [episodes, setEpisodes] = useState([]);
  const [toggle, setToggle] = useState(false);
  const [loading, setLoading] = useState(false);
  const { allShows } = useSelector(state => state.show);

  const onClose = () => {
    setToggle(false)
  }

  const fetchEpisodes = async (showId) => {
    try {
      setLoading(true);

      const { data } = await axios.get(`${server_Url}/api/episodes/show/${showId}/all/episodes`);
      if (data.success) {
        setEpisodes(data.episodes);
      }

    } catch (error) {
      console.log(error.response);
    }
    finally {
      setLoading(false)
    }
  }

  const handleShow = (showOrId) => {
    const show = typeof showOrId === 'object'
      ? showOrId
      : allShows.find((item) => item._id.toString() === showOrId.toString());

    if (!show?._id) return;

    setToggle(true);
    setShowDetails(show);
    fetchEpisodes(show._id);
  }

  return (
    <showContext.Provider value={{ showDetails, episodes, toggle, handleShow, fetchEpisodes, onClose, loading }}>
      {children}
    </showContext.Provider>
  );
}

export default ShowProvider;