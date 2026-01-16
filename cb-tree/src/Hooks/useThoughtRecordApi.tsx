import { useState } from 'react'
import useAuth from './useAuth'
import { FormValues, ThoughtRecord, isThoughtRecord, User } from '../types'
import {
	loadThoughtRecords,
	saveThoughtRecords,
} from '../Utils/localStorage'

/* returns a function that takes in the current path and active thought record 
 to update and a piece of state that shows if the data is currently being fetched */

type FetchThoughtRecord = () => Promise<ThoughtRecord>

interface useThoughtRecordReturn {
	deleteThoughtRecord: (thoughtRecord: string) => Promise<string>
	getActiveThoughtRecord: FetchThoughtRecord
	getNewThoughtRecord: FetchThoughtRecord
	getAllThoughtRecords: () => Promise<ThoughtRecord[]>
	updateThoughtRecord: (
		data: FormValues,
		activeThoughtRecord: string,
		updateKey: string,
	) => Promise<ThoughtRecord>
	saveThoughtRecord: () => Promise<User>
	editThoughtRecord: (thoughtRecordId: string) => Promise<ThoughtRecord>
	isSubmitting: boolean
}

const createThoughtRecord = (username: string): ThoughtRecord => {
	const recordKey = `${Date.now()}-${Math.random().toString(16).slice(2)}`
	return {
		key: recordKey,
		userKey: username,
		timeCreated: Date.now(),
	}
}

const useThoughtRecordApi = (): useThoughtRecordReturn => {
	const { currentUser, logout, updateUser } = useAuth()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const requireUser = () => {
		if (!currentUser) {
			logout()
			throw Error('Not signed in')
		}
		return currentUser
	}

	const getUserRecords = (username: string) =>
		loadThoughtRecords().filter((record) => record.userKey === username)

	const saveUserRecords = (username: string, records: ThoughtRecord[]) => {
		const otherRecords = loadThoughtRecords().filter(
			(record) => record.userKey !== username,
		)
		saveThoughtRecords([...otherRecords, ...records])
	}

	const updateUserState = (user: User) => {
		updateUser(user)
	}

	const handleAction = async <T,>(action: () => T): Promise<T> => {
		if (isSubmitting) {
			throw Error('Already submitting')
		}
		setIsSubmitting(true)
		const result = action()
		setIsSubmitting(false)
		return result
	}

	const getActiveThoughtRecord = async (): Promise<ThoughtRecord> =>
		handleAction(() => {
			const user = requireUser()
			const records = getUserRecords(user.username)
			const activeRecord = user.activeThoughtRecord
				? records.find((record) => record.key === user.activeThoughtRecord)
				: undefined
			if (activeRecord && isThoughtRecord(activeRecord)) {
				return activeRecord
			}
			const newRecord = createThoughtRecord(user.username)
			saveUserRecords(user.username, [...records, newRecord])
			updateUserState({
				...user,
				activeThoughtRecord: newRecord.key,
				thoughtRecords: Array.from(
					new Set([...(user.thoughtRecords || []), newRecord.key]),
				),
			})
			return newRecord
		})

	const getNewThoughtRecord = async (): Promise<ThoughtRecord> =>
		handleAction(() => {
			const user = requireUser()
			const records = getUserRecords(user.username)
			const newRecord = createThoughtRecord(user.username)
			saveUserRecords(user.username, [...records, newRecord])
			updateUserState({
				...user,
				activeThoughtRecord: newRecord.key,
				thoughtRecords: Array.from(
					new Set([...(user.thoughtRecords || []), newRecord.key]),
				),
			})
			return newRecord
		})

	const getAllThoughtRecords = async (): Promise<ThoughtRecord[]> =>
		handleAction(() => {
			const user = requireUser()
			return getUserRecords(user.username)
		})

	const saveThoughtRecord = async (): Promise<User> =>
		handleAction(() => {
			const user = requireUser()
			const updatedUser = {
				...user,
				activeThoughtRecord: null,
			}
			updateUserState(updatedUser)
			return updatedUser
		})

	const deleteThoughtRecord = async (thoughtRecord: string): Promise<string> =>
		handleAction(() => {
			const user = requireUser()
			const records = getUserRecords(user.username).filter(
				(record) => record.key !== thoughtRecord,
			)
			saveUserRecords(user.username, records)
			const updatedUser = {
				...user,
				thoughtRecords: user.thoughtRecords.filter(
					(record) => record !== thoughtRecord,
				),
				activeThoughtRecord:
					user.activeThoughtRecord === thoughtRecord
						? null
						: user.activeThoughtRecord,
			}
			updateUserState(updatedUser)
			return thoughtRecord
		})

	const editThoughtRecord = async (thoughtRecordId: string) =>
		handleAction(() => {
			const user = requireUser()
			const records = getUserRecords(user.username)
			const record = records.find((entry) => entry.key === thoughtRecordId)
			if (!record) {
				throw Error('Invalid return')
			}
			updateUserState({
				...user,
				activeThoughtRecord: record.key,
			})
			return record
		})

	const updateThoughtRecord = async (
		data: FormValues,
		activeThoughtRecord: string,
		updateKey: string,
	): Promise<ThoughtRecord> =>
		handleAction(() => {
			const user = requireUser()
			const records = getUserRecords(user.username)
			const index = records.findIndex(
				(record) => record.key === activeThoughtRecord,
			)
			if (index < 0) {
				throw Error('Record not found')
			}
			const updatedRecord = {
				...records[index],
				[updateKey]: data,
			}
			const updatedRecords = [...records]
			updatedRecords[index] = updatedRecord
			saveUserRecords(user.username, updatedRecords)
			return updatedRecord
		})

	return {
		deleteThoughtRecord,
		getAllThoughtRecords,
		updateThoughtRecord,
		getActiveThoughtRecord,
		getNewThoughtRecord,
		isSubmitting,
		saveThoughtRecord,
		editThoughtRecord,
	}
}

export default useThoughtRecordApi
