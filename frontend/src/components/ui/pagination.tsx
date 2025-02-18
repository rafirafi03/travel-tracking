import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetchDataCountQuery } from "../../store/slices/apiSlices";
import { getUserIdFromToken } from "../../utils/tokenHelper";
import fetchErrorCheck from "../../utils/fetchErrorCheck";
import { useNavigate } from "react-router-dom";

interface PageProps {
  setPage: (page: string) => void;
}

export default function Pagination({ setPage }: PageProps) {
  const navigate = useNavigate();
  const userId = getUserIdFromToken("userToken");
  const { data: dataCount, error: dataCountError } =
    useFetchDataCountQuery(userId);

  useEffect(() => {
    const isError = fetchErrorCheck({
      fetchError: dataCountError,
    });

    if (isError) {
      navigate("/login");
    }
  }, [dataCountError, navigate]);

  console.log("dataCount:", dataCount);

  const itemsPerPage = 10; // Number of items per page
  const totalPages = Math.ceil((dataCount?.data ?? 1) / itemsPerPage); // Correct total pages calculation

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const [currentPage, setCurrentPage] = useState(1); // Track active page

  console.log(dataCount, "datalength");

  // Function to handle page number click
  const handlePageClick = (page: number) => {
    setCurrentPage(page);
    setPage(page.toString());
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-6 mb-4">
      {/* Previous Button */}
      <button
        className="p-2 border border-gray-200 rounded disabled:opacity-50"
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft size={16} className="text-gray-600" />
      </button>

      {/* Pagination Buttons */}
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`w-8 h-8 flex items-center justify-center border rounded text-sm ${
            currentPage === page
              ? "border-blue-500 text-blue-500"
              : "border-gray-200 text-gray-600"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        className="p-2 border border-gray-200 rounded disabled:opacity-50"
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight size={16} className="text-gray-600" />
      </button>
    </div>
  );
}
