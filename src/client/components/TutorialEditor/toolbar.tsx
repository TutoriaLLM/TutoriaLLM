export default function Toolbar(props: {
	id: number | null;
	nodes: any[];
	edges: any[];
	handleClosePopup: () => void;
}) {
	const { nodes, edges, handleClosePopup } = props;

	const handleSave = () => {
		const url =
			props.id === null
				? "/api/admin/tutorials/new"
				: `/api/admin/tutorials/${props.id}`;
		const method = props.id === null ? "POST" : "PUT";

		// Outputノードからデータを取得
		const outputNode = nodes.find((node) => node.type === "output");

		if (outputNode) {
			// Outputノードに接続されているエッジを取得
			const connectedEdges = edges.filter(
				(edge) => edge.target === outputNode.id,
			);

			// 接続されているノードのIDを取得
			const connectedNodeIds = connectedEdges.map((edge) => edge.source);

			// 接続されているノードを取得
			const connectedNodes = nodes.filter((node) =>
				connectedNodeIds.includes(node.id),
			);

			// contentとmetadataを初期化
			let content = "";
			let metadata = {};

			// 接続されているノードからデータを取得
			for (const node of connectedNodes) {
				if (node.type === "md") {
					content = node.data.source || ""; // Provide a default value
				} else if (node.type === "metadata") {
					metadata = node.data;
				}
			}

			// ノードをシリアライズ
			const serializednodes = JSON.stringify({ nodes, edges });

			// APIにデータを送信
			fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					serializednodes: serializednodes,
					metadata: metadata,
					content: content,
				}),
			})
				.then((response) => {
					if (!response.ok) {
						throw new Error("Network response was not ok");
					}
					return response.text();
				})
				.then((data) => {
					console.log(data);
					alert("Tutorial saved successfully!");
					handleClosePopup();
				})
				.catch((error) => {
					console.error("Error saving tutorial:", error);
					alert("Failed to save tutorial");
				});
		} else {
			alert("Output node not found.");
		}
	};

	const handleDownload = () => {
		if (props.id === null) {
			alert("IDがありません。ダウンロードはできません。");
			return;
		}

		const url = `/api/admin/tutorials/${props.id}`;

		// APIからデータを取得してダウンロード
		fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				// Blobを作成してダウンロードリンクをクリックさせる
				const blob = new Blob([JSON.stringify(data, null, 2)], {
					type: "application/json",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = `tutorial_${props.id}.json`;
				a.click();
				URL.revokeObjectURL(url);
			})
			.catch((error) => {
				console.error("Error downloading tutorial:", error);
				alert("Failed to download tutorial");
			});
	};

	return (
		<div className="w-full flex bg-gray-300 rounded-2xl p-1.5">
			<button
				type="button"
				onClick={handleSave}
				className="p-2 bg-green-500 text-white rounded-xl"
			>
				Save
			</button>
			{props.id !== null && (
				<button
					type="button"
					onClick={handleDownload}
					className="p-2 bg-red-500 text-white rounded-xl"
				>
					Download
				</button>
			)}
		</div>
	);
}
