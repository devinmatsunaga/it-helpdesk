import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import TicketsPage from "./pages/TicketsPage";
import MyTicketsPage from "./pages/MyTicketsPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import RequireAuth from "./auth/RequreAuth";
import LoginPage from "./pages/LoginPage";
import NewTicketPage from "./pages/NewTicketPage";
import TicketDetailPage from "./pages/TicketDetailPage";
import AssetsPage from "./pages/AssetsPage";
import AssetDetailPage from "./pages/AssetDetailPage";
import AssetFormPage from "./pages/AssetFormPage";
import UsersPage from "./pages/UsersPage";
import DashboardPage from "./pages/DashboardPage";
import KnowledgeBasePage from "./pages/KnowledgeBasePage";
import ArticlePage from "./pages/ArticlePage";
import ArticleFormPage from "./pages/ArticleFormPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";


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
    <Route index element={<DashboardPage title="Dashboard" />} />
    <Route path="tickets" element={<TicketsPage />} />
    <Route path="tickets/new" element={<NewTicketPage />} />
    <Route path="tickets/:id" element={<TicketDetailPage />} />
    <Route path="my-tickets" element={<MyTicketsPage title="My Tickets" />} />
    <Route path="assets" element={<AssetsPage />} />
    <Route path="assets/new" element={<AssetFormPage/>}/>
    <Route path="assets/:id" element={<AssetDetailPage/>}/>
    <Route path="assets/:id/edit" element={<AssetFormPage/>}/>
    <Route path="users" element={<UsersPage />} />
    <Route path="knowledge" element={<KnowledgeBasePage title="Knowledge Base" />} />
    <Route path="knowledge/new" element={<ArticleFormPage/>}/>
    <Route path="knowledge/:id" element={<ArticlePage/>}/>
    <Route path="knowledge/:id/edit" element={<ArticleFormPage/>}/>
    <Route path="reports" element={<ReportsPage title="Reports" />} />
    <Route path="settings" element={<SettingsPage title="Settings" />} />
  </Route>
</Routes>
    </BrowserRouter>
  );
}