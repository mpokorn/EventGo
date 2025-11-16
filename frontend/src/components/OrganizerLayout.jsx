import Header from "./Header";
import OrganizerSidebar from "./OrganizerSidebar";

import "../styles/dashboard.css"; 
import "../styles/organizer.css";

export default function OrganizerLayout({ children }) {
  return (
    <>
      <Header />

      <div className="dashboard-layout organizer-theme"> {/* APPLY ORGANIZER THEME */}
        <OrganizerSidebar />

        <main className="dashboard-main">
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
