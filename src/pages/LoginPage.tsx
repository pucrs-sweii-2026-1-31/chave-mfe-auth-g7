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
  TextField,
  Typography,
} from "@mui/material";
import { LockOutlined, Visibility, VisibilityOff } from "@mui/icons-material";

interface LoginPageProps {
  onLogin?: (data: LoginResponse) => void;
  onGoToSignUp?: () => void;
}

interface LoginResponse {
  email: string;
  roles: string[];
  token: string;
}

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

const LoginPage: FC<LoginPageProps> = ({ onLogin, onGoToSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Credenciais inválidas");
      }

      localStorage.setItem("token", data.token);
      onLogin?.(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      }
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
      }}
    >
      <Card sx={{ maxWidth: 440, width: "100%", borderRadius: 3, boxShadow: 8 }}>
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
              <LockOutlined sx={{ color: "white", fontSize: 30 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              Chave
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Entre com sua conta para continuar
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="E-mail"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              sx={{ mb: 2 }}
            />
            <TextField
              label="Senha"
              type={showPassword ? "text" : "password"}
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              sx={{ mb: 3 }}
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ borderRadius: 2, py: 1.5, fontWeight: 600 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
            </Button>
          </Box>

          {onGoToSignUp && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="body2" textAlign="center" color="text.secondary">
                Não tem conta?{" "}
                <Button
                  variant="text"
                  size="small"
                  onClick={onGoToSignUp}
                  sx={{ fontWeight: 600, p: 0, minWidth: "auto", verticalAlign: "baseline" }}
                >
                  Cadastre-se
                </Button>
              </Typography>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
