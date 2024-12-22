"use client";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Cookies } from "react-cookie";
import { enqueueSnackbar } from "notistack";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { DatePicker } from "@nextui-org/date-picker";
import { getLocalTimeZone, parseDate } from "@internationalized/date";

import DefaultLayout from "@/layouts/default";

export default function NewIssue() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    id: 1,
    deadline: new Date(),
    subject_2: "",
    subject_3: "",
    subject_4: "",
  });

  useEffect(() => {
    const token = new Cookies().get("token");

    axios
      .get("/api/issues/list", {
        headers: {
          Authorization: token,
        },
      })
      .then((result) => {
        const data = result.data;

        if (data.code === 200) {
          const issues = data.data;
          const maxId = issues.reduce(
            (max: number, issue: { id: number }) => Math.max(max, issue.id),
            0,
          );

          setFormData((prevData) => ({ ...prevData, id: maxId + 1 }));
        }
      });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = new Cookies().get("token");
    const payload = {
      issue_id: formData.id,
      date: Number(formData.deadline.getTime()) / 1000,
      subject: [formData.subject_2, formData.subject_3, formData.subject_4],
      leader: "",
      editors: [],
      respeditor: "",
    };

    if (
      !payload.issue_id ||
      !payload.date ||
      !payload.subject[0].trim() ||
      !payload.subject[1].trim() ||
      !payload.subject[2].trim()
    ) {
      enqueueSnackbar("请填写所有必填字段", { variant: "error" });

      return;
    }

    try {
      const result = await axios.post("/api/issues/create", payload, {
        headers: {
          Authorization: token,
        },
      });

      const data = result.data;

      if (data.code === 200) {
        enqueueSnackbar("新建成功", { variant: "success" });
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        enqueueSnackbar(data.message, { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("操作失败：网络错误", { variant: "error" });
    }
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
        <BreadcrumbItem>新建期刊</BreadcrumbItem>
      </Breadcrumbs>
      <form className="mb-5 space-y-3" onSubmit={handleSubmit}>
        <Input
          isRequired
          id="id"
          label="期刊期数"
          min="1"
          name="id"
          step="1"
          type="number"
          value={formData.id.toString()}
          onChange={(event) => {
            setFormData((prevData) => ({
              ...prevData,
              id: Number(event.target.value),
            }));
          }}
        />
        <DatePicker
          isRequired
          id="deadline"
          label="截止日期"
          value={parseDate(
            formData.deadline
              .toLocaleDateString("zh-cn", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })
              .split("/")
              .join("-"),
          )}
          onChange={(value) => {
            setFormData((prevData) => ({
              ...prevData,
              deadline: value ? value.toDate(getLocalTimeZone()) : new Date(),
            }));
          }}
        />
        <Input
          isRequired
          id="subject_2"
          label="第 2 版"
          name="subject_2"
          type="text"
          value={formData.subject_2}
          onChange={(event) => {
            setFormData((prevData) => ({
              ...prevData,
              subject_2: event.target.value,
            }));
          }}
        />
        <Input
          isRequired
          id="subject_3"
          label="第 3 版"
          name="subject_3"
          type="text"
          value={formData.subject_3}
          onChange={(event) => {
            setFormData((prevData) => ({
              ...prevData,
              subject_3: event.target.value,
            }));
          }}
        />
        <Input
          isRequired
          id="subject_4"
          label="第 4 版"
          name="subject_4"
          type="text"
          value={formData.subject_4}
          onChange={(event) => {
            setFormData((prevData) => ({
              ...prevData,
              subject_4: event.target.value,
            }));
          }}
        />
        <ButtonGroup>
          <Button color="primary" type="submit">
            创建
          </Button>
        </ButtonGroup>
      </form>
    </DefaultLayout>
  );
}
