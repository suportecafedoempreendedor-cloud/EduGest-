import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'EduGest Angola AI Layer',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// EduGest AI Server Query Route
app.post('/api/edugest-ai/chat', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      assistantRole = 'direcao',
      schoolId,
      schoolName,
      userRole = 'school_admin',
      structuredContext,
      model = 'gemini-3.5-flash',
      useSearchGrounding = false,
      history = [],
    } = req.body;

    // Strict validation
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt obrigatório' });
    }

    if (!schoolId) {
      return res.status(400).json({ error: 'schoolId obrigatório para isolamento multi-tenant' });
    }

    // SQL Injection Detection Guardrail
    const sqlPatterns = [
      /\b(select\s+.+\s+from)\b/i,
      /\b(insert\s+into)\b/i,
      /\b(update\s+.+\s+set)\b/i,
      /\b(delete\s+from)\b/i,
      /\b(drop\s+(table|database|schema))\b/i,
      /\b(alter\s+table)\b/i,
      /\b(truncate\s+table)\b/i,
      /\b(union\s+select)\b/i,
      /\b(exec(\s+|\()|execute(\s+|\())\b/i,
      /(--|;\s*drop|;\s*delete|;\s*update)/i,
    ];
    if (sqlPatterns.some((pattern) => pattern.test(prompt))) {
      return res.status(403).json({
        error: 'Tentativa de execução de comando SQL arbitrário bloqueada.',
        type: 'SECURITY_VIOLATION',
      });
    }

    // If Gemini API is available, enrich with AI reasoning
    if (ai) {
      try {
        const systemInstruction = `Você é o EduGest AI, a inteligência artificial oficial integrada da plataforma EduGest Angola para o sistema de ensino angolano.
Você está prestando consultoria e apoio à decisão para a instituição "${schoolName || 'Escola Primária e Secundária'}" (ID: ${schoolId}).
Perfil do utilizador autenticado: ${userRole}.
Módulo/Assistente em execução: ${assistantRole}.

REGRAS DE CONFORMIDADE E SEGURANÇA ESTRITAS:
1. NUNCA envie ou mencione dados de outras instituições de ensino. O escopo é estritamente restrito a esta instituição.
2. NUNCA execute nem sugira comandos SQL arbitrários. Toda consulta aos dados deve ser referenciada por funções seguras tipadas.
3. NUNCA determine oficialmente aprovação, reprovação ou liquidação financeira de estudantes. Sempre reforce que a decisão oficial cabe ao Conselho Pedagógico de Notas e à Secretaria, em conformidade com o Ministério da Educação (MED).
4. Se o utilizador solicitar alteração de notas ou confirmação de pagamentos, explique com clareza que isso exige autorização humana expressa e um fluxo auditado.
5. Responda em Português de Angola de forma polida, executiva, precisa e analítica, utilizando terminologia oficial (Kwanza Kz, trimestres, pautas, director de turma, MED).
${
  structuredContext
    ? `DADOS HOMOLOGADOS CONSULTADOS ATRAVÉS DE FUNÇÕES SEGURAS:
${JSON.stringify(structuredContext, null, 2)}`
    : ''
}`;

        // Select model according to user choice:
        // Complex: gemini-3.1-pro-preview, Fast: gemini-3.1-flash-lite, General / Search Grounded: gemini-3.5-flash
        const selectedModel = useSearchGrounding ? 'gemini-3.5-flash' : model;
        const tools = useSearchGrounding ? [{ googleSearch: {} }] : undefined;

        // Assemble multi-turn contents
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          for (const msg of history) {
            if (msg && msg.text) {
              contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
              });
            }
          }
        }
        contents.push({
          role: 'user',
          parts: [{ text: prompt }],
        });

        const response = await ai.models.generateContent({
          model: selectedModel,
          contents,
          config: {
            systemInstruction,
            temperature: 0.2,
            tools,
          },
        });

        const textOutput = response.text || 'Processamento concluído com sucesso.';

        // Extract Google Search grounding metadata if present
        let searchMetadata: any = null;
        try {
          const candidate = response.candidates?.[0];
          if (candidate?.groundingMetadata) {
            searchMetadata = candidate.groundingMetadata;
          }
        } catch {
          // ignore
        }

        return res.json({
          text: textOutput,
          source: selectedModel,
          schoolId,
          searchGrounded: Boolean(useSearchGrounding),
          groundingMetadata: searchMetadata,
          timestamp: new Date().toISOString(),
        });
      } catch (geminiError: any) {
        console.warn('Gemini generateContent error, falling back to safe local engine:', geminiError?.message);
      }
    }

    // Graceful fallback response when API key is not active
    return res.json({
      text: null,
      source: 'safe-local-engine',
      schoolId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('EduGest AI endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Erro interno no processamento da IA' });
  }
});

// Audio Transcription Route with gemini-3.5-transcribe
app.post('/api/edugest-ai/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 obrigatório para transcrição' });
    }

    if (!ai) {
      return res.json({
        transcription: 'Transcrição simulada: A reunião do conselho pedagógico deliberou sobre o fecho do 2º trimestre lectivo.',
        source: 'local-fallback',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64,
            },
          },
          {
            text: 'Transcreva este áudio em português de Angola com máxima fidelidade e pontuação correta.',
          },
        ],
      },
    });

    return res.json({
      transcription: response.text || '',
      source: 'gemini-3.5-transcribe',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: error?.message || 'Falha ao transcrever áudio' });
  }
});

// School Image Creation & Editing Route with gemini-nano-banana-2.1
app.post('/api/edugest-ai/generate-image', async (req: Request, res: Response) => {
  try {
    const { prompt, aspectRatio = '1:1', baseImageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt obrigatório para geração de imagem' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Serviço de IA não configurado com chave de API' });
    }

    const parts: any[] = [];
    if (baseImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: baseImageBase64,
        },
      });
    }
    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
      model: 'gemini-nano-banana-2.1',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: '1K',
        },
      },
    });

    let imageUrl: string | null = null;
    let textDescription: string | null = null;

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          textDescription = part.text;
        }
      }
    }

    return res.json({
      imageUrl,
      description: textDescription,
      source: 'gemini-nano-banana-2.1',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Image generation error:', error);
    return res.status(500).json({ error: error?.message || 'Falha na geração de imagem com Gemini' });
  }
});

// Video Generation Route with veo-3.1-fast-generate-preview
app.post('/api/edugest-ai/generate-video', async (req: Request, res: Response) => {
  try {
    const { prompt, imageBase64, aspectRatio = '16:9' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt obrigatório para geração de vídeo' });
    }

    if (!ai) {
      return res.status(503).json({ error: 'Serviço de IA não configurado com chave de API' });
    }

    const videoConfig: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt,
      config: {
        aspectRatio: aspectRatio === '9:16' ? '9:16' : '16:9',
      },
    };

    if (imageBase64) {
      videoConfig.image = {
        imageBytes: imageBase64,
        mimeType: 'image/jpeg',
      };
    }

    const operation = await (ai.models as any).generateVideos(videoConfig);

    return res.json({
      operationName: operation?.name || 'operation-' + Date.now(),
      status: 'pending',
      model: 'veo-3.1-fast-generate-preview',
      aspectRatio,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Video generation error:', error);
    return res.status(500).json({ error: error?.message || 'Falha na geração de vídeo com Veo' });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EduGest Angola server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
