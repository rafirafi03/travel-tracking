import { ITripData } from "../../interfaces/interfaces";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedTrips } from "../../store/slices/selectedTripsSlice";
import { RootState } from "../../store/store";
import {
  warningToast,
  errorToast,
  successToast,
  loadingToast,
  dismissToast,
} from "../../utils/toast";
import { useDeleteTripsMutation } from "../../store/slices/apiSlices";
import { toast } from "react-toastify";
import { getUserIdFromToken } from "../../utils/tokenHelper";
import { useNavigate } from "react-router-dom";
import { useFetchTripsQuery } from "../../store/slices/apiSlices";

interface pageProps {
  tripDatas: ITripData[];
  refetch: ReturnType<typeof useFetchTripsQuery>["refetch"];
}

const TripTable = ({ tripDatas, refetch }: pageProps) => {
  const navigate = useNavigate();
  const [deleteTrips] = useDeleteTripsMutation();
  const userId = getUserIdFromToken("userToken");
  const dispatch = useDispatch();
  const selectedTrips = useSelector(
    (state: RootState) => state.trip.selectedTrips
  );

  console.log("selectedTrips:", selectedTrips);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      dispatch(setSelectedTrips(tripDatas.map((trip) => trip._id)));
    } else {
      dispatch(setSelectedTrips([])); // Deselect all
    }
  };

  const handleSelectTrip = (id: string) => {
    const updatedSelection = selectedTrips.includes(id)
      ? selectedTrips.filter((tripId: string) => tripId !== id)
      : [...selectedTrips, id];

    dispatch(setSelectedTrips(updatedSelection));
  };

  const handleDeleteTrips = async () => {
    try {
      if (selectedTrips.length <= 0) {
        warningToast("select trips to delete");
        return;
      }
      const toastLoading = loadingToast("deleting...");

      const response = await deleteTrips({ userId, selectedTrips }).unwrap();
      dismissToast(toastLoading);

      if (response.success) {
        refetch();
        successToast("deleted successfully");
      } else {
        if (response.status === 401) {
          warningToast("session expired! logging out...");
          localStorage.removeItem("userToken");
          navigate("/login");
        }
        errorToast("failed to delete trips!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Handle the case where the error is an instance of Error
        if (error instanceof Response && error.status === 401) {
          warningToast("Session expired! Logging out...");
          localStorage.removeItem("userToken");
          navigate("/login");
        } else {
          toast.dismiss();
          errorToast("Something went wrong");
        }
      } else {
        // Handle unexpected errors (e.g., not an instance of Error)
        console.error("Unexpected error:", error);
        toast.dismiss();
        errorToast("Something went wrong");
      }
    }
  };

  const handleOpen = () => {
    if (selectedTrips.length == 0) {
      warningToast("Please select any trip!");
    } else {
      navigate("/tripTracking");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-gray-800 font-bold text-xl">Your Trips</h2>
        <div className="flex gap-2">
          <button
            onClick={handleDeleteTrips}
            className="px-6 py-1.5 text-sm border bg-white border-gray-500 rounded-md text-gray-500 hover:bg-gray-200"
          >
            Delete
          </button>
          <button
            onClick={handleOpen}
            className="px-6 py-1.5 text-sm bg-gray-500 border border-gray-200 rounded-md text-white hover:bg-gray-600"
          >
            Open
          </button>
        </div>
      </div>
      <div>
        <table className="w-full">
          <thead>
            <tr>
              <th className="w-12 p-4">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 accent-gray-600"
                  checked={selectedTrips.length === tripDatas?.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="text-left p-4 text-sm font-normal text-gray-600">
                Trips
              </th>
            </tr>
          </thead>
          <tbody>
            {tripDatas?.map((trip) => (
              <tr
                key={trip._id}
                className="hover:bg-gray-50 border-t border-gray-100"
              >
                <td className="w-12 p-4">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-gray-600"
                    checked={selectedTrips.includes(trip._id)}
                    onChange={() => handleSelectTrip(trip._id)}
                  />
                </td>
                <td className="p-4 text-sm text-gray-600">{trip.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TripTable;
