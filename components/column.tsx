"use client"

import { useState } from "react"
import { Droppable, Draggable } from "@hello-pangea/dnd"
import { MoreHorizontal, Plus, Trash2, Palette } from "lucide-react"
import TaskCard from "./task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Task, Column as ColumnType } from "@/types/kanban"
import { generateId } from "@/lib/utils"

// Add predefined colors with theme variables
const COLUMN_COLORS = [
  { name: "Default", value: "bg-card" },
  { name: "Blue", value: "bg-blue-300 dark:bg-blue-900/30" },
  { name: "Green", value: "bg-green-300 dark:bg-green-900/30" },
  { name: "Yellow", value: "bg-yellow-300 dark:bg-yellow-900/30" },
  { name: "Purple", value: "bg-purple-300 dark:bg-purple-900/30" },
  { name: "Pink", value: "bg-pink-300 dark:bg-pink-900/30" },
  { name: "Orange", value: "bg-orange-300 dark:bg-orange-900/30" },
  { name: "Cyan", value: "bg-cyan-300 dark:bg-cyan-900/30" },
]

interface ColumnProps {
  column: ColumnType
  onAddTask: (columnId: string, task: Task) => void
  onTaskClick: (task: Task) => void
  onDeleteColumn: () => void
  onUpdateColumn: (columnId: string, updates: Partial<ColumnType>) => void
  onDuplicateTask: (task: Task, columnId: string) => void
}

export default function Column({
  column,
  onAddTask,
  onTaskClick,
  onDeleteColumn,
  onUpdateColumn,
  onDuplicateTask,
}: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${generateId()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      status: column.title,
      dueDate: null,
      subtasks: [],
      customFields: [],
      createdAt: new Date().toISOString(),
    }

    onAddTask(column.id, newTask)
    setNewTaskTitle("")
    setNewTaskDescription("")
    setIsAddingTask(false)
  }

  const handleColorChange = (color: string) => {
    onUpdateColumn(column.id, { color })
  }

  // Get header color class or default to card background
  const headerColorClass = column.color || "bg-card"

  return (
    <div className="shrink-0 w-72 flex flex-col bg-muted/50 rounded-md shadow-sm">
      <div className={`p-3 flex justify-between items-center border-b rounded-t-md ${headerColorClass}`}>
        <h3 className="font-medium text-sm text-gray-700 dark:text-gray-200 flex items-center">
          {column.title}
          <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
            {column.tasks.length}
          </span>
        </h3>
        <div className="flex">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-foreground">Column Color</h4>
                <div className="grid grid-cols-4 gap-2">
                  {COLUMN_COLORS.map((color) => (
                    <button
                      key={color.value}
                      className={`h-8 w-full rounded-md ${color.value} border border-border hover:opacity-80 transition-opacity`}
                      onClick={() => handleColorChange(color.value)}
                      aria-label={`Set column color to ${color.name}`}
                    />
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onDeleteColumn} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Droppable droppableId={column.id}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="flex-1 p-2 overflow-y-auto">
            {column.tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                    <TaskCard
                      task={task}
                      onClick={() => onTaskClick(task)}
                      onDuplicate={() => onDuplicateTask(task, column.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}

            {isAddingTask ? (
              <div className="mt-3 p-4 bg-card rounded-lg shadow-sm border border-border space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title" className="text-sm font-medium text-foreground">
                    Task Title
                  </Label>
                  <Input
                    id="task-title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="task-description" className="text-sm font-medium text-foreground">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="task-description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    placeholder="Enter task description"
                    className="w-full resize-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" onClick={handleAddTask} className="flex-1">
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsAddingTask(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                className="w-full mt-2 text-muted-foreground hover:text-foreground justify-start"
                onClick={() => setIsAddingTask(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
