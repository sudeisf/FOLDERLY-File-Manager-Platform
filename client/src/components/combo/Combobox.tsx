import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import axios from "axios";

const FormSchema = z.object({
  folder: z.string().min(1, "Please select a folder."),
});

interface ComboboxProps {
  onFolderSelect: (folder: string) => void;
  isFolderThere: boolean;
}

export default function Combobox({ onFolderSelect, isFolderThere }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [folders, setFolders] = useState<string[]>([]); // Array to store folder names (string[])
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { folder: "" },
  });

  useEffect(() => {
    const fetchFolderNames = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL
        const res = await axios.get(`${API_URL}/api/folders/get-folders-names`, {
          withCredentials: true,
        });

        if (res.status === 200) {
          // Set fetched folder names directly
          setFolders(res.data); // Since the response is an array of folder names
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchFolderNames();
  }, []);

  return (
    <Form {...form}>
      <form className="space-y-6">
        <FormField
          control={form.control}
          name="folder"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 pl-3">
              <FormLabel className="font-Rubic font-bold text-[.9rem] text-black pt-2">
                Select Folder
              </FormLabel>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[170px] h-8 justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                      disabled={isFolderThere}
                    >
                      {field.value
                        ? folders.find((folder) => folder === field.value)
                        : "Folders"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search folder..." />
                    <CommandList>
                      <CommandEmpty>No folder found.</CommandEmpty>
                      <CommandGroup>
                        {folders.map((folder) => (
                          <CommandItem
                            value={folder}
                            key={folder}
                            onSelect={() => {
                              field.onChange(folder);
                              onFolderSelect(folder);
                              setOpen(false);
                            }}
                          >
                            {folder}
                            <Check
                              className={cn(
                                "ml-auto",
                                folder === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
      <p className="text-sm font-Rubic text-[#756E6E] font-light flex mt-4 w-[90%] mx-auto">
        After you select a folder, click the upload button.
      </p>
    </Form>
  );
}
