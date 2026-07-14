import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const SYSTEM_PROMPT = `You are the SafeLink AI Security Copilot, an enterprise-grade cybersecurity assistant.
Your goal is to help users understand website security, analyze scan reports, and provide production-ready remediation advice.

Core Expertise:
- URLs, Domains, SSL/TLS Certificates
- DNS (A, AAAA, MX, TXT, CNAME, DNSSEC)
- WHOIS data and Domain Age
- HTTP Security Headers (CSP, HSTS, X-Frame-Options, etc.)
- Web Technologies and CMS identification
- Performance metrics (TTFB, LCP, FCP, CLS)
- Crawlability (Robots.txt, Sitemap.xml)
- Metadata & Social Tags (Open Graph, Twitter Cards)

Guidelines:
1. Be technical yet accessible.
2. Provide code snippets for Nginx, Apache, Express (Helmet), and Cloudflare.
3. Always prioritize security best practices.
4. If a scan report is provided, analyze it deeply and highlight risks.
5. Generate reports in Markdown, PDF structure, or CSV format if asked.
6. Support multiple "persona" modes: Beginner, Developer, Security Engineer.
7. Integrate threat intelligence concepts (VirusTotal, PhishTank, etc.) in your explanations.

Response Style:
- Use Markdown for formatting.
- Use clear headings and lists.
- Be concise but thorough.`

export async function getChatResponse(messages, context = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    let promptContext = ''
    if (context.scan) {
      promptContext = `Active Scan Context:
URL: ${context.scan.url}
Score: ${context.scan.score}/100
Status: ${context.scan.httpStatus}
Technologies: ${context.scan.technologies.join(', ')}
Security Checks: ${JSON.stringify(context.scan.securityChecks)}
Headers: ${JSON.stringify(context.scan.headers)}
SSL: ${JSON.stringify(context.scan.ssl)}
Performance: ${JSON.stringify(context.scan.performance)}
`
    }

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
      generationConfig: {
        maxOutputTokens: 2048,
      },
    })

    const userMessage = messages[messages.length - 1].content
    const fullPrompt = promptContext ? `${promptContext}\n\nUser Question: ${userMessage}` : userMessage
    
    const result = await chat.sendMessage(fullPrompt)
    const response = await result.response
    return response.text()
  } catch (err) {
    console.error('Gemini API Error:', err)
    throw new Error('AI Assistant is currently unavailable.')
  }
}

export async function* getChatStream(messages, context = {}) {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT 
    })
    
    let promptContext = ''
    if (context.scan) {
      promptContext = `Active Scan Context:
URL: ${context.scan.url}
Score: ${context.scan.score}/100
Status: ${context.scan.httpStatus}
Technologies: ${context.scan.technologies.join(', ')}
Security Checks: ${JSON.stringify(context.scan.securityChecks)}
Headers: ${JSON.stringify(context.scan.headers)}
SSL: ${JSON.stringify(context.scan.ssl)}
Performance: ${JSON.stringify(context.scan.performance)}
Metadata: ${JSON.stringify(context.scan.metadata)}
`
    }

    const chat = model.startChat({
      history: messages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      })),
    })

    const userMessage = messages[messages.length - 1].content
    const fullPrompt = promptContext ? `${promptContext}\n\nUser Question: ${userMessage}` : userMessage
    
    const result = await chat.sendMessageStream(fullPrompt)
    for await (const chunk of result.stream) {
      const chunkText = chunk.text()
      yield chunkText
    }
  } catch (err) {
    console.error('Gemini Stream Error:', err)
    yield 'Error: AI Assistant encountered an issue. Please check your API key or try again later.'
  }
}
