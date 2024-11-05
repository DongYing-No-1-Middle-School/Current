import { BreadcrumbItem, Breadcrumbs } from "@nextui-org/breadcrumbs";
import { useRouter } from "next/router";

import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  const router = useRouter();

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
        <BreadcrumbItem
          onClick={() => {
            router.push("/draft");
          }}
        >
          草稿
        </BreadcrumbItem>
      </Breadcrumbs>
      <section>
        <p>Nothing to display.</p>
      </section>
    </DefaultLayout>
  );
}
