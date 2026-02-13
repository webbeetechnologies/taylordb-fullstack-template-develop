import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FileIcon, CheckCircle2, Send } from "lucide-react";
import { DemoCard, InlineSpinner } from "@/components/demo";
import { trpc } from "@/lib/trpc";

interface FileMetadata {
  originalName: string;
  mimeType: string;
  size: number;
  sizeFormatted: string;
}

const BASE_URL =
  import.meta.env.VITE_TRPC_URL || "http://localhost:3001/api";

export function FileUploadExample() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: submissions } = trpc.submitUserData.getAll.useQuery();

  const submitMutation = trpc.submitUserData.submit.useMutation({
    onSuccess: () => {
      utils.submitUserData.getAll.invalidate();
      setName("");
      setEmail("");
      setFiles([]);
    },
  });

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setFiles((prev) => [...prev, ...Array.from(newFiles)]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload files via /api/upload
      let uploadedFiles: FileMetadata[] = [];

      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));

        const uploadRes = await fetch(`${BASE_URL}/upload`, {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        const uploadJson = await uploadRes.json();

        if (!uploadRes.ok || !uploadJson.success) {
          throw new Error(uploadJson.error || "File upload failed");
        }
        uploadedFiles = uploadJson.data.files;
      }

      // Step 2: Submit user data with file references via tRPC
      await submitMutation.mutateAsync({
        name,
        email,
        files: uploadedFiles.map((f) => ({
          originalName: f.originalName,
          mimeType: f.mimeType,
          size: f.size,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  };

  const canSubmit = name.trim() && email.trim() && !isLoading;

  return (
    <DemoCard
      title="Submit User Data"
      description="Upload files via /api/upload, then submit data via tRPC"
      icon={Send}
      iconColorClass="bg-amber-500/10 text-amber-500"
      glowClass="glow-primary"
    >
      {/* Form Fields */}
      <div className="flex gap-3">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="flex-1"
        />
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="flex-1"
        />
      </div>

      {/* Drop Zone */}
      <div
        className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <Upload className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
        <p className="text-sm text-muted-foreground">
          {isDragging ? (
            <span className="text-primary font-medium">Drop files here</span>
          ) : (
            <>
              <span className="font-medium text-foreground">Click to browse</span>{" "}
              or drag & drop files
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Any file type • Max 10 MB per file • Up to 10 files
        </p>
      </div>

      {/* Selected Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </p>
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.type || "unknown"} • {formatSize(file.size)}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
      >
        {isLoading ? (
          <>
            <InlineSpinner /> Submitting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Submit User Data
          </>
        )}
      </Button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Submissions List */}
      {submissions && submissions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent submissions
          </p>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="text-sm font-medium">{sub.name}</span>
                <span className="text-xs text-muted-foreground">{sub.email}</span>
              </div>
              {sub.files.length > 0 && (
                <div className="flex flex-wrap gap-1 ml-5.5">
                  {sub.files.map((f, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                    >
                      <FileIcon className="h-3 w-3" />
                      {f.originalName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DemoCard>
  );
}
