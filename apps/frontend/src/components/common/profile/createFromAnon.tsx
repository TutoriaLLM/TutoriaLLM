import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

import Popup from "../../ui/Popup";
import type { AuthSession } from "@/type";
import { useState } from "react";
import { CreateAccontFromAnonymous } from "./create/createFromAnonymous";
export function CreateFromAnonymous(props: { session: AuthSession }) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);

	function togglePopup() {
		setIsPopupOpen(!isPopupOpen);
	}

	const PopupContent = () => {
		return (
			<div className="w-full h-full flex flex-col gap-3 flex-grow overflow-y-auto">
				<CreateAccontFromAnonymous />
			</div>
		);
	};
	return (
		<div>
			<Button variant={"default"} size={"sm"} onClick={togglePopup}>
				<Plus className="w-5 h-5" />
				Create Account
			</Button>
			{isPopupOpen ? (
				<Popup
					openState={isPopupOpen}
					onClose={togglePopup}
					Content={<PopupContent />}
				/>
			) : null}
		</div>
	);
}
