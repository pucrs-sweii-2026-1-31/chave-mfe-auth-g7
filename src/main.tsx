import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import DashboardPage from "./pages/DashboardPage";

type View = "login" | "signup" | "dashboard";

function App() {
  const [view, setView] = useState<View>(() =>
    localStorage.getItem("token") ? "dashboard" : "login"
  );

  if (view === "signup") {
    return (
      <SignUpPage
        onSignUp={() => setView("login")}
        onGoToLogin={() => setView("login")}
      />
    );
  }

  if (view === "dashboard") {
    return <DashboardPage onLogout={() => setView("login")} />;
  }

  return (
    <LoginPage
      onLogin={() => setView("dashboard")}
      onGoToSignUp={() => setView("signup")}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
