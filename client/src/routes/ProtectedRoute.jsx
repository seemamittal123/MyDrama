import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const location = useLocation();
  const { user, loading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-700 border-t-red-600" />
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}
export default ProtectedRoute;



