import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/router/routes';
import { getApiErrorMessage } from '@/lib/getApiErrorMessage';
import { PageLoader } from '@/router/PageLoader';

type RegisterRole = 'CLIENT' | 'FREELANCER';

const RegisterPage = () => {
  const { register, isLoggedIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegisterRole>('CLIENT');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) return < PageLoader />;
  if (isLoggedIn) return <Navigate to={ROUTES.dashboard} replace />;

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await register({ email, password, role });
      navigate(ROUTES.dashboard, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <h1>Create account</h1>

      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="text-white bg-black"
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
            className="text-white bg-black"
          />
        </div>

        <div>
          <label htmlFor="role">I am a</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as RegisterRole)}
          >
            <option value="CLIENT">Client (I want to hire)</option>
            <option value="FREELANCER">Freelancer (I want to work)</option>
          </select>
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Sign Up'}
        </button>
      </form>
    </section>
  );
};

export default RegisterPage;