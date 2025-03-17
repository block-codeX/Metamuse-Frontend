"use client";
import { z } from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Define the form schema with Zod
  const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  // Define the form type based on the schema
  type LoginFormValues = z.infer<typeof loginSchema>;

  // Initialize the form with react-hook-form and zodResolver
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle form submission
  function onSubmit(values: LoginFormValues) {
    console.log("Form submission successful:", values);
    setSubmitStatus("success");

    // In a real app, you would send this data to your backend
    // await signIn(values.email, values.password);
  }

  return (
    <Card className="w-full h-[500px] p-4 m-4 bg-foreground dark:bg-foreground text-text-alt dark:text-text-alt">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl my-8 font-bold text-center">
          Login to your Account
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitStatus === "success" && (
          <Alert className="mb-4 bg-green-50 text-green-800">
            <AlertDescription>
              Login successful! Check the console for form data.
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex flex-flow flex-col justify-start items-stretch gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="your.email@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        {...field}
                      />
                      <div
                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              size="lg"
              type="submit"
              className="bg-btn-primary text-white w-full p-3 text-[16px]"
            >
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <a href="#" className="text-link">
            Forgot your password?
          </a>
          <div>
            New to the platform?{" "}
            <a
              href="/auth/signup"
              className="text-btn-primary dark:text-btn-primary font-bold cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300"
            >
              Sign up
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
