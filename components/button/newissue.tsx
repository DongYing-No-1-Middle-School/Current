"use client";
import { Button } from "@nextui-org/button";
import { CirclePlus as CirclePlusButton } from "lucide-react";
import { useRouter } from "next/router";

export default function NewIssueButton() {
  const router = useRouter();
  const handleNewIssueButtonClick = () => {
    window.location.href = "/issue/new";
  };

  return (
    <>
      <Button color="primary" onClick={handleNewIssueButtonClick}>
        <CirclePlusButton />
        新建期刊（兼容模式）
      </Button>
    </>
  );
}
