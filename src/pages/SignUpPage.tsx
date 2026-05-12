import { FC, FormEvent, ChangeEvent, useState } from "react";

interface SignUpPageProps {
  onSignUp?: (data: any) => void;
  onGoToLogin?: () => void;
}

interface FormData {
  name: string;
  birthday: string;
  gender: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordRules {
  length: boolean;
  upper: boolean;
  number: boolean;
  special: boolean;
}

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

interface ToastProps {
  message: string;
  success: boolean;
  onClose: () => void;
}

const Toast: FC<ToastProps> = ({ message, success, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        background: success ? "#35b810": "#d32f2f",
        color: "#fff",
        padding: "12px 24px",
        borderRadius: 8,
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        fontFamily: "sans-serif",
        fontSize: 14,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 260,
      }}
    >
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};

interface PasswordRuleProps {
  ok: boolean;
  text: string;
}

const PasswordRule: FC<PasswordRuleProps> = ({ ok, text }) => {
  return (
    <p style={{ margin: "2px 0", fontSize: 12, color: ok ? "#2e7d32" : "#999" }}>
      {ok ? "✅" : "⬜"} {text}
    </p>
  );
};

const SignUpPage: FC<SignUpPageProps> = ({ onSignUp, onGoToLogin }) => {
  const [form, setForm] = useState<FormData>({
    name: "",
    birthday: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<{message: string, success: boolean} | null>(null);

  const showToast = (message: string, success: boolean): void => {
    setToast({message: message, success: success});
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const rules: PasswordRules = {
    length: form.password.length >= 10,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsDiffer =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const allRulesOk = rules.length && rules.upper && rules.number && rules.special;

  const isValidEmail = (email: string): boolean => {
    return (
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) &&
      !email.startsWith(".") &&
      !email.endsWith(".") &&
      !email.includes("..")
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    if (new Date(form.birthday) > new Date()) {
      showToast("Data de nascimento inválida", false);
      setLoading(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      showToast("E-mail inválido", false);
      setLoading(false);
      return;
    }

    if (!allRulesOk) {
      showToast("A senha não atende aos requisitos", false);
      setLoading(false);
      return;
    }

    if (!passwordsMatch) {
      showToast("As senhas não coincidem", false);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/users/sign-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birthday: form.birthday,
          gender: form.gender,
          email: form.email,
          password: form.password,
          confirmationPassword: form.confirmPassword
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Erro ao criar conta");
      }

      showToast("Usuário criado com sucesso!", true);
      setTimeout(() => {
        onSignUp?.(data);
      }, 1500);
    } catch (err) {
      if (err instanceof Error) {
        showToast(err.message, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "8px 10px",
    marginTop: 4,
    marginBottom: 6,
    boxSizing: "border-box",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 14,
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: "#333",
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "60px auto",
        fontFamily: "sans-serif",
        padding: "0 16px",
      }}
    >
      <h2 style={{ marginBottom: 4 }}>Chave — Criar conta</h2>
      <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
        Preencha os dados abaixo para se cadastrar.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Nome</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={(e) => {
            const value = e.target.value;
            if (/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) {
              setForm((prev) => ({ ...prev, name: value }));
            }
          }}
          required
          placeholder="Seu nome completo"
          style={{ ...inputStyle, marginBottom: 14 }}
        />

        <label style={labelStyle}>Data de nascimento</label>
        <input
          name="birthday"
          type="date"
          value={form.birthday}
          onChange={handleChange}
          required
          max={new Date().toISOString().split("T")[0]}
          style={{ ...inputStyle, marginBottom: 14 }}
        />

        <label style={labelStyle}>Gênero</label>
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
          required
          style={{ ...inputStyle, marginBottom: 14 }}
        >
          <option value="" disabled>
            Selecione...
          </option>
          <option value="Masculino">Masculino</option>
          <option value="Feminino">Feminino</option>
          <option value="Outro">Outro</option>
        </select>

        <label style={labelStyle}>E-mail</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="seu@email.com"
          style={{
            ...inputStyle,
            marginBottom: 4,
            borderColor:
              form.email.length > 0
                ? isValidEmail(form.email)
                  ? "#2e7d32"
                  : "#d32f2f"
                : "#ccc",
          }}
        />
        <div style={{ marginBottom: 14, marginTop: 4, paddingLeft: 2 }}>
          <PasswordRule ok={form.email.includes("@")} text="Contém @." />
          <PasswordRule
            ok={/^[a-zA-Z0-9._-]+@/.test(form.email)}
            text="Nome de usuário válido (letras, números, caracteres especiais)."
          />
          <PasswordRule
            ok={/@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)}
            text="Domínio válido (ex: gmail.com)."
          />
          <PasswordRule
            ok={
              !form.email.startsWith(".") &&
              !form.email.endsWith(".") &&
              !form.email.includes("..")
            }
            text="Sem pontos consecutivos ou nas bordas."
          />
        </div>

        <label style={labelStyle}>Senha</label>
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Crie uma senha"
          style={inputStyle}
        />

        {/* Requisitos em tempo real */}
        <div style={{ marginBottom: 14, marginTop: 4, paddingLeft: 2 }}>
          <PasswordRule ok={rules.length} text="Mínimo de 10 caracteres." />
          <PasswordRule ok={rules.upper} text="Pelo menos uma letra maiúscula." />
          <PasswordRule
            ok={rules.special}
            text='Pelo menos um caractere especial (!@#$%...).'
          />
          <PasswordRule ok={rules.number} text="Pelo menos um número." />
        </div>

        <label style={labelStyle}>Confirmar senha</label>
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          placeholder="Repita a senha"
          style={{
            ...inputStyle,
            marginBottom: 4,
            borderColor: passwordsDiffer
              ? "#d32f2f"
              : passwordsMatch
              ? "#2e7d32"
              : "#ccc",
          }}
        />
        {passwordsDiffer && (
          <p style={{ color: "#d32f2f", fontSize: 12, marginBottom: 10 }}>
            As senhas não coincidem.
          </p>
        )}
        {passwordsMatch && (
          <p style={{ color: "#2e7d32", fontSize: 12, marginBottom: 10 }}>
            ✅ Senhas coincidem.
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "10px 0",
            background: loading ? "#90a4ae" : "#1565c0",
            color: "#fff",
            border: "none",
            borderRadius: 4,
            fontSize: 15,
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8,
          }}
        >
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      {onGoToLogin && (
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          Já tem conta?{" "}
          <button
            onClick={onGoToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#1565c0",
              cursor: "pointer",
              fontSize: 14,
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Entrar
          </button>
        </p>
      )}

      {toast && <Toast message={toast.message} success={toast.success} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SignUpPage;
