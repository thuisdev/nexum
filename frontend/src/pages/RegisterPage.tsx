import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

const RegisterPage = () => {
  const { register } = useAuth()
  const navigate = useNavigate();

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await register({ email, password })
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <input type="text"
            id="email"
            value={email}
            onChange={e => { setEmail(e.target.value) }}
          />
          <label htmlFor="email">Email</label>
        </div>
        <div>
          <input type="password"
            id="password"
            value={password}
            onChange={e => { setPassword(e.target.value) }}
          />
          <label htmlFor="password">Password</label>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </>
  )
}

export default RegisterPage
