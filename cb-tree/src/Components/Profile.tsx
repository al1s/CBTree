import {
	Button,
	ButtonGroup,
	Heading,
	VStack,
	Text,
	Link,
	Center,
	Divider,
	useToast,
} from '@chakra-ui/react'
import { BsGithub } from 'react-icons/bs'
import { useNavigate, Link as BrowserLink } from 'react-router-dom'
import useAuth from '../Hooks/useAuth'
import useThoughtRecordApi from '../Hooks/useThoughtRecordApi'
import { ChangeEvent, useRef } from 'react'
import {
	getBackupData,
	restoreBackupData,
} from '../Utils/localStorage'

const Profile = () => {
	const { getNewThoughtRecord, editThoughtRecord, isSubmitting } =
		useThoughtRecordApi()
	const navigate = useNavigate()
	const toast = useToast()
	const fileInputRef = useRef<HTMLInputElement | null>(null)
	const handleEdit = async (thoughtRecordId: string) => {
		const thoughtRecord = await editThoughtRecord(thoughtRecordId)
		navigate('/emotion', { state: { ...thoughtRecord } })
	}
	const handleNewThoughtRecord = async () => {
		await getNewThoughtRecord()
		navigate('/emotion')
	}
	const { currentUser } = useAuth()
	if (!currentUser) {
		navigate('/login')
		return <></>
	}

	const userName = currentUser.firstName || currentUser.username.split('@')[0]
	const { thoughtRecords, activeThoughtRecord } = currentUser

	const handleBackupDownload = () => {
		const data = getBackupData()
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: 'application/json',
		})
		const url = URL.createObjectURL(blob)
		const anchor = document.createElement('a')
		anchor.href = url
		anchor.download = `cbtree-backup-${Date.now()}.json`
		document.body.appendChild(anchor)
		anchor.click()
		anchor.remove()
		URL.revokeObjectURL(url)
	}

	const handleBackupRestore = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0]
		if (!file) {
			return
		}
		try {
			const text = await file.text()
			const data = JSON.parse(text)
			restoreBackupData(data)
			toast({
				status: 'success',
				description: 'Backup restored. Reloading…',
			})
			window.location.reload()
		} catch (error) {
			if (error instanceof Error) {
				toast({
					status: 'error',
					description: error.message || 'Unable to restore backup.',
				})
			}
		} finally {
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}
	}
	return (
		<>
			<Center minH={'70vh'}>
				<VStack textAlign={'center'} spacing={10} mt={2}>
					<Heading>Welcome to CBTree {userName}</Heading>

					<Link as={BrowserLink} to={'/about'}>
						<Text color="whiteAlpha.800" as="u">
							What is a thought record?
						</Text>
					</Link>
					<ButtonGroup spacing={6} size={'lg'}>
						<Link as={BrowserLink} to="/thoughtrecords">
							<Button disabled={!!thoughtRecords} isLoading={isSubmitting}>
								View
							</Button>
						</Link>
						<Button isLoading={isSubmitting} onClick={handleNewThoughtRecord}>
							New
						</Button>
						<Button
							disabled={!activeThoughtRecord}
							onClick={() => handleEdit(activeThoughtRecord || '')}
							isLoading={isSubmitting}
						>
							Edit
						</Button>
					</ButtonGroup>
					<Divider borderColor="whiteAlpha.300" />
					<VStack spacing={4}>
						<Text fontWeight="bold">Backup your data</Text>
						<Button onClick={handleBackupDownload} variant="outline">
							Download backup
						</Button>
						<Button
							onClick={() => fileInputRef.current?.click()}
							variant="outline"
						>
							Restore from file
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept="application/json"
							onChange={handleBackupRestore}
							style={{ display: 'none' }}
						/>
					</VStack>
					<Text color={'white'} p={2} fontSize={14}>
						If you have any questions or concerns Contact us at:{' '}
						<Link href={'mailto:kylehgc@gmail.com'}>
							<Text color={'whiteAlpha.800'} as="u">
								kylehgc@gmail.com
							</Text>
						</Link>
					</Text>
					<Link href="https://github.com/kylehgc/CBTree">
						<BsGithub size={80} />
					</Link>
				</VStack>
			</Center>
		</>
	)
}

export default Profile
