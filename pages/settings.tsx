import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { useRouter } from "next/router";
import { Button } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import {
  ContactRound as ContactRoundIcon,
  Lock as LockIcon,
  SearchCheck as SearchCheckIcon,
  FlaskConical as FlaskConicalIcon,
  Wrench as WrenchIcon,
} from "lucide-react";
import { Input } from "@nextui-org/input";
import { useState } from "react";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { Cookies } from "react-cookie";

import DefaultLayout from "@/layouts/default";
import { useUser, hasPermission, Logout } from "@/layouts/usercontext";

export default function IndexPage() {
  const router = useRouter();
  const userdata = useUser();

  const [passwdData, setPasswdData] = useState(["", "", ""]);

  const handleChangePassword = () => {
    if (passwdData[0] === "" || passwdData[1] === "" || passwdData[2] === "") {
      enqueueSnackbar("请填写完整的密码信息", { variant: "warning" });

      return;
    }

    if (passwdData[1] !== passwdData[2]) {
      enqueueSnackbar("两次输入的密码不一致", { variant: "error" });

      return;
    }
    const token = new Cookies().get("token");

    axios
      .post(
        "/api/clients/changepass",
        {
          oldpass: passwdData[0],
          newpass: passwdData[1],
        },
        {
          headers: {
            Authorization: token,
          },
        },
      )
      .then(function (response) {
        var data = response.data;

        if (data.success) {
          enqueueSnackbar("密码修改成功", { variant: "success" });
          setTimeout(function () {
            Logout();
          }, 1000);
        } else {
          enqueueSnackbar("密码修改失败：" + data.message, {
            variant: "error",
          });
        }
      });
  };

  return (
    <DefaultLayout>
      <Breadcrumbs className="mb-5">
        <BreadcrumbItem
          onClick={() => {
            router.push("/");
          }}
        >
          首页
        </BreadcrumbItem>
        <BreadcrumbItem
          onClick={() => {
            router.push("/settings");
          }}
        >
          个人设置
        </BreadcrumbItem>
      </Breadcrumbs>
      <section>
        <Card className="mb-5">
          <CardHeader>
            <ContactRoundIcon className="mr-3" />
            个人信息
          </CardHeader>
          <CardBody className="space-y-2">
            <p>姓名：{userdata.userdata.username}</p>
            <p>年级：{userdata.userdata.grade}</p>
            <p>班级：{userdata.userdata.classnum}</p>
          </CardBody>
        </Card>
        <Card className="mb-5">
          <CardHeader>
            <LockIcon className="mr-3" />
            修改密码
          </CardHeader>
          <CardBody className="space-y-2">
            <Input
              label="原密码"
              type="password"
              onChange={(e) => {
                setPasswdData([e.target.value, passwdData[1], passwdData[2]]);
              }}
            />
            <Input
              label="新密码"
              type="password"
              onChange={(e) => {
                setPasswdData([passwdData[0], e.target.value, passwdData[2]]);
              }}
            />
            <Input
              label="确认密码"
              type="password"
              onChange={(e) => {
                setPasswdData([passwdData[0], passwdData[1], e.target.value]);
              }}
            />
          </CardBody>
          <CardFooter>
            <Button onClick={handleChangePassword}>确认</Button>
          </CardFooter>
        </Card>
        <Card className="mb-5">
          <CardHeader>
            <SearchCheckIcon className="mr-3" />
            关于 Current
          </CardHeader>
          <CardBody className="space-y-2">
            <p>Current - An intelligent platform for scholar newspaper.</p>
            <p>开源社区版本, Licensed Under Apache License 2.0</p>
            <p>前端：React + Next.js | 后端：Python + Flask + SQLite</p>
          </CardBody>
        </Card>
        {hasPermission(userdata.permission, "settings.edit") ? (
          <>
            <Card className="mb-5">
              <CardHeader>
                <WrenchIcon className="mr-3" />
                管理面板 (Admin Only)
              </CardHeader>
              <CardBody className="space-y-2">
                <Button
                  onClick={() => {
                    router.push("/management");
                  }}
                >
                  进入管理面板（兼容模式）
                </Button>
              </CardBody>
            </Card>
          </>
        ) : null}
      </section>
    </DefaultLayout>
  );
}
