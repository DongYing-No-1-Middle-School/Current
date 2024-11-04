"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { Cookies } from "react-cookie";
import axios from "axios";

interface Userdata {
  username: string;
  status: string;
}

interface UserContextProps {
  userdata: Userdata;
  setUserdata: React.Dispatch<React.SetStateAction<Userdata>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userdata, setUserdata] = useState<Userdata>({
    username: "",
    status: "pending",
  });

  useEffect(() => {
    // setUserdata({ username: "testuser", status: "exit" });
    var token = new Cookies().get("token");

    if (token) {
      axios
        .get("/api/clients/status", {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          if (res.data.code === 200) {
            setUserdata({ username: res.data.data.username, status: "logged" });
          } else {
            setUserdata({ username: "", status: "exit" });
          }
        })
        .catch(() => {
          setUserdata({ username: "", status: "exit" });
        });
    } else {
      setUserdata({ username: "", status: "exit" });
    }
  }, []);

  return (
    <UserContext.Provider value={{ userdata, setUserdata }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
};

export const Logout = () => {
  var token = new Cookies().get("token");

  if (token) {
    axios
      .get("/api/clients/logout", {
        headers: {
          Authorization: token,
        },
      })
      .then(() => {
        new Cookies().remove("token");
        window.location.reload();
      })
      .catch(() => {
        new Cookies().remove("token");
        window.location.reload();
      });
  }
};
