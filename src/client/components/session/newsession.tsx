import { useState } from "react";
import { Plus } from "lucide-react";

export default function CreateNewSession() {
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async () => {
    setLoading(true);
    try {
      const response = await fetch("session/new", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.text();
      const sessionCode = data; // Assuming the response contains the session code in this field

      window.location.href = `${sessionCode}`;
    } catch (error) {
      console.error("Failed to create a new session:", error);
      // Handle the error appropriately
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`bg-sky-500 justify-between hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-2xl flex transition-all items-center ${
        loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={handleCreateSession}
      disabled={loading}
    >
      {loading ? "Creating..." : "Create New Session"} <Plus />
    </button>
  );
}
