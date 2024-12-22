"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Card, CardBody } from "@nextui-org/card";
import { Cookies } from "react-cookie";
import { Skeleton } from "@nextui-org/skeleton";
import { Button, ButtonGroup } from "@nextui-org/button";
import { PlusCircle as PlusCircleIcon } from "lucide-react";
import { Breadcrumbs, BreadcrumbItem } from "@nextui-org/breadcrumbs";

import DefaultLayout from "@/layouts/default";
import IssueEntry from "@/components/entry";
// import NewEntryButton from "@/components/button/newentry";

interface IssueInfo {
  date: number;
  editors: string[];
  id: number;
  ispublished: number;
  leader: string;
  respeditor: string;
  subject: string[];
}

interface EntryCount {
  created: number;
  pending: number;
  reviewed: number;
  selected: number;
}

interface Entry {
  description: string;
  filename: string;
  issue_id: number;
  origin: string;
  page: number;
  reviewer: string;
  selector: string;
  status: string;
  title: string;
  uuid: string;
  wordcount: number;
}

export default function IssueDetail() {
  const router = useRouter();
  const { issueid } = router.query;
  const [isLoading, setIsLoading] = useState(true);
  const [issueInfo, setIssueInfo] = useState<IssueInfo | null>(null);
  const [entriesData, setEntriesData] = useState<{
    count: EntryCount[];
    list: Entry[];
  } | null>(null);

  useEffect(() => {
    if (!issueid) return;

    const fetchData = async () => {
      const config = {
        headers: {
          Authorization: new Cookies().get("token"),
        },
      };

      const [infoRes, entriesRes] = await Promise.all([
        axios.get(`/api/issues/info/${issueid}`, config),
        axios.get(`/api/entries/listissue/${issueid}`, config),
      ]);

      if (infoRes.data.success && entriesRes.data.success) {
        setIssueInfo(infoRes.data.data);
        setEntriesData(entriesRes.data.data);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [issueid]);

  const DashboardStats = () => {
    if (!entriesData) return null;

    const totalCreated = entriesData.count.reduce(
      (sum, c) => sum + c.created,
      0,
    );
    const totalReviewed = entriesData.count.reduce(
      (sum, c) => sum + c.reviewed,
      0,
    );
    const totalSelected = entriesData.count.reduce(
      (sum, c) => sum + c.selected,
      0,
    );

    // const chartData = {
    //   labels: ["第一版", "第二版", "第三版", "第四版"],
    //   datasets: [
    //     {
    //       label: "已投稿",
    //       data: entriesData.count.map((c) => c.created),
    //       backgroundColor: "rgba(75, 192, 192, 0.2)",
    //     },
    //     {
    //       label: "已审核",
    //       data: entriesData.count.map((c) => c.reviewed),
    //       backgroundColor: "rgba(75, 192, 192, 0.6)",
    //     },
    //     {
    //       label: "已选录",
    //       data: entriesData.count.map((c) => c.selected),
    //       backgroundColor: "rgba(54, 162, 235, 0.6)",
    //     },
    //   ],
    // };

    return (
      <Card>
        <CardBody>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalCreated}</div>
              <div className="text-gray-600">已投稿</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalReviewed}</div>
              <div className="text-gray-600">已审核</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalSelected}</div>
              <div className="text-gray-600">已选录</div>
            </div>
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <DefaultLayout>
      <Breadcrumbs className="mb-5">
        <BreadcrumbItem
          onClick={() => {
            router.push(`/`);
          }}
        >
          首页
        </BreadcrumbItem>
        <BreadcrumbItem
          onClick={() => {
            router.push(`/issue/${issueid}`);
          }}
        >{`第 ${issueid} 期`}</BreadcrumbItem>
      </Breadcrumbs>
      {isLoading ? (
        <>
          <Skeleton className="rounded-lg h-[80px] mb-5">
            <Card>
              <CardBody>
                <p>Loading...</p>
              </CardBody>
            </Card>
          </Skeleton>
          <Skeleton className="rounded-lg h-1/2">
            <Card>
              <CardBody>
                <p>Loading...</p>
              </CardBody>
            </Card>
          </Skeleton>
        </>
      ) : (
        <>
          {issueInfo?.ispublished === 0 ? (
            <>
              <DashboardStats />
              <section className="h-5" />
              <ButtonGroup>
                <Button
                  color="primary"
                  onClick={() => {
                    router.push(`/issue/${issueid}/newentry`);
                  }}
                >
                  <PlusCircleIcon /> 新建投稿
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <>
              <iframe
                className="w-full h-screen"
                src={`/api/issues/getpdf/${issueid}`}
                title="查看 PDF"
              />
            </>
          )}
          <section className="h-5" />
          {[1, 2, 3, 4].map((pageNum) => {
            const pageEntries = entriesData?.list.filter(
              (entry) => entry.page === pageNum,
            );

            return (
              <div key={pageNum} className="mb-8">
                <h2 className="text-xl font-bold mb-4">
                  第 {pageNum} 版
                  <span className=" text-lg font-normal">
                    {pageNum === 1
                      ? " - 时事新闻"
                      : ` - ${issueInfo?.subject[pageNum - 2]}`}
                  </span>
                </h2>
                {pageEntries?.map((entry) => (
                  <IssueEntry key={entry.uuid} bare_entry={entry} />
                ))}
                {(!pageEntries || pageEntries.length === 0) && (
                  <Card className="w-full mb-3 bg-gray-50">
                    <CardBody>
                      <p className="text-gray-500 text-center">暂无文章</p>
                    </CardBody>
                  </Card>
                )}
              </div>
            );
          })}
        </>
      )}
    </DefaultLayout>
  );
}
