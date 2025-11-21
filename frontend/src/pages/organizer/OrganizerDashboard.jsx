import OrganizerLayout from "../../components/OrganizerLayout";

export default function OrganizerDashboard() {
  return (
    <OrganizerLayout>
      <h1 className="organizer-title">Organizer Dashboard</h1>

      <div className="profile-card organizer-card">
        <h2>Overview</h2>
        <p>You can edit your events here.</p>
      </div>
    </OrganizerLayout>
  );
}
