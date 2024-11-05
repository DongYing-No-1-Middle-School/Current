"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { Cookies } from "react-cookie";
import axios from "axios";

interface Userdata {
  username: string;
  grade: number;
  classnum: number;
  status: string;
}

interface UserContextProps {
  userdata: Userdata;
  setUserdata: React.Dispatch<React.SetStateAction<Userdata>>;
  permission: String[];
  setPermission: React.Dispatch<React.SetStateAction<String[]>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

interface UserProviderProps {
  children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userdata, setUserdata] = useState<Userdata>({
    username: "",
    grade: 0,
    classnum: 0,
    status: "pending",
  });
  const [permission, setPermission] = useState<String[]>([]);

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
            setUserdata({
              username: res.data.data.username,
              grade: res.data.data.grade,
              classnum: res.data.data.classnum,
              status: "logged",
            });
            // 请求权限数据
            axios
              .get("/api/clients/permissions", {
                headers: {
                  Authorization: token,
                },
              })
              .then((permRes) => {
                if (permRes.data.code === 200) {
                  setPermission(permRes.data.data);
                }
              })
              .catch(() => {
                setPermission([]);
              });
          } else {
            setUserdata({
              username: "",
              grade: 0,
              classnum: 0,
              status: "exit",
            });
          }
        })
        .catch(() => {
          setUserdata({
            username: "",
            grade: 0,
            classnum: 0,
            status: "exit",
          });
        });
    } else {
      setUserdata({
        username: "",
        grade: 0,
        classnum: 0,
        status: "exit",
      });
    }
  }, []);

  return (
    <UserContext.Provider
      value={{ userdata, setUserdata, permission, setPermission }}
    >
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

export const hasPermission = (
  userpermission: String[],
  perm: String,
): boolean => {
  if (userpermission.includes("*")) {
    return true;
  }

  return userpermission.includes(perm);
};
