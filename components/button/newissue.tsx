"use client";
import { Button } from "@nextui-org/button";
import { CirclePlus as CirclePlusButton } from "lucide-react";

export default function NewIssueButton() {
  const handleNewIssueButtonClick = () => {
    // window.location.href = "/newissue";
  };

  return (
    <>
      <Button color="primary" onClick={handleNewIssueButtonClick}>
        <CirclePlusButton />
        New Issue
      </Button>
    </>
  );
}
