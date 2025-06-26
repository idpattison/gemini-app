import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import our Prisma client instance

// GET /api/todos - Fetch all todos
export async function GET() {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'asc', // Order by creation date
      },
    });
    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: Request) {
  try {
    const { name, priority } = await request.json(); // Destructure priority
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required and must be a string' }, { status: 400 });
    }
    // Validate priority if provided
    if (priority !== undefined && typeof priority !== 'number') {
      return NextResponse.json({ error: 'Priority must be a number if provided' }, { status: 400 });
    }


    const newTodo = await prisma.todo.create({
      data: {
        name,
        priority: priority !== undefined ? priority : 0, // Use provided priority or default to 0
      },
    });
    return NextResponse.json(newTodo, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
