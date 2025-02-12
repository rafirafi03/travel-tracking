import { useState } from "react";
import { ITripData } from "../../interfaces/interfaces";

interface pageProps {
  tripDatas : ITripData[]
}

const TripTable = ({tripDatas}: pageProps) => {
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const trips = [
    { id: 1, route: "Bangalore - Mysore" },
    { id: 2, route: "Bangalore - Mysore" },
    { id: 3, route: "Bangalore - Mysore" },
    { id: 4, route: "Bangalore - Mysore" },
    { id: 5, route: "Bangalore - Mysore" },
    { id: 6, route: "Bangalore - Mysore" },
    { id: 7, route: "Bangalore - Mysore" },
    { id: 8, route: "Bangalore - Mysore" },
    { id: 9, route: "Bangalore - Mysore" },
    { id: 10, route: "Bangalore - Mysore" },
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTrips(tripDatas.map((trip) => trip._id));
    } else {
      setSelectedTrips([]);
    }
  };

  const handleSelectTrip = (id) => {
    setSelectedTrips((prev) =>
      prev.includes(id) ? prev.filter((tripId) => tripId !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h2 className="text-gray-800 font-bold text-xl">Your Trips</h2>
        <div className="flex gap-2">
          <button className="px-6 py-1.5 text-sm border bg-white border-gray-500 rounded-md text-gray-500 hover:bg-gray-200">
            Delete
          </button>
          <button className="px-6 py-1.5 text-sm bg-gray-500 border border-gray-200 rounded-md text-white hover:bg-gray-600">
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
