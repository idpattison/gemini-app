'use client'; // This directive makes the component a Client Component

import { useState, useEffect, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react'; // Import useSession and signIn

// Define the interface for a Todo item
interface Todo {
  id: string;
  name: string;
  completed: boolean;
  priority: number; // Added priority
  createdAt: string; // From Prisma model
  updatedAt: string; // From Prisma model
  ownerId: string; // Add ownerId to the interface
  owner?: { // Optional owner object for admin view
    id: string;
    name?: string | null;
    email?: string | null;
  };
  isEditing: boolean; // New property to manage editing state
}

// Hardcode admin email for client-side display logic
// This should match the ADMIN_EMAIL in your .env file
const ADMIN_EMAIL_CLIENT = process.env.NEXT_PUBLIC_ADMIN_EMAIL; // Use NEXT_PUBLIC_ prefix

export default function Home() {
   const { data: session, status } = useSession(); // Get session data
  // State to hold the list of todos
  const [todos, setTodos] = useState<Todo[]>([]);
  // State to hold the value of the new todo input field
  const [newTodoName, setNewTodoName] = useState<string>('');
  const [newTodoPriority, setNewTodoPriority] = useState<number>(0); // State for new todo priority
  // State to hold the value of the currently edited todo
  // const [editingValue, setEditingValue] = useState<string>('');
  // add loading and error states
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [error, setError] = useState<string | null>(null); // Add error state

  // Determine if the current user is an admin
  const isAdmin = session?.user?.email === ADMIN_EMAIL_CLIENT;


  // Function to fetch todos from the API
  const fetchTodos = useCallback(async () => {

    if (status === 'loading') return; // Don't fetch if session is still loading
    if (status === 'unauthenticated') {
      setTodos([]); // Clear todos if unauthenticated
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/todos');
      if (!response.ok) {
        // If unauthorized, the API will return 401, which is handled here
        if (response.status === 401) {
          setError('Please sign in to view your todos.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data: Todo[] = await response.json();
      // Ensure isEditing is false for all fetched todos initially
      setTodos(data.map(todo => ({ ...todo, isEditing: false })));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch todos');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [status]); // Depend on status to re-fetch when auth status changes

  // Fetch todos when the component mounts
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]
  ); // Re-run if fetchTodos changes (it won't because of useCallback)



  // Function to add a new todo
  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    if (newTodoName.trim() === '') return; // Don't add empty todos
    if (status !== 'authenticated' || !session?.user?.id) {
      setError('You must be signed in to add a todo.');
      return;
    }

      try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newTodoName.trim(), priority: newTodoPriority }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Re-fetch all todos to update the UI
      await fetchTodos();
      setNewTodoName('');
      setNewTodoPriority(0); // Reset priority input
    } catch (err: any) {
      setError(err.message || 'Failed to add todo');
      console.error('Add todo error:', err);
    }

  };

  const toggleComplete = async (id: string, currentCompleted: boolean) => {
    if (status !== 'authenticated') return; // Only allow authenticated users to interact

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentCompleted }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic update: Update state immediately, then re-fetch for confirmation
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      );
      // await fetchTodos(); // Optional: Re-fetch for strict consistency
    } catch (err: any) {
      setError(err.message || 'Failed to toggle todo status');
      console.error('Toggle complete error:', err);
      await fetchTodos(); // Revert state on error
    }
  };


// Function to delete a todo
  const deleteTodo = async (id: string) => {
    if (status !== 'authenticated') return; // Only allow authenticated users to interact

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic update: Remove from state immediately
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      // await fetchTodos(); // Optional: Re-fetch for strict consistency
    } catch (err: any) {
      setError(err.message || 'Failed to delete todo');
      console.error('Delete todo error:', err);
      await fetchTodos(); // Revert state on error
    }
  };

  // Function to toggle editing mode for a todo (client-side only)
  const toggleEdit = (id: string) => {
    if (status !== 'authenticated') return; // Only allow authenticated users to interact

    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };


// Function to handle saving the edited todo name
  const saveEdit = async (id: string, newName: string, newPriority: number) => {
    if (status !== 'authenticated') return; // Only allow authenticated users to interact

    if (newName.trim() === '') {
      // If name is empty, revert or prevent save
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, isEditing: false } : todo
        )
      );
      return;
    }

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim(), priority: newPriority }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optimistic update: Update state immediately
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === id ? { ...todo, name: newName.trim(), priority: newPriority, isEditing: false } : todo
        )
      );
      // await fetchTodos(); // Optional: Re-fetch for strict consistency
    } catch (err: any) {
      setError(err.message || 'Failed to update todo name / priority');
      console.error('Save edit error:', err);
      await fetchTodos(); // Revert state on error
    }
  };


  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-base-200 text-base-content">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-8 mt-8 mb-8">
        <h1 className="text-5xl font-bold text-primary text-center mb-6">
          My To-Do List
        </h1>

        {status === 'loading' && (
          <div className="text-center py-8">
            <span className="loading loading-spinner loading-lg"></span>
            <p className="mt-4">Loading session...</p>
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Please sign in to manage your todos.</p>
            <button className="btn btn-primary" onClick={() => signIn('google')}>
              Sign In with Google
            </button>
          </div>
        )}

        {status === 'authenticated' && (
          <>


            {/* Add New Todo Form */}
            <form onSubmit={addTodo} className="flex gap-2 mb-8">
              <input
                type="text"
                placeholder="Add a new todo"
                className="input input-bordered flex-grow"
                value={newTodoName}
                onChange={(e) => setNewTodoName(e.target.value)}
              />
              <input
                type="number"
                placeholder="Priority"
                className="input input-bordered w-24"
                value={newTodoPriority}
                onChange={(e) => setNewTodoPriority(parseInt(e.target.value) || 0)}
                min="0"
              />

              <button type="submit" className="btn btn-primary">
                Add Todo
              </button>
            </form>

            {/* Loading and Error States */}
            {loading && <p className="text-center">Loading todos...</p>}
            {error && <p className="text-center text-error">Error: {error}</p>}


            {/* Todo List */}
            {todos.length === 0 ? (
              <p className="text-center text-lg text-base-content/70">No todos yet! Add one above.</p>
            ) : (
              <ul className="space-y-4">
                {todos.map((todo) => (
                  <li
                    key={todo.id}
                    className="flex items-center bg-base-200 p-4 rounded-lg shadow-sm gap-4"
                  >
                    {/* Checkbox for completion */}
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={todo.completed}
                      onChange={() => toggleComplete(todo.id, todo.completed)}
                    />

                    {/* Todo Name (editable or display) */}
                    {todo.isEditing ? (
                      <div className="flex flex-grow gap-2">
                        <input
                          type="text"
                          className="input input-bordered flex-grow"
                            value={todo.name}
                          onChange={(e) => {
                            // Update local state for input immediately
                            setTodos((prevTodos) =>
                              prevTodos.map((t) =>
                                t.id === todo.id ? { ...t, name: e.target.value } : t
                              )
                            );
                          }}
                          onBlur={(e) => saveEdit(todo.id, e.target.value, todo.priority)} // Save on blur
                          onKeyDown={(e) => { // Save on Enter key press
                            if (e.key === 'Enter') {
                              saveEdit(todo.id, e.currentTarget.value, todo.priority);
                            }
                          }}

                          autoFocus
                        />
                        <input
                            type="number"
                            className="input input-bordered w-24"
                            value={todo.priority}
                            onChange={(e) => {
                              setTodos((prevTodos) =>
                                prevTodos.map((t) =>
                                  t.id === todo.id ? { ...t, priority: parseInt(e.target.value) || 0 } : t
                                )
                              );
                            }}
                            onBlur={(e) => saveEdit(todo.id, todo.name, parseInt(e.target.value) || 0)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                saveEdit(todo.id, todo.name, parseInt(e.currentTarget.value) || 0);
                              }
                            }}
                            min="0"
                          />
                        </div>

                    ) : (
                      <span
                        className={`flex-grow text-lg ${
                          todo.completed ? 'line-through text-base-content/60' : ''
                        }`}
                        onDoubleClick={() => toggleEdit(todo.id)} // Double click to edit
                      >
                        {todo.name} (P: {todo.priority})
                        {isAdmin && todo.owner && ( // Display owner for admin
                        <span className="text-sm text-base-content/50 ml-2">
                          (Owner: {todo.owner.name || todo.owner.email})
                        </span>
                        )}
                      </span>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!todo.isEditing && ( // Only show edit button when not editing
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() => toggleEdit(todo.id)}
                        >
                          Edit
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => deleteTodo(todo.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </main>
  );
}
