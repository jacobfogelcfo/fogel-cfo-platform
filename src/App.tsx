import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { ClientProvider } from "@/contexts/ClientContext";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { RoleHomeRedirect } from "@/components/guards/RoleHomeRedirect";
import AppLayout from "@/components/layout/AppLayout";
import Login from "@/pages/Login";
import NoAccess from "@/pages/NoAccess";
import NotFound from "@/pages/NotFound";
import {
  DashboardPage,
  MyPage,
  ReportPage,
  GenericStubPage,
} from "@/pages/stubs";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ClientProvider>
            <UserRoleProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/no-access" element={<RequireAuth><NoAccess /></RequireAuth>} />

                <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                  <Route path="/" element={<RoleHomeRedirect />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/my" element={<MyPage />} />
                  <Route path="/report" element={<ReportPage />} />

                  {/* M2+ stubs — every link in the sidebar resolves to something. */}
                  <Route path="/intake" element={<GenericStubPage title="Intake Queue" milestone="Milestone 2" />} />
                  <Route path="/donors" element={<GenericStubPage title="Donors" milestone="Milestone 5" />} />
                  <Route path="/donations" element={<GenericStubPage title="Donations" milestone="Milestone 5" />} />
                  <Route path="/income" element={<GenericStubPage title="Income Entries" milestone="Milestone 5" />} />
                  <Route path="/invoices" element={<GenericStubPage title="Invoices" milestone="Milestone 6" />} />
                  <Route path="/customers" element={<GenericStubPage title="Customers" milestone="Milestone 6" />} />
                  <Route path="/bills" element={<GenericStubPage title="Bills" milestone="Milestone 6" />} />
                  <Route path="/vendors" element={<GenericStubPage title="Vendors" milestone="Milestone 4" />} />
                  <Route path="/us-checks" element={<GenericStubPage title="US Checks" milestone="Milestone 5" />} />
                  <Route path="/check-requests" element={<GenericStubPage title="Check Requests" milestone="Milestone 5" />} />
                  <Route path="/bank/accounts" element={<GenericStubPage title="Bank Accounts" milestone="Milestone 7" />} />
                  <Route path="/bank/transactions" element={<GenericStubPage title="Bank Transactions" milestone="Milestone 7" />} />
                  <Route path="/bank/reconcile" element={<GenericStubPage title="Reconciliation" milestone="Milestone 7" />} />
                  <Route path="/bank/credit-cards" element={<GenericStubPage title="Credit Cards" milestone="Milestone 7" />} />
                  <Route path="/projects" element={<GenericStubPage title="Projects" milestone="Milestone 4" />} />
                  <Route path="/workers" element={<GenericStubPage title="Workers" milestone="Milestone 8" />} />
                  <Route path="/timesheets" element={<GenericStubPage title="Timesheets" milestone="Milestone 8" />} />
                  <Route path="/meetings" element={<GenericStubPage title="Meetings" milestone="Milestone 8" />} />
                  <Route path="/sales-orders" element={<GenericStubPage title="Sales Orders" milestone="Milestone 8" />} />
                  <Route path="/payouts" element={<GenericStubPage title="Platform Payouts" milestone="Milestone 8" />} />
                  <Route path="/admin/clients" element={<GenericStubPage title="Clients" milestone="Milestone 9" />} />
                  <Route path="/admin/members" element={<GenericStubPage title="Members" milestone="Milestone 9" />} />
                  <Route path="/admin/audit" element={<GenericStubPage title="Audit Log" milestone="Milestone 9" />} />
                  <Route path="/admin/sync" element={<GenericStubPage title="Sync Jobs" milestone="Milestone 9" />} />
                  <Route path="/settings" element={<GenericStubPage title="Settings" milestone="Milestone 4" />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </UserRoleProvider>
          </ClientProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
