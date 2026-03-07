
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import Uploader from "@/components/Uploader/Uploader"
import Folder from "@/pages/Folders"
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import type { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";






export default function Home() {
  const savedTab = localStorage.getItem("selecetedTab") || "upload";
  const [folderName, setFolderName] = useState<string>("")
    const [createFolderLoading, setCreateFolderLoading] = useState<boolean>(false)

  const handleTabChange = (value: string) => {
    localStorage.setItem("selecetedTab", value);
  };

  const createFolderHandler = async (e: FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const trimmedName = folderName.trim();

    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      });
      return;
    }

    setCreateFolderLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(
        `${API_URL}/api/folders/create-folder`,
        { name: trimmedName },
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast({
          title: "Success",
          description: res.data?.message || "Folder created successfully",
          variant: "default",
        });
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string } | string>;
      const apiMessage =
        typeof axiosErr.response?.data === 'string'
          ? axiosErr.response.data
          : axiosErr.response?.data?.message || axiosErr.message || 'Request failed';
      console.error(axiosErr);
      toast({
        title: "Error",
        description: String(apiMessage),
        variant: "destructive",
      });
    } finally {
      setCreateFolderLoading(false);
    }
  }

  return (
    <Tabs
     defaultValue={savedTab}
     onValueChange={handleTabChange}
      className="w-[90%] max-w-[900px] mx-auto mt-10">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="upload" className="capitalize">Upload</TabsTrigger>
        <TabsTrigger value="Folders">Folders</TabsTrigger>
      </TabsList>
      <TabsContent value="upload">
        <Uploader />
      </TabsContent>


      <TabsContent value="Folders" className="flex">
        <Card className="w-[60%] border-none shadow-none rounded-none ">
          <CardHeader>
            <CardTitle>Folders</CardTitle>
            <CardDescription>
            create folders and store your files 
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-1"> 
            <Folder />
          </CardContent>

         
        </Card>
        <Card className="w-[40%] border-none shadow-none">
          <CardHeader>
            <CardTitle>Create New Folder</CardTitle>
            <CardDescription>
            create a new folder to organize your files 
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input name="folderName" onChange={(e)=>setFolderName(e.target.value)} type="text" placeholder="Folder Name" className="w-full py-1 px-4 rounded-md border-gray-300 border-2 focus:outline-none" />
          </CardContent>
          <CardFooter className="flex items-center justify-end">
            <button 
            onClick={createFolderHandler}
            className="w-full h-8 rounded-md text-[.9rem] font-Rubic text-white bg-black hover:bg-gray-700">
              {
                createFolderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'
              }
            </button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
