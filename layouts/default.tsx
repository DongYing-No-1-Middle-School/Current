import { Link } from "@nextui-org/link";
import { Skeleton } from "@nextui-org/skeleton";
import React from "react";

import { Head } from "./head";
import { useUser } from "./usercontext";

import { Navbar } from "@/components/navbar";
import NotLoggedIn from "@/components/notloggedin";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userdata } = useUser();

  return (
    <div className="relative flex flex-col h-screen">
      <Head />
      <Navbar />
      <main className="mx-5 lg:mx-[20%] px-6 flex-grow pt-16">
        {userdata.status === "pending" ? (
          <Skeleton className="rounded-lg">
            <div className="h-96 rounded-lg bg-default-300" />
          </Skeleton>
        ) : userdata.status === "logged" ? (
          <>{children}</>
        ) : (
          <NotLoggedIn />
        )}
      </main>
      <footer className="w-full flex flex-col items-center justify-center py-3">
        <p>Current - An intelligent platform for scholar newspaper.</p>
        <p className="flex flex-row">
          Made by&nbsp;
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://github.com/DongYing-No-1-Middle-School/Current"
            title="DYYZ Github"
          >
            <span className="text-primary">Dongying No.1 Middle School</span>
          </Link>
        </p>
        <p>Licensed Under Apache License 2.0</p>
      </footer>
    </div>
  );
}
