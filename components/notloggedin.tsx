"use client";
import { Card, CardBody } from "@nextui-org/card";

export default function NotLoggedIn() {
  return (
    <Card>
      <CardBody className="p-12 flex text-center">
        <p>登录到 Current，开始创作之旅。</p>
      </CardBody>
    </Card>
  );
}
