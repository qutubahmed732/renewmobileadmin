import { Metadata } from "next"
import DashboardClientWrapper from "./components/dashboard-client-wrapper"

export const metadata: Metadata = {
  title: "Dashboard | Renew Mobile Admin",
  description: "Login to your account.",
  robots: "noindex, nofollow",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardClientWrapper>
      {children}
    </DashboardClientWrapper>
  )
}