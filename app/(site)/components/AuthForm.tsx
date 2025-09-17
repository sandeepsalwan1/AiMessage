"use client";

import axios from "axios";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { BsGithub, BsGoogle } from "react-icons/bs";

import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import AuthSocialButton from "./AuthSocialButton";

type Variant = "LOGIN" | "REGISTER";

const AuthForm = () => {
  const session = useSession();
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session.status === "authenticated") {
      toast.success("Logged in!");
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    if (!data) {
      toast.error("Please fill in all fields!");
      return;
    }

    if (variant === "REGISTER") {
      try {
        await axios.post("/api/register", data);
        const callback = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (callback?.error) {
          toast.error(callback.error || "Invalid credentials!");
        } else {
          toast.success("Account created!");
          router.push("/users");
        }
      } catch (err: any) {
        if (err?.response?.status === 409) {
          toast.error("Email already registered");
        } else if (err?.response?.data) {
          const errorMessage = typeof err.response.data === 'string'
            ? err.response.data
            : err.response.data.error || err.response.data.message || 'Registration failed';
          toast.error(errorMessage);
        } else {
          toast.error("Registration failed");
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (variant === "LOGIN") {
      try {
        const callback = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (callback?.error) {
          toast.error("Invalid credentials!");
        }
        if (callback?.ok && !callback?.error) {
          toast.success("Logged in!");
          router.push("/users");
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, {
      redirect: false,
    }).then((callback) => {
      if (callback?.error) {
        toast.error("Something went wrong!");
      }
      if (callback?.ok && !callback?.error) {
        toast.success("Logged in!");
      }
    });

    setIsLoading(false);
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && <Input id="name" label="Name" register={register} errors={errors} />}
          <Input id="email" label="Email" type="email" register={register} errors={errors} />
          <Input id="password" label="Password" type="password" register={register} errors={errors} />
          <div>
            <Button disabled={isLoading} fullWidth type="submit">
              {variant === "LOGIN" ? "Sign in" : "Register"}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2">
            <AuthSocialButton icon={BsGithub} onClick={() => socialAction("github")} />
            <AuthSocialButton icon={BsGoogle} onClick={() => socialAction("google")} />
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <div>{variant === "LOGIN" ? "Don't have an account?" : "Already have an account?"}</div>
          <div onClick={toggleVariant} className="underline cursor-pointer">
            {variant === "LOGIN" ? "Register" : "Sign in"}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
