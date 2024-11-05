import { Button, ButtonGroup } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import {
  Merge as MergeIcon,
  Check as CheckIcon,
  CircleDashed as CircleDashedIcon,
  ScanEye as ScanEyeIcon,
  Download as DownloadIcon,
  Trash2 as TrashIcon,
  FileCheck2 as FileCheckIcon,
  Boxes as BoxesIcon,
} from "lucide-react";
import { closeSnackbar, useSnackbar } from "notistack";
import React from "react";
import { Cookies } from "react-cookie";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/modal";

import { useUser, hasPermission } from "@/layouts/usercontext";

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

interface IssueEntryProps {
  bare_entry: Entry;
}

export default function IssueEntry({ bare_entry }: IssueEntryProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [entry, setEntry] = React.useState<Entry>(bare_entry);
  const userdata = useUser();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleReviewClick = () => {
    if (fileInputRef.current) {
      enqueueSnackbar("请上传审核后的文件", { variant: "info" });
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;

    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    const formData = new FormData();
    const token = new Cookies().get("token");

    formData.append("file", file);

    const snackbarId = enqueueSnackbar("正在上传，请不要关闭页面……", {
      persist: true,
    });

    axios
      .post(`/api/entries/review/${entry.uuid}`, formData, {
        headers: {
          Authorization: token,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => {
        if (res.data.code === 200) {
          enqueueSnackbar("文件上传成功", { variant: "success" });
          setEntry({
            ...entry,
            status: "reviewed",
            reviewer: userdata.userdata.username,
          });
        } else {
          enqueueSnackbar("文件上传失败：" + res.data.message, {
            variant: "error",
          });
        }
        closeSnackbar(snackbarId);
      })
      .catch(() => {
        enqueueSnackbar("文件上传失败：网络错误。", {
          variant: "error",
        });
        closeSnackbar(snackbarId);
      });
  };

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [confirmInput, setConfirmInput] = React.useState("");

  const handleDeleteConfirmClick = () => {
    if (confirmInput !== entry.title) {
      enqueueSnackbar("输入错误，操作已取消，请重新输入", { variant: "error" });

      return;
    }
    const token = new Cookies().get("token");

    axios
      .post(
        `/api/entries/remove/${entry.uuid}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        },
      )
      .then((result) => {
        var data = result.data;

        if (data.code === 200) {
          enqueueSnackbar("删除成功", { variant: "success" });
          setEntry({ ...entry, status: "deleted" });
        } else {
          enqueueSnackbar("删除失败：" + data.message, { variant: "error" });
        }
      });
  };

  const handleSelectClick = () => {
    const token = new Cookies().get("token");

    axios
      .post(
        `/api/entries/select/${entry.uuid}`,
        {},
        {
          headers: {
            Authorization: token,
          },
        },
      )
      .then((result) => {
        if (result.data.success) {
          if (entry.status === "reviewed") {
            enqueueSnackbar("选录成功", { variant: "success" });
            setEntry({ ...entry, status: "selected" });
          } else {
            enqueueSnackbar("取消选录成功", { variant: "success" });
            setEntry({ ...entry, status: "reviewed" });
          }
        } else {
          enqueueSnackbar("操作失败：" + result.data.message, {
            variant: "error",
          });
        }
      })
      .catch(() => {
        enqueueSnackbar("操作失败：网络错误", { variant: "error" });
      });
  };

  return (
    <>
      {entry.status === "deleted" ? (
        <Card key={entry.uuid} className="w-full mb-3">
          <CardHeader className="flex flex-row p-4">
            <TrashIcon className="mr-3" color="red" />
            <p className="italic">此稿件已被删除</p>
          </CardHeader>
        </Card>
      ) : (
        <Card key={entry.uuid} className="w-full mb-3">
          <Modal
            isDismissable={false}
            isKeyboardDismissDisabled={true}
            isOpen={isOpen}
            onOpenChange={onOpenChange}
          >
            <ModalContent>
              {(onClose) => (
                <>
                  <ModalHeader className="flex flex-col gap-1">
                    删除 ”{entry.title}“
                  </ModalHeader>
                  <ModalBody>
                    <p>你确定要删除此稿件吗？此操作不可撤销！</p>
                    <p>请手动输入稿件标题以确认删除：</p>
                    <input
                      autoComplete="off"
                      className="w-full p-2 border border-gray-500 rounded"
                      type="text"
                      onChange={(e) => setConfirmInput(e.target.value)}
                    />
                  </ModalBody>
                  <ModalFooter>
                    <Button color="primary" variant="light" onPress={onClose}>
                      取消
                    </Button>
                    <Button
                      color="danger"
                      onPress={() => {
                        handleDeleteConfirmClick();
                        onClose();
                      }}
                    >
                      确认删除
                    </Button>
                  </ModalFooter>
                </>
              )}
            </ModalContent>
          </Modal>
          <CardHeader className="flex flex-row p-4">
            {entry.status === "reviewed" ? (
              <CheckIcon className="mr-3" color="green" />
            ) : entry.status === "selected" ? (
              <MergeIcon className="mr-3" color="purple" />
            ) : (
              <CircleDashedIcon className="mr-3" color="blue" />
            )}
            <p className="font-bold">{entry.title}</p>
          </CardHeader>
          <CardBody className="">
            <p>
              <span className="font-bold">来源：</span>
              {entry.origin}
            </p>
            <p>
              <span className="font-bold">词数：</span>
              {entry.wordcount}
            </p>
            <p>
              <span className="font-bold">选稿人：</span>
              {entry.selector} | <span className="font-bold">审稿人：</span>
              {entry.reviewer}
            </p>
            <p className="mt-3">{entry.description}</p>
          </CardBody>
          <CardFooter>
            <ButtonGroup>
              <Button
                color="primary"
                onClick={() =>
                  window.open(
                    `https://view.officeapps.live.com/op/view.aspx?src=https://current.yzxgg.xyz/api/entries/getasset/${entry.uuid}`,
                    "_blank",
                  )
                }
              >
                <ScanEyeIcon />
                <p className="hidden sm:block">在线预览</p>
              </Button>
              <Button
                onClick={() =>
                  window.open(`/api/entries/getasset/${entry.uuid}`, "_blank")
                }
              >
                <DownloadIcon />
                <p className="hidden sm:block">下载</p>
              </Button>
              {hasPermission(userdata.permission, `entries.delete.*`) ? (
                <Button color="danger" onClick={onOpen}>
                  <TrashIcon />
                  <p className="hidden sm:block">删除</p>
                </Button>
              ) : null}
              {hasPermission(userdata.permission, `entries.review.*`) &&
              entry.status === "created" ? (
                <Button onClick={handleReviewClick}>
                  <FileCheckIcon />
                  <p className="hidden sm:block">审核</p>
                </Button>
              ) : null}
              {hasPermission(userdata.permission, `entries.select.*`) &&
              entry.status === "reviewed" ? (
                <Button onClick={handleSelectClick}>
                  <BoxesIcon />
                  <p className="hidden sm:block">选录</p>
                </Button>
              ) : null}
              {hasPermission(userdata.permission, `entries.select.*`) &&
              entry.status === "selected" ? (
                <Button color="success" onClick={handleSelectClick}>
                  <BoxesIcon />
                  <p className="hidden sm:block">选录</p>
                </Button>
              ) : null}
            </ButtonGroup>
          </CardFooter>
          <input
            ref={fileInputRef}
            accept=".doc,.docx"
            className="hidden"
            id="review-files"
            type="file"
            onChange={handleFileChange}
          />
        </Card>
      )}
    </>
  );
}
