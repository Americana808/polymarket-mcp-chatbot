import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-regular-svg-icons";

export function Canvas() {
  return (
    <div className="w-full h-dvh relative bg-gradient-to-br from-gray-50 via-white to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-gray-800 overflow-hidden">
      {/* Center placeholder to add the rest of the content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
        <h1 className="text-4xl font-semibold tracking-tight text-gray-800 dark:text-gray-100 mb-4">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md text-center">
          Add the buttons, widgets, charts here.
        </p>
      </div>
      {/* Message button to open chat */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2">
        <Link
          to="/chat"
          className="inline-flex items-center justify-center rounded-full bg-black hover:bg-zinc-800 active:scale-[0.98] text-white w-14 h-14 shadow-lg shadow-indigo-600/30 transition-colors"
        >
          <FontAwesomeIcon icon={faMessage} className="text-2xl" />
        </Link>
      </div>
    </div>
  );
}
