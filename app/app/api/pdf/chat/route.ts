// app/api/pdf/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { trackApiUsage, validateApiKey } from '@/lib/validate-key';
import OpenAI from 'openai';
import { PDFExtractionService } from '@/lib/pdf-extraction-service';
import { ChatSessionsService } from '@/lib/chat-sessions-service';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize-input';
import { log } from 'console';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const UPLOAD_DIR = join(process.cwd(), 'uploads');
const CHAT_SESSIONS_DIR = join(process.cwd(), 'chatsessions');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_MESSAGE_LENGTH = 5000; // Characters

// Ensure directories exist
async function ensureDirectories() {
  const dirs = [UPLOAD_DIR, CHAT_SESSIONS_DIR];
  for (const dir of dirs) {
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }
}

// Process user message with OpenAI
async function processUserMessage(sessionId: string, userMessage: string): Promise<string> {
  try {
    const session = await ChatSessionsService.getSession(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Sanitize user input
    const sanitizedMessage = sanitizeInput(userMessage);
    if (sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      throw new Error('Message exceeds maximum length');
    }

    // Truncate PDF content to avoid token limits (reduced to 50k for efficiency)
    const truncatedContent = session.pdfText.substring(0, 50000);
    const systemMessage = `You are ScanPro Assistant, powered by scanpro.cc. You answer questions about the uploaded PDF document. 
Document content: ${truncatedContent}

Rules:
1. Only answer questions related to the document
2. If the answer isn't in the document, say "I couldn't find that information in the document"
3. Be concise but comprehensive
4. Use Markdown for readability when appropriate
5. Maintain a professional and friendly tone`;

    // Create message history
    const messageHistory = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add current message
    const messages = [
      { role: 'system', content: systemMessage },
      ...messageHistory,
      { role: 'user', content: sanitizedMessage },
    ];

    // Call OpenAI API with retry logic
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini', // Upgraded to a more capable model
          messages: messages as any,
          temperature: 0.4, // Slightly increased for more natural responses
          max_tokens: 1200, // Increased for more detailed answers
        });

        const answer = response.choices[0].message.content || 'No response generated.';
        return sanitizeInput(answer); // Sanitize AI output
      } catch (error) {
        if (attempt === 3) {
          console.log('OpenAI API failed after retries', error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
      }
    }

    throw new Error('Failed to process message after retries');
  } catch (error) {
    console.log('Error processing user message', error);
    return 'Sorry, I encountered an issue processing your question. Please try again later.';
  }
}

// POST handler for uploading a PDF or sending a chat message
export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Get API key
    const headers = request.headers;
    const url = new URL(request.url);
    const apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');

    // Validate API key if provided
    if (apiKey) {
      const validation = await validateApiKey(apiKey, 'chat');
      if (!validation.valid) {
        console.log('Invalid API key', { apiKey });
        return NextResponse.json({ error: validation.error || 'Invalid API key' }, { status: 401 });
      }
      if (validation.userId) {
        trackApiUsage(validation.userId, 'chat');
      }
    }

    await ensureDirectories();

    const contentType = request.headers.get('content-type') || '';

    // Handle file upload
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;

      if (!file) {
        return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
      }

      // Validate file
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
      }

      // Create session and store file
      const sessionId = uuidv4();
      const inputPath = join(UPLOAD_DIR, `${sessionId}-chat.pdf`);
      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(inputPath, buffer);

      // Extract PDF text
      let pdfText;
      try {
        pdfText = await PDFExtractionService.extractText(inputPath);
      } catch (error) {
        console.log('PDF extraction failed', error);
        pdfText = '[Failed to extract text. The PDF may be encrypted or image-based.]';
      }

      // Create chat session
      await ChatSessionsService.createSession(sessionId, inputPath, pdfText);

      // Add branded welcome message
      const welcomeMessage = `Welcome to ScanPro (scanpro.cc)! I've successfully processed your PDF document "${file.name}". Ask me any questions about its contents, and I'll provide accurate answers based on the document.`;
      await ChatSessionsService.addMessage(sessionId, welcomeMessage, 'assistant');

      return NextResponse.json({
        success: true,
        message: welcomeMessage,
        sessionId,
        originalName: file.name,
      });
    }
    // Handle chat message
    else if (contentType.includes('application/json')) {
      const body = await request.json();
      const { sessionId, message } = body;

      if (!sessionId || !message) {
        return NextResponse.json(
          { error: 'Session ID and message are required' },
          { status: 400 }
        );
      }

      const session = await ChatSessionsService.getSession(sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Chat session not found or expired' }, { status: 404 });
      }

      // Add user message
      await ChatSessionsService.addMessage(sessionId, message, 'user');

      // Process message
      const response = await processUserMessage(sessionId, message);
      await ChatSessionsService.addMessage(sessionId, response, 'assistant');

      return NextResponse.json({
        success: true,
        message: response,
      });
    } else {
      return NextResponse.json(
        { error: 'Unsupported content type. Use multipart/form-data for uploads or application/json for messages.' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.log('POST request error', error);
    return NextResponse.json(
      { error: 'An error occurred during processing. Please try again.', success: false },
      { status: 500 }
    );
  }
}

// GET handler for retrieving chat history
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await ChatSessionsService.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      sessionId,
      messages: session.messages,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.log('GET request error', error);
    return NextResponse.json(
      { error: 'An error occurred retrieving the chat session', success: false },
      { status: 500 }
    );
  }
}

// DELETE handler for cleaning up sessions
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const session = await ChatSessionsService.getSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
    }

    // Delete session and associated file
    await ChatSessionsService.deleteSession(sessionId);
    const filePath = join(UPLOAD_DIR, `${sessionId}-chat.pdf`);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }

    return NextResponse.json({ success: true, message: 'Session deleted successfully' });
  } catch (error) {
    console.log('DELETE request error', error);
    return NextResponse.json(
      { error: 'An error occurred deleting the session', success: false },
      { status: 500 }
    );
  }
}