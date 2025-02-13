import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronLeft, Clock, Route } from "lucide-react";
import L from "leaflet";
import Card from "../components/ui/card";
import Header from "../components/ui/header";

// Fix Leaflet icon issue
const icon = L.icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Types
interface TripData {
  id: string;
  location: string;
  coordinates: [number, number][];
  stats: {
    totalDistance: string;
    transitDuration: string;
    overSpeeding: string;
    overSpeedingDistance: string;
    stoppedDuration: string;
  };
  details: {
    timeRange: string;
    coordinates: string;
    ignition: "ON" | "OFF";
    speed: string;
  }[];
}

// interface TripTrackerProps {
//   tripData: TripData;
// }

const TripTracker = () => {
  const tripData: TripData = {
    id: "1",
    location: "Colaba",
    coordinates: [
      [35.2271, -80.8431],
      [35.227, -80.8429],
      // Add more coordinates for the route
    ],
    stats: {
      totalDistance: "63 KM",
      transitDuration: "1Hr 36 Mins",
      overSpeeding: "41 Mins",
      overSpeedingDistance: "20.3 KM",
      stoppedDuration: "41 Mins",
    },
    details: [
      {
        timeRange: "11:20:24 PM to 11:20:24 PM",
        coordinates: "40.7238°N 74.0043°W",
        ignition: "ON",
        speed: "20.5 KM/H",
      },
      // Add more trip details
    ],
  };
  const defaultPosition: [number, number] = [35.2271, -80.8431]; // Charlotte coordinates

  const stats = [
    {
      value: tripData.stats.totalDistance,
      label: "Total Distance Travelled",
      icon: <Route className="w-6 h-6 text-cyan-500" />,
    },
    {
      value: tripData.stats.transitDuration,
      label: "Transit Travelled Duration",
      icon: <Clock className="w-6 h-6 text-cyan-500" />,
    },
    {
      value: tripData.stats.overSpeeding,
      label: "Over Speeding Duration",
      icon: <Clock className="w-6 h-6 text-teal-400" />,
    },
    {
      value: tripData.stats.overSpeedingDistance,
      label: "Over Speeding Distance",
      icon: <Route className="w-6 h-6 text-teal-400" />,
    },
    {
      value: tripData.stats.stoppedDuration,
      label: "Stopped Duration",
      icon: <Clock className="w-6 h-6 text-blue-600" />,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-w-screen max-w-4xl mx-auto px-10 py-3">
        {/* Header */}
        <button className=" hover:bg-gray-100 rounded-full mb-2">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Card className="px-3 py-4 border border-gray-400 flex items-center">
          <div className="flex items-center justify-between w-full text-center">
            <h2 className="text-lg font-semibold">{tripData.location}</h2>
            <span className="px-6 py-1 text-sm bg-gray-800 text-white rounded">
              New
            </span>
          </div>
        </Card>

        <div className="flex my-2 space-x-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-600 rounded-full"></span>
            <h1>Stopped</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-pink-500 rounded-full"></span>
            <h1>Idle</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-teal-400 rounded-full"></span>
            <h1>Over Speeding</h1>
          </div>
        </div>

        {/* Map */}
        <Card className="mt-4 mb-4">
          <div className="h-[400px] w-full">
            <MapContainer
              center={defaultPosition}
              zoom={13}
              className="h-full w-full rounded-lg"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Polyline positions={tripData.coordinates} color="blue" />
              <Marker position={tripData.coordinates[0]} icon={icon} />
              <Marker
                position={tripData.coordinates[tripData.coordinates.length - 1]}
                icon={icon}
              />
            </MapContainer>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="border border-gray-300">
              <div className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2">{stat.icon}</div>
                  <div className="text-lg font-bold">{stat.value}</div>
                  <div className="text-black text-md">{stat.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Details Table */}
        <Card className="mt-4">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-2">Time</th>
                    <th className="p-2">Point</th>
                    <th className="p-2">Ignition</th>
                    <th className="p-2">Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {tripData.details.map((detail, index) => (
                    <tr
                      key={index}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="p-2">{detail.timeRange}</td>
                      <td className="p-2">{detail.coordinates}</td>
                      <td className="p-2">{detail.ignition}</td>
                      <td className="p-2">{detail.speed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default TripTracker;
