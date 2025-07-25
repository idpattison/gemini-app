import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth'; // Import getServerSession
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Import your authOptions

// Helper to parse the ID from the URL
type Params = { params: { id: string } };

// PUT /api/todos/[id] - Update a todo
export async function PUT(request: Request, { params }: Params) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, completed, priority } = await request.json();

    // Validate priority if provided
    if (priority !== undefined && typeof priority !== 'number') {
      return NextResponse.json({ error: 'Priority must be a number if provided' }, { status: 400 });
    }


    const updatedTodo = await prisma.todo.update({
      where: {
        id,
        ownerId: session.user.id, // Crucial: only update if owned by current user
      },
      data: {
        ...(name !== undefined && { name }), // Only update name if provided
        ...(completed !== undefined && { completed }), // Only update completed if provided
        ...(priority !== undefined && { priority }), // Only update priority if provided

      },
    });
    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.error(`Error updating todo with ID ${id}:`, error);
    // Prisma throws P2025 error if record not found OR if ownerId doesn't match
    if (error instanceof Error && (error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(request: Request, { params }: Params) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.todo.delete({
      where: {
        id,
        ownerId: session.user.id, // Crucial: only delete if owned by current user
      },
    });
    return NextResponse.json(null, { status: 204 }); // 204 No Content
  } catch (error) {
    console.error(`Error deleting todo with ID ${id}:`, error);
    if (error instanceof Error && (error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Todo not found or unauthorized' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete todo' }, { status: 500 });
  }
}
