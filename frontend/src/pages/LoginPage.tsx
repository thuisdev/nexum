import { useAuth } from "@/hooks/useAuth"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {

    e.preventDefault()

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <input type="text"
              id="email"
              value={email}
              onChange={e => { setEmail(e.target.value) }}
              placeholder=' '
            />
            <label htmlFor="email">Email</label>
          </div>
          <div>
            <input type="password"
              id="password"
              value={password}
              onChange={e => { setPassword(e.target.value) }}
              placeholder=' '
            />
            <label htmlFor="password">Password</label>
          </div>
          <button type="submit">
            Sign In
          </button>
        </form>
      </section >
    </>
  )
}

export default LoginPage
