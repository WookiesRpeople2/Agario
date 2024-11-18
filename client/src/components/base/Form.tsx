import React from "react";
import { UseFormProps, useForm as useReactForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

type FormProps = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
} & React.FormHTMLAttributes<HTMLFormElement>;

type UseZodFormProps<T extends z.ZodSchema> = {
  schema: T;
} & Omit<UseFormProps<z.infer<T>>, "resolver">;

export const useZodForm = <T extends z.ZodSchema>({
  schema,
  ...formProps
}: UseZodFormProps<T>) => {
  return useReactForm<z.infer<T>>({
    mode: "onTouched",
    reValidateMode: "onChange",
    criteriaMode: "all",
    resolver: zodResolver(schema),
    ...formProps,
  });
};

export const Form = ({
  onSubmit,
  children,
  className = "",
  ...props
}: FormProps) => {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className={cn(className, `flex flex-col gap-2 `)}
      {...props}
    >
      {children}
    </form>
  );
};
