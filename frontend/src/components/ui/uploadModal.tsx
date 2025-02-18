import { useRef, useState } from "react";
import { X } from "lucide-react";
import { useUploadTripDataMutation } from "../../store/slices/apiSlices";
import { toast } from "react-toastify";
import {
  dismissToast,
  errorToast,
  loadingToast,
  successToast,
  warningToast,
} from "../../utils/toast";
import { getUserIdFromToken } from "../../utils/tokenHelper";
import { useFetchTripsQuery } from "../../store/slices/apiSlices";
import { useNavigate } from "react-router-dom";

interface pageProps {
  isOpen: boolean;
  onClose: () => void;
  refetch: ReturnType<typeof useFetchTripsQuery>["refetch"];
}

const UploadModal = ({ isOpen, onClose, refetch }: pageProps) => {
  const navigate = useNavigate();
  const userId = getUserIdFromToken("userToken");

  const [uploadTrip] = useUploadTripDataMutation();

  const [tripName, setTripName] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      console.log("Selected file:", file.name);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!selectedFile) {
        errorToast("please select a file");
        return;
      }
      if (!tripName) {
        errorToast("please enter trip name");
        return;
      }
      const toastLoading = loadingToast("uploading file...");
      const formData = new FormData();
      formData.append("tripName", tripName);
      formData.append("selectedFile", selectedFile);
      formData.append("userId", userId ? userId : "");
      const response = await uploadTrip(formData).unwrap();
      dismissToast(toastLoading);

      if (response.success) {
        refetch();
        successToast("file uploaded successfully");
        setTripName("");
        setSelectedFile(null);
        onClose();
      } else {
        if (response.status == 401) {
          warningToast("session expired! logging out...");
          localStorage.removeItem("userToken");
          navigate("/login");
        }
        errorToast("something went wrong!");
      }
    } catch (error) {
      toast.dismiss();
      errorToast("failed to upload file!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-10 z-50">
      <div className="bg-white rounded-lg w-full max-w-lg relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Input Field */}
          <div>
            <input
              type="text"
              placeholder="Trip Name*"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          <input
            type="file"
            accept=".xls,.xlsx"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Upload Area */}
          <div
            className="border-2 border-blue-400 rounded-lg p-8 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-blue-500 mb-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p className="text-base">
                {selectedFile ? (
                  <span className="text-green-600">{selectedFile.name}</span>
                ) : (
                  <>
                    Click here to upload the{" "}
                    <span className="text-blue-500">Excel</span> sheet of your
                    trip
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-600 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-[#1B2B3A] text-white rounded-lg hover:bg-[#162431] transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
