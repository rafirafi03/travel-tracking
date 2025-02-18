import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrl, HttpMethod } from "../../constants";

export const apiSlices = createApi({
  reducerPath: "bookingApi",
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (postData) => ({
        url: "/login",
        method: HttpMethod.POST,
        body: postData,
      }),
    }),
    uploadTripData: builder.mutation({
      query: (postData) => ({
        url: "/uploadTrip",
        method: HttpMethod.POST,
        body: postData,
      }),
    }),
    fetchTrips: builder.query({
      query: ({ userId, page }) => ({
        url: `/fetchTrips/${userId}?page=${page}`,
        method: HttpMethod.GET,
      }),
    }),
    deleteTrips: builder.mutation({
      query: (deleteData) => ({
        url: "/deleteTrips",
        method: HttpMethod.DELETE,
        body: deleteData,
      }),
    }),
    fetchTripsDetails: builder.query({
      query: ({ selectedTrips, page }) => ({
        url: `/fetchTripsDetails/${selectedTrips}?page=${page}`,
        method: HttpMethod.GET,
      }),
    }),
    fetchDataCount: builder.query({
      query: (userId) => ({
        url: `/fetchDataCount/${userId}`,
        method: HttpMethod.GET,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/logout",
        method: HttpMethod.POST,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useUploadTripDataMutation,
  useFetchTripsQuery,
  useDeleteTripsMutation,
  useFetchTripsDetailsQuery,
  useFetchDataCountQuery,
  useLogoutMutation,
} = apiSlices;
