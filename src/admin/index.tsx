import React, { useState, useEffect } from "react";

export default function AdminPage() {
  const [currentConfig, setCurrentConfig] = useState(null);
  const [configText, setConfigText] = useState("");

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch("/admin/config");
        if (!response.ok) {
          throw new Error("Failed to fetch config");
        }
        const config = await response.json();
        setCurrentConfig(config);
        setConfigText(JSON.stringify(config, null, 2)); // フォーマットされたJSONをテキストエリアに表示
      } catch (error) {
        console.error("Error fetching config:", error);
      }
    }

    fetchConfig();
  }, []); // 空の依存配列は、このエフェクトが一度だけ実行されることを意味します

  const handleTextChange = (event: any) => {
    setConfigText(event.target.value);
  };

  const handleSave = async () => {
    try {
      const updatedConfig = JSON.parse(configText); // テキストエリアの内容をJSONに変換
      const response = await fetch("/admin/config/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConfig),
      });
      if (!response.ok) {
        throw new Error("Failed to update config");
      }
      setCurrentConfig(updatedConfig); // 成功したら状態を更新
      alert("Config updated successfully");
    } catch (error) {
      console.error("Error updating config:", error);
      alert("Failed to update config. Please check the format of the JSON.");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="w-full h-full max-w-md p-2 flex flex-col ">
        <h1>Admin Page for setting. Access is restricted.</h1>
        {currentConfig ? (
          <div>
            <textarea value={configText} onChange={handleTextChange}></textarea>
            <br />
            <button onClick={handleSave}>Save Config</button>
          </div>
        ) : (
          <p>Loading config...</p>
        )}
      </div>
    </div>
  );
}
