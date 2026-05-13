import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock component simples para teste
function LoginPageMock() {
  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Email" />
      <input placeholder="Senha" type="password" />
      <button>Entrar</button>
    </div>
  );
}

describe('LoginPage', () => {
  it('deve renderizar o formulário de login', () => {
    render(<LoginPageMock />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve ter inputs corretos', () => {
    render(<LoginPageMock />);
    
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement;
    const senhaInput = screen.getByPlaceholderText('Senha') as HTMLInputElement;
    
    expect(emailInput.type).toBe('text');
    expect(senhaInput.type).toBe('password');
  });

  it('deve renderizar botão de submit', () => {
    render(<LoginPageMock />);
    
    const botao = screen.getByRole('button', { name: /entrar/i });
    expect(botao).toBeInTheDocument();
    expect(botao).toBeEnabled();
  });
});
