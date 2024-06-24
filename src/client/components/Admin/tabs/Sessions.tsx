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

  const timeAgo = (date: Date) => {
    const now = new Date();
    const secondsPast = (now.getTime() - new Date(date).getTime()) / 1000;

    if (secondsPast < 60) {
      return `${Math.floor(secondsPast)} seconds ago`;
    }
    if (secondsPast < 3600) {
      return `${Math.floor(secondsPast / 60)} minutes ago`;
    }
    if (secondsPast < 86400) {
      return `${Math.floor(secondsPast / 3600)} hours ago`;
    }
    if (secondsPast < 2592000) {
      return `${Math.floor(secondsPast / 86400)} days ago`;
    }
    if (secondsPast < 31104000) {
      return `${Math.floor(secondsPast / 2592000)} months ago`;
    }
    return `${Math.floor(secondsPast / 31104000)} years ago`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    alert(error);
    setError(null); // エラーをリセットして表示を続行
  }

  return (
    <div className="w-full overflow-scroll">
      <table className="w-full text-left text-sm">
        <thead className="font-semibold border-b-2 border-gray-300">
          <tr>
            <th scope="col" className="px-6 py-4">
              Session Code
            </th>
            <th scope="col" className="px-6 py-4">
              Session Language
            </th>
            <th scope="col" className="px-6 py-4">
              Created at
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
              <td className="px-6 py-4 font-semibold text-sm">
                {langToStr(session.language)}
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-sm">
                  {session.createdAt ? timeAgo(session.createdAt) : "N/A"}
                </p>
                <p className="font-medium text-xs text-gray-600">
                  {" "}
                  {session.createdAt.toString()}
                </p>
              </td>
              <td className="px-6 py-4">
                <p className="font-semibold text-sm">
                  {session.updatedAt ? timeAgo(session.updatedAt) : "N/A"}
                </p>
                <p className="font-medium text-xs text-gray-600">
                  {" "}
                  {session.updatedAt.toString()}
                </p>
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
