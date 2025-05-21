import { BrowserRouter, Routes, Route } from "react-router";
import App from "./App.tsx";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
    </Routes>
  </BrowserRouter>
);
