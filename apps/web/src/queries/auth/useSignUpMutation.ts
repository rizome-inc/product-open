import apiClient from "@/api";
import { useMutation } from "@tanstack/react-query";
import { SignupSchema } from "xylem";

export function useSignUpMutation({
  onError,
  onSuccess,
}: {
  onError?: (error: Error) => void;
  onSuccess?: () => void;
} = {}) {
  return useMutation({
    mutationFn: async (body: SignupSchema) => {
      const res = await apiClient.auth.signup({
        body,
      });
      if (res.status !== 201) {
        throw new Error(`Failed to sign up: ${JSON.stringify(res.body)}`);
      }
      return res.body;
    },
    onError,
    onSuccess,
  });
}
