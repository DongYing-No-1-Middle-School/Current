import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";
import { AnnouncementBar } from "@/components/announcementbar";
import NewIssueButton from "@/components/button/newissue";
import IssuesList from "@/components/issues";
import { useUser, hasPermission } from "@/layouts/usercontext";

export default function IndexPage() {
  const router = useRouter();
  const userdata = useUser();

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
      </Breadcrumbs>
      <section>
        <AnnouncementBar />
        {hasPermission(userdata.permission, "issues.create") ? (
          <>
            <section className="h-5" />
            <NewIssueButton />
          </>
        ) : null}
        <section className="h-5" />
        <IssuesList />
      </section>
    </DefaultLayout>
  );
}
