import {
	Box,
	Stack,
	Link,
	Button,
	Heading,
	useToast,
	Text,
	Center,
} from '@chakra-ui/react'
import useAuth from '../../Hooks/useAuth'

import { useForm, SubmitHandler } from 'react-hook-form'
import UserPassFormElements from './UserPassFormElements'
import UseThemeColors from '../../Hooks/useThemeColors'
import { useEffect } from 'react'
import { useNavigate, Link as BrowserLink, useLocation } from 'react-router-dom'
import LoadingTextField from '../Loading/LoadingTextField'
import { getUserByUsername } from '../../Utils/localStorage'

interface FormValues {
	username: string
	password: string
}
type LocationState = {
	state: {
		path: string
	}
}

const Login: React.FC = () => {
	const toast = useToast()
	const { login, currentUser } = useAuth()
	const { foregroundColor, backgroundColor, linkColor } = UseThemeColors()
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>()
	const navigate = useNavigate()
	const { state } = useLocation() as LocationState

	useEffect(() => {
		if (currentUser) {
			navigate(state?.path || '/profile')
		}
	}, [currentUser, navigate, state?.path])

	const onSubmit: SubmitHandler<FormValues> = async (value) => {
		const existingUser = getUserByUsername(value.username)
		if (!existingUser || existingUser.password !== value.password) {
			toast({
				status: 'error',
				description: 'Incorrect username or password',
			})
			return
		}
		login(existingUser)
		toast({
			status: 'success',
			description: 'Logged in. Redirecting...',
		})
	}
	if (currentUser === null) {
		return <LoadingTextField />
	}
	return (
		<Center minH={'70vh'}>
			<Stack spacing={8} mx={'auto'} maxW={'lg'} maxH={'100%'} px={6}>
				<Stack spacing={4} align={'center'}>
					<Heading textAlign={'center'} fontSize={'4xl'}>
						Sign in to your account
					</Heading>
					<Link as={BrowserLink} to={'/about'}>
						<Text color="whiteAlpha.800" as="u">
							What is a thought record?
						</Text>
					</Link>
				</Stack>
				<form onSubmit={handleSubmit(onSubmit)}>
					<Box rounded={'lg'} bg={foregroundColor} boxShadow={'lg'} p={8}>
						<UserPassFormElements register={register} errors={errors} />
						<Stack p={2} spacing={6}>
							<Stack
								direction={{ base: 'column', sm: 'row' }}
								align={'start'}
								spacing={4}
								justify={'space-between'}
							>
								<Link as={BrowserLink} color={linkColor} to={'/forgotpassword'}>
									Forgot password?
								</Link>
							</Stack>
							<Button
								type={'submit'}
								isLoading={isSubmitting}
								loadingText={'Submitting'}
								variant={'loginSubmit'}
								textColor={'white'}
								bg={backgroundColor}
								sx={{ _hover: { _disabled: { bg: backgroundColor } } }}
							>
								Sign in
							</Button>
							<Link
								as={BrowserLink}
								to="/signup"
								textAlign={'center'}
								color={linkColor}
							>
								New user? Sign up here!
							</Link>
						</Stack>
					</Box>
				</form>
			</Stack>
		</Center>
	)
}
export default Login
