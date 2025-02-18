"use client";

import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { warningToast } from "./toast";

interface PageProps {
  fetchError: FetchBaseQueryError | SerializedError | undefined;
}

export default function FetchErrorCheck({ fetchError }: PageProps) {
  const tokenName = "userToken";
  if (fetchError && "status" in fetchError) {
    if (fetchError.status === 401) {
      warningToast("session expired! logging out");
      localStorage.removeItem(tokenName);
      return true;
    }
  }

  return false;
}
