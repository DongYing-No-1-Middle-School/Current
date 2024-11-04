import { Button, ButtonGroup } from "@nextui-org/button";
import { Card, CardBody, CardFooter, CardHeader } from "@nextui-org/card";
import {
  Merge as MergeIcon,
  Check as CheckIcon,
  CircleDashed as CircleDashedIcon,
} from "lucide-react";

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
  entry: Entry;
}

export default function IssueEntry({ entry }: IssueEntryProps) {
  return (
    <Card key={entry.uuid} className="w-full mb-3">
      <CardHeader className="flex flex-row p-4">
        {/* {issue.ispublished === 0 ? (
          <CircleDashedIcon className="mr-3" />
        ) : (
          <CircleCheckBigIcon className="mr-3" color="green" />
        )} */}
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
          <Button>编辑</Button>
        </ButtonGroup>
      </CardFooter>
    </Card>
  );
}
