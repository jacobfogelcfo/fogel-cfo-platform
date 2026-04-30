/**
 * AppSidebar — primary navigation. Groups are feature-gated via useClientConfig().has(...).
 *
 * In M1 most links route to placeholder stubs that render "Coming in Milestone N". The grouping
 * mirrors the Base44 reference so M2+ can drop content in without restructuring.
 */
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  HandCoins,
  Heart,
  CircleDollarSign,
  FileText,
  Users,
  Receipt,
  Building2,
  Banknote,
  Landmark,
  CreditCard,
  ArrowLeftRight,
  FolderKanban,
  Briefcase,
  Clock,
  CalendarRange,
  Settings,
  Database,
  ShieldCheck,
  Inbox,
  Send,
  ListChecks,
  Truck,
  Wallet,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ClientSwitcher } from "@/components/layout/ClientSwitcher";
import { useClientConfig } from "@/hooks/useClientConfig";
import { useUserRole } from "@/contexts/UserRoleContext";
import type { ClientConfigFeatures } from "@/lib/db-types";
import type { ResolvedRole } from "@/lib/db-types";

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: keyof ClientConfigFeatures;
  roles?: ResolvedRole[]; // if set, only these roles see it
};

type NavSection = {
  label: string;
  items: NavItem[];
  feature?: keyof ClientConfigFeatures; // hide whole section if flag is off
  roles?: ResolvedRole[];
};

const SECTIONS: NavSection[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: ["super_admin", "client_manager", "local_admin"] },
      { label: "My Submissions", to: "/my", icon: ClipboardList, roles: ["member"] },
      { label: "Report Income", to: "/report", icon: HandCoins, roles: ["income_reporter"] },
    ],
  },
  {
    label: "Intake",
    items: [{ label: "Intake Queue", to: "/intake", icon: Inbox }],
  },
  {
    label: "Money In",
    items: [
      { label: "Donors", to: "/donors", icon: Heart, feature: "donor_crm" },
      { label: "Donations", to: "/donations", icon: HandCoins, feature: "donation_tracking" },
      { label: "Income Entries", to: "/income", icon: CircleDollarSign, feature: "income_entry" },
      { label: "Invoices", to: "/invoices", icon: FileText, feature: "invoices_ar" },
      { label: "Customers", to: "/customers", icon: Users, feature: "invoices_ar" },
    ],
  },
  {
    label: "Money Out",
    items: [
      { label: "Bills", to: "/bills", icon: Receipt, feature: "bills_ap" },
      { label: "Vendors", to: "/vendors", icon: Building2, feature: "supplier_registry" },
      { label: "US Checks", to: "/us-checks", icon: Send, feature: "us_checks" },
      { label: "Check Requests", to: "/check-requests", icon: ListChecks, feature: "check_requests" },
    ],
  },
  {
    label: "Banking",
    feature: "bank_dashboard",
    items: [
      { label: "Accounts", to: "/bank/accounts", icon: Landmark },
      { label: "Transactions", to: "/bank/transactions", icon: ArrowLeftRight },
      { label: "Reconciliation", to: "/bank/reconcile", icon: Banknote },
      { label: "Credit Cards", to: "/bank/credit-cards", icon: CreditCard },
    ],
  },
  {
    label: "Operate",
    items: [
      { label: "Projects", to: "/projects", icon: FolderKanban, feature: "project_tracking" },
      { label: "Workers", to: "/workers", icon: Briefcase, feature: "hr_module" },
      { label: "Timesheets", to: "/timesheets", icon: Clock, feature: "hr_module" },
      { label: "Meetings", to: "/meetings", icon: CalendarRange, feature: "meetings" },
    ],
  },
  {
    label: "Commerce",
    feature: "ecommerce",
    items: [
      { label: "Sales Orders", to: "/sales-orders", icon: Truck },
      { label: "Payouts", to: "/payouts", icon: Wallet },
    ],
  },
  {
    label: "Admin",
    roles: ["super_admin"],
    items: [
      { label: "Clients", to: "/admin/clients", icon: Building2 },
      { label: "Members", to: "/admin/members", icon: Users },
      { label: "Audit Log", to: "/admin/audit", icon: ShieldCheck },
      { label: "Sync Jobs", to: "/admin/sync", icon: Database },
    ],
  },
  {
    label: "Settings",
    items: [{ label: "Settings", to: "/settings", icon: Settings, roles: ["super_admin", "client_manager", "local_admin"] }],
  },
];

export function AppSidebar() {
  const { has } = useClientConfig();
  const { role } = useUserRole();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-2 py-2">
        <div className={collapsed ? "flex justify-center py-1" : "flex items-center gap-2 px-1.5 py-1"}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground shadow-fc-1">
            <span className="font-display text-sm font-bold">F</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold leading-tight">Fogel CFO</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Platform</div>
            </div>
          )}
        </div>
        <ClientSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {SECTIONS.map((section) => {
          if (section.feature && !has(section.feature)) return null;
          if (section.roles && (!role || !section.roles.includes(role))) return null;

          const visibleItems = section.items.filter((item) => {
            if (item.feature && !has(item.feature)) return false;
            if (item.roles && (!role || !item.roles.includes(role))) return false;
            return true;
          });
          if (visibleItems.length === 0) return null;

          return (
            <SidebarGroup key={section.label}>
              {!collapsed && <SidebarGroupLabel>{section.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((item) => {
                    const isActive = pathname === item.to || pathname.startsWith(`${item.to}/`);
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                          <NavLink to={item.to} className="flex items-center gap-2">
                            <Icon className="h-4 w-4 shrink-0" />
                            {!collapsed && <span className="truncate">{item.label}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
