import { BrowserRouter, Routes, Route } from "react-router";
import Events from "./Events.tsx";
import Organizations from "./Organizations.tsx";
import UserManagement from "./UserManagement.tsx";
import Updates from "./Updates.tsx";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/app" element={<Events />} />
        <Route path="/app/orgs" element={<Organizations />} />
        <Route path="/app/users" element={<UserManagement />} />
        <Route path="/app/updates" element={<Updates />} />
      </Routes>
    </BrowserRouter>
  );
}
