import { SignUpForm, SignUpFormValues } from "@/components/forms/signUpForm";
import { useAuth } from "@/hooks/useAuth";
const signUpFn = async ({
  username,
  email,
  password,
}: SignUpFormValues): Promise<void> => {
  const response = await fetch("http://localhost:3001/api/auth/sign-up", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error("Sign in failed. Please check your credentials.");
  }

  return response.json();
};

export const SignUp = () => {
  const { mutate, isLoading } = useAuth(signUpFn);

  const onSubmit = async (values: SignUpFormValues) => {
    mutate(values);
  };

  return (
    <div className="flex justify-center align-middle">
      <SignUpForm onSubmit={onSubmit} isLoading={isLoading} />
    </div>
  );
};
