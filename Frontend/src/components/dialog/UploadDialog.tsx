import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import publicicon from '@/assets/folder-link-svgrepo-com.svg'
import { Label } from "@/components/ui/label"
import add from '@/assets/add-ellipse-svgrepo-com.svg'
import Combobox  from "../combo/Combobox"
import axios from "axios"
import { toast } from "@/hooks/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"


interface Props {

  file: File | null

}

export default function UploadComponet({ file }: Props) {
  const [folderName, setFolderName] = useState<string>("")
  const [selectedFolder, setSelectedFolder] = useState<string>("")
  const [isFolderCreated, setFolderCreated] = useState<boolean>(false)
  const [folderId,setFolderId] = useState<string>('')
  const [creatBtnDisable, serCreateBtnDisable] = useState<boolean>(false)
  const [isOpen , setIsOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [createFolderLoading, setCreateFolderLoading] = useState<boolean>(false)

  const handleFolderChange = (folder: string) => {
    setSelectedFolder(folder)
    console.log("Selected Folder:", folder) // Here you get the selected folder
  }

  const createFolderHandler = async (e: any) => {
    e.preventDefault()
    const trimmedName = folderName.trim()

    if (!trimmedName) {
      toast({
        title: "Error",
        description: "Folder name is required",
        variant: "destructive",
      })
      return
    }

    setCreateFolderLoading(true)
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await axios.post(API_URL + '/api/folders/create-folder', {
        name: trimmedName 
      }, {
        withCredentials: true,
      })
      
      if (res.status === 200) {
        console.log(res.data)
        setFolderCreated(true) 
        setFolderId(res.data.folderID)
        toast({
          title: "Success",
          description: res.data?.message || 'Folder created successfully',
          variant: "default",
        })
        serCreateBtnDisable(true)
      }
    } catch (err: any) {
      const apiMessage = err?.response?.data?.message || err?.response?.data || err?.message || 'Request failed'
      console.error(err)
      toast({
        title: "Error",
        description: String(apiMessage),
        variant: "destructive",
      })
    } finally {
      setCreateFolderLoading(false)
    }
  }

  const uploadFile = async (e: any) => {
    e.preventDefault()
    console.log(file)
    setLoading(true)
    try {
      const folder = selectedFolder || folderName || 'public'
      const API_URL = import.meta.env.VITE_API_URL;


      const formData = new FormData();
      if (file) {
        formData.append('file', file); 
      }
      formData.append('folder', folder); 
      formData.append('folderID',folderId);

      const res = await axios.post(`${API_URL}/api/files/file`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.status === 200) {
        toast({
          title: "Success",
          description: 'File uploaded successfully',
          variant: "default",
        })
        setFolderCreated(false)
        setSelectedFolder("")
        setLoading(false)
        setIsOpen(false);
      }
    } catch (err: any) {
      
      toast({
        title: 'Failed',
        description: `${err.response.data} happened`,
        variant: "destructive"
      })
    } finally{
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
      <Button onClick={() => setIsOpen(true)} className="justify-end">
        <img src={add} alt="add btn" className="w-5" />
        Upload
      </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-black text-2xl font-semibold font-Rubic mb-4">
            
          </DialogTitle>
          <DialogDescription>
            <span className="text-lg text-[#756E6E] flex mb-2">
              Upload to public Folder by default
              <span className="text-black flex ml-2 text-[.9rem] font-bold font-Rubic items-center justify-center space-x-5">
                <img src={publicicon} alt="" className="w-6 capitalize items-center mr-1" />
                public
              </span>
            </span>
          </DialogDescription>
        </DialogHeader>

        <Button type="submit" className="w-[95%] mx-auto h-8 rounded-sm text-[.9rem] font-Rubic" onClick={uploadFile}>
          {
              loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'
          }
        
          </Button>

        <div className="flex items-center justify-center space-x-4 mt-4">
          <div className="w-[40%] h-[.05rem] bg-black"></div>
          <h1>or</h1>
          <div className="w-[40%] h-[.05rem] bg-black"></div>
        </div>
        <div>
          <Combobox onFolderSelect={handleFolderChange} isFolderThere={isFolderCreated} />
        </div>
        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
          <p className="text-md text-black font-bold font-Rubic mx-auto w-[90%]">If you want to add a folder, you can create one</p>
          <div className="flex items-center ml-3 space-x-4 mt-2 w-full">
            <Label className="text-black text-sm font-Rubic font-semibold">Folder name</Label>
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)} 
              className="w-[150px] mx-auto h-8 rounded-sm placeholder:text-xs placeholder:text-gray-400 font-rubik text-gray-700 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter folder name"
            />

            <Button
              onClick={createFolderHandler}
              className="w-[95px] h-8 rounded-sm text-[.9rem] font-Rubic"
              disabled={creatBtnDisable || selectedFolder !== ""}
            >
              {
                createFolderLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'
              }
            </Button>
          </div>
          <p className="text-sm text-[#756E6E] font-medium font-Rubic w-[90%]">After you create a folder, click the upload button</p>
        </div>
        <DialogFooter />
      </DialogContent>
    </Dialog>
  )
}
