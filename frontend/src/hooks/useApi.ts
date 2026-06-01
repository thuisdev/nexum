import axios from "axios"

export const getMe = async () => {
    return axios.get('/api/auth/me')
}