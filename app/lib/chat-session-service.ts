// lib/chat-sessions-service.ts
import { writeFile, readFile, access } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { constants } from 'fs';

// Types for chat sessions
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  pdfPath: string;
  createdAt: string;
  pdfText: string;
  messages: ChatMessage[];
}

/**
 * Service for managing PDF chat sessions
 */
export class ChatSessionsService {
  private static CHAT_SESSIONS_DIR = join(process.cwd(), 'chatsessions');

  /**
   * Ensure the chat sessions directory exists
   */
  static async ensureDirectory(): Promise<void> {
    const { mkdir } = await import('fs/promises');
    
    if (!existsSync(this.CHAT_SESSIONS_DIR)) {
      await mkdir(this.CHAT_SESSIONS_DIR, { recursive: true });
    }
  }

  /**
   * Create a new chat session
   * 
   * @param sessionId - Unique ID for the session
   * @param pdfPath - Path to the PDF file
   * @param pdfText - Extracted text from the PDF
   * @returns The created chat session
   */
  static async createSession(
    sessionId: string,
    pdfPath: string,
    pdfText: string
  ): Promise<ChatSession> {
    await this.ensureDirectory();
    
    const sessionFile = join(this.CHAT_SESSIONS_DIR, `${sessionId}.json`);
    const session: ChatSession = {
      id: sessionId,
      pdfPath,
      createdAt: new Date().toISOString(),
      pdfText,
      messages: []
    };
    
    await writeFile(sessionFile, JSON.stringify(session, null, 2));
    return session;
  }

  /**
   * Get a chat session by ID
   * 
   * @param sessionId - ID of the session to retrieve
   * @returns The chat session or null if not found
   */
  static async getSession(sessionId: string): Promise<ChatSession | null> {
    await this.ensureDirectory();
    
    const sessionFile = join(this.CHAT_SESSIONS_DIR, `${sessionId}.json`);
    
    try {
      await access(sessionFile, constants.R_OK);
      const sessionData = await readFile(sessionFile, 'utf-8');
      return JSON.parse(sessionData) as ChatSession;
    } catch (error) {
      // File doesn't exist or can't be read
      return null;
    }
  }

  /**
   * Add a message to a chat session
   * 
   * @param sessionId - ID of the session
   * @param message - Message to add
   * @param role - Role of the message sender ('user' or 'assistant')
   * @returns Updated chat session or null if session not found
   */
  static async addMessage(
    sessionId: string,
    message: string,
    role: 'user' | 'assistant'
  ): Promise<ChatSession | null> {
    const session = await this.getSession(sessionId);
    
    if (!session) {
      return null;
    }
    
    const newMessage: ChatMessage = {
      role,
      content: message,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(newMessage);
    
    const sessionFile = join(this.CHAT_SESSIONS_DIR, `${sessionId}.json`);
    await writeFile(sessionFile, JSON.stringify(session, null, 2));
    
    return session;
  }

  /**
   * Get messages for a session
   * 
   * @param sessionId - ID of the session
   * @returns Array of messages or empty array if session not found
   */
  static async getMessages(sessionId: string): Promise<ChatMessage[]> {
    const session = await this.getSession(sessionId);
    return session?.messages || [];
  }

  /**
   * Clean up old sessions (can be run periodically)
   * 
   * @param maxAgeHours - Maximum age of sessions to keep (in hours)
   * @returns Number of sessions deleted
   */
  static async cleanupOldSessions(maxAgeHours: number = 24): Promise<number> {
    const { readdir, unlink } = await import('fs/promises');
    await this.ensureDirectory();
    
    const files = await readdir(this.CHAT_SESSIONS_DIR);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const sessionFile = join(this.CHAT_SESSIONS_DIR, file);
        const sessionData = await readFile(sessionFile, 'utf-8');
        const session = JSON.parse(sessionData) as ChatSession;
        
        const createdAt = new Date(session.createdAt).getTime();
        const ageHours = (now - createdAt) / (1000 * 60 * 60);
        
        if (ageHours > maxAgeHours) {
          await unlink(sessionFile);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error processing session file ${file}:`, error);
      }
    }
    
    return deletedCount;
  }
}

export default ChatSessionsService;