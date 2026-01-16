import { Center, Heading, Link, Text, VStack } from '@chakra-ui/react'
import { BsGithub } from 'react-icons/bs'
import AboutText from './AboutText'

const ThoughtRecordExplination: React.FC = () => {
	return (
		<Center flexDirection={'column'} w={'100%'} p={4}>
			<Heading textAlign={'center'}>What and Why of Thought Records</Heading>
			<VStack spacing={3} mt={4} textAlign={'center'}>
				<Text color="whiteAlpha.800">
					This mobile-only version runs entirely on your device.
				</Text>
				<Text color="whiteAlpha.800">
					Video content has been removed to keep the app offline-friendly.
				</Text>
			</VStack>
			<AboutText />
			<Link href="https://github.com/kylehgc/CBTree">
				<BsGithub size={80} />
			</Link>
		</Center>
	)
}

export default ThoughtRecordExplination
