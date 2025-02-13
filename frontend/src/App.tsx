import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Home from './pages/home'
import TripTracker from "./pages/tripTracker";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function App() {
  return (
    <>
      <ToastContainer position="top-center" autoClose={3000} />
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tripTracking" element={<TripTracker />} />
      </Routes>
    </Router>
    </>
  );
}
