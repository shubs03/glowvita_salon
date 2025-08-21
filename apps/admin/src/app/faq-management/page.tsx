"use client";

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetSuperDataQuery } from '@repo/store/api';
import { 
  selectAllFaqs, 
  selectFaqsStatus, 
  selectFaqsError,
  fetchFaqs,
  addNewFaq,
  updateFaqItem,
  deleteFaqItem,
  resetError,
  toggleFaqVisibility
} from '../../../../../packages/store/src/slices/faqSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@repo/ui/table";
import { Pagination } from "@repo/ui/pagination";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@repo/ui/dialog';
import { Input } from '@repo/ui/input';
import { Label } from '@repo/ui/label';
import { Textarea } from '@repo/ui/textarea';
import { Eye, Edit, Trash2, ToggleLeft, ToggleRight, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/select';
import { toast } from "sonner";

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
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const faqs = useSelector(selectAllFaqs);
  const status = useSelector(selectFaqsStatus);
  const error = useSelector(selectFaqsError);
  
  useEffect(() => {
    if (process.browser) {
      dispatch(fetchFaqs());
    }
  }, [dispatch]);
  
  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = faqs.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(faqs.length / itemsPerPage);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null);

  const [selectedFaq, setSelectedFaq] = useState<(FAQ & { categoryDescription?: string }) | null>(null);
  const [newFaq, setNewFaq] = useState<Partial<FAQ> & { categoryDescription?: string }>({ 
    question: '',
    answer: '',
    category: '',
    visible: true 
  });
  
  const { data: superDataResponse, isLoading: isSuperDataLoading } = useGetSuperDataQuery(undefined, {
    skip: !process.browser
  });
  
  const faqCategories = useMemo(() => {
    if (!Array.isArray(superDataResponse)) return [];
    return superDataResponse.filter((item: any) => item.type === 'faqCategory');
  }, [superDataResponse]);
  
  const handleCategoryChange = (value: string) => {
    const selectedCategory = faqCategories.find((cat: any) => cat.name === value);
    setNewFaq(prev => ({
      ...prev,
      category: value,
      categoryDescription: selectedCategory?.description || ''
    }));
  };
  
  const handleViewClick = (faq: FAQ) => {
    const selectedCategory = faqCategories.find((cat: any) => cat.name === faq.category);
    setSelectedFaq({
      ...faq,
      categoryDescription: selectedCategory?.description || ''
    });
    setIsViewModalOpen(true);
  };

  const handleEditClick = (faq: FAQ) => {
    const selectedCategory = faqCategories.find((cat: any) => cat.name === faq.category);
    setSelectedFaq({
      ...faq,
      categoryDescription: selectedCategory?.description || ''
    });
    setIsEditModalOpen(true);
  };
  
  const handleDeleteClick = (faq: FAQ) => {
    setFaqToDelete(faq);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (faqToDelete) {
      try {
        await dispatch(deleteFaqItem(faqToDelete._id)).unwrap();
        toast.success("FAQ deleted successfully!", {
          duration: 5000,
          style: { background: '#22c55e', color: '#ffffff' },
        });
        setIsDeleteModalOpen(false);
        setFaqToDelete(null);
      } catch (err) {
        toast.error("Failed to delete FAQ. Please try again.", {
          description: err.payload?.message || err.message || 'Unknown error',
          duration: 5000,
        });
      }
    }
  };

  const handleToggleVisibility = async (id: string) => {
    const faq = faqs.find(f => f._id === id);
    if (faq) {
      try {
        await dispatch(updateFaqItem({
          id,
          visible: !faq.visible
        })).unwrap();
        toast.success(`FAQ ${faq.visible ? 'hidden' : 'made visible'} successfully!`, {
          duration: 5000,
          style: { background: '#22c55e', color: '#ffffff' },
        });
      } catch (err) {
        toast.error("Failed to toggle FAQ visibility. Please try again.", {
          description: err.payload?.message || err.message || 'Unknown error',
          duration: 5000,
        });
      }
    }
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
              <Button onClick={() => setIsNewModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New FAQ
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {status === 'loading' ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        <p className="text-sm text-muted-foreground">Loading FAQs...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No FAQs found. Add your first FAQ to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((faq) => {
                    const selectedCategory = faqCategories.find((cat: any) => cat.name === faq.category);
                    const categoryDescription = selectedCategory?.description || '';
                    return (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-sm">
                          <div className="font-semibold">{faq.question || 'No question'}</div>
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {faq.answer || 'No answer provided'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 w-fit">
                            {faq.category || 'Uncategorized'}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-sm">
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {categoryDescription || 'No description'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              faq.visible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {faq.visible ? 'Visible' : 'Hidden'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleVisibility(faq.id)}
                          >
                            {faq.visible ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteClick(faq)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
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

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New FAQ</DialogTitle>
            <DialogDescription>Create a new frequently asked question and answer.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="question">Question *</Label>
              <Input 
                id="question" 
                placeholder="Enter the question" 
                value={newFaq.question || ''}
                onChange={(e) => setNewFaq({...newFaq, question: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea 
                id="answer" 
                placeholder="Enter the answer" 
                value={newFaq.answer || ''}
                onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newFaq.category}
                onValueChange={handleCategoryChange}
                disabled={isSuperDataLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={
                    isSuperDataLoading ? 'Loading categories...' : 'Select a category'
                  } />
                </SelectTrigger>
                <SelectContent>
                  {faqCategories.length > 0 ? (
                    faqCategories.map((category) => (
                      <SelectItem key={category._id} value={category.name}>
                        <div className="flex flex-col">
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {isSuperDataLoading ? 'Loading categories...' : 'No categories found. Please add FAQ categories in Dropdown Management.'}
                    </div>
                  )}
                </SelectContent>
              </Select>
              <Textarea 
                id="category-description"
                placeholder="Category description will appear here"
                className="mt-2 text-sm min-h-[60px]"
                readOnly
                value={newFaq.categoryDescription || ''}
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                setIsNewModalOpen(false);
                setNewFaq({ question: '', answer: '', category: '', visible: true });
              }}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              disabled={status === 'loading'}
              onClick={async () => {
                if (newFaq.question && newFaq.answer && newFaq.category) {
                  try {
                    const newFaqData = {
                      question: newFaq.question,
                      answer: newFaq.answer,
                      category: newFaq.category,
                      categoryDescription: newFaq.categoryDescription,
                      visible: true
                    };
                    
                    await dispatch(addNewFaq(newFaqData)).unwrap();
                    toast.success("FAQ added successfully!", {
                      duration: 5000,
                      style: { background: '#22c55e', color: '#ffffff' },
                    });
                    setIsNewModalOpen(false);
                    setNewFaq({ question: '', answer: '', category: '', visible: true });
                  } catch (err) {
                    toast.error("Failed to save FAQ. Please try again.", {
                      description: err.payload?.message || err.message || 'Unknown error',
                      duration: 5000,
                    });
                  }
                } else {
                  toast.error("Please fill in all required fields.", {
                    duration: 5000,
                  });
                }
              }}
            >
              Save FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>Update the question, answer, or category for this FAQ.</DialogDescription>
          </DialogHeader>
          {selectedFaq && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-question">Question *</Label>
                <Input
                  id="edit-question"
                  value={selectedFaq.question || ''}
                  onChange={(e) =>
                    setSelectedFaq({ ...selectedFaq, question: e.target.value })
                  }
                  placeholder="Enter the question"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-answer">Answer *</Label>
                <Textarea
                  id="edit-answer"
                  value={selectedFaq.answer || ''}
                  onChange={(e) =>
                    setSelectedFaq({ ...selectedFaq, answer: e.target.value })
                  }
                  placeholder="Enter the answer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={selectedFaq.category || ''}
                  onValueChange={(value) => {
                    const selectedCategory = faqCategories.find(
                      (cat: any) => cat.name === value
                    );
                    setSelectedFaq({
                      ...selectedFaq,
                      category: value,
                      categoryDescription: selectedCategory?.description || '',
                    });
                  }}
                  disabled={isSuperDataLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isSuperDataLoading ? 'Loading categories...' : 'Select a category'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {faqCategories.length > 0 ? (
                      faqCategories.map((category: any) => (
                        <SelectItem key={category._id} value={category.name}>
                          <div className="flex flex-col">
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        {isSuperDataLoading
                          ? 'Loading categories...'
                          : 'No categories found. Please add FAQ categories in Dropdown Management.'}
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <Textarea
                  id="edit-category-description"
                  placeholder="Category description will appear here"
                  className="mt-2 text-sm min-h-[60px]"
                  readOnly
                  value={selectedFaq.categoryDescription || ''}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEditModalOpen(false);
                setSelectedFaq(null);
                dispatch(resetError());
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                status === 'loading' ||
                !selectedFaq?.question ||
                !selectedFaq?.answer ||
                !selectedFaq?.category
              }
              onClick={async () => {
                if (selectedFaq) {
                  try {
                    const updatedFields: Partial<FAQ> = {};
                    const originalFaq = faqs.find(f => f._id === selectedFaq._id);
                    if (originalFaq) {
                      if (selectedFaq.question !== originalFaq.question) {
                        updatedFields.question = selectedFaq.question;
                      }
                      if (selectedFaq.answer !== originalFaq.answer) {
                        updatedFields.answer = selectedFaq.answer;
                      }
                      if (selectedFaq.category !== originalFaq.category) {
                        updatedFields.category = selectedFaq.category;
                      }
                      if (selectedFaq.visible !== originalFaq.visible) {
                        updatedFields.visible = selectedFaq.visible;
                      }
                    }

                    if (Object.keys(updatedFields).length > 0) {
                      await dispatch(
                        updateFaqItem({
                          id: selectedFaq._id,
                          ...updatedFields,
                        })
                      ).unwrap();
                      toast.success("FAQ updated successfully!", {
                        duration: 5000,
                        style: { background: '#22c55e', color: '#ffffff' },
                      });
                      setIsEditModalOpen(false);
                      setSelectedFaq(null);
                      dispatch(resetError());
                    } else {
                      toast.info("No changes detected.", {
                        duration: 5000,
                      });
                      setIsEditModalOpen(false);
                      setSelectedFaq(null);
                    }
                  } catch (err) {
                    toast.error(`Failed to update FAQ: ${err.payload?.message || err.message || 'Unknown error'}`, {
                      duration: 5000,
                    });
                  }
                }
              }}
            >
              {status === 'loading' ? 'Saving...' : 'Save Changes'}
            </Button>
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
                <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">{selectedFaq.answer}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-muted-foreground">Category</h4>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {selectedFaq.category}
                  </span>
                </div>
                {selectedFaq.categoryDescription && (
                  <div className="mt-2">
                    <h4 className="font-semibold text-muted-foreground">Category Description</h4>
                    <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md">
                      {selectedFaq.categoryDescription}
                    </p>
                  </div>
                )}
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
            <Button variant="secondary" onClick={() => {
              setIsDeleteModalOpen(false);
              setFaqToDelete(null);
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}