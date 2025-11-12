import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, requireAuth } = useAuth();
  const [event, setEvent] = useState(null);
  const [ticketType, setTicketType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  useEffect(() => {
    api
      .get(`/events/${id}`)
      .then((res) => setEvent(res.data))
      .catch((err) => console.error("API error:", err));
  }, [id]);

  async function handlePurchase() {
    if (!ticketType) {
      setMessage("Prosimo, izberite vrsto vstopnice.");
      setMessageType("error");
      return;
    }

    const purchaseTickets = async () => {
      try {
        setLoading(true);
        setMessage("");
        setMessageType("");

        const response = await api.post("/tickets", {
          event_id: event.id,
          ticket_type_id: parseInt(ticketType),
          quantity: parseInt(quantity),
          payment_method: "card",
        });

        setMessage(response.data.message);
        setMessageType("success");
        // Optionally refresh event data to update available tickets
        const updatedEvent = await api.get(`/events/${id}`);
        setEvent(updatedEvent.data);
      } catch (err) {
        console.error("Purchase error:", err);
        setMessage(err.response?.data?.message || "Napaka pri nakupu vstopnic.");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };

    requireAuth(purchaseTickets);
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold">{event.title}</h1>
          <p className="mt-4 text-lg text-blue-100">{event.description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Podrobnosti dogodka</h3>
              <div className="space-y-4">
                <p className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {new Date(event.start_datetime).toLocaleString('sl-SI')}
                </p>
                <p className="flex items-center text-gray-600">
                  <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  {event.location}
                </p>
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Nakup vstopnic</h3>
              {event.ticket_types?.length ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Vrsta vstopnice</label>
                    <select
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    >
                      <option value="">-- Izberite --</option>
                      {event.ticket_types.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.type} – {t.price} €
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Količina</label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="mt-1 block w-24 pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    />
                  </div>

                  <button
                    onClick={handlePurchase}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Procesiranje..." : "Kupi vstopnice"}
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">Trenutno ni na voljo vstopnic.</p>
              )}
            </div>
          </div>
        </div>

        {message && (
          <div className={`rounded-md p-4 ${
            messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex">
              <div className="flex-shrink-0">
                {messageType === 'success' ? (
                  <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
