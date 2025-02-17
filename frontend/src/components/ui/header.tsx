import { FiLogOut } from "react-icons/fi"; // Import the logout icon from Feather icons
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../store/slices/apiSlices";
import { dismissToast, errorToast, loadingToast, successToast } from "../../utils/toast";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      const toastLoading = loadingToast("logging out...");
      const response = await logout({});
      dismissToast(toastLoading);

      // Destructure response for clarity
      const { success } = response.data;

      if (success) {
        successToast("logged out");
        localStorage.removeItem("userToken");
        navigate("/login");
      } else {
        errorToast("something went wrong");
      }
    } catch (error) {
      toast.dismiss();
      errorToast("An error occurred while logging out.");
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      {/* Remove max-w-6xl and mx-auto to allow full width */}
      <div className="flex justify-between items-center px-10 py-3">
        {/* Left side: Logo and text */}
        <div className="flex items-end space-x-2">
          <img
            src="/icons/speedometer.svg"
            alt="Speedometer"
            className="w-8 h-8"
          />
          <span className="text-lg text-black font-bold font-squada">
            Speedo
          </span>
        </div>

        {/* Right side: Logout icon */}
        <button
          onClick={handleLogout}
          className="py-2 hover:bg-gray-100 rounded-full mx-5"
          aria-label="Logout"
        >
          <FiLogOut className="w-6 h-6 text-gray-600" />
        </button>
      </div>
    </header>
  );
};

export default Header;
