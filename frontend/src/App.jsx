import {
  Route,
  Routes,
} from "react-router";

import PublicLayout from "./layouts/PublicLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import HomePage from "./pages/HomePage.jsx";
import EventsPage from "./pages/EventsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ClientPage from "./pages/ClientPage.jsx";
import OrganizerPage from "./pages/OrganizerPage.jsx";
import CheckinPage from "./pages/CheckinPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import EventDetailsPage from "./pages/EventDetailsPage.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/eventos"
          element={<EventsPage />}
        />

        <Route
          path="/eventos/:eventId"
          element={<EventDetailsPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
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
          element={<ClientPage />}
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
          element={<CheckinPage />}
        />
      </Route>

      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}