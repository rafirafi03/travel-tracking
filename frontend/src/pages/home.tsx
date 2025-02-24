import Header from "../components/ui/header";
import TripTable from "../components/ui/tripTable";
import Pagination from "../components/ui/pagination";
import UploadTrip from "../components/ui/uploadTrip";
import UploadModal from "../components/ui/uploadModal";
import { useEffect, useState, useCallback } from "react";
import { useFetchTripsQuery } from "../store/slices/apiSlices";
import { getUserIdFromToken } from "../utils/tokenHelper";
import fetchErrorCheck from "../utils/fetchErrorCheck";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/loader";

const Home = () => {
  const navigate = useNavigate();
  const userId = getUserIdFromToken("userToken");
  const [page, setPage] = useState("1");
  const [uploadModal, setUploadModal] = useState(false);

  const {
    data: trips,
    refetch,
    error: fetchTripsError,
    isLoading,
  } = useFetchTripsQuery({ userId, page });

  useEffect(() => {
    if (fetchErrorCheck({ fetchError: fetchTripsError })) {
      navigate("/login");
    }
  }, [fetchTripsError, navigate]);

  const handleModalClose = useCallback(() => {
    setUploadModal(false);
  }, []);

  const handleModalOpen = useCallback(() => {
    setUploadModal(true);
  }, []);

  if (isLoading) {
    return (
      <Loader/>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UploadModal 
        isOpen={uploadModal} 
        onClose={handleModalClose} 
        refetch={refetch} 
      />

      <Header />

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="bg-white rounded-lg border border-gray-400 shadow-sm p-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 text-xl" role="img" aria-label="wave">👋</span>
            <span className="text-gray-800">Welcome, User</span>
          </div>
        </div>

        <UploadTrip 
          dataLength={trips?.length} 
          onClick={handleModalOpen} 
        />

        {trips?.length > 0 && (
          <>
            <TripTable 
              tripDatas={trips} 
              refetch={refetch} 
            />
            <Pagination setPage={setPage} />
          </>
        )}
      </main>
    </div>
  );
};

export default Home;