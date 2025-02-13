import Header from "../components/ui/header";
import TripTable from "../components/ui/tripTable";
import Pagination from "../components/ui/pagination";
import UploadTrip from "../components/ui/uploadTrip";
import UploadModal from "../components/ui/uploadModal";
import { useState } from "react";
import { useFetchTripsQuery } from "../store/slices/apiSlices";
import { getUserIdFromToken } from "../utils/tokenHelper";
import { toast } from "react-toastify";
import { errorToast, successToast, loadingToast, dismissToast, warningToast } from "../utils/toast";
import { useDeleteTripsMutation } from "../store/slices/apiSlices";

const Home = () => {
  const userId = getUserIdFromToken("userToken");
  const [deleteTrips] = useDeleteTripsMutation()

  const { data: fetchTrips, refetch: refetchTrips } = useFetchTripsQuery(userId);
  const [uploadModal, setUploadModal] = useState<boolean>(false);

  console.log(fetchTrips, "fetchtrips");

  const onClose = () => {
    setUploadModal(false);
  };

  const openModal = () => {
    setUploadModal(true);
  };

  const handleDeleteTrips = async (selectedTrips: string[]) => {
    try {

      if(selectedTrips.length<=0) {
        warningToast('select trips to delete')
        return
      }
      const toastLoading = loadingToast("deleting...");

      const response = await deleteTrips({ userId, selectedTrips }).unwrap();
      dismissToast(toastLoading)

      if(response.success) {
        refetchTrips()
        successToast('deleted successfully')
      } else {
        errorToast('failed to delete trips!')
      }
    } catch (error) {
      toast.dismiss();
      errorToast("something went wrong");
    }
  };

  return (
    <>
      <UploadModal isOpen={uploadModal} onClose={onClose} />
      <div className="min-h-screen min-w-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-xl">👋</span>
              <span className="text-gray-800">Welcome, User</span>
            </div>
          </div>
          {/* Upload Section */}
          <UploadTrip dataLength={fetchTrips?.length} onClick={openModal} />
          {/* Table Section */}
          {fetchTrips?.length > 0 && <TripTable tripDatas={fetchTrips} deleteTrips={handleDeleteTrips} />}
          <Pagination />
        </div>
      </div>
    </>
  );
};

export default Home;
