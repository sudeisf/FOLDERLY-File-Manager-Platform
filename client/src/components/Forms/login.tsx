import { Input } from "../ui/input"
import { Button } from "../ui/button"
import {z} from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Link } from "react-router-dom"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Loader2 } from "lucide-react"
import { useState } from "react"
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
        }catch(e: any){
            console.log(e)
            toast({
                title: "Error",
                description: e.response.data.message,
                variant: "destructive",
            })
            setLoading(false);
        }finally{
            setLoading(false);
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-[400px] mx-auto mt-28 p-5 border-2 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold ">Login</h1>
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
                <div className="text-right">
                    <a href="" className="text-right text-black  ">Forgot password ?</a>
                </div>
                    <Button type="submit" className="w-full">{ loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Login'} </Button>
                <div className="text-center flex items-center justify-center gap-2">
                    <p>Don't have an account?</p>
                    <Link to='/register'>Register</Link>
                </div>
            </form>
        </Form>
    )
}