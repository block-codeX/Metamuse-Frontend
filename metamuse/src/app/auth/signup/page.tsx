"use client";
import { z } from "zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
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
import { api } from "@/lib/utils";
import { toast } from "sonner";
import { useUserStore } from "@/lib/stores/user-store";
import useLocalStorage from "../context/useLocalstorage";
export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { setUserId } = useUserStore();
  const [otpData, setOtpData] = useLocalStorage("otp", {})
  
  // Define the form schema with Zod
  const signupSchema = z.object({
    firstName: z.string().nonempty("Please enter your first name"),
    lastName: z.string().nonempty("Please enter your last name"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  })

  // Define the form type based on the schema
  type SignupFormValues = z.infer<typeof signupSchema>;

  // Initialize the form with react-hook-form and zodResolver
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signup = async (data: any) => {
    try {
      const apiInstance = api(true);
      console.log("API URL:", apiInstance.defaults.baseURL);
      const response = await api(true).post("/auth/signup", data);
      if (response.status === 201) {
        setUserId(response.data.userId);
        toast.success("Signup Successful");
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error?.response?.data?.message?.message || "Something went wrong!");
      return false;
    }
  };
  const requestOtp = async (email: string) => {
    try {
      const response = await api().post("/auth/otp/request", {
        email,
        otpType: "EMAIL",
        multiUse: false,
      });
      if (response.status == 201) {
        console.log(response.data)
        setOtpData({ otpId: response.data.otp.otpId, email})
      }
    } catch (error) {
      console.error(error)
    }
  };
  // Handle form submission
  async function onSubmit(values: SignupFormValues) {
    console.log("Form submission successful:", values);
    const success = await signup(values);
    if (success) {
      await requestOtp(values.email);
      router.push('/auth/verify')
    }
  }

  return (
    <Card className="w-full min-h-[500px] p-4 m-4 bg-surface">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl my-3 font-bold text-center">
          Signup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 flex flex-flow flex-col justify-start items-stretch gap-2"
          >
            <div className="flex flex-row justify-between gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="James" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Brown" type="text" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
              className="bg-secondary text-on-tertiary hover:bg-secondary/90 w-full p-3 text-[16px]"
            >
              Sign Up
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <div>
            Already have an account?{" "}
            <span
              onClick={() => router.push("/auth/login")}
              className="font-syne font-bold cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Log in
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
