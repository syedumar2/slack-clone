import { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import api from "../../axios";
import { toast } from "sonner";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  //load token from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setAccessToken(token);
      fetchUserData();
    }
    setAuthLoading(false);
  }, [accessToken]);

  const searchContacts = async (q) => {
    try {
      const res = await api.get(`/users?q=${q}`);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || error?.message,
      };
    }
  };

  const updateProfile = async (name, email, pwd) => {
    try {
      const res = await api.patch("/update", { name, email, pwd });
      if (res.data.success) {
        console.log("new user details", res.data.user);
        setUser(res.data.user);
        return { success: true };
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || error?.message,
      };
    }
  };

  const addFriends = async (contacts = []) => {
    try {
      const res = await api.patch("/update", { contacts });
      if (res.data.success) {
        console.log("new user details", res.data.user);
        setUser(res.data.user);
        return { success: true };
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || error?.message,
      };
    }
  };

  const changePwd = async (pwd) => {
    try {
      const res = await api.patch("/update", { pwd: pwd });
      if (res.data.success) {
        return { success: true };
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      return {
        success: false,
        message: error?.response?.data?.message || error?.message,
      };
    }
  };

  const login = async (email, pwd) => {
    try {
      const res = await api.post("/login", { email, pwd });

      if (res.data.success) {
        localStorage.setItem("accessToken", res.data.accessToken);
        setAccessToken(res.data.accessToken);
        return { success: true, message: res.data.data };
      } else {
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      setAuthLoading(false);
      if (!error.response) {
        return { success: false, message: "No server response" };
      } else if (error.response?.status === 401) {
        return { success: false, message: "Invalid Email or Password" };
      } else {
        return { success: false, message: "Login Failed" };
      }
    }
  };

  const logout = async () => {
    try {
      const res = await api.post("/logout");
      localStorage.removeItem("accessToken");

      setAccessToken(null);
      setUser(null);
      setUserId(null);
      return { success: true, message: res.data.message };
    } catch (error) {
      console.log(error);
      if (!error.response) {
        return { success: false, message: "No server response" };
      } else if (error.response?.status === 500) {
        return { success: false, message: "LogOut failed" };
      } else {
        return { success: false, message: "Logout Failed" };
      }
    }
  };

  const register = async (name, email, pwd) => {
    try {
      const res = await api.post("/register", { name, email, pwd });
      if (res.data.success) {
        return { success: true, message: res.data.message };
      }
    } catch (error) {
      if (!error.response) {
        return { success: false, message: "No server response" };
      } else if (error.response?.status === 409) {
        return { success: false, message: "User with Email already exists" };
      } else if (error.response?.status === 401) {
        return { success: false, message: "Invalid Credentials" };
      } else {
        return { success: false, message: "Signup Failed" };
      }
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await api.get("/protected", {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      });
      if (res.data.success) {
        setUser(res.data.data);
        setUserId(res.data.data._id);

        return { success: true, userData: res.data.data };
      }
    } catch (err) {
      return console.error(err?.response?.data?.message || err?.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        userId,
        login,
        logout,
        fetchUserData,
        authLoading,
        register,
        updateProfile,
        changePwd,
        searchContacts,
        addFriends,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
