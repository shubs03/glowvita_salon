
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Eye, Edit, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';

const faqData = [
  {
    id: 1,
    question: "What is Monorepo Maestro?",
    answer: "Monorepo Maestro is a powerful, scalable, and unified structure for your Next.js projects, designed to streamline development across multiple applications and shared packages.",
    category: "Booking",
    visible: true,
  },
  {
    id: 2,
    question: "How do I get started?",
    answer: "You can get started by cloning the repository, installing dependencies with `npm install`, and running the development server with `npm run dev`. Make sure to set up your `.env` file first.",
    category: "Booking",
    visible: true,
  },
  {
    id: 3,
    question: "Can I use a different database?",
    answer: "Yes, while the project is set up with MongoDB, you can adapt the database connection logic in `@repo/lib/db` to connect to any database of your choice.",
    category: "Booking",
    visible: false,
  },
];

type FAQ = typeof faqData[0];

export default function FaqManagementPage() {
  const [faqs, setFaqs] = useState(faqData);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = faqs.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(faqs.length / itemsPerPage);
  
  const handleViewClick = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (faq: FAQ) => {
    setSelectedFaq(faq);
    setIsDeleteModalOpen(true);
  };

  const handleToggleVisibility = (id: number) => {
    setFaqs(faqs.map(faq => faq.id === id ? { ...faq, visible: !faq.visible } : faq));
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold font-headline mb-6">FAQ Management</h1>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Create, edit, and manage FAQs for the platform.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setIsNewCategoryModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Category
              </Button>
              <Button onClick={() => setIsNewModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New FAQ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto no-scrollbar">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {currentItems.map((faq) => (
                        <TableRow key={faq.id}>
                            <TableCell className="font-medium max-w-sm">
                                <div>
                                    <div className="font-semibold">{faq.question}</div>
                                    <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{faq.answer}</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                        {faq.category}
                                    </span>
                                    <div className="text-sm text-muted-foreground mt-1">Category description goes here</div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    faq.visible
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}>
                                    {faq.visible ? 'Visible' : 'Hidden'}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleToggleVisibility(faq.id)}>
                                    {faq.visible ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                                    <span className="sr-only">Toggle Visibility</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleViewClick(faq)}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEditClick(faq)}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(faq)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
          <Pagination
                className="mt-4"
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={setItemsPerPage}
                totalItems={faqs.length}
            />
        </CardContent>
      </Card>
      
      {/* Add/Edit Modals */}
        <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New FAQ</DialogTitle>
                    <DialogDescription>
                        Create a new frequently asked question and answer.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="question">Question</Label>
                        <Input id="question" placeholder="Enter the question" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Textarea id="answer" placeholder="Enter the answer" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsNewModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save FAQ</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit FAQ</DialogTitle>
                    <DialogDescription>
                        Update the question and answer for this FAQ.
                    </DialogDescription>
                </DialogHeader>
                 {selectedFaq && (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-question">Question</Label>
                            <Input id="edit-question" defaultValue={selectedFaq.question} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-answer">Answer</Label>
                            <Textarea id="edit-answer" defaultValue={selectedFaq.answer} />
                        </div>
                    </div>
                 )}
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>View FAQ</DialogTitle>
                </DialogHeader>
                {selectedFaq && (
                    <div className="space-y-4 py-4">
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Question</h4>
                            <p>{selectedFaq.question}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Answer</h4>
                            <p className="text-sm">{selectedFaq.answer}</p>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete FAQ?</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this FAQ? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant='destructive'
                        onClick={() => {
                            // Logic to delete FAQ
                            setIsDeleteModalOpen(false);
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Add New Category Modal */}
        <Dialog open={isNewCategoryModalOpen} onOpenChange={setIsNewCategoryModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                    <DialogDescription>
                        Create a new category for organizing FAQs.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="category-name">Category Name</Label>
                        <Input id="category-name" placeholder="Enter the category name" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category-description">Description</Label>
                        <Textarea id="category-description" placeholder="Enter the category description" />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="secondary" onClick={() => setIsNewCategoryModalOpen(false)}>Cancel</Button>
                    <Button type="submit">Save Category</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}
