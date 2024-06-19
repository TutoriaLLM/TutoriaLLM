import { useAtom } from "jotai";
import { isPopupOpen } from "../state";
import SessionPopup from "../components/sessionPopup";

export default function AdminPage() {
  const [showPopup, setShowPopup] = useAtom(isPopupOpen);

  setShowPopup(true);

  return (
    <div className="w-screen h-screen flex flex-col bg-gray-200 text-gray-800">
      {!showPopup && (
        // ポップアップが表示されている場合や接続が確立されていない場合はエディタを表示しない
        <p>Admin Page is here!</p>
      )}
      <p>login popup</p>
    </div>
  );
}
