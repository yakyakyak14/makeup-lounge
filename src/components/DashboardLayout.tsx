import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import ProfileDropdown from "@/components/ProfileDropdown";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Calendar, User, Star, Settings, Sparkles, Users, Search, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Bookings", url: "/bookings", icon: Calendar },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Ratings", url: "/ratings", icon: Star },
    { title: "Services", url: "/services", icon: Sparkles },
    { title: "Browse", url: "/browse", icon: Search },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <Sidebar className="border-r border-border">
            <SidebarContent>
              <div className="p-6 border-b">
                <h2 className="text-xl font-playfair font-bold text-primary">Make-Up Lounge</h2>
              </div>
              
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild
                          className={isActive(item.url) ? "bg-primary text-primary-foreground" : ""}
                        >
                          <button
                            onClick={() => navigate(item.url)}
                            className="flex items-center gap-3 w-full text-left"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-card flex items-center justify-between px-6">
              <SidebarTrigger />
              <ProfileDropdown />
            </header>
            
            <main className="flex-1 p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default DashboardLayout;