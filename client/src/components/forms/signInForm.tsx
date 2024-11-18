import { Form, useZodForm } from "@/components/base/Form";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/base/Input";
import { z } from "zod";
import { FormProvider } from "react-hook-form";
import {
  emailValidator,
  passwordValidator,
  usernameValidator,
} from "@/lib/validators";
import { BaseFormProps } from "@/types";
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  User2Icon,
} from "lucide-react";
import { useState } from "react";

const signInSchema = z.object({
  username: usernameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export type SignInFormValues = z.infer<typeof signInSchema>;

export const SignInForm: React.FC<BaseFormProps<SignInFormValues>> = ({
  onSubmit,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const form = useZodForm({
    schema: signInSchema,
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  return (
    <FormProvider {...form}>
      <Form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-1/2">
        <InputField
          control={form.control}
          name="username"
          label="Username"
          required
          placeholder="Enter your username"
          disabled={isLoading}
          leftElement={<User2Icon className="h-4 w-4 text-gray-500" />}
          onEnterPress={() => form.handleSubmit(onSubmit)()}
        />
        <InputField
          control={form.control}
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          disabled={isLoading}
          leftElement={<MailIcon className="h-4 w-4 text-gray-500" />}
          onEnterPress={() => form.handleSubmit(onSubmit)()}
        />

        <InputField
          control={form.control}
          name="password"
          label="Password"
          type={showPassword ? "text" : "password"}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          disabled={isLoading}
          leftElement={<LockIcon className="h-4 w-4 text-gray-500" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOffIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              ) : (
                <EyeIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
              )}
            </button>
          }
          onEnterPress={() => form.handleSubmit(onSubmit)()}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </Form>
    </FormProvider>
  );
};
