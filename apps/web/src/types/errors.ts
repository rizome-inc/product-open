export type ErrorLike = string | string[] | Error | { message: string };

export type ErrorModalContent = React.ReactNode | ErrorLike;

export type ErrorModalData = {
  content: ErrorModalContent;
  id: number;
  resolve: () => void;
  title?: string;
};
