import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function POST(request: NextRequest) {
    try {
        // Parse the incoming JSON body
        const body = await request.json();

        // Validate required fields
        const { name, email, subject, message } = body;
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get authenticated email address from environment variables
        const authenticatedEmail = process.env.SMTP_USER;

        // Make sure we have the required environment variables
        if (!authenticatedEmail || !process.env.CONTACT_RECIPIENT_EMAIL) {
            console.error('Missing required environment variables for email sending');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Send email using the authenticated email as the sender
        await transporter.sendMail({
            from: authenticatedEmail, // Use the authenticated email address
            to: process.env.CONTACT_RECIPIENT_EMAIL,
            replyTo: email, // Set reply-to as the user's email
            subject: `New Contact Form Submission: ${subject}`,
            text: `
        New message from ${name} (${email})

        Subject: ${subject}

        Message:
        ${message}
      `,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <h3>Message:</h3>
          <p>${message}</p>
        </div>
      `
        });

        // Return success response
        return NextResponse.json(
            { message: 'Message sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Contact form submission error:', error);

        // Provide more detailed error message
        let errorMessage = 'Failed to send message';

        if (error instanceof Error) {
            // Check for specific nodemailer errors
            if (error.message.includes('Sender address rejected')) {
                errorMessage = 'Email configuration error: Sender address not authorized';
            } else if (error.message.includes('Invalid login')) {
                errorMessage = 'Email configuration error: Invalid SMTP credentials';
            } else if (error.message.includes('Connection refused')) {
                errorMessage = 'Email configuration error: Could not connect to email server';
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
