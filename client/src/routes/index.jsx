import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../components/Home";
import AddSeries from "../admin/AddSeries";
import AddEpisode from "../admin/AddEpisode";
import AuthPage from "../pages/AuthPage";
import AdminDashboard from "../admin/AdminDashboard";
import ShowEpisodes from "../admin/ShowEpisodes";
import AdminRoute from "./AdminRoute";
import Explore from "../components/Explore";
import Layout from "../pages/Layout";
import Watchlist from "../components/Watchlist";
import History from "../components/History";
import EpisodePlayerPage from "../components/EpisodePlayPage";

const router = createBrowserRouter([{
  path: '/',
  element: <App />,
  children: [
    {
      path: "auth",
      element: <AuthPage />
    },
    {
      path: "forgot-password",
      element: <ForgotPassword />
    },
    {
      path: "admin",
      element: <AdminRoute />,
      children: [
        {
          index: true,
          element: <AdminDashboard />,
        },
        {
          path: "shows/:showId/episodes",
          element: <ShowEpisodes />,
        },
        {
          path: "series/add",
          element: <AddSeries />,
        },
        {
          path: "series/edit/:id", //
          element: <AddSeries />,
        },
        {
          path: "episodes/add", // 
          element: <AddEpisode />,
        },
        {
          path: "episodes/edit/:epId",
          element: <AddEpisode />,
        },
      ],
    },
    {
      path: '',
      element: <Layout />,
      children: [
        {
          path: "",
          element: <Home />
        },
        {
          path: "explore",
          element: <Explore />
        },
        {
          path: "watch-list",
          element: <Watchlist />
        },
        {
          path: "continue-watching",
          element: <History />
        },
      ]
    },
    {
      path:"Drama/:slug/episode/:id",
      element:<EpisodePlayerPage/>
    }
  ]
}])

export default router;