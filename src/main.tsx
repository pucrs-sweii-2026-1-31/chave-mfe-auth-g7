import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

function App() {
  const [page, setPage] = useState<"login" | "signup">("signup");

  if (page === "login") {
    return (
      <LoginPage onLogin={(data: any) => console.log("Logado:", data)} />
    );
  }

  return (
    <SignUpPage
      onSignUp={(data: any) => console.log("Cadastrado:", data)}
      onGoToLogin={() => setPage("login")}
    />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
