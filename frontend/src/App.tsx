import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import TripTracker from "./pages/tripTracker";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProtectedRoute from "./router/protectedRoute";
import PublicRoute from "./router/publicRoute";

export default function App() {
  return (
    <>
      <ToastContainer position="top-center" autoClose={2000} />
      <Router>
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/tripTracking" element={<TripTracker />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}
