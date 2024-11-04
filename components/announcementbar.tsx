"use client";
import axios from "axios";
import { Card, CardBody } from "@nextui-org/card";
import { useEffect, useState } from "react";
import React from "react";
import { Cookies } from "react-cookie";
import { Skeleton } from "@nextui-org/skeleton";

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
      .catch((err) => {
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
          <CardBody className="p-5 text-blue-700 bg-blue-50">
            <p>{announcement.content}</p>
          </CardBody>
        </Card>
      )}
    </>
  );
}
