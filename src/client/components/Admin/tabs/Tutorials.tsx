import { useEffect, useState } from "react";
import { TutorialData } from "../../../../type";
import { X } from "lucide-react";

export default function Users() {
  const [tutorials, setTutorials] = useState<TutorialData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<TutorialData | null>(
    null
  );
  const [editTutorial, setEditTutorial] = useState<Partial<TutorialData>>({});
  const [newTutorial, setNewTutorial] = useState({
    tutorialId: "",
    content: "",
    metadata: {},
  } as TutorialData);

  const fetchTutorials = () => {
    fetch("/api/admin/tutorials")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        const parsedData = data.map((tutorial: any) => ({
          ...tutorial,
          metadata: JSON.parse(tutorial.metadata),
        }));
        setTutorials(parsedData);
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
        data.metadata = JSON.parse(data.metadata);
        setSelectedTutorial(data);
        setEditTutorial(data);
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setEditTutorial((prev) => ({ ...prev, [name]: value }));
  };

  const handleNewTutorialChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setNewTutorial((prev) => {
      if (name in prev.metadata) {
        return {
          ...prev,
          metadata: { ...prev.metadata, [name]: value },
        };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };

  const handleUpdateTutorial = () => {
    if (!editTutorial.content || !editTutorial.tutorialId) {
      console.error("Invalid tutorial data");
      return;
    }
    if (selectedTutorial) {
      fetch(`/api/admin/tutorial/${selectedTutorial.tutorialId}`, {
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
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        setTutorials((prevTutorial) =>
          prevTutorial.filter((tutorial) => tutorial.tutorialId !== id)
        );
      })
      .catch((error) => {
        setError(error.message);
      });
  };

  const handleCreateTutorial = () => {
    console.log("new tutorial!" + JSON.stringify(newTutorial));
    if (
      !newTutorial.content ||
      !newTutorial.metadata.title ||
      !newTutorial.metadata.description
    ) {
      console.error("Invalid tutorial data");
      return;
    }
    fetch("/api/admin/tutorial/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTutorial),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok " + response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        data.metadata = JSON.parse(data.metadata);
        setTutorials((prevTutorial) => [...prevTutorial, data]);
        setNewTutorial({
          tutorialId: "",
          content: "",
          metadata: {
            marp: true,
            title: "",
            description: "",
            keywords: [],
          },
        });
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
              description
            </th>
            <th scope="col" className="px-6 py-4">
              keywords
            </th>
            <th scope="col" className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="gap-2">
          {tutorials.map((tutorial) => (
            <tr
              key={tutorial.tutorialId}
              className="border-y-2 border-gray-300 rounded-2xl bg-gray-200"
            >
              <th className="px-6 py-4">{tutorial.metadata.title}</th>
              <th className="px-6 py-4">{tutorial.metadata.description}</th>
              <th className="px-6 py-4">{tutorial.metadata.keywords}</th>
              <td className="px-6 py-4 border-l-2 border-gray-300">
                <span className="flex gap-2">
                  <button
                    className="p-1.5 rounded-full bg-sky-500 px-2 font-semibold text-white hover:bg-sky-600"
                    onClick={() => handleTutorialClick(tutorial.tutorialId)}
                  >
                    View
                  </button>
                  <button
                    className="p-1.5 rounded-full bg-red-500 px-2 font-semibold text-white hover:bg-red-600"
                    onClick={() => handleDeleteTutorial(tutorial.tutorialId)}
                  >
                    Delete
                  </button>
                </span>
              </td>
            </tr>
          ))}
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
              value={newTutorial.content}
              onChange={handleNewTutorialChange}
            />
          </label>
          <label>
            title
            <input
              className="p-1.5 rounded-2xl bg-white"
              name="title"
              value={newTutorial.metadata.title}
              onChange={handleNewTutorialChange}
            />
          </label>
          <label>
            description
            <input
              className="p-1.5 rounded-2xl bg-white"
              name="description"
              value={newTutorial.metadata.description}
              onChange={handleNewTutorialChange}
            />
          </label>
          <label>
            keywords
            <input
              className="p-1.5 rounded-2xl bg-white"
              name="keywords"
              value={newTutorial.metadata.keywords}
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
