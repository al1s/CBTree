import { useToast } from '@chakra-ui/react'
import {
	createContext,
	useEffect,
	useState,
	useContext,
	useCallback,
} from 'react'
import { User } from '../types'
import {
	getActiveUsername,
	getUserByUsername,
	setActiveUsername,
	toUser,
	updateStoredUser,
	upsertUser,
	StoredUser,
} from '../Utils/localStorage'

interface AuthContext {
	login: (user: StoredUser) => void
	logout: () => void
	currentUser: User | null | false
	updateUser: (user: User) => void
}

const authContext = createContext({} as AuthContext)

const useAuth = () => {
	const [currentUser, setCurrentUser] = useState<User | null | false>(null)
	const toast = useToast()

	const logout = useCallback(() => {
		setActiveUsername(null)
		setCurrentUser(false)
		toast({
			status: 'success',
			description: 'Logged out...',
		})
	}, [toast])

	const hydrateUser = useCallback(() => {
		const activeUsername = getActiveUsername()
		if (!activeUsername) {
			setCurrentUser(false)
			return
		}
		const storedUser = getUserByUsername(activeUsername)
		if (storedUser) {
			setCurrentUser(toUser(storedUser))
		} else {
			setCurrentUser(false)
		}
	}, [])

	useEffect(() => {
		if (currentUser === null) {
			hydrateUser()
		}
	}, [currentUser, hydrateUser])

	const login = useCallback((user: StoredUser) => {
		upsertUser(user)
		setActiveUsername(user.username)
		setCurrentUser(toUser(user))
	}, [])

	const updateUser = useCallback((user: User) => {
		updateStoredUser(user.username, (storedUser) => ({
			...storedUser,
			...user,
		}))
		setCurrentUser(user)
	}, [])

	return {
		currentUser,
		login,
		logout,
		updateUser,
	}
}
export const AuthProvider: React.FC = ({ children }) => {
	const auth = useAuth()
	return <authContext.Provider value={auth}>{children}</authContext.Provider>
}
export default function AuthConsumer() {
	return useContext(authContext)
}
