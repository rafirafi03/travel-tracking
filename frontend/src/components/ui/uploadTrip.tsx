import { Upload } from "lucide-react";

interface pageProps {
  onClick: () => void;
  dataLength: number;
}

export default function uploadTrip({ onClick, dataLength }: pageProps) {
  return (
    <>
      {dataLength > 0 ? (
        <div className="bg-white flex border border-gray-400 rounded-lg shadow-sm p-6 space-x-4 mb-6">
          <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 border btn-primary border-gray-200 rounded-lg text-white hover:bg-gray-50"
          >
            <Upload size={20} />
            <span>Upload Trip</span>
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Upload the Excel sheet of your trip
          </p>
        </div>
      ) : (
        <div className="bg-white flex flex-col items-center border border-gray-400 rounded-lg shadow-sm p-6 space-y-4 mb-6">
          <img
            src="/icons/papermap.svg"
            alt="Upload Placeholder"
            className="w-50 h-50 object-cover"
          />
          <button
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2 btn-primary border border-gray-200 rounded-lg text-white hover:bg-gray-700"
          >
            <Upload size={20} />
            <span>Upload Trip</span>
          </button>
          <p className="text-sm text-gray-500 text-center">
            Upload the Excel sheet of your trip
          </p>
        </div>
      )}
    </>
  );
}
