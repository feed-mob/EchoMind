import { Group } from '@/app/_types/group';

export const mockGroups: Group[] = [
  {
    id: '1',
    title: 'Marketing Q4 Strategy',
    department: 'Marketing Department',
    icon: 'campaign',
    memberCount: 12,
    ideaCount: 47,
    status: 'active',
    statusText: '47 Ideas Collected',
    members: [
      { id: '1', name: 'User 1', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ' },
      { id: '2', name: 'User 2', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ' },
      { id: '3', name: 'User 3', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ' },
    ],
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    title: 'Product Roadmap 2024',
    department: 'Product Team',
    icon: 'rocket_launch',
    memberCount: 8,
    ideaCount: 32,
    status: 'active',
    statusText: '32 Ideas Collected',
    members: [
      { id: '4', name: 'User 4', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ' },
      { id: '5', name: 'User 5', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ' },
    ],
    lastActivity: '5 hours ago',
  },
  {
    id: '3',
    title: 'Customer Feedback Analysis',
    department: 'Customer Success',
    icon: 'feedback',
    memberCount: 6,
    ideaCount: 0,
    status: 'evaluating',
    statusText: 'AI Evaluation In Progress',
    members: [
      { id: '6', name: 'User 6', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGXN8Y6hzYlCGQKogfljkJrLdsYywA9uCAIF0y1jiN8FC4i4JjoZrtjbBgELKuPDDJ_LvPEe1VnavWA2DDwec7uWBIWY7XHRw9DqfT4f-UEbcF4LJ7szkAsg3DCLVcbluIFOcyU0g87hWR4u5PVAsBdrgfXYb900PtT9YEKHwboavYJ5AJm_cUOyh2gnMUiXbR0d5_EJGdOMGWxz856BNhiw_UhatJCb88hrh0kpQ1mrltLlQVQ-G5l78a6Om6YK9EzjoomcNoZQ' },
    ],
    lastActivity: 'Processing ideas...',
  },
];
