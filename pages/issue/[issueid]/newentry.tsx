"use client";
import { Button, ButtonGroup } from "@nextui-org/button";
import { Input, Textarea } from "@nextui-org/input";
import { Select, SelectItem } from "@nextui-org/select";
import { useRef, useState } from "react";
import { Check as CheckIcon, FileText as FileTextIcon } from "lucide-react";
import { useRouter } from "next/router";
import axios from "axios";
import { Cookies } from "react-cookie";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";

import DefaultLayout from "@/layouts/default";

export default function NewEntryButton() {
  const router = useRouter();
  const { issueid } = router.query;

  const [entryData, setEntryData] = useState({
    page: "1",
    title: "",
    origin: "",
    wordcount: 0,
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }
    setFile(files[0]);
  };

  const handleNewEntryButtonClick = async () => {
    const token = new Cookies().get("token");
    const formData = new FormData();

    formData.append("page", entryData.page);
    formData.append("title", entryData.title);
    formData.append("origin", entryData.origin);
    formData.append("wordcount", entryData.wordcount.toString());
    formData.append("description", entryData.description);

    if (
      entryData.page.trim() === "" ||
      entryData.title.trim() === "" ||
      entryData.origin.trim() === "" ||
      entryData.wordcount === 0
    ) {
      enqueueSnackbar("请填写所有必填项", { variant: "error" });

      return;
    }

    if (!file) {
      enqueueSnackbar("请上传文件", { variant: "error" });

      return;
    }

    const snackbarId = enqueueSnackbar("正在上传，请不要关闭页面……", {
      persist: true,
    });

    try {
      const createResponse = await axios.post(
        "/api/entries/create",
        {
          issue_id: issueid,
          page: entryData.page,
          title: entryData.title,
          origin: entryData.origin,
          wordcount: entryData.wordcount,
          description: entryData.description,
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      if (createResponse.data.code === 200) {
        const uuid = createResponse.data.data.uuid;
        const fileFormData = new FormData();

        fileFormData.append("file", file);

        const uploadResponse = await axios.post(
          `/api/entries/upload/${uuid}`,
          fileFormData,
          {
            headers: {
              Authorization: token,
              "Content-Type": "multipart/form-data",
            },
          },
        );

        if (uploadResponse.data.code === 200) {
          enqueueSnackbar("上传成功", { variant: "success" });
          closeSnackbar(snackbarId);
          router.push(`/issue/${issueid}`);
        } else {
          enqueueSnackbar("操作失败：" + uploadResponse.data.message, {
            variant: "error",
          });
        }
      } else {
        enqueueSnackbar("操作失败：" + createResponse.data.message, {
          variant: "error",
        });
      }
      closeSnackbar(snackbarId);
    } catch (error) {
      enqueueSnackbar("操作失败：网络错误", {
        variant: "error",
      });
      closeSnackbar(snackbarId);
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
        <BreadcrumbItem
          onClick={() => {
            router.push(`/issue/${issueid}`);
          }}
        >{`第 ${issueid} 期`}</BreadcrumbItem>
        <BreadcrumbItem>新增稿件</BreadcrumbItem>
      </Breadcrumbs>
      <form className="mb-5 space-y-3">
        <Select
          isRequired
          label="版页"
          onChange={(e) => {
            setEntryData({ ...entryData, page: e.target.value });
          }}
        >
          <SelectItem key="1">第一版</SelectItem>
          <SelectItem key="2">第二版</SelectItem>
          <SelectItem key="3">第三版</SelectItem>
          <SelectItem key="4">第四版</SelectItem>
        </Select>
        <Input
          isRequired
          label="标题"
          onChange={(e) => {
            setEntryData({ ...entryData, title: e.target.value });
          }}
        />
        <Input
          isRequired
          label="来源"
          onChange={(e) => {
            setEntryData({ ...entryData, origin: e.target.value });
          }}
        />
        <Input
          isRequired
          label="词数"
          type="number"
          onChange={(e) => {
            setEntryData({
              ...entryData,
              wordcount: Number(e.target.value),
            });
          }}
        />
        <Textarea
          label="描述"
          onChange={(e) => {
            setEntryData({ ...entryData, description: e.target.value });
          }}
        />
        <input
          ref={fileInputRef}
          accept=".doc,.docx"
          className="hidden"
          id="file-upload"
          type="file"
          onChange={handleFileChange}
        />
        <section className="flex flex-row items-center">
          <Button
            className="mr-3"
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            {file ? (
              <>
                <CheckIcon />
                <p>更换文件</p>
              </>
            ) : (
              "选择文件"
            )}
          </Button>
          {file ? (
            <>
              <FileTextIcon className="mr-1" color="blue" />
              <p>{file.name}</p>
            </>
          ) : (
            <p>未选择文件</p>
          )}
        </section>
      </form>
      <ButtonGroup>
        <Button
          color="primary"
          onClick={() => {
            handleNewEntryButtonClick();
          }}
        >
          提交
        </Button>
      </ButtonGroup>
    </DefaultLayout>
  );
}
