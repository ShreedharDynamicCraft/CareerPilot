"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function addTopicsToTodo(topics) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    const existingTodos = await db.todo.findMany({
      where: { userId: user.id },
      select: { text: true }
    });

    const newTodos = topics.map(topic => ({
      text: `Review ${topic} (from OA practice)`,
      priority: "high",
      source: "interview",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }));

    const uniqueTodos = newTodos.filter(newTodo => 
      !existingTodos.some(existing => existing.text === newTodo.text)
    );

    await db.todo.createMany({
      data: uniqueTodos.map(todo => ({
        ...todo,
        userId: user.id
      }))
    });

    return { success: true, count: uniqueTodos.length };
  } catch (error) {
    console.error("Error adding topics to todo:", error);
    return { success: false, error: error.message };
  }
}

export async function getTodos(filter = "all") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    const where = { userId: user.id };
    if (filter === "active") where.completed = false;
    if (filter === "completed") where.completed = true;

    return await db.todo.findMany({
      where,
      orderBy: [
        { priority: "asc" },
        { completed: "asc" },
        { createdAt: "desc" }
      ]
    });
  } catch (error) {
    console.error("Error fetching todos:", error);
    return [];
  }
}

export async function addTodo(text, priority = "medium") {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.todo.create({
      data: {
        text,
        priority,
        source: "manual",
        userId: user.id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error("Error adding todo:", error);
    throw error;
  }
}

export async function toggleTodo(id, completed) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.todo.update({
      where: { id, userId: user.id },
      data: { completed }
    });
  } catch (error) {
    console.error("Error toggling todo:", error);
    throw error;
  }
}

export async function updateTodoPriority(id, priority) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.todo.update({
      where: { id, userId: user.id },
      data: { priority }
    });
  } catch (error) {
    console.error("Error updating todo priority:", error);
    throw error;
  }
}

export async function deleteTodo(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new Error("User not found");

    return await db.todo.delete({
      where: { id, userId: user.id }
    });
  } catch (error) {
    console.error("Error deleting todo:", error);
    throw error;
  }
}