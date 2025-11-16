import OrganizerLayout from "../../components/OrganizerLayout";
import { useState } from "react";

export default function OrganizerCreateEvent() {
  const [form, setForm] = useState({});

  return (
    <OrganizerLayout>
      <div className="profile-card organizer-card">
        <h2 className="organizer-title">Create Event</h2>

        <form className="profile-form">
          <div className="form-row">
            <label>Title</label>
            <input name="title" />
          </div>

          <div className="form-row">
            <label>Description</label>
            <input name="description" />
          </div>

          <button className="profile-save">Create Event</button>
        </form>
      </div>
    </OrganizerLayout>
  );
}
