import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  CircleMarker,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ChevronLeft, ChevronRight, Clock, Route } from "lucide-react";
import L from "leaflet";
import Card from "../components/ui/card";
import Header from "../components/ui/header";
import { useFetchTripsDetailsQuery } from "../store/slices/apiSlices";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { useEffect, useState } from "react";
import {
  Coordinate,
  ITripDetails,
  RouteSegment,
  TableDetailRow,
} from "../interfaces/interfaces";
import { LatLngExpression } from "leaflet";
import { formatDuration } from "../utils/formatDuration";
import { useNavigate } from "react-router-dom";
import fetchErrorCheck from "../utils/fetchErrorCheck";

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

const TripTracker = () => {
  const navigate = useNavigate();
  const selectedTrips = useSelector(
    (state: RootState) => state.trip.selectedTrips
  );

  console.log("selectedTrips:", selectedTrips);

  const [currentPage, setCurrentPage] = useState<number>(1);

  const { data: fetchTripsDetails, error: fetchTripsDetailsError } =
    useFetchTripsDetailsQuery({ selectedTrips, page: currentPage });

  useEffect(() => {
    const isError = fetchErrorCheck({
      fetchError: fetchTripsDetailsError,
    });

    if (isError) {
      navigate("/login");
    }
  }, [fetchTripsDetailsError, navigate]);

  console.log("fetchTripsDetails:", fetchTripsDetails);

  const [activeLocation, setActiveLocation] = useState(
    fetchTripsDetails?.data[0]?.name
  );
  const [selectedTripDetails, setSelectedTripDetails] = useState(
    fetchTripsDetails?.data[0]
  );

  const itemsPerPage = 10; // Number of items per page
  const totalPages = Math.ceil(
    (selectedTripDetails?.gpsData?.length ?? 1) / itemsPerPage
  ); // Correct total pages calculation

  const pageNumbers = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const [startPosition, setStartPosition] = useState<
    LatLngExpression | null | undefined
  >(null);
  const [endPosition, setEndPosition] = useState<
    LatLngExpression | null | undefined
  >(null);

  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [stoppedPoints, setStoppedPoints] = useState<Coordinate[]>([]);
  const [idlingPoints, setIdlingPoints] = useState<Coordinate[]>([]);

  useEffect(() => {
    if (fetchTripsDetails?.data?.length) {
      setActiveLocation(fetchTripsDetails.data[0].name);
      setSelectedTripDetails(fetchTripsDetails.data[0]);

      if (fetchTripsDetails.data[0].routeSegments) {
        setRouteSegments(fetchTripsDetails.data[0].routeSegments);
      }

      if (fetchTripsDetails.data[0].stoppedPoints) {
        setStoppedPoints(fetchTripsDetails.data[0].stoppedPoints);
      }

      if (fetchTripsDetails.data[0].idlingPoints) {
        setIdlingPoints(fetchTripsDetails.data[0].idlingPoints);
      }
    }
  }, [fetchTripsDetails]);

  useEffect(() => {
    if (fetchTripsDetails?.data?.length) {
      const coordinates = fetchTripsDetails.data.map((trip: ITripDetails) =>
        trip.gpsData.map(
          ({ latitude, longitude }): LatLngExpression => [latitude, longitude]
        )
      );

      if (coordinates.length > 0) {
        setStartPosition(coordinates[0][0]);
        setEndPosition(
          coordinates[coordinates.length - 1][
            coordinates[coordinates.length - 1].length - 1
          ]
        );
      }
    }
  }, [fetchTripsDetails]);

  const handleTripClick = (id: string) => {
    const tripDetails = fetchTripsDetails?.data?.find(
      (trip: ITripDetails) => trip._id === id
    );
    setActiveLocation(tripDetails.name);
    setSelectedTripDetails(tripDetails);

    if (tripDetails.routeSegments) {
      setRouteSegments(tripDetails.routeSegments);
    }

    if (tripDetails.stoppedPoints) {
      setStoppedPoints(tripDetails.stoppedPoints);
    }

    if (tripDetails.idlingPoints) {
      setIdlingPoints(tripDetails.idlingPoints);
    }
  };

  const stats = [
    {
      label: "Total Distance Travelled",
      value: `${selectedTripDetails?.totalDistance}`,
      icon: <Route className="text-cyan-500" />,
    },
    {
      label: "Total Travelled Duration",
      value: `${selectedTripDetails?.duration}`,
      icon: <Clock className="text-cyan-500" />,
    },
    {
      label: "Over Speed Duration",
      value: `${selectedTripDetails?.overspeedDuration}`,
      icon: <Clock className="text-emerald-300" />,
    },
    {
      label: "Over Speed Distance",
      value: `${selectedTripDetails?.overspeedDistance}`,
      icon: <Route className="text-emerald-300" />,
    },
    {
      label: "Stopped Duration",
      value: `${selectedTripDetails?.stoppedDuration}`,
      icon: <Clock className="text-blue-500" />,
    },
    {
      label: "Idling Duration",
      value: `${selectedTripDetails?.idlingDuration || "0 Min"}`,
      icon: <Clock className="text-pink-500" />,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-w-screen max-w-4xl mx-auto px-10 py-3">
        {/* Header */}
        <button
          onClick={() => navigate("/")}
          className=" hover:bg-gray-100 rounded-full mb-2"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <Card className="px-3 py-4 border border-gray-400 flex items-center">
          <div className="flex items-center justify-between w-full text-center">
            <h2 className="text-lg font-semibold">
              {selectedTripDetails?.name}
            </h2>
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
          <div className="h-[600px] w-full">
            {startPosition && (
              <MapContainer
                center={startPosition}
                zoom={13}
                className="h-full w-full rounded-lg"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* Render route segments with appropriate colors */}
                {routeSegments.map((segment, index) => {
                  // Convert segment coordinates to LatLngExpression[] for Polyline
                  const positions: LatLngExpression[] = segment.coordinates.map(
                    (coord) => [coord.latitude, coord.longitude]
                  );

                  return (
                    <Polyline
                      key={index}
                      positions={positions}
                      color={segment?.isOverspeeding ? "#00FFD1" : "#00B2FF"}
                      weight={4}
                    />
                  );
                })}

                {/* Render stopped points with blue circle markers and tooltips */}
                {stoppedPoints.map((point, index) => (
                  <CircleMarker
                    key={`stopped-${index}`}
                    center={[point.latitude, point.longitude]}
                    radius={8}
                    fillColor="#0000FF" // Blue color
                    color="#0000FF"
                    weight={2}
                    opacity={1}
                    fillOpacity={0.8}
                  >
                    <Tooltip
                      direction="top"
                      offset={[0, -10]}
                      opacity={10}
                      permanent={false}
                    >
                      <div className="p-2 text-center text-white bg-blue-500">
                        <strong>
                          Stopped for {formatDuration(point.durationSeconds)}
                        </strong>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                ))}

                {/* Render idling points with pink circle markers and tooltips */}
                {idlingPoints &&
                  idlingPoints.map((point, index) => (
                    <CircleMarker
                      key={`idling-${index}`}
                      center={[point.latitude, point.longitude]}
                      radius={8}
                      fillColor="#FF69B4" // Pink color
                      color="#FF69B4"
                      weight={2}
                      opacity={1}
                      fillOpacity={0.8}
                    >
                      <Tooltip
                        direction="top"
                        offset={[0, -10]}
                        opacity={1}
                        permanent={false}
                      >
                        <div className="p-2 text-center text-white bg-pink-500">
                          <strong>
                            Idling for {formatDuration(point.durationSeconds)}
                          </strong>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}

                {startPosition && (
                  <Marker position={startPosition} icon={icon}>
                    <Tooltip direction="top" offset={[0, -30]}>
                      <div className="p-1">Trip Start</div>
                    </Tooltip>
                  </Marker>
                )}
                {endPosition && (
                  <Marker position={endPosition} icon={icon}>
                    <Tooltip direction="top" offset={[0, -30]}>
                      <div className="p-1">Trip End</div>
                    </Tooltip>
                  </Marker>
                )}
              </MapContainer>
            )}
          </div>
        </Card>

        <div className="w-full max-w-screen mx-auto my-5">
          <nav className="relative flex items-center">
            <button
              className="p-1 hover:bg-gray-100 border border-gray-300 rounded-sm"
              aria-label="Previous locations"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex-1 overflow-x-auto flex items-center space-x-8 px-4">
              {fetchTripsDetails?.data?.map((data: ITripDetails) => (
                <button
                  key={data?._id}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 transition-colors ${
                    activeLocation === data?.name
                      ? "border-blue-500 text-blue-500"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTripClick(data._id)}
                >
                  {data?.name}
                </button>
              ))}
            </div>

            <button
              className="p-1 hover:bg-gray-100 border border-gray-300 rounded-sm"
              aria-label="Next locations"
            >
              <ChevronRight className="w-5 h-5 text-gray-500 " />
            </button>
          </nav>
          <hr className="text-gray-300" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
        <div className="p-4 max-w-screen my-5">
          <div className="border border-gray-400 p-4 rounded-lg shadow-lg flex flex-col lg:flex-row gap-4">
            {/* Table Container (Scrollable on small screens) */}
            <div className="overflow-auto w-full lg:w-2/3">
              <table className="border-collapse border border-gray-400 w-full min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-400 p-4 text-left">
                      Time
                    </th>
                    <th className="border border-gray-400 p-4 text-left">
                      Point
                    </th>
                    <th className="border border-gray-400 p-4 text-left">
                      Ignition
                    </th>
                    <th className="border border-gray-400 p-4 text-left">
                      Speed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTripDetails?.tableDetails?.map(
                    (detail: TableDetailRow, index: string) => (
                      <tr key={index}>
                        <td className="border border-gray-400 p-4">
                          {detail.timeRange}
                        </td>
                        <td className="border border-gray-400 p-4">
                          {detail.coordinates}
                        </td>
                        <td className="border border-gray-400 p-4">
                          <span
                            className={
                              detail.ignition === "ON"
                                ? "text-green-500"
                                : "text-red-500"
                            }
                          >
                            {detail.ignition}
                          </span>
                        </td>
                        <td className="border border-gray-400 p-4">
                          {detail.speed}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Stats Section (Right Side) */}
            <div className="flex py-15 px-10 border border-gray-400 w-full lg:w-1/3 items-start">
              <div className="grid grid-cols-2 gap-y-5">
                <div className="text-gray-700 font-semibold">
                  Travel Duration
                </div>
                <div className="font-bold text-center">
                  {selectedTripDetails?.duration}
                </div>

                <div className="text-gray-700 font-semibold">Stopped from</div>
                <div className="font-bold text-center">
                  {selectedTripDetails?.stoppedDuration}
                </div>

                <div className="text-gray-700 font-semibold">Distance</div>
                <div className="font-bold text-center">
                  {selectedTripDetails?.totalDistance}
                </div>

                <div className="text-gray-700 font-semibold">
                  Overspeeding Duration
                </div>
                <div className="font-bold text-center">
                  {selectedTripDetails?.overspeedDuration}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Section */}
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
      </div>
    </>
  );
};

export default TripTracker;
