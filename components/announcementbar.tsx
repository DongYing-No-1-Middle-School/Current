"use client";
import axios from "axios";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { useEffect, useState } from "react";
import React from "react";
import { Cookies } from "react-cookie";
import { Skeleton } from "@nextui-org/skeleton";
import { Presentation as PresentationIcon } from "lucide-react";

export function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState({
    content: "",
    show_pdf: false,
    status: "pending",
  });

  useEffect(() => {
    axios
      .get("/api/clients/getannouncement", {
        headers: {
          Authorization: new Cookies().get("token"),
        },
      })
      .then((res) => {
        setAnnouncement({
          content: res.data.data.content,
          show_pdf: res.data.data.show_pdf,
          status: "success",
        });
      })
      .catch(() => {
        setAnnouncement({
          content: "获取公告失败，请稍后再试。",
          show_pdf: false,
          status: "error",
        });
      });
  }, []);

  return (
    <>
      {announcement.status === "pending" ? (
        <Skeleton className="rounded-lg">
          <Card>
            <CardBody className="p-5 text-blue-700 bg-blue-50">
              <p>Loading...</p>
            </CardBody>
          </Card>
        </Skeleton>
      ) : (
        <Card>
          <CardHeader className="flex flex-row p-4 text-blue-700 bg-blue-50">
            <PresentationIcon className="mr-2" /> 公告
          </CardHeader>
          <CardBody
            dangerouslySetInnerHTML={{ __html: announcement.content }}
          />
        </Card>
      )}
    </>
  );
}
