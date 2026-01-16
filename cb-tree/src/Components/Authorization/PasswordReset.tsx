import { Button, Heading, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'

const PasswordReset: React.FC = () => {
	const navigate = useNavigate()

	return (
		<VStack
			p={2}
			spacing={6}
			justifyContent={'center'}
			height={'60vh'}
			flexDir={'column'}
		>
			<Heading textAlign={'center'}>Reset links are disabled offline</Heading>
			<Text color="white" textAlign={'center'}>
				This app runs without external services, so reset links are not used.
				Update your password directly on this device instead.
			</Text>
			<Button variant="submit" onClick={() => navigate('/forgotpassword')}>
				Go to local reset
			</Button>
		</VStack>
	)
}

export default PasswordReset
