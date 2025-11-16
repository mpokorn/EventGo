import OrganizerLayout from "../../components/OrganizerLayout";

export default function OrganizerDashboard() {
  return (
    <OrganizerLayout>
      <h1 className="organizer-title">Organizer Dashboard</h1>

      <div className="profile-card organizer-card">
        <h2>Overview</h2>
        <p>Your organizer stats will appear here.</p>
      </div>
    </OrganizerLayout>
  );
}
