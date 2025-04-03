"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, CheckCircle2, Clock, AlertCircle, Target, Brain, Sparkles, 
  CalendarDays, Search, Tag, Calendar, Star, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import { addTodo, getTodos, toggleTodo, deleteTodo, updateTodoPriority } from "@/actions/todo";
import { formatDistanceToNow, isAfter } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover.jsx";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command.jsx";
import { ScrollArea } from "@/components/ui/scroll-area.jsx";

const CATEGORIES = [
  "Technical", "Behavioral", "System Design", "Data Structures", 
  "Algorithms", "Projects", "Resume", "Other"
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
  }, [userId, filter, isLoaded, isSignedIn, router]);

  const loadTodos = async () => {
    try {
      const data = await getTodos(filter);
      setTodos(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load topics",
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
          description: error.message || "Failed to add topic",
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
        description: "Failed to update topic",
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
        description: "Failed to delete topic",
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

  const getFilteredAndSortedTodos = () => {
    // Filter todos
    const filtered = todos.filter(todo => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || todo.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort todos
    return [...filtered].sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sortOrder === "desc" 
          ? priorityOrder[b.priority] - priorityOrder[a.priority]
          : priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "dueDate") {
        if (!a.dueDate) return sortOrder === "asc" ? 1 : -1;
        if (!b.dueDate) return sortOrder === "asc" ? -1 : 1;
        return sortOrder === "desc"
          ? new Date(b.dueDate) - new Date(a.dueDate)
          : new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });
  };

  const sortedTodos = getFilteredAndSortedTodos();
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
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Revision Topics
        </h1>
        <p className="text-muted-foreground text-sm">
          Track topics that need revision based on your interview performance
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Sidebar */}
        <div className="md:col-span-4 space-y-4">
          {/* Add New Topic Card */}
          <Card className="bg-gradient-to-br from-white to-green-50 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-4 w-4 text-green-500" />
                Add Topic
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
                <Button onClick={handleAddTodo} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview Card */}
          <Card className="bg-gradient-to-br from-white to-blue-50 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium">Completion</span>
                <span className="font-medium">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-2" />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold text-sm">{todos.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Done</p>
                  <p className="font-bold text-sm">{todos.filter(t => t.completed).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="font-bold text-sm">{todos.filter(t => !t.completed).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filter Card */}
          <Card className="bg-gradient-to-br from-white to-purple-50 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-sm"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {selectedCategory || "All Categories"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-0">
                    <Command>
                      <CommandInput placeholder="Search..." className="h-9" />
                      <CommandEmpty>None found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem onSelect={() => setSelectedCategory(null)}>
                          All Categories
                        </CommandItem>
                        {CATEGORIES.map((category) => (
                          <CommandItem key={category} onSelect={() => setSelectedCategory(category)}>
                            {category}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-8">
                    <TabsTrigger 
                      value="all" 
                      className="text-[10px]"
                      onClick={() => setFilter("all")}>
                      All
                    </TabsTrigger>
                    <TabsTrigger 
                      value="active" 
                      className="text-[10px]"
                      onClick={() => setFilter("active")}>
                      Active
                    </TabsTrigger>
                    <TabsTrigger 
                      value="completed" 
                      className="text-[10px]"
                      onClick={() => setFilter("completed")}>
                      Done
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortBy("priority");
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  }}
                  className="flex-1 text-xs h-8"
                >
                  <Star className="mr-1 h-3 w-3" />
                  Priority
                  {sortBy === "priority" && (
                    sortOrder === "desc" ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronUp className="ml-1 h-3 w-3" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSortBy("dueDate");
                    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                  }}
                  className="flex-1 text-xs h-8"
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  Due Date
                  {sortBy === "dueDate" && (
                    sortOrder === "desc" ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronUp className="ml-1 h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-8">
          <Card className="bg-gradient-to-br from-white to-yellow-50 shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-yellow-500" />
                Topics to Revise ({sortedTodos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6 text-muted-foreground">
                  Loading your revision topics...
                </div>
              ) : (
                <ScrollArea className="h-[550px] pr-4">
                  <Reorder.Group
                    values={sortedTodos}
                    onReorder={setTodos}
                    className="space-y-2"
                  >
                    <AnimatePresence>
                      {sortedTodos.map((todo) => (
                        <Reorder.Item
                          key={todo.id}
                          value={todo}
                          className="relative"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className={`flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-all ${
                              todo.completed ? "bg-gray-50" : "bg-white"
                            } ${isOverdue(todo.dueDate) && !todo.completed ? "border-red-200 bg-red-50" : "border-gray-200"} shadow-sm`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="flex items-center">
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-move opacity-60 hover:opacity-100 mr-1" />
                                <Checkbox
                                  checked={todo.completed}
                                  onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm truncate ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                                  {todo.text}
                                </p>
                                <div className="flex items-center gap-1 mt-1 flex-wrap">
                                  <Badge variant={getPriorityColor(todo.priority)} className="text-xs px-1.5 py-0">
                                    {todo.priority}
                                  </Badge>
                                  {todo.category && (
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0">
                                      {todo.category}
                                    </Badge>
                                  )}
                                  {todo.dueDate && (
                                    <Badge 
                                      variant="outline" 
                                      className={`flex items-center gap-1 text-xs px-1.5 py-0 ${
                                        isOverdue(todo.dueDate) && !todo.completed 
                                          ? "bg-red-50 text-red-700 border-red-200" 
                                          : "bg-purple-50 text-purple-700 border-purple-200"
                                      }`}
                                    >
                                      <CalendarDays className="h-2.5 w-2.5" />
                                      {formatDistanceToNow(new Date(todo.dueDate), { addSuffix: true })}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleUpdatePriority(todo.id, todo.priority)}
                                className="h-7 w-7 hover:bg-accent rounded-full"
                              >
                                {todo.priority === "high" ? <AlertCircle className="h-3.5 w-3.5 text-red-500" /> : 
                                todo.priority === "medium" ? <Clock className="h-3.5 w-3.5 text-yellow-500" /> : 
                                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteTodo(todo.id)}
                                className="h-7 w-7 text-destructive hover:text-destructive hover:bg-red-50 rounded-full"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>
                  {sortedTodos.length === 0 && !loading && (
                    <div className="text-center py-12 px-4">
                      <Sparkles className="h-10 w-10 text-yellow-200 mx-auto mb-2" />
                      <p className="text-lg font-medium text-gray-500">No revision topics found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add some topics or complete your interviews to get personalized recommendations.
                      </p>
                    </div>
                  )}
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}