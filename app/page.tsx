'use client'; // This directive makes the component a Client Component

import { useState } from 'react';

// Define the interface for a Todo item
interface Todo {
  id: string;
  name: string;
  completed: boolean;
  isEditing: boolean; // New property to manage editing state
}

export default function Home() {
  // State to hold the list of todos
  const [todos, setTodos] = useState<Todo[]>([]);
  // State to hold the value of the new todo input field
  const [newTodoName, setNewTodoName] = useState<string>('');
  // State to hold the value of the currently edited todo
  const [editingValue, setEditingValue] = useState<string>('');

  // Function to add a new todo
  const addTodo = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    if (newTodoName.trim() === '') return; // Don't add empty todos

    const newTodo: Todo = {
      id: crypto.randomUUID(), // Generate a unique ID for the todo
      name: newTodoName.trim(),
      completed: false,
      isEditing: false,
    };
    setTodos((prevTodos) => [...prevTodos, newTodo]); // Add new todo to the list
    setNewTodoName(''); // Clear the input field
  };

  // Function to toggle the completed status of a todo
  const toggleComplete = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // Function to delete a todo
  const deleteTodo = (id: string) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  // Function to toggle editing mode for a todo
  const toggleEdit = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo && !todo.isEditing) {
      setEditingValue(todo.name); // Set editing value when entering edit mode
    }
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isEditing: !todo.isEditing } : todo
      )
    );
  };

  // Function to handle saving the edited todo name
  const saveEdit = (id: string) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, name: editingValue.trim(), isEditing: false } : todo
      )
    );
    setEditingValue('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8 bg-base-200 text-base-content">
      <div className="card w-full max-w-2xl bg-base-100 shadow-xl p-8 mt-8 mb-8">
        <h1 className="text-5xl font-bold text-primary text-center mb-6">
          My To-Do List
        </h1>

        {/* Add New Todo Form */}
        <form onSubmit={addTodo} className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Add a new todo"
            className="input input-bordered flex-grow"
            value={newTodoName}
            onChange={(e) => setNewTodoName(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Add Todo
          </button>
        </form>

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
                  onChange={() => toggleComplete(todo.id)}
                />

                {/* Todo Name (editable or display) */}
                {todo.isEditing ? (
                  <input
                    type="text"
                    className="input input-bordered flex-grow"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        saveEdit(todo.id);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <span
                    className={`flex-grow text-lg ${
                      todo.completed ? 'line-through text-base-content/60' : ''
                    }`}
                    onDoubleClick={() => toggleEdit(todo.id)} // Double click to edit
                  >
                    {todo.name}
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
      </div>
    </main>
  );
}
