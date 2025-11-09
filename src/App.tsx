import "./App.css";
import { useState } from "react";
import { Chat } from "./pages/chat/chat";
import { Canvas } from "./pages/canvas/canvas";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { Charts } from "./pages/charts/charts";
import { Articles } from "./pages/articles/articles";
import { Recent } from "./pages/recent/recent";
import { ChatWidget } from "@/components/custom/chat-widget";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMessage } from "@fortawesome/free-regular-svg-icons";

function App() {
  // Global chat widget state so it persists across routes
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <ThemeProvider>
      <Router>
        <div className="w-full h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Routes>
            <Route path="/" element={<Canvas />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/charts" element={<Charts />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/recent" element={<Recent />} />
          </Routes>

          {/* Global Floating Chat Widget */}
          <ChatWidget open={chatOpen} onClose={() => setChatOpen(false)} />
          <button
            onClick={() => setChatOpen((v) => !v)}
            aria-label="Toggle Chat"
            className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full bg-black hover:bg-zinc-800 active:scale-[0.98] text-white w-14 h-14 shadow-lg shadow-blue-950 transition-colors z-50"
          >
            <FontAwesomeIcon icon={faMessage} className="text-2xl" />
          </button>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
