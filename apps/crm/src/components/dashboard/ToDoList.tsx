
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Checkbox } from "@repo/ui/checkbox";
import { Input } from "@repo/ui/input";
import { Button } from "@repo/ui/button";
import { FaPlus } from 'react-icons/fa';

const tasks = [
    { id: 1, label: 'Order new shipment of shampoo', done: false },
    { id: 2, label: 'Follow up with Mrs. Davis', done: false },
    { id: 3, label: 'Finalize next month\'s staff schedule', done: true },
];

export function ToDoList() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>To-Do List</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {tasks.map(task => (
                         <div key={task.id} className="flex items-center space-x-2">
                            <Checkbox id={`task-${task.id}`} checked={task.done} />
                            <label
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${task.done ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {task.label}
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex w-full items-center space-x-2 mt-4">
                    <Input type="text" placeholder="Add a new task..." />
                    <Button type="submit" size="icon">
                        <FaPlus className="h-4 w-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
