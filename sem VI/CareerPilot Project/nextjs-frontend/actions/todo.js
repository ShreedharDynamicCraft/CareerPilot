// actions/todo.js
"use client";

export async function addTopicsToTodo(topics, toast) {
  try {
    // Get existing todos from localStorage
    const existingTodos = JSON.parse(localStorage.getItem("interview-todos") || "[]");
    
    // Add new topics as todos if they don't exist
    const newTodos = topics.map(topic => ({
      id: Date.now() + Math.random(),
      text: `Review ${topic} (from OA practice)`,
      completed: false,
      priority: "high",
      createdAt: new Date().toISOString(),
      source: "interview"
    }));

    // Filter out duplicates based on text
    const uniqueTodos = newTodos.filter(newTodo => 
      !existingTodos.some(existing => existing.text === newTodo.text)
    );

    // Save updated todos
    const updatedTodos = [...existingTodos, ...uniqueTodos];
    localStorage.setItem("interview-todos", JSON.stringify(updatedTodos));

    // Show success notification
    if (uniqueTodos.length > 0 && toast) {
      toast({
        title: "Topics Added",
        description: `${uniqueTodos.length} topics added to your revision list`,
      });
    }

    return { success: true, count: uniqueTodos.length };
  } catch (error) {
    console.error("Error adding topics to todo:", error);
    if (toast) {
      toast({
        title: "Error",
        description: "Failed to add topics to revision list",
        variant: "destructive",
      });
    }
    return { success: false, error: error.message };
  }
}