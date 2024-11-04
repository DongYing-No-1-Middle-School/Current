export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Current",
  description: "Make beautiful websites regardless of your design experience.",
  navItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "草稿",
      href: "/draft",
    },
    {
      label: "个人设置",
      href: "/settings",
    },
  ],
  navMenuItems: [
    {
      label: "首页",
      href: "/",
    },
    {
      label: "草稿",
      href: "/draft",
    },
    {
      label: "个人设置",
      href: "/settings",
    },
  ],
  links: {
    github: "https://github.com/nextui-org/nextui",
  },
};
