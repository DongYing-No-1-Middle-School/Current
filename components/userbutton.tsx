"use client";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Skeleton } from "@nextui-org/skeleton";
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import axios from "axios";
import { Cookies } from "react-cookie";

import { UserIcon } from "./icons";

import { Logout, useUser } from "@/layouts/usercontext";

export default function UserButton() {
  const { userdata } = useUser();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [username, setUsername] = useState({
    value: "",
    isInvalid: false,
    errorMessage: "",
  });
  const [password, setPassword] = useState({
    value: "",
    isInvalid: false,
    errorMessage: "",
  });
  const [isLoginButtonLoading, setLoginButtonLoading] = useState(false);
  const [isLogoutButtonLoading, setLogoutButtonLoading] = useState(false);

  const handleLogin = () => {
    if (username.value === "") {
      setUsername({
        value: username.value,
        isInvalid: true,
        errorMessage: "用户名不能为空。",
      });

      return;
    }
    if (password.value === "") {
      setPassword({
        value: password.value,
        isInvalid: true,
        errorMessage: "密码不能为空。",
      });

      return;
    }
    setLoginButtonLoading(true);
    axios
      .post("/api/clients/login", {
        username: username.value,
        password: password.value,
      })
      .then((result) => {
        setLoginButtonLoading(false);
        if (result.data.code === 200) {
          new Cookies().set("token", result.data.data.token, { path: "/" });
          location.reload();
        } else {
          setPassword({
            value: password.value,
            isInvalid: true,
            errorMessage: "用户名或密码错误。",
          });
        }
      })
      .catch(() => {
        setLoginButtonLoading(false);
        setPassword({
          value: password.value,
          isInvalid: true,
          errorMessage: "登录失败，请稍后再试。",
        });
      });
    // });
  };

  const handleLogout = () => {
    setLogoutButtonLoading(true);
    Logout();
  };

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">登录</ModalHeader>
              <ModalBody>
                <form>
                  <Input
                    isRequired
                    errorMessage={username.errorMessage}
                    id="username"
                    isInvalid={username.isInvalid}
                    label="用户名"
                    type="text"
                    value={username.value}
                    variant="underlined"
                    onChange={(e) =>
                      setUsername({
                        value: e.target.value,
                        isInvalid: false,
                        errorMessage: "",
                      })
                    }
                  />
                  <Input
                    isRequired
                    errorMessage={password.errorMessage}
                    id="password"
                    isInvalid={password.isInvalid}
                    label="密码"
                    type="password"
                    value={password.value}
                    variant="underlined"
                    onChange={(e) =>
                      setPassword({
                        value: e.target.value,
                        isInvalid: false,
                        errorMessage: "",
                      })
                    }
                  />
                </form>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  关闭
                </Button>
                {isLoginButtonLoading ? (
                  <Button
                    isLoading
                    color="primary"
                    type="submit"
                    onPress={handleLogin}
                  >
                    登录
                  </Button>
                ) : (
                  <Button color="primary" type="submit" onPress={handleLogin}>
                    登录
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <ButtonGroup>
        {userdata.status === "logged" ? (
          <section className="flex flex-row items-center">
            <ButtonGroup>
              {isLogoutButtonLoading ? (
                <Button
                  isLoading
                  className="hidden sm:flex"
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
              ) : (
                <Button className="hidden sm:flex" onClick={handleLogout}>
                  退出登录
                </Button>
              )}
            </ButtonGroup>
            <p className="flex flex-row">
              &nbsp;
              <UserIcon />
              {userdata.username}
            </p>
          </section>
        ) : userdata.status === "pending" ? (
          <Skeleton className="rounded-lg">
            <Button>Loading...</Button>
          </Skeleton>
        ) : (
          <Button color="primary" onPress={onOpen}>
            登录
          </Button>
        )}
      </ButtonGroup>
    </>
  );
}
