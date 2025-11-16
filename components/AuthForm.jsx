"use client";

import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FIELD_NAMES, FIELD_TYPES } from "@/constants";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "./ui/toast-provider";


const AuthForm = ({
  type,
  schema,
  defaultValues,
  onSubmit,
}) => {
  const router = useRouter();
  const toast = useToast()

  const isSignIn = type === "SIGN_IN";

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
  });

  const handleSubmit = async (data) => {
    const result = await onSubmit(data);
    console.log(result)

    if (result.success) {
      isSignIn ? toast.success("you have succesfully signed in")
      : toast.success("You have succesfully signed up")

      router.push("/");
    } else {
      isSignIn ? toast.error("Error Signing in")
      : toast.error("Error signing up")
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to Beauty AI" : "Create your personal account"}
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-6"
        >
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field.name]}
                  </FormLabel>
                  <FormControl>
                      <Input
                        required
                        type={
                          FIELD_TYPES[field.name]
                        }
                        {...field}
                        className="form-input"
                      />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="form-btn">
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BeautyAI ? " : "Already have an account? "}

        <Link
          href={isSignIn ? "/sign-up" : "/sign-in"}
          className="font-bold text-primary"
        >
          {isSignIn ? "Create an account" : "Sign in"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm