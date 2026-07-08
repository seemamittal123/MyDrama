
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import loader from '../assets/loader.svg';
const AdminRoute = () => {
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return <div className="spinner">
      <img src={loader} alt="" /> </div>;
  }

  return user && user?.role == "admin" ? <Outlet /> : <Navigate to="/auth" replace />;

};

export default AdminRoute;




