import { useEffect, useState } from "react";
import { SessionValue } from "../../../../type";
import { langToStr } from "../../../../utils/langToStr";

export default function Sessions() {
  const [sessions, setSessions] = useState<SessionValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/sessions/list")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        const parsedData = data.map((sessionString: string) =>
          JSON.parse(sessionString)
        );
        setSessions(parsedData);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  const handleDeleteSession = (key: string) => {
    fetch(`/api/admin/sessions/${key}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        setSessions(sessions.filter((session) => session.sessioncode !== key));
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    alert(error);
    setError(null); // エラーをリセットして表示を続行
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="font-semibold border-b-2 border-gray-300">
          <tr>
            <th scope="col" className="px-6 py-4">
              Session Code
            </th>
            <th scope="col" className="px-6 py-4">
              Session Language
            </th>
            <th scope="col" className="px-6 py-4">
              Last Update
            </th>
            <th scope="col" className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="gap-2">
          {sessions.map((session) => (
            <tr
              key={session.sessioncode}
              className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
            >
              <td className="px-6 py-4 font-semibold text-base tracking-wide">
                {session.sessioncode}
              </td>
              <td className="px-6 py-4">{langToStr(session.language)}</td>
              <td className="px-6 py-4">
                {session.updatedAt
                  ? new Date(session.updatedAt).toString()
                  : "N/A"}
              </td>
              <td className="px-6 py-4 border-l-2 border-gray-300">
                <span className="flex gap-2">
                  <a
                    href={`/${session.sessioncode}`}
                    className="p-1.5 rounded-full bg-sky-500 px-2 font-semibold text-white hover:bg-sky-600"
                  >
                    Open
                  </a>
                  <button
                    className="p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600"
                    onClick={() => handleDeleteSession(session.sessioncode)}
                  >
                    Delete
                  </button>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
