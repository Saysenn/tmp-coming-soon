import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { render } from "@react-email/render";
import ContactFormEmail from "@/emails/ContactFormEmail";

type ContactFormData = {
	name: string;
	email: string;
	phone: string;
	message: string;
	captchaToken: string | null;
	website?: string; // Honeypot field
};

// Rate limiting store (in-memory, resets on server restart)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // Max 5 requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
	return ip;
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
	const now = Date.now();
	const record = rateLimitStore.get(ip);

	// Clean up expired entries periodically
	if (rateLimitStore.size > 1000) {
		for (const [key, value] of rateLimitStore.entries()) {
			if (now > value.resetTime) {
				rateLimitStore.delete(key);
			}
		}
	}

	if (!record || now > record.resetTime) {
		rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
	}

	if (record.count >= RATE_LIMIT_MAX) {
		return { allowed: false, remaining: 0 };
	}

	record.count++;
	return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

// Sanitize input to prevent XSS in emails
function sanitizeInput(input: string): string {
	return input
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;");
}

// Strict email validation to block test/disposable emails
function validateEmailStrict(email: string): { valid: boolean; error?: string } {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return { valid: false, error: "Invalid email format" };
	}

	const normalizedEmail = email.toLowerCase().trim();
	const [localPart, domain] = normalizedEmail.split("@");

	// Block disposable/temporary email domains
	const blockedDomains = [
		"mailinator.com", "tempmail.com", "guerrillamail.com", "10minutemail.com",
		"throwaway.email", "fakeinbox.com", "trashmail.com", "tempinbox.com",
		"dispostable.com", "mailnesia.com", "maildrop.cc", "yopmail.com",
		"sharklasers.com", "getnada.com", "temp-mail.org", "mohmal.com",
		"fakemailgenerator.com", "emailondeck.com", "tempr.email", "discard.email",
		"mailsac.com", "mailcatch.com", "mytrashmail.com", "mt2009.com",
		"thankyou2010.com", "spam4.me", "grr.la", "guerrillamailblock.com",
		"pokemail.net", "spamgourmet.com", "armyspy.com", "cuvox.de",
		"dayrep.com", "einrot.com", "fleckens.hu", "gustr.com", "jourrapide.com",
		"rhyta.com", "superrito.com", "teleworm.us", "tempail.com",
	];

	// Block test/example domains
	const testDomains = [
		"example.com", "example.org", "example.net", "test.com", "test.org",
		"domain.com", "email.com", "sample.com", "demo.com", "fake.com",
		"invalid.com", "placeholder.com", "yoursite.com", "yourdomain.com",
		"mysite.com", "website.com", "company.com", "business.com",
	];

	// Check blocked domains
	if (blockedDomains.includes(domain)) {
		return { valid: false, error: "Please use a permanent email address" };
	}

	// Check test domains
	if (testDomains.includes(domain)) {
		return { valid: false, error: "Please use a real email address" };
	}

	// Block suspicious local parts that suggest test/fake emails
	const blockedLocalParts = [
		"test", "testing", "fake", "example", "sample", "demo", "dummy",
		"placeholder", "noreply", "no-reply", "donotreply", "nobody",
		"null", "void", "admin123", "user123", "asdf", "qwerty", "aaa",
		"xxx", "yyy", "zzz", "abc", "123", "temp", "temporary",
	];

	if (blockedLocalParts.includes(localPart)) {
		return { valid: false, error: "Please use a real email address" };
	}

	// Block emails with suspicious patterns
	const suspiciousPatterns = [
		/^test\d*@/,           // test, test1, test123, etc.
		/^fake\d*@/,           // fake, fake1, etc.
		/^user\d+@/,           // user1, user123, etc.
		/^temp\d*@/,           // temp, temp1, etc.
		/^[a-z]{1,2}\d{3,}@/,  // a123, ab1234, etc.
		/^(.)\1{4,}@/,         // aaaaa@, bbbbb@, etc.
	];

	for (const pattern of suspiciousPatterns) {
		if (pattern.test(normalizedEmail)) {
			return { valid: false, error: "Please use a real email address" };
		}
	}

	return { valid: true };
}

type TurnstileResponse = {
	success: boolean;
	"error-codes"?: string[];
};

// Email provider type
type EmailProvider = "smtp" | "resend";

// Get configured email provider
const getEmailProvider = (): EmailProvider => {
	const provider = process.env.EMAIL_PROVIDER?.toLowerCase();
	if (provider === "resend") return "resend";
	return "smtp"; // default to SMTP
};

// Send email via SMTP (Gmail, etc.)
async function sendViaSMTP(
	to: string,
	replyTo: string,
	subject: string,
	html: string,
	text: string
) {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT) || 587,
		secure: process.env.SMTP_SECURE === "true",
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	});

	await transporter.sendMail({
		from: `"Petronex Contact" <${process.env.SMTP_USER}>`,
		to,
		replyTo,
		subject,
		html,
		text,
	});

	console.log("[SMTP] Email sent successfully");
}

// Send email via Resend
async function sendViaResend(
	to: string,
	replyTo: string,
	subject: string,
	html: string
) {
	const resend = new Resend(process.env.RESEND_API_KEY);

	const { error } = await resend.emails.send({
		from: process.env.RESEND_FROM_EMAIL || "Petronex <noreply@petronex.co>",
		to: [to],
		replyTo: [replyTo],
		subject,
		html,
	});

	if (error) {
		throw new Error(error.message);
	}

	console.log("[Resend] Email sent successfully");
}

// Generate plain text fallback
const generatePlainText = (name: string, email: string, phone: string, message: string) => {
	return `
NEW CONTACT FORM SUBMISSION
============================

From: ${name}
Email: ${email}
Phone: ${phone}

${message ? `Message:\n${message}` : "No message provided"}

----
This email was sent from the contact form on petronex.co
	`.trim();
};

export async function POST(request: NextRequest) {
	try {
		// Rate limiting
		const ip = getRateLimitKey(request);
		const { allowed, remaining } = checkRateLimit(ip);

		if (!allowed) {
			return NextResponse.json(
				{ error: "Too many requests. Please try again later." },
				{
					status: 429,
					headers: {
						"Retry-After": "60",
						"X-RateLimit-Remaining": "0",
					},
				}
			);
		}

		const body: ContactFormData = await request.json();

		// Honeypot check - if this field is filled, it's a bot
		if (body.website) {
			// Silently reject but return success to not alert bots
			console.log("[Security] Honeypot triggered, rejecting submission");
			return NextResponse.json({
				success: true,
				message: "Your inquiry has been sent successfully",
			});
		}

		// Trim and sanitize inputs
		const name = sanitizeInput(body.name?.trim() || "");
		const email = body.email?.trim(); // Don't sanitize email, validate instead
		const phone = sanitizeInput(body.phone?.trim() || "");
		const message = sanitizeInput(body.message?.trim() || "");
		const captchaToken = body.captchaToken;

		// Validate required fields
		if (!name || !email || !phone || !message) {
			return NextResponse.json(
				{ error: "All fields are required" },
				{ status: 400 }
			);
		}

		// Validate minimum lengths
		if (name.length < 2) {
			return NextResponse.json(
				{ error: "Name must be at least 2 characters" },
				{ status: 400 }
			);
		}

		if (message.length < 5) {
			return NextResponse.json(
				{ error: "Message must be at least 5 characters" },
				{ status: 400 }
			);
		}

		// Validate email format and block test/disposable emails
		const emailValidation = validateEmailStrict(email);
		if (!emailValidation.valid) {
			return NextResponse.json(
				{ error: emailValidation.error },
				{ status: 400 }
			);
		}

		// Turnstile verification (if configured)
		const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY;

		if (turnstileSecretKey && !turnstileSecretKey.includes("your_")) {
			if (!captchaToken) {
				return NextResponse.json(
					{ error: "Captcha token missing" },
					{ status: 400 }
				);
			}

			const verifyResponse = await fetch(
				"https://challenges.cloudflare.com/turnstile/v0/siteverify",
				{
					method: "POST",
					headers: { "Content-Type": "application/x-www-form-urlencoded" },
					body: new URLSearchParams({
						secret: turnstileSecretKey,
						response: captchaToken,
					}),
				}
			);

			const verification: TurnstileResponse = await verifyResponse.json();

			if (!verification.success) {
				console.error("Turnstile verification failed:", verification["error-codes"]);
				return NextResponse.json(
					{ error: "Captcha verification failed" },
					{ status: 400 }
				);
			}
		}

		// Send email
		const contactEmail = process.env.CONTACT_EMAIL || "sales@petronex.co";
		const provider = getEmailProvider();

		console.log(`[Email] Using provider: ${provider}`);

		if (provider === "resend" && process.env.RESEND_API_KEY) {
			// Use Resend with pre-rendered HTML
			const emailComponent = ContactFormEmail({ name, email, phone, message });
			const html = await render(emailComponent);
			await sendViaResend(contactEmail, email, `[Contact Form] Inquiry from ${name}`, html);
		} else if (process.env.SMTP_HOST) {
			// Use SMTP with rendered HTML
			const emailComponent = ContactFormEmail({ name, email, phone, message });
			const html = await render(emailComponent);
			const text = generatePlainText(name, email, phone, message);
			await sendViaSMTP(contactEmail, email, `[Contact Form] Inquiry from ${name}`, html, text);
		} else {
			// No email provider configured - log only
			console.warn("[Email] No provider configured. Logging submission:");
			console.log({ name, email, phone, message, timestamp: new Date().toISOString() });
		}

		return NextResponse.json(
			{
				success: true,
				message: "Your inquiry has been sent successfully",
			},
			{
				headers: {
					"X-RateLimit-Remaining": remaining.toString(),
				},
			}
		);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		console.error("Contact form error:", errorMessage);
		return NextResponse.json(
			{ error: `Email failed: ${errorMessage}` },
			{ status: 500 }
		);
	}
}
