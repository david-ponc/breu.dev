import {
	Body,
	Button,
	Column,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Row,
	Section,
	Text,
} from '@react-email/components';

interface MagicLinkEmailProps {
	url: string;
	logoUrl: string;
}

export function MagicLinkEmail({ url, logoUrl }: MagicLinkEmailProps) {
	return (
		<Html lang='en'>
			<Head />
			<Preview>Your secure sign-in link to Breu. It expires in 5 minutes.</Preview>
			<Body
				style={{
					margin: '0',
					backgroundColor: '#f4f4f5',
					padding: '40px 16px',
					fontFamily: 'IBM Plex Sans, Arial, Helvetica, sans-serif',
				}}
			>
				<Container
					width='520'
					style={{ width: '100%', maxWidth: '520px', margin: '0 auto' }}
				>
					<Section
						style={{
							border: '1px solid #e4e4e7',
							borderRadius: '14px',
							backgroundColor: '#ffffff',
						}}
					>
						<Row>
							<Column style={{ padding: '32px 36px' }}>
								<Img
									src={logoUrl}
									alt='Breu'
									width='102'
									height='33'
									style={{ display: 'block', margin: '0 0 36px' }}
								/>
								<Text
									style={{
										margin: '0 0 8px',
										color: '#0369a1',
										fontSize: '12px',
										fontWeight: '700',
										letterSpacing: '1.2px',
										lineHeight: '1.4',
										textTransform: 'uppercase',
									}}
								>
									Sign-in link
								</Text>
								<Heading
									as='h1'
									style={{
										margin: '0 0 12px',
										color: '#09090b',
										fontSize: '28px',
										fontWeight: '600',
										letterSpacing: '-0.8px',
										lineHeight: '1.2',
									}}
								>
									Your link is ready
								</Heading>
								<Text
									style={{
										margin: '0 0 24px',
										color: '#52525b',
										fontSize: '16px',
										lineHeight: '1.6',
									}}
								>
									Use the secure link below to sign in to Breu.
								</Text>
								<Button
									href={url}
									style={{
										display: 'block',
										borderRadius: '9px',
										backgroundColor: '#7dd3fc',
										padding: '14px 20px',
										color: '#0c4a6e',
										fontSize: '15px',
										fontWeight: '700',
										lineHeight: '20px',
										textAlign: 'center',
										textDecoration: 'none',
									}}
								>
									Sign in to Breu
								</Button>
								<Text
									style={{
										margin: '16px 0 0',
										color: '#52525b',
										fontSize: '14px',
										lineHeight: '1.5',
									}}
								>
									This link expires in <strong>5 minutes</strong>.
								</Text>
								<Hr style={{ margin: '24px 0 16px', borderColor: '#e4e4e7' }} />
								<Text
									style={{
										margin: '0 0 6px',
										color: '#71717a',
										fontSize: '13px',
										lineHeight: '1.5',
									}}
								>
									If the button doesn’t work, use this link instead:
								</Text>
								<Link
									href={url}
									style={{
										color: '#0369a1',
										fontSize: '13px',
										lineHeight: '1.5',
										wordBreak: 'break-all',
									}}
								>
									Open sign-in link
								</Link>
							</Column>
						</Row>
					</Section>
					<Text
						style={{
							margin: '20px 24px 0',
							color: '#71717a',
							fontSize: '13px',
							lineHeight: '1.6',
							textAlign: 'center',
						}}
					>
						If you didn’t request this email, you can safely ignore it.
					</Text>
				</Container>
			</Body>
		</Html>
	);
}
