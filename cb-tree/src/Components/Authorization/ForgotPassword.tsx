import {
	Button,
	Flex,
	Heading,
	Input,
	Text,
	useToast,
	FormControl,
	FormLabel,
	FormErrorMessage,
} from '@chakra-ui/react'
import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form'
import { getUserByUsername, updateStoredUser } from '../../Utils/localStorage'
import { useNavigate } from 'react-router-dom'

interface FormValues {
	username: string
	password: string
	confirmPassword: string
}

const ForgotPassword: React.FC = () => {
	const toast = useToast()
	const navigate = useNavigate()
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>()

	const onSubmit: SubmitHandler<FormValues> = (values) => {
		if (values.password !== values.confirmPassword) {
			toast({
				status: 'warning',
				description: 'Passwords do not match',
			})
			return
		}
		const existingUser = getUserByUsername(values.username)
		if (!existingUser) {
			toast({
				status: 'error',
				description: 'No local account found for that username',
			})
			return
		}
		updateStoredUser(values.username, (user) => ({
			...user,
			password: values.password,
		}))
		toast({
			status: 'success',
			description: 'Password updated. Please sign in again.',
		})
		navigate('/login')
	}

	return (
		<Flex p={2} flexDir={'column'} height={'70vh'} justifyContent={'center'}>
			<Heading>Reset your local password</Heading>
			<Text
				color="white"
				m={2}
				size={'md'}
				mt={4}
				w={'full'}
				textAlign={'left'}
			>
				This app runs fully offline, so resets happen on this device.
			</Text>
			<form onSubmit={handleSubmit(onSubmit)}>
				<FormControl isInvalid={!!errors.username} mt={4}>
					<FormLabel>Username</FormLabel>
					<Input
						color="white"
						placeholder="username"
						{...register('username', { required: 'Username is required' })}
					/>
					<FormErrorMessage>{errors.username?.message}</FormErrorMessage>
				</FormControl>
				<FormControl isInvalid={!!errors.password} mt={4}>
					<FormLabel>New password</FormLabel>
					<Input
						color="white"
						type={'password'}
						placeholder="new password"
						{...register('password', {
							required: 'Password is required',
							minLength: { value: 4, message: 'Password is too short' },
						})}
					/>
					<FormErrorMessage>{errors.password?.message}</FormErrorMessage>
				</FormControl>
				<FormControl isInvalid={!!errors.confirmPassword} mt={4}>
					<FormLabel>Confirm password</FormLabel>
					<Input
						color="white"
						type={'password'}
						placeholder="confirm password"
						{...register('confirmPassword', {
							required: 'Please confirm your password',
						})}
					/>
					<FormErrorMessage>
						{errors.confirmPassword?.message}
					</FormErrorMessage>
				</FormControl>
				<Button isLoading={isSubmitting} mt={6} type="submit" variant={'submit'}>
					Update password
				</Button>
			</form>
		</Flex>
	)
}

export default ForgotPassword
