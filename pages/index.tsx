import { Snippet } from "@nextui-org/snippet";
import { Code } from "@nextui-org/code";

import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import {AnnouncementBar} from "@/components/announcementbar";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className=""><AnnouncementBar /></section>
    </DefaultLayout>
  );
}
