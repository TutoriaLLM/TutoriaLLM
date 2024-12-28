import { PenIcon } from "lucide-react";
import { Button } from "../../ui/button";

import Popup from "../../ui/Popup";
import type { AuthSession } from "@/type";
import { useState } from "react";
import { EditPassword } from "./edit/editPassword";
import { Editinfo } from "./edit/editInfo";
export function ProfileEditor(props: { session: AuthSession }) {
	const [isEditorPopupOpen, setIsEditorPopupOpen] = useState(false);

	function toggleEditorPopup() {
		setIsEditorPopupOpen(!isEditorPopupOpen);
	}

	const PopupContent = () => {
		const { session } = props;

		return (
			<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
				<Editinfo session={session} />

				<EditPassword />
			</div>
		);
	};
	return (
		<div>
			<Button variant={"default"} size={"sm"} onClick={toggleEditorPopup}>
				<PenIcon className="w-5 h-5" />
				Edit Profile
			</Button>
			{isEditorPopupOpen ? (
				<Popup openState={isEditorPopupOpen} onClose={toggleEditorPopup}>
					<PopupContent />
				</Popup>
			) : null}
		</div>
	);
}
