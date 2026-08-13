import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IMAGE_ACCEPT, getImageValidationMessage } from "@/lib/uploads";
import { User as UserIcon } from "lucide-react";
import { toast } from "sonner";

function initials(name?: string | null) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AvatarUploadField({
  currentUrl,
  name,
  file,
  onFileChange,
}: {
  currentUrl?: string | null;
  name?: string | null;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const fallback = useMemo(() => initials(name), [name]);
  const previewUrl = objectUrl ?? currentUrl ?? null;

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    setObjectUrl(nextUrl);

    return () => URL.revokeObjectURL(nextUrl);
  }, [file]);

  return (
    <div className="space-y-2 sm:col-span-2">
      <Label htmlFor="avatar">Avatar</Label>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="h-20 w-20 border">
          {previewUrl && (
            <AvatarImage src={previewUrl} alt={name ?? "Avatar"} className="object-cover" />
          )}
          <AvatarFallback>
            {fallback || <UserIcon className="h-6 w-6 text-muted-foreground" />}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-56 flex-1 space-y-2">
          <Input
            id="avatar"
            type="file"
            accept={IMAGE_ACCEPT}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;

              if (!selectedFile) {
                onFileChange(null);
                return;
              }

              const message = getImageValidationMessage(selectedFile);
              if (message) {
                toast.error(message);
                onFileChange(null);
                event.currentTarget.value = "";
                return;
              }

              onFileChange(selectedFile);
            }}
          />
          <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP ate 2 MB.</p>
          {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
        </div>
      </div>
    </div>
  );
}
