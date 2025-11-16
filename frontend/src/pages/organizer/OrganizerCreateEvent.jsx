import { useState } from "react";
import "../../styles/organizer.css";

export default function OrganizerCreateEvent() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitEvent = (e) => {
    e.preventDefault();
    console.log("Event submitted:", form);
    // TODO: API call
  };

  return (
    <div className="organizer-page">
      <h1 className="organizer-title">Create New Event</h1>

      <form className="organizer-card organizer-form" onSubmit={submitEvent}>
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          value={form.title}
          onChange={handleChange}
        />

        <textarea
          name="description"
          placeholder="Event Description"
          value={form.description}
          onChange={handleChange}
          rows="4"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
        />

        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
        />

        <input
          type="text"
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
        />

        <button type="submit">Create Event</button>
      </form>
    </div>
  );
}
