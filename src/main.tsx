import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [page, setPage] = useState<"login" | "signup">("login");

  if (page === "signup") {
    return (
      <SignUpPage
        onSignUp={() => setPage("login")}
        onGoToLogin={() => setPage("login")}
      />
    );
  }

  return (
    <LoginPage
      onLogin={(data) => console.log("Logado:", data)}
      onGoToSignUp={() => setPage("signup")}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
