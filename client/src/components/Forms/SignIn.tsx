import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import {  useForm } from "react-hook-form"
import { Form , FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useState } from "react";   
import { Loader2 } from "lucide-react";
const formSchema = z.object({
    username: z.string().min(3),
    email: z.string().email().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
    password: z.string().min(6),
})


export default function Register() {
    const [loading, setLoading] = useState<boolean>(false);
    const {toast  } = useToast();
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
        },
    })


    async function onSubmit(values: z.infer<typeof formSchema>) { 
        try{
            setLoading(true);
            const API = import.meta.env.VITE_API_URL;
            const response = await axios.post(`${API}/api/auth/register`, values ,{withCredentials: true});
            const data = response.data;
            if(data.success){
                toast({
                    title: "Success",
                    description: data.message,
                    variant: "default",
                })
                setLoading(false);
                navigate("/login");
            }
        }catch(e: any){
            console.log(e)
            toast({
                title: "Error",
                description: e.response.data.message,
                variant: "destructive",
            })      
            setLoading(false);
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[400px] mx-auto mt-28 p-5 border-2 rounded-lg shadow-md ">
              <h1 className="text-3xl font-bold capitalize">Sign Up</h1>
               <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                                <Input placeholder="Username" {...field} />
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="Email" {...field} />
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
                                <Input type="password" placeholder="Password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register'} </Button>
                <div className="flex justify-center gap-2">
                    <p className="text-center">have an account?</p>
                     <a href="/login">sign in</a>
                </div>
            </form>
        </Form>
    )
}