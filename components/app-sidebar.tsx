"use client";

import {
  CheckCircle,
  Command,
  Edit3,
  Frame,
  HelpCircle,
  Home,
  LifeBuoy,
  LogOut,
  Map,
  PieChart,
  Send,
  Target,
  UploadCloud,
  User,
} from "lucide-react";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
      items: [],
    },

    {
      title: "Set Milestones",
      url: "/set-milestones",
      icon: Edit3, // Represents editing or setting goals
      items: [],
    },
    {
      title: "Submit Drafts",
      url: "/submit-drafts",
      icon: UploadCloud, // Represents uploading files
      items: [],
    },
    {
      title: "My Writing Journey",
      url: "/writing-journey",
      icon: Target, // Represents progress or goals
      items: [],
    },

    {
      title: "Editorial Reviews",
      url: "/editorial-reviews",
      icon: CheckCircle, // Represents review or completion
      items: [],
    },
    {
      title: "Account Settings",
      url: "/account-settings",
      icon: User, // Represents user/account
      items: [
        {
          title: "Profile",
          url: "#",
        },
        {
          title: "Subscription",
          url: "#",
        },
      ],
    },
    {
      title: "Help & Support",
      url: "#",

      icon: HelpCircle, // Represents help or support
      items: [],
    },
    {
      title: "Logout",
      url: "#",
      icon: LogOut, // Represents exiting or logging out
      items: [],
    },
  ],

  navSecondary: [
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
