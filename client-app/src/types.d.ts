import { UseToastOptions } from "@chakra-ui/react";
export {};

declare global {
  interface Window {
    toast: (options?: UseToastOptions | undefined) => any;
    navigate: (url: string) => void;
  }
}
export interface Activity {
  id: string;
  title: string;
  date: Date;
  description: string;
  category: string;
  city: string;
  venue: string;
}

export interface ServerError {
  statusCode: number;
  message: string;
  details: string;
}

export interface User {
  username: string;
  displayName: string;
  token: string;
  image?: string;
}
