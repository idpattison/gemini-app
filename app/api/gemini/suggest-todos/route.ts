import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// Initialize Gemini
const GEMINI_API_KEY = process.env.GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { todos } = await request.json(); // Expects an array of todo strings

    if (!Array.isArray(todos)) {
      return NextResponse.json({ error: 'Invalid input: todos must be an array' }, { status: 400 });
    }

    const todoListString = todos.join(', '); // Convert array to comma-separated string

    // Construct the prompt for Gemini
    const prompt = `
      Based on the following list of tasks, suggest 3 new and distinct todo items.
      The suggestions should be varied and realistic, potentially related to personal life, work, hobbies, or self-improvement.
      Format the output as a JSON array of strings, like this:
      ["Suggestion 1", "Suggestion 2", "Suggestion 3"]

      Current tasks: ${todoListString}
    `;

    // Generate content using Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Attempt to parse the JSON response
    let suggestedTodos: string[] = [];
    try {
      // Clean up potential markdown code block formatting
      const cleanedText = text.replace(/```json\n/g, '').replace(/\n```/g, '').trim();
      suggestedTodos = JSON.parse(cleanedText);
      if (!Array.isArray(suggestedTodos) || suggestedTodos.some(item => typeof item !== 'string')) {
        throw new Error('Parsed response is not an array of strings.');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      // Fallback: If parsing fails, try to extract lines or use a default error message
      suggestedTodos = ['Could not parse suggestions. Try again.'];
      // You might also implement more sophisticated fallback parsing here
    }

    return NextResponse.json({ suggestions: suggestedTodos }, { status: 200 });

  } catch (error) {
    console.error('Error getting Gemini suggestions:', error);
    // Handle API key errors or other Gemini-related issues
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json({ error: 'Gemini API Key is invalid or missing.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to get todo suggestions from AI.' }, { status: 500 });
  }
}
