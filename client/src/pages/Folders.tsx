
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"

  import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
  } from "@/components/ui/menubar"
import { Download, EllipsisVertical, Folder, Share, Trash } from "lucide-react";
import svg from "@/assets/svg-svgrepo-com.svg";
import docx from "@/assets/docx-file-format-symbol-svgrepo-com.svg";
import pptx from "@/assets/ppt-svgrepo-com.svg";
import png from "@/assets/png-file-type-svgrepo-com.svg";
import jpg from "@/assets/jpeg-svgrepo-com.svg";

import { Key, useEffect , useState } from "react";
import { useFolder } from "@/hooks/useFolder";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
interface Folder {
  name: string;
  files: { 
    name: string;
    id: string;
     metadata: {
      originalName: string;
      mimetype: string;
      size: number 
} }[];
}



export default function Folders() {
    const {data,isLoading} = useFolder();
    console.log(data);
    const setFileIconFunction = (file: { name: string; type: string }): string | undefined => {
        const fileTypes: Record<string, string> = {
          "image/jpeg": jpg,
          "image/png": png,
          "image/svg+xml": svg,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": docx,
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": pptx,
        };
        return fileTypes[file.type];
      };

      const formatFileSize = (size: number): string => {
        if (size >= 1024 * 1024) {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
          return `${(size / 1024).toFixed(2)} KB`;
        }
        return `${size} Bytes`;
      };


      const handleDelete = async (folderName: string, fileId: string) => {
        console.log(folderName, fileId);
          try{
                const API_URL = import.meta.env.VITE_API_URL;
                const data = await axios.delete(`${API_URL}/api/files/delete/${folderName}/${fileId}` , {
                 withCredentials: true,
                });
                if(data.status === 200){
                  toast({
                    title: "File deleted successfully",
                    description: "File deleted successfully",
                    variant: "default",
                  });
                } else {
                  toast({
                    title: "File deletion failed",
                    description: "File deletion failed 90",
                    variant: "destructive",
                  });
                } 
          }catch(error){
            console.log(error);
            toast({
              title: "File deletion failed",
              description: "File deletion failed 89",
              variant: "destructive",
            });
          }
      }

      const handleDownload = async (folderName: string, fileId: string) => {
        try{

            const APIURl = import.meta.env.VITE_API_URL;
            const response = await axios.get(`${APIURl}/api/files/download/${folderName}/${fileId}`,{
              withCredentials: true,
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'];
            const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
            const fileName = fileNameMatch ? fileNameMatch[1] : 'download';
            
            
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            // Clean up
            setTimeout(() => window.URL.revokeObjectURL(url), 100);


            toast({
              title: "Download started",
              description: "Your file is being downloaded",
              variant: "default",
            });
        }catch(error){
          console.log(error);
          toast({
            title: "File download failed",
            description: `File download failed ${error}`,
            variant: "destructive",
            duration: 3000,
          });
        }
      }
  
    return (
      <>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {data?.map((folder: Folder, index: Key | null | undefined)  => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="border-2 p-4 rounded-md border-black">
                  <div className="flex gap-2 items-center">
                    <Folder className="w-5 h-5" />
                    <h3>{folder.name}</h3>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pl-4 pt-2">
                  {folder.files.map((file, i) => (
                    <div key={i} className="w-[90%] bg-[#d3d0d01f] text-white px-1 pl-2 rounded-lg flex items-center justify-between shadow-sm">
                      <div className="flex text-black gap-2 items-center p-2">
                        <img
                        src={setFileIconFunction({
                            name: file.name, type: file.metadata.mimetype})}
                        alt="file" className="w-8" />
                        <div>
                          <h4 className="font-bold">{file.name}</h4>
                          <p className="text-[#787070]">{formatFileSize(file.metadata.size)}</p>
                        </div>
                      </div>
  
                      <Menubar className="text-black bg-none border-none shadow-none">
                        <MenubarMenu>
                          <MenubarTrigger>
                            <EllipsisVertical className="w-3" />
                          </MenubarTrigger>
                          <MenubarContent className="flex flex-col w-8">
                            <MenubarItem className="flex">
                              <Button variant="ghost" className="w-fit">
                              <Share className="w-4" /> Share
                              </Button>
                            </MenubarItem>
                            <MenubarItem  className="text-red-700 flex items-center">
                              <Button onClick={() => handleDelete(folder.name,file.id)} variant="ghost" className="text-red-700 w-fit">
                                <Trash className="w-4" /> Delete
                              </Button>
                            </MenubarItem>
                            <MenubarItem className="flex items-center">
                              <Button onClick={() => handleDownload(folder.name,file.id)} variant="ghost" className="w-fit">
                                <Download className="w-4" /> Download
                              </Button>
                            </MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </>
    );
  }
  