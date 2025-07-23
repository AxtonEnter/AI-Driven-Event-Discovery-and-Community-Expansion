import { BrowserRouter, Routes, Route } from "react-router";
import Events from "./Events.tsx";
import Organizations from "./Organizations.tsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<Events />} />
        <Route path="/orgs" element={<Organizations />} />
      </Routes>
    </BrowserRouter>
  );
}
