import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Link } from "react-router-dom"
import axios from "axios"
import type { AxiosError } from "axios"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import AuthSplitLayout from "@/components/layouts/AuthSplitLayout"
const formSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
})


export default function Login() {

    const { toast  } = useToast();
    const navigate = useNavigate();
    const {setIsLoggedIn} = useAuth();
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    })


   async function onSubmit(values: z.infer<typeof formSchema>) { 
        try{
            setLoading(true);
            const API_URL  = import.meta.env.VITE_API_URL;
            const response  = await axios.post(`${API_URL}/api/auth/login`, values ,{withCredentials: true});
            const data = response.data;
            if(data.success){
                toast({
                    title: "Success",
                    description: data.message,
                    variant: "default",
                })
                setIsLoggedIn(true);
                localStorage.setItem("isLoggedIn", "true");
                navigate("/protected/home");
            }
        }catch(e: unknown){
            const err = e as AxiosError<{ message?: string }>;
            console.log(err)
            const message = err.response?.data?.message || err.message || "Login failed";
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            })
            setLoading(false);
        }finally{
            setLoading(false);
        }
    }


        return (
            <AuthSplitLayout
                title="Welcome Back!"
                subtitle={
                    <>
                        Don&apos;t have an account?{' '}
                        <Link className="font-medium text-[#171717] underline" to="/register">
                            Create one now
                        </Link>
                        . It&apos;s free and takes less than a minute.
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
                                                placeholder="hisaim.ux@gmail.com"
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
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Login Now'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="h-11 w-full rounded-lg border-[#cbcbcb] bg-white text-[#111216] hover:bg-[#f5f5f5]"
                            >
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f3f3] text-xs font-semibold text-[#171717]">
                                    G
                                </span>
                                Login with Google
                            </Button>
                        </form>
                    </Form>
                }
                footer={
                    <>
                        Forget password?{' '}
                        <button type="button" className="font-semibold text-[#171717] underline">
                            Click here
                        </button>
                    </>
                }
            />
        )
}