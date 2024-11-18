"use client";
import { Button } from "@nextui-org/button";
import { CirclePlus as CirclePlusButton } from "lucide-react";
import { useRouter } from "next/router";

export default function NewIssueButton() {
  const router = useRouter();

  return (
    <>
      <Button
        color="primary"
        onClick={() => {
          router.push("/newissue");
        }}
      >
        <CirclePlusButton />
        新建期刊
      </Button>
    </>
  );
}
