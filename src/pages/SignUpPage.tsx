// Trigger CI test

import { FC, FormEvent, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  PersonAddOutlined,
  RadioButtonUnchecked,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

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

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

const GENDER_OPTIONS = [
  { value: "Masculino", label: "Masculino" },
  { value: "Feminino", label: "Feminino" },
  { value: "Indefinido", label: "Prefiro não informar" },
];

const isValidEmail = (email: string) =>
  /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email) &&
  !email.startsWith(".") &&
  !email.endsWith(".") &&
  !email.includes("..");

interface RuleItemProps {
  ok: boolean;
  text: string;
}

const RuleItem: FC<RuleItemProps> = ({ ok, text }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
    {ok ? (
      <CheckCircle sx={{ fontSize: 14, color: "success.main" }} />
    ) : (
      <RadioButtonUnchecked sx={{ fontSize: 14, color: "text.disabled" }} />
    )}
    <Typography variant="caption" color={ok ? "success.main" : "text.secondary"}>
      {text}
    </Typography>
  </Box>
);

const SignUpPage: FC<SignUpPageProps> = ({ onSignUp, onGoToLogin }) => {
  const [form, setForm] = useState<FormData>({
    name: "",
    birthday: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (field === "name" && value && !/^[a-zA-ZÀ-ÿ\s]*$/.test(value)) return;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const rules = {
    length: form.password.length >= 10,
    upper: /[A-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };
  const allRulesOk = Object.values(rules).every(Boolean);
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsDiffer = form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (new Date(form.birthday) > new Date()) {
      setError("Data de nascimento inválida");
      return;
    }
    if (!isValidEmail(form.email)) {
      setError("E-mail inválido");
      return;
    }
    if (!allRulesOk) {
      setError("A senha não atende aos requisitos mínimos");
      return;
    }
    if (!passwordsMatch) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
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
          confirmationPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Erro ao criar conta");
      }

      setSuccess(true);
      setTimeout(() => onSignUp?.(data), 1500);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
        p: 2,
        py: 4,
      }}
    >
      <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 3, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <PersonAddOutlined sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Criar conta
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Preencha os dados abaixo para se cadastrar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Nome completo"
              fullWidth
              required
              value={form.name}
              onChange={handleChange("name")}
              autoFocus
              sx={{ mb: 2 }}
            />

            <TextField
              label="Data de nascimento"
              type="date"
              fullWidth
              required
              value={form.birthday}
              onChange={handleChange("birthday")}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: new Date().toISOString().split("T")[0] } }}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Gênero"
              select
              fullWidth
              required
              value={form.gender}
              onChange={handleChange("gender")}
              sx={{ mb: 2 }}
            >
              {GENDER_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={handleChange("email")}
              autoComplete="email"
              error={form.email.length > 0 && !isValidEmail(form.email)}
              helperText={
                form.email.length > 0 && !isValidEmail(form.email)
                  ? "Formato de e-mail inválido"
                  : " "
              }
              sx={{ mb: 1 }}
            />

            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={form.password}
              onChange={handleChange("password")}
              autoComplete="new-password"
              sx={{ mb: 1 }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ mb: 2, pl: 0.5 }}>
              <RuleItem ok={rules.length} text="Mínimo de 10 caracteres" />
              <RuleItem ok={rules.upper} text="Pelo menos uma letra maiúscula" />
              <RuleItem ok={rules.number} text="Pelo menos um número" />
              <RuleItem ok={rules.special} text="Pelo menos um caractere especial (!@#$%...)" />
            </Box>

            <TextField
              label="Confirmar senha"
              type={showConfirm ? "text" : "password"}
              fullWidth
              required
              value={form.confirmPassword}
              onChange={handleChange("confirmPassword")}
              autoComplete="new-password"
              error={passwordsDiffer}
              helperText={
                passwordsDiffer
                  ? "As senhas não coincidem"
                  : passwordsMatch
                  ? "✓ Senhas coincidem"
                  : " "
              }
              sx={{
                mb: 3,
                "& .MuiFormHelperText-root": {
                  color: passwordsMatch ? "success.main" : undefined,
                },
              }}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirm((v) => !v)}
                        edge="end"
                        aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Criar conta"}
            </Button>
          </Box>

          {onGoToLogin && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" textAlign="center" color="text.secondary">
                Já tem conta?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={onGoToLogin}
                  sx={{ fontWeight: 600, p: 0, minWidth: "auto", verticalAlign: "baseline" }}
                >
                  Entrar
                </Button>
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={success}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled">
          Conta criada com sucesso! Redirecionando...
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignUpPage;
