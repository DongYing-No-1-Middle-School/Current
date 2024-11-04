import DefaultLayout from "@/layouts/default";
import { AnnouncementBar } from "@/components/announcementbar";
import NewIssueButton from "@/components/button/newissue";
import IssuesList from "@/components/issues";
import { hasPermission } from "@/layouts/usercontext";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section>
        <AnnouncementBar />
        {hasPermission("issues.create") ? (
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
