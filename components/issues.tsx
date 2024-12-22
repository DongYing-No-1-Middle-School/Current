"use client";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { useEffect, useState } from "react";
import { Skeleton } from "@nextui-org/skeleton";
import { useRouter } from "next/router";
import {
  CircleCheckBig as CircleCheckBigIcon,
  CircleDashed as CircleDashedIcon,
} from "lucide-react";
import axios from "axios";

interface Issue {
  id: number;
  date: number;
  ispublished: number;
  leader: string;
  respeditor: string;
  subject: string[];
}

export default function IssuesList() {
  const [issuesList, setIssuesList] = useState<{
    issues: Issue[];
    status: string;
  }>({
    issues: [],
    status: "pending",
  });

  const router = useRouter();

  useEffect(() => {
    axios
      .get("/api/issues/list")
      .then((res) => {
        if (res.data.success) {
          setIssuesList({ issues: res.data.data, status: "loaded" });
        } else {
          setIssuesList({ issues: [], status: "error" });
        }
      })
      .catch(() => {
        setIssuesList({ issues: [], status: "error" });
      });
  }, []);

  const calculateRemainingDays = (date: number) => {
    const currentDate = new Date();
    const targetDate = new Date(date * 1000);
    const diffTime = targetDate.getTime() - currentDate.getTime();

    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      {issuesList.status === "pending" ? (
        <Skeleton className="rounded-lg">
          <Card>
            <CardBody className="p-5 text-blue-700 bg-blue-50">
              <p>Loading...</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-5 text-blue-700 bg-blue-50">
              <p>Loading...</p>
            </CardBody>
          </Card>
        </Skeleton>
      ) : (
        issuesList.issues
          .slice()
          .reverse()
          .map((issue) => (
            <Card
              key={issue.id}
              isPressable
              className="w-full mb-3 cursor-pointer"
              onPress={() => {
                router.push(`/issue/${issue.id}`);
              }}
            >
              <CardHeader className="flex flex-row p-4">
                {issue.ispublished === 0 ? (
                  <CircleDashedIcon className="mr-3" />
                ) : (
                  <CircleCheckBigIcon className="mr-3" color="green" />
                )}
                <p>{`第 ${issue.id} 期`}</p>
              </CardHeader>
              <CardBody className="">
                {issue.ispublished === 0 ? (
                  <>
                    <p>{`截稿日期：${new Date(
                      issue.date * 1000,
                    ).toLocaleDateString()}`}</p>
                    {calculateRemainingDays(issue.date) > 0 ? (
                      <p
                        style={{ color: "#006fee" }}
                      >{`剩余天数：${calculateRemainingDays(issue.date)} 天`}</p>
                    ) : (
                      <p
                        style={{ color: "#dd1111" }}
                      >{`已超时天数：${-calculateRemainingDays(issue.date)} 天`}</p>
                    )}
                  </>
                ) : (
                  <p>已出版</p>
                )}
              </CardBody>
            </Card>
          ))
      )}
    </>
  );
}
