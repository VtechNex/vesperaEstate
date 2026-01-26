import axios from "axios";
import API from "../utils/utils";
import { encryptToken, decryptToken } from "../utils/crypto";

/* ======================
   USER HELPERS
====================== */

const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error("Invalid user in localStorage:", error);
    return null;
  }
};

const getAuthToken = () => {
  const user = getUser();
  if (!user?.token) return null;

  try {
    return decryptToken(user.token);
  } catch (error) {
    console.error("Token decrypt failed:", error);
    return null;
  }
};

/* ======================
   AUTH FUNCTIONS
====================== */

const login = async (email, password) => {
  try {
    // ✅ IMPORTANT: your backend route must be /api/auth/log
    const response = await axios.post(
      `${API.AUTH}/log`,
      { email, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { token, user } = response.data;

    if (!token || !user) {
      throw new Error("Invalid response from server");
    }

    const storedUser = {
      ...user,
      token: encryptToken(token),
    };

    localStorage.setItem("user", JSON.stringify(storedUser));

    // ✅ RETURN FULL RESPONSE (so you can use res.status in frontend)
    return response;
  } catch (error) {
    console.error("Login error:", error);

    // ✅ Always throw a consistent object
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Server not reachable";

    throw {
      status: error?.response?.status || 500,
      error: message,
    };
  }
};

const logout = () => {
  localStorage.removeItem("user");
};

/* ======================
   EXPORT
====================== */

const AUTH = {
  LOGIN: login,
  LOGOUT: logout,
  USER: getUser,
  GET_TOKEN: getAuthToken,
};

export default AUTH;
