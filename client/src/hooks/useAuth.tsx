import { clientConfig } from "@/config";
import {
  MutationFunction,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const getStoredToken = () => localStorage.getItem("auth_token");
const setStoredToken = (token: string) =>
  localStorage.setItem("auth_token", token);
const removeStoredToken = () => localStorage.removeItem("auth_token");

export const useAuth = <T,>(mutationFn?: MutationFunction<unknown, T>) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const authMutation = useMutation({
    mutationFn: mutationFn,
    onSuccess: (data) => {
      setStoredToken(data.token);
      queryClient.setQueryData(["auth"], data);
      queryClient.invalidateQueries({ queryKey: ["user-data"] });
      navigate("/");
    },
    onError: (_error) => {
      removeStoredToken();
      queryClient.setQueryData(["auth"], null);
    },
  });

  const signOut = () => {
    removeStoredToken();
    queryClient.setQueryData(["auth"], null);
    queryClient.invalidateQueries();
  };

  const token = getStoredToken();

  return {
    mutate: authMutation.mutate,
    signOut,
    token,
    isLoading: authMutation.isPending,
    error: authMutation.error,
    isAuthenticated: !!token,
  };
};
