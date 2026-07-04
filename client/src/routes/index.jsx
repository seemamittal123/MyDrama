import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../pages/Home";
import AddSeries from "../admin/AddSeries";
import AddEpisode from "../admin/AddEpisode";
import Show from "../pages/Show";
import AuthPage from "../pages/AuthPage";
import AdminDashboard from "../admin/AdminDashboard";
import ShowEpisodes from "../admin/ShowEpisodes";
import AdminRoute from "./AdminRoute";

const router = createBrowserRouter([{
  path: '/',
  element: <App />,
  children: [
    {
      path: "",
      element: <Home />
    },
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
          path: "shows/:id/episodes",
          element: <ShowEpisodes />,
        },
        {
          path: "series/add",
          element: <AddSeries />,
        },
        {
          path: "series/add/:id", //
          element: <AddSeries />,
        },
        {
          path: "episodes/add", // 
          element: <AddEpisode />,
        },
        {
          path: "episodes/add/:id",
          element: <AddEpisode />,
        },
      ],
    },
    {
      path: "Drama/:showname",
      element: <Show />
    },

  ]
}])

export default router;