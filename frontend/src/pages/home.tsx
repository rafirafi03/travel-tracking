import Header from "../components/ui/header";
import TripTable from "../components/ui/tripTable";
import Pagination from "../components/ui/pagination";
import UploadTrip from "../components/ui/uploadTrip";
import UploadModal from "../components/ui/uploadModal";
import { useState } from "react";
import { useFetchTripsQuery } from "../store/slices/apiSlices";
import { getUserIdFromToken } from "../utils/tokenHelper";


const Home = () => {
  const userId = getUserIdFromToken("userToken");

  const { data: fetchTrips} = useFetchTripsQuery(userId);
  const [uploadModal, setUploadModal] = useState<boolean>(false);
  console.log(fetchTrips, "fetchtrips");

  const onClose = () => {
    setUploadModal(false);
  };

  const openModal = () => {
    setUploadModal(true);
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
          {fetchTrips?.length > 0 && <TripTable tripDatas={fetchTrips} />}
          <Pagination />
        </div>
      </div>
    </>
  );
};

export default Home;
