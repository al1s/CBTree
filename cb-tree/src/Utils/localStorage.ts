import { ThoughtRecord, User } from '../types'

export type StoredUser = User & { password: string }
export type BackupData = {
	version: number
	activeUsername: string | null
	users: StoredUser[]
	records: ThoughtRecord[]
}

const USERS_KEY = 'cbtreeUsers'
const ACTIVE_USER_KEY = 'cbtreeActiveUser'
const RECORDS_KEY = 'cbtreeThoughtRecords'
const BACKUP_VERSION = 1

const parseJson = <T>(value: string | null, fallback: T): T => {
	if (!value) {
		return fallback
	}
	try {
		return JSON.parse(value) as T
	} catch {
		return fallback
	}
}

export const loadUsers = (): StoredUser[] =>
	parseJson<StoredUser[]>(localStorage.getItem(USERS_KEY), [])

export const saveUsers = (users: StoredUser[]) => {
	localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export const getUserByUsername = (username: string) =>
	loadUsers().find((user) => user.username === username)

export const upsertUser = (user: StoredUser) => {
	const users = loadUsers()
	const index = users.findIndex((entry) => entry.username === user.username)
	if (index >= 0) {
		users[index] = user
	} else {
		users.push(user)
	}
	saveUsers(users)
}

export const updateStoredUser = (
	username: string,
	updater: (user: StoredUser) => StoredUser,
) => {
	const users = loadUsers()
	const index = users.findIndex((entry) => entry.username === username)
	if (index < 0) {
		return null
	}
	const updated = updater(users[index])
	users[index] = updated
	saveUsers(users)
	return updated
}

export const setActiveUsername = (username: string | null) => {
	if (username) {
		localStorage.setItem(ACTIVE_USER_KEY, username)
		return
	}
	localStorage.removeItem(ACTIVE_USER_KEY)
}

export const getActiveUsername = () => localStorage.getItem(ACTIVE_USER_KEY)

export const toUser = (user: StoredUser): User => {
	const { password, ...rest } = user
	return rest
}

export const loadThoughtRecords = (): ThoughtRecord[] =>
	parseJson<ThoughtRecord[]>(localStorage.getItem(RECORDS_KEY), [])

export const saveThoughtRecords = (records: ThoughtRecord[]) => {
	localStorage.setItem(RECORDS_KEY, JSON.stringify(records))
}

export const getBackupData = (): BackupData => ({
	version: BACKUP_VERSION,
	activeUsername: getActiveUsername(),
	users: loadUsers(),
	records: loadThoughtRecords(),
})

export const restoreBackupData = (data: BackupData) => {
	if (data.version !== BACKUP_VERSION) {
		throw new Error('Unsupported backup version')
	}
	saveUsers(data.users)
	saveThoughtRecords(data.records)
	setActiveUsername(data.activeUsername)
}
