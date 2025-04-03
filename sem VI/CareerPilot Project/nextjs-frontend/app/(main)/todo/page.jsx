"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, BookOpen, Target, Brain, Sparkles, CalendarDays, Search, Filter, Tag, Calendar, Star, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence, Reorder, useDragControls } from "framer-motion";
import { addTodo, getTodos, toggleTodo, deleteTodo, updateTodoPriority } from "@/actions/todo";
import { formatDistanceToNow, isAfter, addDays } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { Calendar as CalendarComponent } from "@/components/ui/calendar.jsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command.jsx";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";

const CATEGORIES = [
  "Technical",
  "Behavioral",
  "System Design",
  "Data Structures",
  "Algorithms",
  "Projects",
  "Resume",
  "Other"
];

export default function TodoPage() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState("priority");
  const [sortOrder, setSortOrder] = useState("desc");
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    loadTodos();
  }, [userId, filter, isLoaded, isSignedIn]);

  const loadTodos = async () => {
    try {
      const data = await getTodos(filter);
      setTodos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load todos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;
    
    try {
      const todo = await addTodo(newTodo);
      setTodos([...todos, todo]);
      setNewTodo("");
      toast({
        title: "Topic Added",
        description: "New revision topic has been added to your list.",
      });
    } catch (error) {
      if (error.message === "User not authenticated") {
        router.push("/sign-in");
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add todo",
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleTodo = async (id, completed) => {
    try {
      await toggleTodo(id, !completed);
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: !completed } : todo
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update todo",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await deleteTodo(id);
      setTodos(todos.filter(todo => todo.id !== id));
      toast({
        title: "Topic Removed",
        description: "The revision topic has been removed from your list.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete todo",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePriority = async (id, priority) => {
    const newPriority = priority === "high" ? "medium" : 
                       priority === "medium" ? "low" : "high";
    try {
      await updateTodoPriority(id, newPriority);
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, priority: newPriority } : todo
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || todo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return sortOrder === "desc" 
        ? priorityOrder[b.priority] - priorityOrder[a.priority]
        : priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (sortBy === "dueDate") {
      return sortOrder === "desc"
        ? new Date(b.dueDate) - new Date(a.dueDate)
        : new Date(a.dueDate) - new Date(b.dueDate);
    }
    return 0;
  });

  const completionRate = todos.length
    ? Math.round((todos.filter(todo => todo.completed).length / todos.length) * 100)
    : 0;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return !isAfter(new Date(dueDate), new Date());
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Revision Topics
        </h1>
        <p className="text-muted-foreground">
          Track and manage topics that need revision based on your interview performance.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-8 bg-gradient-to-br from-white to-blue-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Completion Rate</span>
                <span className="text-sm font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="font-bold">{todos.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="font-bold">{todos.filter(t => t.completed).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="font-bold">{todos.filter(t => !t.completed).length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-white to-green-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-500" />
                Add New Topic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter a topic to revise..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
                  className="border-green-200 focus:border-green-500"
                />
                <Button onClick={handleAddTodo} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-white to-purple-50 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Filter Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[200px] justify-start">
                        <Tag className="mr-2 h-4 w-4" />
                        {selectedCategory || "All Categories"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0">
                      <Command>
                        <CommandInput placeholder="Search category..." />
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                          <CommandItem
                            onSelect={() => setSelectedCategory(null)}
                          >
                            All Categories
                          </CommandItem>
                          {CATEGORIES.map((category) => (
                            <CommandItem
                              key={category}
                              onSelect={() => setSelectedCategory(category)}
                            >
                              {category}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSortBy("priority");
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                    }}
                    className="flex-1"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Priority
                    {sortBy === "priority" && (
                      sortOrder === "desc" ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronUp className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSortBy("dueDate");
                      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                    }}
                    className="flex-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Due Date
                    {sortBy === "dueDate" && (
                      sortOrder === "desc" ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronUp className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-br from-white to-yellow-50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Topics List
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading your revision topics...
              </div>
            ) : (
              <ScrollArea className="h-[500px]">
                <Reorder.Group
                  values={sortedTodos}
                  onReorder={setTodos}
                  className="space-y-4"
                >
                  <AnimatePresence>
                    {sortedTodos.map((todo) => (
                      <Reorder.Item
                        key={todo.id}
                        value={todo}
                        dragListener={false}
                        className="relative"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors bg-white shadow-sm ${
                            isOverdue(todo.dueDate) && !todo.completed ? "border-red-200 bg-red-50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="cursor-grab">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <Checkbox
                              checked={todo.completed}
                              onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                              className="border-2"
                            />
                            <div className="flex-1">
                              <p className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                                {todo.text}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant={getPriorityColor(todo.priority)}>
                                  {todo.priority}
                                </Badge>
                                {todo.category && (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {todo.category}
                                  </Badge>
                                )}
                                {todo.dueDate && (
                                  <Badge 
                                    variant="outline" 
                                    className={`flex items-center gap-1 ${
                                      isOverdue(todo.dueDate) && !todo.completed 
                                        ? "bg-red-50 text-red-700 border-red-200" 
                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                    }`}
                                  >
                                    <CalendarDays className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(todo.dueDate), { addSuffix: true })}
                                    {isOverdue(todo.dueDate) && !todo.completed && " (Overdue)"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdatePriority(todo.id, todo.priority)}
                              className="hover:bg-accent"
                            >
                              {todo.priority === "high" ? <AlertCircle className="h-4 w-4 text-red-500" /> : 
                               todo.priority === "medium" ? <Clock className="h-4 w-4 text-yellow-500" /> : 
                               <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="text-destructive hover:text-destructive hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
                {sortedTodos.length === 0 && !loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No topics to revise. Add some or complete your interviews to get personalized recommendations.
                  </motion.div>
                )}
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}