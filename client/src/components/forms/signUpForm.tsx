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

const signUpSchema = z
  .object({
    username: usernameValidator,
    email: emailValidator,
    password: passwordValidator,
    confirmPassword: passwordValidator,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

export type SignUpFormValues = z.infer<typeof signUpSchema>;

type PawwordFields = {
  name: "password" | "confirmPassword";
  label: string;
  placeholder: string;
  autoComplete: string;
};

const passwordFields: PawwordFields[] = [
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    autoComplete: "current-password",
  },
  {
    name: "confirmPassword",
    label: "Confirm Password",
    placeholder: "Confirm your password",
    autoComplete: "new-password",
  },
];

export const SignUpForm: React.FC<BaseFormProps<SignUpFormValues>> = ({
  onSubmit,
  isLoading,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const form = useZodForm({
    schema: signUpSchema,
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
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

        {passwordFields.map((field) => (
          <InputField
            key={field.name}
            control={form.control}
            name={field.name}
            label={field.label}
            type={showPassword ? "text" : "password"}
            required
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
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
        ))}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
      </Form>
    </FormProvider>
  );
};
