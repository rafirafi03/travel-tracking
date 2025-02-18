import { jwtDecode } from "jwt-decode";

export const getUserIdFromToken = (tokenName: string) => {
  let token: string | null = "";

  token = localStorage.getItem(tokenName);

  if (token) {
    try {
      // Decode the token to get the payload
      const decodedToken = jwtDecode<{ userId: string }>(token);

      // Extract and return the userId
      return decodedToken.userId;
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  } else {
    console.error("No token found in localStorage");
    return null;
  }
};
