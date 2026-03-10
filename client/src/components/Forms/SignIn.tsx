import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {  useForm } from "react-hook-form"
import { Form , FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import type { AxiosError } from "axios"
import { useRegisterMutation } from "@/api/hooks/useAuthMutations"
import { useToast } from "@/hooks/use-toast"
import { Link, useNavigate } from "react-router-dom"
import { Loader2 } from "lucide-react";
import AuthSplitLayout from "@/components/layouts/AuthSplitLayout"
const formSchema = z.object({
    username: z.string().min(3),
    email: z.string().email().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    password: z.string().min(6),
})


export default function Register() {
    const {toast  } = useToast();
    const navigate = useNavigate();
    const registerMutation = useRegisterMutation();
    const loading = registerMutation.isPending;
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })

    const handleGoogleLogin = () => {
        const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
        const googleAuthUrl = apiBase ? `${apiBase}/api/auth/google` : '/api/auth/google';
        window.location.href = googleAuthUrl;
    }


    async function onSubmit(values: z.infer<typeof formSchema>) { 
        try{
            const data = await registerMutation.mutateAsync(values);
            if(data.success){
                toast({
                    title: "Success",
                    description: data.message,
                    variant: "default",
                })
                navigate("/login");
            }
        }catch(e: unknown){
            const err = e as AxiosError<{ message?: string }>;
            console.log(err)
            const message = err.response?.data?.message || err.message || "Registration failed";
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            })      
        }
    }


        return (
            <AuthSplitLayout
                title="Create Account"
                subtitle={
                    <>
                        Already have an account?{' '}
                        <Link className="font-medium text-[#171717] underline" to="/login">
                            Sign in now
                        </Link>
                        . Start uploading and organizing files in seconds.
                    </>
                }
                form={
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#5c5c5c]">Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Username"
                                                className="h-11 rounded-none border-0 border-b border-[#bcbcbc] bg-transparent px-0 text-base focus-visible:ring-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
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

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[#5c5c5c]">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Password"
                                                className="h-11 rounded-none border-0 border-b border-[#bcbcbc] bg-transparent px-0 text-base focus-visible:ring-0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="h-11 w-full rounded-lg bg-[#111216] text-white hover:bg-[#24252b]">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="h-11 w-full rounded-lg border-[#cbcbcb] bg-white text-[#111216] hover:bg-[#f5f5f5]"
                            >
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f3f3] text-xs font-semibold text-[#171717]">
                                    G
                                </span>
                                Continue with Google
                            </Button>
                        </form>
                    </Form>
                }
                footer={
                    <>
                        By signing up, you agree to our{' '}
                        <button type="button" className="font-semibold text-[#171717] underline">
                            Terms
                        </button>
                        .
                    </>
                }
            />
        )
}