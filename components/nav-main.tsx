"use client";

import { type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "@radix-ui/react-icons";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {/* {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild className="text-lg">
              <a href={item.url}>
                <item.icon style={{ width: "14px", height: "14px" }} />
                <span>{item.title}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))} */}
        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="text-base py-5"
                >
                  <a href={item.url}>
                    <item.icon style={{ width: "24px", height: "24px" }} />
                    <span>{item.title}</span>
                    {item.items?.length ? (
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRightIcon />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    ) : null}
                  </a>
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {/* If the item has sub-items, show the collapsible content */}
              {item.items?.length ? (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild className="text-lg">
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
