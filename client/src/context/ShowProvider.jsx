import { createContext, useContext, useState } from 'react';
import { useSelector } from 'react-redux';
import { server_Url } from '../App';
import axios from 'axios';

export const showContext = createContext();

const ShowProvider = ({ children }) => {
  const [showDetails, setShowDetails] = useState({});
  const [episodes, setEpisodes] = useState([]);
  const [toggle, setToggle] = useState(false);
  const { allShows } = useSelector(state => state.show);

  const onClose = () => {
    setToggle(false)
  }

  const fetchEpisodes = async (showId) => {
    try {
      const { data } = await axios.get(`${server_Url}/api/episodes/show/${showId}/all/episodes`);
      if (data.success) {
        setEpisodes(data.episodes);
      }

    } catch (error) {
      console.log(error.response);
    }
  }

  const handleShow = (showId) => {
    const show = allShows.find((show) => show._id.toString() == showId.toString());
    setToggle(true);
    setShowDetails(show);
    fetchEpisodes(showId);
  }

  return (
    <showContext.Provider value={{ showDetails, episodes, toggle, handleShow, fetchEpisodes, onClose }}>
      {children}
    </showContext.Provider>
  );
}

export default ShowProvider;