import {
  Route,
  Routes,
} from "react-router";

import PublicLayout from "./layouts/PublicLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";
import SharedTicketPage from "./pages/SharedTicketPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ClientPage from "./pages/ClientPage.jsx";
import OrganizerPage from "./pages/OrganizerPage.jsx";
import OrganizerEventFormPage from "./pages/OrganizerEventFormPage.jsx";
import OrganizerEventConfigurationPage from "./pages/OrganizerEventConfigurationPage.jsx";
import OrganizerEventMetricsPage from "./pages/OrganizerEventMetricsPage.jsx";
import CheckinPage from "./pages/CheckinPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route
        element={
          <PublicLayout />
        }
      >
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="/eventos"
          element={
            <EventsPage />
          }
        />

        <Route
          path="/eventos/:eventId"
          element={
            <EventDetailsPage />
          }
        />

        <Route
          path="/ingresso/:sharedToken"
          element={
            <SharedTicketPage />
          }
        />

        <Route
          path="/login"
          element={
            <LoginPage />
          }
        />

        <Route
          path="*"
          element={
            <NotFoundPage />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "CLIENT",
            ]}
          />
        }
      >
        <Route
          path="/cliente"
          element={
            <ClientPage />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "ORGANIZER",
            ]}
          />
        }
      >
        <Route
          path="/organizador"
          element={
            <OrganizerPage />
          }
        />

        <Route
          path="/organizador/eventos/novo"
          element={
            <OrganizerEventFormPage />
          }
        />

        <Route
          path="/organizador/eventos/:eventId/editar"
          element={
            <OrganizerEventFormPage />
          }
        />

        <Route
          path="/organizador/eventos/:eventId/configurar"
          element={
            <OrganizerEventConfigurationPage />
          }
        />

        <Route
          path="/organizador/eventos/:eventId/metricas"
          element={
            <OrganizerEventMetricsPage />
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "CHECKIN",
            ]}
          />
        }
      >
        <Route
          path="/portaria"
          element={
            <CheckinPage />
          }
        />
      </Route>
    </Routes>
  );
}