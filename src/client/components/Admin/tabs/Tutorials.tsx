import { useEffect, useState } from "react";
import { TutorialData } from "../../../../type";
import { X } from "lucide-react";
import yaml from "js-yaml";

export default function Users() {
  const [tutorials, setTutorials] = useState<TutorialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialData | null>(
    null
  );
  const [editTutorial, setEditTutorial] = useState<Partial<TutorialData>>({});
  const [newTutorial, setNewTutorial] = useState("");

  const fetchTutorials = () => {
    fetch("/api/admin/tutorials")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setTutorials(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const handleTutorialClick = (id: string) => {
    fetch(`/api/admin/tutorials/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setSelectedTutorial(data);
        setEditTutorial(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditTutorial((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewTutorialChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setNewTutorial(e.target.value.toString());
  };

  const handleUpdateTutorial = () => {
    if (!editTutorial.content || !editTutorial.id) {
      console.error("Invalid tutorial data");
      return;
    }
    if (selectedTutorial) {
      fetch(`/api/admin/tutorial/${selectedTutorial.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editTutorial),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Network response was not ok " + response.statusText
            );
          }
          return response.json();
        })
        .then(() => {
          fetchTutorials();
          setSelectedTutorial(null);
        })
        .catch((error) => {
          setError(error.message);
        });
    }
  };

  const handleDeleteTutorial = (id: string) => {
    fetch(`/api/admin/tutorials/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        console.log(response);
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        setTutorials((prevTutorial) =>
          prevTutorial.filter((tutorial) => tutorial.id !== id)
        );
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleCreateTutorial = () => {
    if (!newTutorial) {
      console.error("Invalid tutorial data");
      return;
    }
    fetch("/api/admin/tutorials/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newTutorial }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        setTutorials((prevTutorial) => [...prevTutorial, data]);
        setNewTutorial("");
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
      <table className="min-w-full text-left text-sm whitespace-nowrap">
        <thead className="font-semibold border-b-2 border-gray-300">
          <tr>
            <th scope="col" className="px-6 py-4">
              Title
            </th>
            <th scope="col" className="px-6 py-4">
              Description
            </th>
            <th scope="col" className="px-6 py-4">
              Keywords
            </th>
            <th scope="col" className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="gap-2">
          {tutorials.map((tutorial) => {
            const metadata = extractMetadata(tutorial.content);
            return (
              <tr
                key={tutorial.id}
                className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
              >
                <th className="px-6 py-4">{metadata.title}</th>
                <th className="px-6 py-4">{metadata.description}</th>
                <th className="px-6 py-4">{metadata.keywords}</th>
                <td className="px-6 py-4 border-l-2 border-gray-300">
                  <span className="flex gap-2">
                    <button
                      className="p-1.5 rounded-full bg-sky-500 px-2 font-semibold text-white hover:bg-sky-600"
                      onClick={() => handleTutorialClick(tutorial.id)}
                    >
                      View
                    </button>
                    <button
                      className="p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600"
                      onClick={() => handleDeleteTutorial(tutorial.id)}
                    >
                      Delete
                    </button>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedTutorial && (
        <div className="p-2 bg-gray-300 rounded-2xl">
          <button onClick={() => setSelectedTutorial(null)}>
            <X />
          </button>
          <form>
            <label>
              content:
              <textarea
                name="content"
                value={editTutorial.content || ""}
                onChange={handleEditChange}
              />
            </label>
            <button type="button" onClick={handleUpdateTutorial}>
              Update
            </button>
          </form>
        </div>
      )}

      <div className="p-2 border-b-2 border-gray-300 bg-gray-300">
        <h2 className="py-2 font-semibold">Create New Tutorial</h2>
        <form className="gap-2 flex">
          <label>
            content
            <textarea
              className="p-1.5 rounded-2xl bg-white"
              name="content"
              value={newTutorial}
              onChange={handleNewTutorialChange}
            />
          </label>

          <button
            type="button"
            onClick={handleCreateTutorial}
            className="p-1.5 rounded-full bg-orange-500 px-2 font-semibold text-white hover:bg-orange-600"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}

// メタデータを抽出する関数
function extractMetadata(content: string): {
  title: string;
  description: string;
  keywords: string;
} {
  const metadataDelimiter = "---";
  const parts = content.split(metadataDelimiter);
  if (parts.length >= 3) {
    const metadata = yaml.load(parts[1].trim()) as Record<string, any>;
    return {
      title: metadata.title || "",
      description: metadata.description || "",
      keywords: metadata.keywords || "",
    };
  }
  return { title: "", description: "", keywords: "" };
}
