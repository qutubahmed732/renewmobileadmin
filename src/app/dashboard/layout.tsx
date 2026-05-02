import { Metadata } from "next"
import DashboardClientWrapper from "./components/dashboard-client-wrapper"

export const metadata: Metadata = {
  title: "Dashboard | Renew Mobile Admin",
  description: "Securely login to your account. Access your dashboard and manage your projects efficiently.",
  robots: "noindex, nofollow",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardClientWrapper>
      {children}
    </DashboardClientWrapper>
  )
}