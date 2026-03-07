
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
import { Download, EllipsisVertical, Eye, Folder, FolderDown, Share, Trash } from "lucide-react";
import svg from "@/assets/svg-svgrepo-com.svg";
import docx from "@/assets/docx-file-format-symbol-svgrepo-com.svg";
import pptx from "@/assets/ppt-svgrepo-com.svg";
import png from "@/assets/png-file-type-svgrepo-com.svg";
import jpg from "@/assets/jpeg-svgrepo-com.svg";
import pdf from "@/assets/xml-svgrepo-com.svg";

import { Key } from "react";
import { useFolder } from "@/hooks/useFolder";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";

const getDownloadFileName = (contentDisposition: string): string => {
  if (!contentDisposition) return 'download';

  // Prefer RFC 5987 format: filename*=UTF-8''encoded-name
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  // Fallback to basic filename="name.ext"
  const basicMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
  return basicMatch?.[1] || 'download';
};
interface Folder {
  id: string;
  name: string;
  files: { 
    name: string;
    uid?: string;
    id?: string;
     metadata: {
      originalName: string;
      mimetype: string;
      size: number 
} }[];
}



export default function Folders() {
  const {data,isLoading, refetch} = useFolder();
    const setFileIconFunction = (file: { name: string; type: string }): string | undefined => {
        const fileTypes: Record<string, string> = {
          "image/jpeg": jpg,
          "image/png": png,
          "image/svg+xml": svg,
          "application/pdf": pdf,
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": docx,
          "application/vnd.openxmlformats-officedocument.presentationml.presentation": pptx,
        };
        return fileTypes[file.type] || pdf;
      };

      const formatFileSize = (size: number): string => {
        if (size >= 1024 * 1024) {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
          return `${(size / 1024).toFixed(2)} KB`;
        }
        return `${size} Bytes`;
      };


      const handleDelete = async (folderName: string, fileUid: string) => {
          try{
                const API_URL = import.meta.env.VITE_API_URL;
                const data = await axios.delete(`${API_URL}/api/files/delete/${folderName}/${fileUid}` , {
                 withCredentials: true,
                });
                if(data.status === 200){
                  toast({
                    title: "File deleted successfully",
                    description: "File deleted successfully",
                    variant: "default",
                  });
                  await refetch();
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

      const fetchFileBlob = async (folderName: string, fileUid: string) => {
        const APIURl = import.meta.env.VITE_API_URL;
        return axios.get(`${APIURl}/api/files/download/${folderName}/${fileUid}`, {
          withCredentials: true,
          responseType: 'blob',
        });
      }

      const handleDownload = async (folderName: string, fileUid: string) => {
        try{
            const response = await fetchFileBlob(folderName, fileUid);

            const url = window.URL.createObjectURL(response.data);
            const link = document.createElement('a');
            link.href = url;
            
            const contentDisposition = response.headers['content-disposition'] || '';
            const fileName = getDownloadFileName(contentDisposition);
            
            
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

      const handleView = async (folderName: string, fileUid: string) => {
        try {
          const APIURl = import.meta.env.VITE_API_URL;
          const viewUrl = `${APIURl}/api/files/view/${encodeURIComponent(folderName)}/${encodeURIComponent(fileUid)}`;
          const opened = window.open(viewUrl, '_blank', 'noopener,noreferrer');
          if (!opened) {
            throw new Error('Popup blocked by browser');
          }

          toast({
            title: "Opened",
            description: "File opened in a new tab",
            variant: "default",
          });
        } catch (error) {
          console.log(error);
          toast({
            title: "File view failed",
            description: `Could not open file in browser`,
            variant: "destructive",
            duration: 3000,
          });
        }
      }

      const handleShare = async (folderId: string) => {
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const response = await axios.post(`${API_URL}/share/${folderId}`, {}, {
            withCredentials: true,
          });

          const shareLink = response.data?.link;
          if (!shareLink) {
            throw new Error('Share link was not returned');
          }

          if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(shareLink);
          }
          toast({
            title: "Share link copied",
            description: shareLink,
            variant: "default",
          });
        } catch (error: unknown) {
          const err = error as AxiosError<{ message?: string } | string>;
          console.log(err);
          const message =
            typeof err.response?.data === 'string'
              ? err.response.data
              : err.response?.data?.message || err.message || 'Could not create share link';
          toast({
            title: "Share failed",
            description: message,
            variant: "destructive",
          });
        }
      }

      const handleDownloadFolderZip = async (folderName: string) => {
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const response = await axios.get(`${API_URL}/api/files/download-folder/${encodeURIComponent(folderName)}`, {
            withCredentials: true,
            responseType: 'blob',
          });

          const zipBlobUrl = window.URL.createObjectURL(response.data);
          const link = document.createElement('a');
          link.href = zipBlobUrl;
          link.setAttribute('download', `${folderName}.zip`);
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => window.URL.revokeObjectURL(zipBlobUrl), 100);

          toast({
            title: 'ZIP ready',
            description: `${folderName}.zip is downloading`,
            variant: 'default',
          });
        } catch (error: unknown) {
          const err = error as AxiosError<{ message?: string } | string>;
          console.log(err);
          const message =
            typeof err.response?.data === 'string'
              ? err.response.data
              : err.response?.data?.message || err.message || 'Could not download folder as ZIP';
          toast({
            title: 'Folder download failed',
            description: message,
            variant: 'destructive',
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
                  <div className="flex w-full items-center justify-between pr-2">
                    <div className="flex gap-2 items-center">
                    <Folder className="w-5 h-5" />
                    <h3>{folder.name}</h3>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDownloadFolderZip(folder.name);
                      }}
                    >
                      <FolderDown className="w-4 h-4 mr-1" /> ZIP
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 pl-4 pt-2">
                  {folder.files.map((file, i) => {
                    const fileKey = file.uid || file.id;
                    if (!fileKey) {
                      return null;
                    }

                    return (
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
                              <Button onClick={() => handleShare(folder.id)} variant="ghost" className="w-fit">
                              <Share className="w-4" /> Share
                              </Button>
                            </MenubarItem>
                            <MenubarItem className="flex items-center">
                              <Button onClick={() => handleView(folder.name, fileKey)} variant="ghost" className="w-fit">
                                <Eye className="w-4" /> View
                              </Button>
                            </MenubarItem>
                            <MenubarItem  className="text-red-700 flex items-center">
                              <Button onClick={() => handleDelete(folder.name,fileKey)} variant="ghost" className="text-red-700 w-fit">
                                <Trash className="w-4" /> Delete
                              </Button>
                            </MenubarItem>
                            <MenubarItem className="flex items-center">
                              <Button onClick={() => handleDownload(folder.name,fileKey)} variant="ghost" className="w-fit">
                                <Download className="w-4" /> Download
                              </Button>
                            </MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </>
    );
  }
  