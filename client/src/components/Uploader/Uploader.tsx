import { useRef, useState } from "react";
import { Input } from "../ui/input";
import uploader from "@/assets/uploader.svg";
import { z } from "zod";
import { ZodError } from "zod";
import { toast } from "@/hooks/use-toast";
import svg from "@/assets/svg-svgrepo-com.svg";
import docx from "@/assets/docx-file-format-symbol-svgrepo-com.svg";
import pptx from "@/assets/ppt-svgrepo-com.svg";
import png from "@/assets/png-file-type-svgrepo-com.svg";
import jpg from "@/assets/jpeg-svgrepo-com.svg";
import pdf from "@/assets/xml-svgrepo-com.svg";
import cancelIcon from "@/assets/remove-circle-svgrepo-com.svg";
import { Button } from "../ui/button";
import { useDrop } from "react-dnd";
import { NativeTypes } from "react-dnd-html5-backend";

// Zod schema for file validation
const formSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size < 2 * 1024 * 1024, {
      message: "File size must be less than or equal to 2MB",
    })
    .refine((file) => {
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/svg+xml",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      return validTypes.includes(file.type);
    }, {
      message: "File must be JPG, PNG, SVG, PDF, DOCX, or PPTX",
    }),
});

// Function to map file types to icons
  const setFileIconFunction = (file: File): string | undefined => {
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

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [fileIcon, setFileIcon] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectedFile = (selectedFile: File) => {
    const icon = setFileIconFunction(selectedFile);

    try {
      formSchema.parse({ file: selectedFile });
      setFile(selectedFile);
      setFileIcon(icon || undefined);
      toast({
        title: "Success",
        description: `${selectedFile.name} uploaded successfully`,
        variant: "default",
      });
    } catch (error: unknown) {
      const validationError = error as ZodError;
      toast({
        title: "Error",
        description: validationError.errors?.[0]?.message || "Invalid file",
        variant: "destructive",
      });
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [NativeTypes.FILE],
    drop: (item: { files?: File[] | FileList }) => {
      const droppedFile = item?.files?.[0];
      if (droppedFile) {
        handleSelectedFile(droppedFile);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleCancel = () => {
    setFile(null);
    setFileIcon(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    handleSelectedFile(selectedFile);

    e.target.value = ""; 
  };

  return (
    <div className="w-full h-full max-h-[700px] bg-[#f5f3f3a3] p-2 rounded-lg shadow-sm">
      <div className="w-full h-full max-h-[700px] bg-white pt-8 rounded-lg border-2 shadow-sm">
        <div className="w-full mx-auto bg-white rounded-lg p-4 mb-4">
          <div
            ref={drop}
            className={`relative w-[95%] mx-auto mb-4 mt-4 bg-white rounded-xl border-dotted border-[.2rem] ${
              isOver ? "border-blue-500" : "border-[#d7d7d7]"
            }`}
            onClick={handleFileUpload}
          >
            <div className="flex flex-col items-center h-[300px]">
              <img src={uploader} alt="uploader" className="mx-auto my-10 w-20 h-20 " />
              <p>Drag and drop a file or click to upload</p>
              <p>File limit: 2MB</p>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.svg,.pdf,.docx,.pptx,image/jpeg,image/png,image/svg+xml,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
              onChange={handleFileChange}
              className="hidden w-full cursor-pointer"
            />
          </div>

        </div>

        {file && (
          <div className="mx-auto">
            <div className="flex items-center justify-between w-[90%] bg-white mx-auto mt-4 mb-5 py-4 px-8 rounded-xl border-2 shadow-sm group">
              <div className="flex">
                <div className="flex items-center">
                  <img src={fileIcon} alt="File icon" className="w-10 h-10" />
                </div>

                <div className="flex flex-col ml-4">
                  <p className="text-md font-sans">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {file.size < 1024
                      ? `${file.size} bytes`
                      : file.size < 1024 * 1024
                      ? `${(file.size / 1024).toFixed(2)} KB`
                      : `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                  </p>
                </div>
              </div>

              <div className="hidden group-hover:block">
                <button
                  className="text-red-500 capitalize flex flex-col text-[0.8rem]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                >
                  <img src={cancelIcon} alt="cancel icon" className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto flex justify-end space-x-4 mb-2 bg-white p-2 border-t-2">
          <Button variant="outline" className="w-[110px]">Discard</Button>
          <Button className="w-[110px]" disabled>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}
