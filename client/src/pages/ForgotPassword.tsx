import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import type { AxiosError } from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import AuthSplitLayout from "@/components/layouts/AuthSplitLayout";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const passwordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ForgotStep = "email" | "otp" | "password" | "done";
const RESEND_COOLDOWN_SECONDS = 60;

export default function ForgotPassword() {
  const [step, setStep] = useState<ForgotStep>("email");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { toast } = useToast();
  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_URL;

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const getErrorMessage = (error: unknown, fallback: string) => {
    const err = error as AxiosError<{ message?: string }>;
    return err.response?.data?.message || err.message || fallback;
  };

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const formatCooldown = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
    const ss = String(seconds % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const requestOtp = async (values: z.infer<typeof emailSchema>) => {
    try {
      setLoading(true);
      const normalizedEmail = values.email.trim().toLowerCase();
      await axios.post(`${apiBase}/api/auth/forgot-password/request`, { email: normalizedEmail }, { withCredentials: true });
      setEmail(normalizedEmail);
      setStep("otp");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast({ title: "OTP sent", description: "Check your email for the 6-digit code." });
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error, "Failed to send OTP"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      toast({ title: "Invalid OTP", description: "Enter the full 6-digit code.", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${apiBase}/api/auth/forgot-password/verify`,
        { email, otp },
        { withCredentials: true }
      );

      if (response.data?.resetToken) {
        setResetToken(response.data.resetToken);
        setStep("password");
        toast({ title: "OTP verified", description: "Create your new password." });
      }
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error, "OTP verification failed"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (values: z.infer<typeof passwordSchema>) => {
    try {
      setLoading(true);
      await axios.post(
        `${apiBase}/api/auth/forgot-password/reset`,
        {
          email,
          newPassword: values.newPassword,
          resetToken,
        },
        { withCredentials: true }
      );

      setStep("done");
      toast({ title: "Password updated", description: "You can now log in with your new password." });
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error, "Failed to reset password"), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (step === "email") {
      return {
        title: "Forgot Password",
        subtitle: "Enter your email first and we will send you a 6-digit OTP code.",
        form: (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(requestOtp)} className="space-y-5">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5c5c5c]">Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="h-11 rounded-none border-0 border-b border-[#bcbcbc] bg-transparent px-0 text-base focus-visible:ring-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="h-11 w-full rounded-lg bg-[#111216] text-white hover:bg-[#24252b]" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
              </Button>
            </form>
          </Form>
        ),
        footer: (
          <>
            Remember your password?{" "}
            <Link className="font-semibold text-[#171717] underline" to="/login">
              Login
            </Link>
          </>
        ),
      };
    }

    if (step === "otp") {
      return {
        title: "Verify OTP",
        subtitle: (
          <>
            We sent a 6-digit code to <span className="font-semibold text-[#171717]">{email}</span>.
          </>
        ),
        form: (
          <div className="space-y-5">
            <div>
              <p className="mb-3 text-sm text-[#5c5c5c]">Enter OTP</p>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))}
                pattern="[0-9]*"
                containerClassName="justify-center"
              >
                <InputOTPGroup className="w-full justify-center">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <InputOTPSlot key={index} index={index} />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button type="button" className="h-11 w-full rounded-lg bg-[#111216] text-white hover:bg-[#24252b]" onClick={verifyOtp} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify OTP"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full rounded-lg border-[#cbcbcb] bg-white text-[#111216] hover:bg-[#f5f5f5]"
              onClick={() => emailForm.handleSubmit(requestOtp)()}
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend OTP in ${formatCooldown(resendCooldown)}` : "Resend OTP"}
            </Button>
          </div>
        ),
        footer: (
          <button
            type="button"
            className="font-semibold text-[#171717] underline"
            onClick={() => {
              setStep("email");
              setOtp("");
              setResendCooldown(0);
            }}
          >
            Change email
          </button>
        ),
      };
    }

    if (step === "password") {
      return {
        title: "Create New Password",
        subtitle: "Set a new password and continue to login.",
        form: (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(resetPassword)} className="space-y-5">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5c5c5c]">New Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="New password"
                        className="h-11 rounded-none border-0 border-b border-[#bcbcbc] bg-transparent px-0 text-base focus-visible:ring-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#5c5c5c]">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm password"
                        className="h-11 rounded-none border-0 border-b border-[#bcbcbc] bg-transparent px-0 text-base focus-visible:ring-0"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="h-11 w-full rounded-lg bg-[#111216] text-white hover:bg-[#24252b]" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset Password"}
              </Button>
            </form>
          </Form>
        ),
        footer: (
          <>
            Back to{" "}
            <Link className="font-semibold text-[#171717] underline" to="/login">
              Login
            </Link>
          </>
        ),
      };
    }

    return {
      title: "Password Updated",
      subtitle: "Your password was updated successfully.",
      form: (
        <div className="space-y-5">
          <Button
            type="button"
            className="h-11 w-full rounded-lg bg-[#111216] text-white hover:bg-[#24252b]"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </div>
      ),
      footer: "",
    };
  };

  const content = renderContent();

  return (
    <AuthSplitLayout
      title={content.title}
      subtitle={content.subtitle}
      form={content.form}
      footer={content.footer}
    />
  );
}
