import { FC, useCallback, useEffect, useState } from "react";
import {
  AdminPanelSettings,
  Logout,
  PersonOff,
  RefreshOutlined,
} from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

const API = import.meta.env.VITE_MS_AUTH_URL || "http://localhost:3001";

interface Role {
  idRole: number;
  name: string;
  description: string;
  active: boolean;
}

interface User {
  idUser: number;
  name: string;
  birthday: string;
  gender: string;
  email: string;
  active: boolean;
  roles: Role[];
}

interface DashboardPageProps {
  onLogout?: () => void;
}

const isAdminUser = (user: User): boolean => user.roles.some((r) => r.idRole === 2);

const getAge = (birthday: string): number => {
  const today = new Date();
  const birth = new Date(birthday);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const DashboardPage: FC<DashboardPageProps> = ({ onLogout }) => {
  const [me, setMe] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [snack, setSnack] = useState<{ msg: string; severity: "success" | "error" } | null>(null);

  const loadData = useCallback(async () => {
    setLoadingPage(true);
    setPageError(null);
    try {
      const meRes = await fetch(`${API}/api/auth/me`, { headers: getAuthHeaders() });
      const meData = await meRes.json();

      if (!meRes.ok) {
        if (meRes.status === 401) {
          localStorage.removeItem("token");
          onLogout?.();
          return;
        }
        throw new Error(meData.message || "Erro ao carregar dados do usuário");
      }

      setMe(meData);

      if (isAdminUser(meData)) {
        const usersRes = await fetch(`${API}/api/users/all`, { headers: getAuthHeaders() });
        const usersData = await usersRes.json();
        if (!usersRes.ok) throw new Error(usersData.message || "Erro ao listar usuários");
        setUsers(usersData);
      }
    } catch (err) {
      if (err instanceof Error) setPageError(err.message);
    } finally {
      setLoadingPage(false);
    }
  }, [onLogout]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePromote = async (idUser: number) => {
    setActionLoading(idUser);
    try {
      const res = await fetch(`${API}/api/users/copy-roles`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ idUser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erro ao promover usuário");
      setUsers((prev) => prev.map((u) => (u.idUser === idUser ? data : u)));
      setSnack({ msg: `${data.name} agora é administrador`, severity: "success" });
    } catch (err) {
      if (err instanceof Error) setSnack({ msg: err.message, severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDemote = async (idUser: number) => {
    setActionLoading(idUser);
    try {
      const res = await fetch(`${API}/api/users/downgrade-roles`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ idUser }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Erro ao remover privilégios");
      setUsers((prev) => prev.map((u) => (u.idUser === idUser ? data : u)));
      setSnack({ msg: `Privilégios de ${data.name} foram removidos`, severity: "success" });
    } catch (err) {
      if (err instanceof Error) setSnack({ msg: err.message, severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
    } finally {
      localStorage.removeItem("token");
      onLogout?.();
    }
  };

  if (loadingPage) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (pageError) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", gap: 2, p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 480, width: "100%" }}>{pageError}</Alert>
        <Button variant="outlined" startIcon={<RefreshOutlined />} onClick={loadData}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  const meIsAdmin = me ? isAdminUser(me) : false;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7fa" }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ background: "linear-gradient(90deg, #1565c0 0%, #0d47a1 100%)" }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            Chave
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: 34,
                height: 34,
                bgcolor: "rgba(255,255,255,0.2)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {me ? getInitials(me.name) : "?"}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" } }}>
              {me?.name}
            </Typography>
            <Tooltip title="Sair">
              <IconButton color="inherit" onClick={handleLogout} size="small">
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1000, mx: "auto", p: { xs: 2, sm: 3 } }}>
        {/* Perfil do usuário logado */}
        <Paper
          elevation={0}
          sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e0e0e0" }}
        >
          <Typography variant="overline" color="text.secondary" fontWeight={600}>
            Meu perfil
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1, mb: 2 }}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                fontSize: 22,
                fontWeight: 700,
                bgcolor: meIsAdmin ? "#1565c0" : "#616161",
              }}
            >
              {me ? getInitials(me.name) : "?"}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
                {me?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {me?.email}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip label={`${getAge(me?.birthday ?? "")} anos`} size="small" variant="outlined" />
            <Chip label={me?.gender} size="small" variant="outlined" />
            {me?.roles.map((r) => (
              <Chip
                key={r.idRole}
                label={r.name}
                size="small"
                color={r.idRole === 2 ? "primary" : "default"}
                variant={r.idRole === 2 ? "filled" : "outlined"}
              />
            ))}
          </Box>
        </Paper>

        {/* Lista de usuários — somente admin */}
        {meIsAdmin ? (
          <>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Gerenciamento de Usuários
            </Typography>
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 3, border: "1px solid #e0e0e0" }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f5f7fa" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Usuário</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Idade</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Perfis</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Ações
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => {
                    const userIsAdmin = isAdminUser(user);
                    const isMe = user.idUser === me?.idUser;
                    return (
                      <TableRow
                        key={user.idUser}
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                fontSize: 13,
                                fontWeight: 700,
                                bgcolor: userIsAdmin ? "#1565c0" : "#9e9e9e",
                              }}
                            >
                              {getInitials(user.name)}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {user.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getAge(user.birthday)} anos
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {user.roles.map((r) => (
                              <Chip
                                key={r.idRole}
                                label={r.name}
                                size="small"
                                color={r.idRole === 2 ? "primary" : "default"}
                                variant={r.idRole === 2 ? "filled" : "outlined"}
                              />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {isMe ? (
                            <Typography variant="caption" color="text.disabled" fontStyle="italic">
                              você
                            </Typography>
                          ) : actionLoading === user.idUser ? (
                            <CircularProgress size={22} />
                          ) : userIsAdmin ? (
                            <Tooltip title="Reverter para usuário padrão">
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<PersonOff fontSize="small" />}
                                onClick={() => handleDemote(user.idUser)}
                              >
                                Remover admin
                              </Button>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Conceder privilégios de administrador">
                              <Button
                                size="small"
                                variant="outlined"
                                color="primary"
                                startIcon={<AdminPanelSettings fontSize="small" />}
                                onClick={() => handlePromote(user.idUser)}
                              >
                                Tornar admin
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid #e0e0e0",
              textAlign: "center",
            }}
          >
            <Typography color="text.secondary">
              Você está autenticado como usuário padrão. Apenas administradores podem gerenciar
              outros usuários.
            </Typography>
          </Paper>
        )}
      </Box>

      <Snackbar
        open={!!snack}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack?.severity}
          variant="filled"
          onClose={() => setSnack(null)}
          sx={{ minWidth: 280 }}
        >
          {snack?.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
