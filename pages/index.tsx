import DefaultLayout from "@/layouts/default";
import { AnnouncementBar } from "@/components/announcementbar";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="">
        <AnnouncementBar />
      </section>
    </DefaultLayout>
  );
}
