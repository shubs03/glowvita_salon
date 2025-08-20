declare module '../../../../packages/store/src/slices/marketingslice' {
  import { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
  
  export interface SmsPackage {
    id: string;
    name: string;
    smsCount: number;
    price: number;
    description: string;
    validityDays: number;
    isPopular: boolean;
    features: string[];
    createdAt: string;
    updatedAt: string;
  }

  export interface SmsTemplate {
    id: string;
    name: string;
    content: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }

  export const useGetSmsPackagesQuery: any;
  export const useCreateSmsPackageMutation: () => [
    (pkg: Omit<SmsPackage, 'id'>) => Promise<any>,
    { isLoading: boolean; error: any }
  ];
  export const useUpdateSmsPackageMutation: () => [
    (pkg: SmsPackage) => Promise<any>,
    { isLoading: boolean; error: any }
  ];
  export const useDeleteSmsPackageMutation: () => [
    (id: string) => Promise<any>,
    { isLoading: boolean; error: any }
  ];
}
