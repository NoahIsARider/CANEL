import { useState, useEffect } from 'react';
import { Plus, Check, Circle } from 'lucide-react';

interface TodoCardProps {
  cardId: string;
  config: Record<string, string | number | boolean | string[]>;
}

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export function TodoCard({ cardId }: TodoCardProps) {
  const [newText, setNewText] = useState('');

  // Load todos from localStorage
  const storageKey = `canel-todo-${cardId}`;
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(todos));
  }, [todos, storageKey]);

  const addTodo = () => {
    if (!newText.trim()) return;
    setTodos([...todos, { id: Date.now().toString(), text: newText.trim(), done: false }]);
    setNewText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div key={todo.id} className="flex items-center gap-2 group">
          <button
            onClick={() => toggleTodo(todo.id)}
            className="flex-shrink-0 text-brand hover:text-brand-hover transition-colors"
          >
            {todo.done ? <Check size={16} /> : <Circle size={16} />}
          </button>
          <span
            className={`flex-1 text-body ${
              todo.done ? 'line-through text-ink-tertiary' : 'text-ink'
            }`}
          >
            {todo.text}
          </span>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="opacity-0 group-hover:opacity-100 text-ink-tertiary hover:text-red-500 transition-all"
          >
            ×
          </button>
        </div>
      ))}

      <div className="flex items-center gap-2 pt-2 border-t border-line">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTodo();
          }}
          placeholder="Add task..."
          className="flex-1 text-body bg-transparent outline-none placeholder:text-ink-tertiary"
        />
        <button
          onClick={addTodo}
          className="p-1 text-ink-tertiary hover:text-brand transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
