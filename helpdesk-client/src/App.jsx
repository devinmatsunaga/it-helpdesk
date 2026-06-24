import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TicketsPage from "./pages/TicketsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import RequireAuth from "./auth/RequreAuth";
import LoginPage from "./pages/LoginPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import AssetsPage from "./pages/AssetsPage";
import UsersPage from "./pages/UsersPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route
    element={
      <RequireAuth>
        <Layout />
      </RequireAuth>
    }
  >
    <Route index element={<PlaceholderPage title="Dashboard" />} />
    <Route path="tickets" element={<TicketsPage />} />
    <Route path="tickets/new" element={<NewTicketPage />} />
    <Route path="tickets/:id" element={<TicketDetailPage />} />
    <Route path="my-tickets" element={<PlaceholderPage title="My Tickets" />} />
    <Route path="assets" element={<AssetsPage />} />
    <Route path="users" element={<UsersPage />} />
    <Route path="knowledge" element={<PlaceholderPage title="Knowledge Base" />} />
    <Route path="reports" element={<PlaceholderPage title="Reports" />} />
    <Route path="settings" element={<PlaceholderPage title="Settings" />} />
  </Route>
</Routes>
    </BrowserRouter>
  );
}