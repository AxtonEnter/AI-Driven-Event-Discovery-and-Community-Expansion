import { BrowserRouter, Routes, Route } from "react-router";
import Events from "./Events.tsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<Events />} />
      </Routes>
    </BrowserRouter>
  );
}
