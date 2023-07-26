import { createContext, useContext, useState } from "react";

const loginContext = createContext()

const LoginProvider = ({ children }) => {
    const [username, setUsername] = useState(null)
    const [password, setPassword] = useState(null)

    return (
        <loginContext.Provider value={{ username, setUsername, password, setPassword }}>
            {children}
        </loginContext.Provider>
    )
}

const useLogin = () => {
    return useContext(loginContext)
}

export { useLogin, LoginProvider }