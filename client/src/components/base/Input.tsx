import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

type InputFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  label?: string;
  onEnterPress?: () => void;
};

export const InputField = <TFieldValues extends FieldValues>({
  control,
  name,
  type = "text",
  autoComplete,
  disabled = false,
  required = false,
  label,
  placeholder,
  leftElement,
  rightElement,
  onEnterPress,
}: InputFieldProps<TFieldValues>) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && onEnterPress) {
      e.preventDefault();
      onEnterPress();
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={"space-y-1.5"}>
          {label && (
            <FormLabel
              className={cn(
                required &&
                  "after:content-['*'] after:ml-0.5 after:text-red-500"
              )}
            >
              {label}
            </FormLabel>
          )}

          <FormControl>
            <div className="relative">
              {leftElement && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  {leftElement}
                </div>
              )}

              <Input
                {...field}
                id={name}
                type={type}
                autoComplete={autoComplete}
                disabled={disabled}
                placeholder={placeholder}
                aria-invalid={!!fieldState.error}
                required={required}
                className={cn(
                  leftElement && "pl-10",
                  rightElement && "pr-10",
                  fieldState.error &&
                    "border-red-500 focus-visible:ring-red-500"
                )}
                onKeyDown={handleKeyDown}
              />

              {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {rightElement}
                </div>
              )}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
};
