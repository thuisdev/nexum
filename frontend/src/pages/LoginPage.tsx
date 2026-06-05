import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ROUTES } from '@/router/routes';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true)

    try {
      await login({email, password});
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section>

        <h1>Login</h1>

        {error && <p role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value) }}
              required
              className="text-white bg-black"
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => { setPassword(e.target.value) }}
              required
              className="text-white bg-black"
            />
          </div>

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </section >
    </>
  );
};

export default LoginPage;
