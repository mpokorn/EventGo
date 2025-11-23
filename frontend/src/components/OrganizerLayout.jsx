import { useState } from "react";
import Header from "./Header";
import OrganizerSidebar from "./OrganizerSidebar";

import "../styles/dashboard.css"; 
import "../styles/organizer.css";

export default function OrganizerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header />

      <div className="dashboard-layout organizer-theme"> {/* APPLY ORGANIZER THEME */}
        <OrganizerSidebar 
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="dashboard-main">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
