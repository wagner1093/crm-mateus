import { OpenAI } from 'openai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const openai = new OpenAI({ apiKey });

    const { messages, context } = await req.json();

    const systemMessage = {
      role: 'system',
      content: `Você é o Assistente IA do CRM MATEUS, uma inteligência especializada em gestão de agências.
      
Contexto atual da agência:
${JSON.stringify(context, null, 2)}

Suas capacidades:
1. Analisar faturamento e saúde financeira.
2. Fornecer detalhes sobre leads e pipeline.
3. Resumir atividades de clientes e equipe.
4. Dar conselhos estratégicos para aumentar o lucro.

Regras:
- Seja executivo, profissional e direto.
- Use os dados do contexto para responder perguntas específicas.
- Se não tiver certeza de um dado, admita e sugira onde encontrar no CRM.
- Responda sempre em Português do Brasil.`
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ 
      content: response.choices[0].message.content 
    }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('AI Error:', error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
