import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Img,
	Link,
	Preview,
	Section,
	Text,
} from "@react-email/components";

type Props = {
	name: string;
	email: string;
	phone: string;
	message?: string;
};

export default function ContactFormEmail({ name, email, phone, message }: Props) {
	const currentYear = new Date().getFullYear();

	return (
		<Html>
			<Head />
			<Preview>New contact form submission from {name}</Preview>
			<Body style={main}>
				<Container style={container}>
					{/* Header */}
					<Section style={header}>
						<Img
							src="https://petronex.co/logo.webp"
							alt="Petronex"
							height="50"
							style={logo}
						/>
						<Heading style={headerTitle}>New Contact Form Submission</Heading>
						<Text style={headerDate}>
							{new Date().toLocaleDateString("en-US", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</Text>
					</Section>

					{/* Content */}
					<Section style={content}>
						{/* Sender Card */}
						<Section style={senderCard}>
							<table>
								<tr>
									<td style={avatarCell}>
										<div style={avatar}>{name.charAt(0).toUpperCase()}</div>
									</td>
									<td style={senderInfo}>
										<Text style={senderName}>{name}</Text>
										<Link href={`mailto:${email}`} style={senderEmail}>
											{email}
										</Link>
										{phone && (
											<Text style={senderPhone}>
												<Link href={`tel:${phone}`} style={senderPhoneLink}>{phone}</Link>
											</Text>
										)}
									</td>
								</tr>
							</table>
						</Section>

						{/* Message */}
						{message ? (
							<Section style={fieldSection}>
								<Text style={fieldLabel}>Message</Text>
								<Section style={messageBox}>
									<Text style={messageText}>{message}</Text>
								</Section>
							</Section>
						) : (
							<Section style={fieldSection}>
								<Text style={noMessage}>No message provided</Text>
							</Section>
						)}

						{/* Reply Button */}
						<Section style={buttonSection}>
							<Button
								href={`mailto:${email}`}
								style={replyButton}
							>
								Reply to {name.split(" ")[0]}
							</Button>
						</Section>
					</Section>

					<Hr style={divider} />

					{/* Footer */}
					<Section style={footer}>
						<Text style={footerText}>
							This email was sent from the contact form on
						</Text>
						<Link href="https://petronex.co" style={footerLink}>
							petronex.co
						</Link>
						<Text style={copyright}>
							© {currentYear} Petronex Resources PTE Ltd. All rights reserved.
						</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

// Styles
const main = {
	backgroundColor: "#f8fafb",
	fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
};

const container = {
	maxWidth: "600px",
	margin: "0 auto",
	backgroundColor: "#ffffff",
	borderRadius: "16px",
	overflow: "hidden" as const,
	boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
};

const header = {
	background: "linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)",
	padding: "40px 30px",
	textAlign: "center" as const,
};

const logo = {
	margin: "0 auto 20px",
};

const headerTitle = {
	color: "#ffffff",
	fontSize: "24px",
	fontWeight: "600",
	margin: "0",
};

const headerDate = {
	color: "rgba(255,255,255,0.8)",
	fontSize: "14px",
	margin: "10px 0 0",
};

const content = {
	padding: "40px 30px",
};

const senderCard = {
	backgroundColor: "#f8fafb",
	borderRadius: "12px",
	padding: "24px",
	marginBottom: "30px",
};

const avatarCell = {
	width: "50px",
	verticalAlign: "top" as const,
};

const avatar = {
	width: "50px",
	height: "50px",
	background: "linear-gradient(135deg, #e53935 0%, #c81d25 100%)",
	borderRadius: "50%",
	color: "#ffffff",
	fontSize: "20px",
	fontWeight: "600" as const,
	lineHeight: "50px",
	textAlign: "center" as const,
};

const senderInfo = {
	paddingLeft: "16px",
	verticalAlign: "top" as const,
};

const senderName = {
	margin: "0 0 4px",
	color: "#1e3a5f",
	fontSize: "18px",
	fontWeight: "600",
};

const senderEmail = {
	color: "#e53935",
	fontSize: "14px",
	textDecoration: "none",
};

const senderPhone = {
	margin: "4px 0 0",
	fontSize: "14px",
};

const senderPhoneLink = {
	color: "#546e7a",
	textDecoration: "none",
};

const fieldSection = {
	marginBottom: "24px",
};

const fieldLabel = {
	margin: "0 0 8px",
	color: "#90a4ae",
	fontSize: "12px",
	textTransform: "uppercase" as const,
	letterSpacing: "1px",
	fontWeight: "600",
};

const messageBox = {
	backgroundColor: "#f8fafb",
	borderLeft: "4px solid #e53935",
	padding: "20px",
	borderRadius: "0 8px 8px 0",
};

const messageText = {
	margin: "0",
	color: "#546e7a",
	fontSize: "15px",
	lineHeight: "1.6",
	whiteSpace: "pre-wrap" as const,
};

const noMessage = {
	margin: "0",
	color: "#90a4ae",
	fontSize: "14px",
	fontStyle: "italic" as const,
};

const buttonSection = {
	textAlign: "center" as const,
	paddingTop: "20px",
};

const replyButton = {
	background: "linear-gradient(135deg, #e53935 0%, #c81d25 100%)",
	color: "#ffffff",
	padding: "14px 32px",
	borderRadius: "50px",
	fontSize: "14px",
	fontWeight: "600",
	textTransform: "uppercase" as const,
	letterSpacing: "0.5px",
	textDecoration: "none",
};

const divider = {
	borderColor: "#e8eef2",
	margin: "0",
};

const footer = {
	backgroundColor: "#f8fafb",
	padding: "30px",
	textAlign: "center" as const,
};

const footerText = {
	margin: "0 0 10px",
	color: "#90a4ae",
	fontSize: "13px",
};

const footerLink = {
	color: "#1e3a5f",
	fontWeight: "600",
	fontSize: "14px",
	textDecoration: "none",
};

const copyright = {
	margin: "20px 0 0",
	color: "#b0bec5",
	fontSize: "12px",
};
