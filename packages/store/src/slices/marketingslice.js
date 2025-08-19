import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

// Initial data
const initialSmsTemplates = [
  { 
    id: 'TMP001', 
    name: 'Welcome Offer', 
    type: 'Promotional', 
    price: 500, 
    status: 'Active', 
    content: 'Welcome to our salon! Enjoy 20% off on your first visit.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 'TMP002', 
    name: 'Appointment Reminder', 
    type: 'Transactional', 
    price: 200, 
    status: 'Active', 
    content: 'Your appointment is tomorrow at 2 PM. See you soon!',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 'TMP003', 
    name: 'Festive Discount', 
    type: 'Promotional', 
    price: 750, 
    status: 'Inactive', 
    content: 'Celebrate Diwali with us! Get 25% off all services.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialSmsPackages = [
  {
    id: 'PKG001',
    name: 'Starter Pack',
    smsCount: 1000,
    price: 100000,
    description: 'Ideal for new vendors.',
    validityDays: 30,
    isPopular: false,
    features: ['1000 SMS', '30 days validity', 'Basic support'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PKG002',
    name: 'Growth Pack',
    smsCount: 5000,
    price: 450000,
    description: 'For growing businesses.',
    validityDays: 60,
    isPopular: true,
    features: ['5000 SMS', '60 days validity', 'Priority support', 'Analytics'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'PKG003',
    name: 'Pro Pack',
    smsCount: 10000,
    price: 800000,
    description: 'For high-volume marketing.',
    validityDays: 90,
    isPopular: false,
    features: ['10000 SMS', '90 days validity', '24/7 Priority support', 'Advanced Analytics', 'Dedicated Account Manager'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialSocialPosts = [
  {
    id: 'POST001',
    title: 'Summer Special',
    platform: 'instagram',
    content: 'Get 20% off on all hair treatments this summer!',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    price: 1500,
    description: 'Promoting our summer special offer',
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'POST002',
    title: 'New Services',
    platform: 'facebook',
    content: 'Check out our new spa treatments!',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    price: 2000,
    description: 'Announcing our new spa services',
    status: 'published',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialMarketingTickets = [
  {
    id: 'TKT001',
    vendorName: 'Glamour Salon',
    requestDate: '2024-08-10',
    service: 'Digital Marketing Campaign',
    status: 'Pending',
    priority: 'High',
    assignedTo: 'Marketing Team',
    lastUpdated: '2024-08-10T10:30:00Z',
    notes: 'Need to create a social media campaign for the upcoming festival season.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TKT002',
    vendorName: 'Modern Cuts',
    requestDate: '2024-08-12',
    service: 'SEO Optimization',
    status: 'In Progress',
    priority: 'Medium',
    assignedTo: 'SEO Team',
    lastUpdated: '2024-08-12T14:15:00Z',
    notes: 'Improve search rankings for local keywords.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'TKT003',
    vendorName: 'Style Hub',
    requestDate: '2024-08-15',
    service: 'Social Media Management',
    status: 'Completed',
    priority: 'Low',
    assignedTo: 'Social Media Team',
    lastUpdated: '2024-08-18T16:45:00Z',
    notes: 'Monthly content calendar created and scheduled.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialPurchaseHistory = [
  { 
    id: 'PUR001', 
    vendorName: 'Beauty Bliss', 
    item: 'Starter Pack (SMS)', 
    date: '2024-08-01', 
    amount: 100000,
    status: 'Completed',
    paymentMethod: 'Credit Card',
    invoiceNumber: 'INV-2024-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 'PUR002', 
    vendorName: 'The Men\'s Room', 
    item: 'Basic Social (Posts)', 
    date: '2024-08-05', 
    amount: 500000,
    status: 'Completed',
    paymentMethod: 'Bank Transfer',
    invoiceNumber: 'INV-2024-002',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialActiveCampaigns = [
  { 
    id: 'CAMP001', 
    vendorName: 'Glamour Salon', 
    salonName: 'Glamour Salon', 
    contact: '123-456-7890', 
    email: 'glamour@example.com', 
    campaignType: 'Social Media',
    startDate: '2024-08-01', 
    endDate: '2024-09-01',
    status: 'Active',
    budget: 50000,
    impressions: 12500,
    clicks: 1250,
    ctr: 10.0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  { 
    id: 'CAMP002', 
    vendorName: 'Modern Cuts', 
    salonName: 'Modern Cuts', 
    contact: '987-654-3210', 
    email: 'modern@example.com',
    campaignType: 'SMS Marketing',
    startDate: '2024-08-15', 
    endDate: '2024-08-25',
    status: 'Active',
    budget: 25000,
    messagesSent: 1500,
    deliveryRate: 98.5,
    openRate: 65.2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialState = {
  smsTemplates: initialSmsTemplates,
  smsPackages: initialSmsPackages,
  socialPosts: initialSocialPosts,
  marketingTickets: initialMarketingTickets,
  purchaseHistory: initialPurchaseHistory,
  activeCampaigns: initialActiveCampaigns,
  loading: false,
  error: null,
  message: '',
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0
};

const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    // Social Media Posts
    setSocialPosts(state, action) {
      state.socialPosts = action.payload;
    },
    addSocialPost(state, action) {
      const { image, ...postData } = action.payload;
      const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
      
      state.socialPosts.push({
        ...postData,
        image: imageUrl,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    },
    updateSocialPost(state, action) {
      const { id, image, ...updates } = action.payload;
      const index = state.socialPosts.findIndex(post => post.id === id);
      
      if (index !== -1) {
        const currentPost = state.socialPosts[index];
        const imageUrl = image instanceof File ? URL.createObjectURL(image) : image || currentPost.image;
        
        state.socialPosts[index] = {
          ...currentPost,
          ...updates,
          image: imageUrl,
          updatedAt: new Date().toISOString()
        };
      }
    },
    deleteSocialPost(state, action) {
      state.socialPosts = state.socialPosts.filter(post => post.id !== action.payload);
    },
    
    // SMS Templates
    setSmsTemplates: (state, action) => {
      state.smsTemplates = action.payload;
      state.loading = false;
    },
    addSmsTemplate: (state, action) => {
      state.smsTemplates.unshift(action.payload);
      state.message = 'SMS Template added successfully';
    },
    updateSmsTemplate: (state, action) => {
      const index = state.smsTemplates.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.smsTemplates[index] = action.payload;
        state.message = 'SMS Template updated successfully';
      }
    },
    deleteSmsTemplate: (state, action) => {
      state.smsTemplates = state.smsTemplates.filter(t => t.id !== action.payload);
      state.message = 'SMS Template deleted successfully';
    },
    toggleSmsTemplateStatus: (state, action) => {
      const template = state.smsTemplates.find(t => t.id === action.payload);
      if (template) {
        template.status = template.status === 'Active' ? 'Inactive' : 'Active';
        state.message = `SMS Template ${template.status === 'Active' ? 'activated' : 'deactivated'} successfully`;
      }
    },

    // SMS Packages
    setSmsPackages: (state, action) => {
      state.smsPackages = action.payload;
      state.loading = false;
    },
    addSmsPackage(state, action) {
      state.smsPackages.push(action.payload);
      state.message = 'SMS Package added successfully';
    },
    updateSmsPackage(state, action) {
      const index = state.smsPackages.findIndex(pkg => pkg.id === action.payload.id);
      if (index !== -1) {
        state.smsPackages[index] = {
          ...state.smsPackages[index],
          ...action.payload,
          updatedAt: new Date().toISOString()
        };
        state.message = 'SMS Package updated successfully';
      }
    },
    deleteSmsPackage(state, action) {
      state.smsPackages = state.smsPackages.filter(pkg => pkg.id !== action.payload);
      state.message = 'SMS Package deleted successfully';
    },

    // Marketing Tickets
    setMarketingTickets: (state, action) => {
      state.marketingTickets = action.payload;
      state.loading = false;
    },
    updateTicketStatus: (state, action) => {
      const { id, status } = action.payload;
      const ticket = state.marketingTickets.find(t => t.id === id);
      if (ticket) {
        ticket.status = status;
        state.message = 'Ticket status updated successfully';
      }
    },

    // Active Campaigns
    setActiveCampaigns: (state, action) => {
      state.activeCampaigns = action.payload;
      state.loading = false;
    },
    toggleCampaignStatus: (state, action) => {
      const campaign = state.activeCampaigns.find(c => c.id === action.payload);
      if (campaign) {
        campaign.status = !campaign.status;
        state.message = `Campaign ${campaign.status ? 'activated' : 'deactivated'} successfully`;
      }
    },

    // Pagination
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1;
    },

    // Loading and Error states
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = '';
    }
  }
});

// Async Thunks
export const createSocialPost = createAsyncThunk(
  'marketing/createSocialPost',
  async (postData, { dispatch, getState }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.post('/api/marketing/social-posts', postData);
      // return response.data;
      
      // For now, just dispatch the synchronous action
      const newPost = {
        ...postData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      dispatch(addSocialPost(newPost));
      return newPost;
    } catch (error) {
      throw error;
    }
  }
);

export const updateSocialPostAsync = createAsyncThunk(
  'marketing/updateSocialPost',
  async (postData, { dispatch, getState }) => {
    try {
      // In a real app, this would be an API call
      // const response = await api.put(`/api/marketing/social-posts/${postData.id}`, postData);
      // return response.data;
      
      // For now, just dispatch the synchronous action
      dispatch(updateSocialPost({
        ...postData,
        updatedAt: new Date().toISOString()
      }));
      return postData;
    } catch (error) {
      throw error;
    }
  }
);

export const {
  setSocialPosts,
  addSocialPost,
  updateSocialPost,
  deleteSocialPost,
  setSmsTemplates,
  addSmsTemplate,
  updateSmsTemplate,
  deleteSmsTemplate,
  toggleSmsTemplateStatus,
  setSmsPackages,
  addSmsPackage,
  setMarketingTickets,
  updateTicketStatus,
  setActiveCampaigns,
  toggleCampaignStatus,
  setCurrentPage,
  setItemsPerPage,
  setLoading,
  setError,
  clearError,
  clearMessage,
} = marketingSlice.actions;

export default marketingSlice.reducer;

// Selectors
export const selectAllSocialPosts = (state) => state.marketing.socialPosts;
export const selectSocialPostById = (state, postId) => 
  state.marketing.socialPosts.find(post => post.id === postId);
export const selectSmsTemplateById = (state, id) => 
  state.marketing.smsTemplates.find(template => template.id === id);

export const selectAllSmsPackages = (state) => state.marketing.smsPackages;
export const selectSmsPackageById = (state, id) => 
  state.marketing.smsPackages.find(pkg => pkg.id === id);

export const selectAllMarketingTickets = (state) => state.marketing.marketingTickets;
export const selectMarketingTicketById = (state, id) => 
  state.marketing.marketingTickets.find(ticket => ticket.id === id);

export const selectAllActiveCampaigns = (state) => state.marketing.activeCampaigns;
export const selectActiveCampaignById = (state, id) => 
  state.marketing.activeCampaigns.find(campaign => campaign.id === id);

export const selectMarketingLoading = (state) => state.marketing.loading;
export const selectMarketingError = (state) => state.marketing.error;
export const selectMarketingMessage = (state) => state.marketing.message;
export const selectCurrentPage = (state) => state.marketing.currentPage;
export const selectItemsPerPage = (state) => state.marketing.itemsPerPage;
export const selectTotalItems = (state) => state.marketing.totalItems;