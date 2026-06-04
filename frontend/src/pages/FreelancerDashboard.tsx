import { useAuth } from "@/hooks/useAuth";

const FreelancerDashboard = () => {
  const { user } = useAuth();

  return (
    <>
      <h1>Welcome, {user?.name ?? user?.email ?? 'User'}</h1>
    </>
  )
}

export default FreelancerDashboard
