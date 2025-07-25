import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import our Prisma client instance
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import your authOptions

const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // Get admin email from env

// GET /api/todos - Fetch all todos
export async function GET() {
  const session = await getServerSession(authOptions); // Get the session on the server
  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let todos;
    if (session.user?.email === ADMIN_EMAIL) {
      // Admin user: fetch all todos and include owner info
      todos = await prisma.todo.findMany({
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Regular user: fetch only their own todos
      todos = await prisma.todo.findMany({
        where: {
          ownerId: session.user.id,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });
    }

    return NextResponse.json(todos, { status: 200 });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

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
        ownerId: session.user.id, // Assign the todo to the current user

      },
    });
    return NextResponse.json(newTodo, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}
