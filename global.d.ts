/// <reference types="nativewind/types" />

interface Step {
  title: string;
  content: string;
}

interface Recipe {
  id: number;
  created_at: string;
  title: string;
  notes: string;
  from_user: string;
  steps: Step[] | null;
  isPublic: boolean;
  image_url: string;
}

interface CustomButtonProps {
  title?: string;
  containerClassName?: string;
  contentClassName?: string;
  textClassName?: string;
  children?: ReactNode;
}
