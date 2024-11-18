import { SignInForm, SignInFormValues } from "@/components/forms/signInForm";
import { useAuth } from "@/hooks/useAuth";

const signInFn = async (credentials: SignInFormValues): Promise<void> => {
  const response = await fetch("http://localhost:3001/api/auth/sign-in", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Sign in failed. Please check your credentials.");
  }

  return response.json();
};

export const SignIn = () => {
  const { mutate, isLoading } = useAuth(signInFn);

  const onSubmit = async (values: SignInFormValues) => {
    mutate(values);
  };

  return (
    <div className="flex justify-center align-middle">
      <SignInForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};
