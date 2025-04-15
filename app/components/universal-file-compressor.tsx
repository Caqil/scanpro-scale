"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileIcon, 
  Cross2Icon, 
  CheckCircledIcon, 
  CrossCircledIcon, 
  UploadIcon, 
  DownloadIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { AlertCircle, File, FileImage, FileText, Table } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/src/store/store";

// Form schema
const formSchema = z.object({
  quality: z.enum(["high", "medium", "low"]).default("medium"),
});

// File with processing status
interface FileWithStatus {
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  error?: string;
  fileType: 'pdf' | 'image' | 'office' | 'unknown';
}

interface CompressedFile {
  originalSize: number;
  compressedSize: number;
  compressionRatio: string;
  fileUrl: string;
  filename: string;
  originalName?: string;
  fileType: 'pdf' | 'image' | 'office' | 'unknown';
}

type FormValues = z.infer<typeof formSchema>;

export function UniversalFileCompressor() {
  const { t } = useLanguageStore();
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [compressedFiles, setCompressedFiles] = useState<Record<string, CompressedFile>>({});
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      quality: "medium",
    },
  });

  // Determine file type based on extension
  const getFileType = (filename: string): 'pdf' | 'image' | 'office' | 'unknown' => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (extension === 'pdf') {
      return 'pdf';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (['docx', 'pptx', 'xlsx'].includes(extension)) {
      return 'office';
    }
    
    return 'unknown';
  };

  // Get file icon based on type
  const getFileIcon = (fileType: 'pdf' | 'image' | 'office' | 'unknown') => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'image':
        return <FileImage className="h-5 w-5 text-blue-500" />;
      case 'office':
        return fileType === 'office' ? <Table className="h-5 w-5 text-green-500" /> : <File className="h-5 w-5" />;
      default:
        return <FileIcon className="h-5 w-5" />;
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 100 * 1024 * 1024, // 100MB
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        const rejection = rejectedFiles[0];
        setError(rejection.file.size > 100 * 1024 * 1024 
          ? t('fileUploader.maxSize')
          : t('fileUploader.inputFormat'));
        return;
      }
      if (acceptedFiles.length > 0) {
        setFiles(prev => {
          const existingFileNames = new Set(prev.map(f => f.file.name));
          const newFiles = acceptedFiles
            .filter(file => !existingFileNames.has(file.name))
            .map(file => ({
              file,
              status: 'idle' as const,
              fileType: getFileType(file.name)
            }));
          return [...prev, ...newFiles];
        });
        setError(null);
      }
    },
    multiple: true,
  });

  const onSubmit = async (values: FormValues) => {
    if (files.length === 0) {
      setError(t('compressPdf.error.noFiles'));
      return;
    }
    setIsProcessing(true);
    setError(null);
    
    const compressionPromises = files
      .filter(fileItem => fileItem.status !== 'completed')
      .map(fileItem => compressFile(fileItem.file, values.quality));
    
    await Promise.all(compressionPromises);
    setIsProcessing(false);
    toast.success(t('compressPdf.success'));
  };
  
  const compressFile = async (file: File, quality: string): Promise<void> => {
    setFiles(prev => prev.map(f => f.file.name === file.name ? { ...f, status: 'processing' as const, error: undefined } : f));
    setProgress(prev => ({ ...prev, [file.name]: 0 }));
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("quality", quality);
  
    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const currentProgress = prev[file.name] || 0;
          if (currentProgress >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return { ...prev, [file.name]: currentProgress + 5 };
        });
      }, 300 + Math.random() * 300);
  
      const response = await fetch('/api/compress/universal', { method: 'POST', body: formData });
      clearInterval(progressInterval);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('compressPdf.error.generic'));
      }
  
      const data = await response.json();
      setProgress(prev => ({ ...prev, [file.name]: 100 }));
      setCompressedFiles(prev => ({ 
        ...prev, 
        [file.name]: {
          originalSize: data.originalSize,
          compressedSize: data.compressedSize,
          compressionRatio: data.compressionRatio,
          fileUrl: data.fileUrl,
          filename: data.filename,
          originalName: data.originalName,
          fileType: data.fileType || getFileType(file.name)
        } 
      }));
      setFiles(prev => prev.map(f => f.file.name === file.name ? { ...f, status: 'completed' as const } : f));
      toast.success(t('compressPdf.success'), { description: `${file.name} ${t('compressPdf.reducedBy')} ${data.compressionRatio}` });
    } catch (err) {
      setFiles(prev => prev.map(f => f.file.name === file.name ? { ...f, status: 'error' as const, error: err instanceof Error ? err.message : t('compressPdf.error.unknown') } : f));
      setProgress(prev => ({ ...prev, [file.name]: 0 }));
      toast.error(t('compressPdf.error.failed'), { description: err instanceof Error ? err.message : t('compressPdf.error.unknown') });
      throw err;
    }
  };

  const handleRemoveFile = (fileName: string) => {
    setFiles(prev => prev.filter(f => f.file.name !== fileName));
    setProgress(prev => { const newProgress = { ...prev }; delete newProgress[fileName]; return newProgress; });
    setCompressedFiles(prev => { const newCompressedFiles = { ...prev }; delete newCompressedFiles[fileName]; return newCompressedFiles; });
  };

  const formatFileSize = (sizeInBytes: number): string => {
    if (sizeInBytes < 1024) return `${sizeInBytes} B`;
    if (sizeInBytes < 1024 * 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getTotalStats = useCallback(() => {
    if (Object.keys(compressedFiles).length === 0) return null;
    const totalOriginalSize = Object.values(compressedFiles).reduce((sum, file) => sum + file.originalSize, 0);
    const totalCompressedSize = Object.values(compressedFiles).reduce((sum, file) => sum + file.compressedSize, 0);
    const totalSaved = totalOriginalSize - totalCompressedSize;
    const compressionRatio = ((totalSaved / totalOriginalSize) * 100).toFixed(2);
    return { totalOriginalSize, totalCompressedSize, totalSaved, compressionRatio };
  }, [compressedFiles]);
  
  const handleDownloadAll = async () => {
    const completedFiles = Object.values(compressedFiles);
    if (completedFiles.length === 0) {
      toast.error(t('compressPdf.error.noCompressed'));
      return;
    }
  
    try {
      // In a real implementation, you would generate a zip file on the server
      // For simplicity, we'll just download the first file
      if (completedFiles.length === 1) {
        window.open(completedFiles[0].fileUrl, '_blank');
      } else {
        const response = await fetch('/api/compress/download-zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            files: completedFiles.map(f => ({
              filename: f.filename,
              originalName: f.originalName || f.filename
            }))
          }),
        });
  
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || t('compressPdf.error.downloadZip'));
        }
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed-files-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
  
      toast.success(t('compressPdf.zipDownloadSuccess'));
    } catch (err) {
      toast.error(t('compressPdf.error.downloadZip'), { description: err instanceof Error ? err.message : t('compressPdf.error.unknown') });
    }
  };

  const totalStats = getTotalStats();
  const allFilesProcessed = files.every(f => f.status === 'completed');
  const anyFilesFailed = files.some(f => f.status === 'error');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle>{t('universalCompressor.title') || "Universal File Compressor"}</CardTitle>
            <CardDescription>{t('universalCompressor.description') || "Compress PDF, images, and Office documents while maintaining quality"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="quality" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fileUploader.quality')}</FormLabel>
                <Select disabled={isProcessing} onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder={t('compressPdf.qualityPlaceholder')} /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex flex-col">
                        <span>{t('compressPdf.quality.high')}</span>
                        <span className="text-xs text-muted-foreground">{t('compressPdf.quality.highDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex flex-col">
                        <span>{t('compressPdf.quality.balanced')}</span>
                        <span className="text-xs text-muted-foreground">{t('compressPdf.quality.balancedDesc')}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex flex-col">
                        <span>{t('compressPdf.quality.maximum')}</span>
                        <span className="text-xs text-muted-foreground">{t('compressPdf.quality.maximumDesc')}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            
            <div {...getRootProps()} className={cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer", isDragActive ? "border-primary bg-primary/10" : files.length > 0 ? "border-green-500 bg-green-50 dark:bg-green-950/20" : "border-muted-foreground/25 hover:border-muted-foreground/50", isProcessing && "pointer-events-none opacity-80")}>
              <input {...getInputProps()} disabled={isProcessing} />
              <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center"><UploadIcon className="h-6 w-6 text-muted-foreground" /></div>
                <div className="text-lg font-medium">{isDragActive ? t('fileUploader.dropHere') : t('fileUploader.dragAndDrop')}</div>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t('universalCompressor.dropHereDesc') || "Drop your files here (PDF, JPG, PNG, DOCX, PPTX, XLSX)"} {t('fileUploader.maxSize')}
                </p>
                <Button type="button" variant="secondary" size="sm" className="mt-2">{t('fileUploader.browse')}</Button>
              </div>
            </div>
            
            {files.length > 0 && (
              <div className="border rounded-lg">
                <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
                  <h3 className="font-medium">{t('universalCompressor.filesToCompress') || "Files to Compress"} ({files.length})</h3>
                  {!isProcessing && <Button type="button" size="sm" variant="outline" onClick={() => setFiles([])}><TrashIcon className="h-4 w-4 mr-1" /> {t('ui.clearAll')}</Button>}
                </div>
                <div className="divide-y overflow-y-auto max-h-[300px]">
                  {files.map((fileItem) => (
                    <div key={fileItem.file.name} className="p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 rounded-md flex items-center justify-center flex-shrink-0" style={{
                          backgroundColor: fileItem.fileType === 'pdf' ? 'rgba(239, 68, 68, 0.1)' : 
                                          fileItem.fileType === 'image' ? 'rgba(59, 130, 246, 0.1)' : 
                                          fileItem.fileType === 'office' ? 'rgba(16, 185, 129, 0.1)' : 
                                          'rgba(209, 213, 219, 0.1)'
                        }}>
                          {getFileIcon(fileItem.fileType)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{fileItem.file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(fileItem.file.size)}
                            {compressedFiles[fileItem.file.name] && (
                              <span className="ml-2 text-green-600 dark:text-green-400">
                                → {formatFileSize(compressedFiles[fileItem.file.name].compressedSize)} 
                                ({compressedFiles[fileItem.file.name].compressionRatio} {t('compressPdf.reduction')})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {fileItem.status === 'idle' && !isProcessing && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleRemoveFile(fileItem.file.name)}
                          >
                            <Cross2Icon className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {fileItem.status === 'processing' && (
                          <div className="flex items-center gap-2 min-w-32">
                            <Progress value={progress[fileItem.file.name] || 0} className="h-2 w-20" />
                            <span className="text-xs text-muted-foreground">{progress[fileItem.file.name] || 0}%</span>
                          </div>
                        )}
                        
                        {fileItem.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            >
                              <CheckCircledIcon className="h-3 w-3 mr-1" /> {t('compressPdf.status.completed')}
                            </Badge>
                            <Button type="button" variant="ghost" size="sm" asChild className="text-sm">
                              <a 
                                href={compressedFiles[fileItem.file.name].fileUrl} 
                                download 
                                target="_blank"
                              >
                                <DownloadIcon className="h-3.5 w-3.5 mr-1" /> {t('ui.download')}
                              </a>
                            </Button>
                          </div>
                        )}
                        
                        {fileItem.status === 'error' && (
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                            >
                              <CrossCircledIcon className="h-3 w-3 mr-1" /> {t('compressPdf.status.failed')}
                            </Badge>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleRemoveFile(fileItem.file.name)}
                            >
                              <Cross2Icon className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Processing progress */}
            {isProcessing && files.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{t('compressPdf.overallProgress')}</span>
                  <span className="text-sm text-muted-foreground">
                    {Object.values(progress).filter(p => p === 100).length} 
                    {' '}{t('compressPdf.of')}{' '}
                    {files.length} 
                    {' '}{t('compressPdf.files')}
                  </span>
                </div>
                <Progress 
                  value={(Object.values(progress).reduce((a, b) => a + b, 0) / (files.length * 100)) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit" 
              disabled={files.length === 0 || isProcessing} 
              className="min-w-32"
            >
              {isProcessing ? t('ui.processing') : (t('universalCompressor.compressAll') || "Compress All Files")}
            </Button>
          </CardFooter>
        </Card>
        
        {totalStats && files.length > 1 && (allFilesProcessed || anyFilesFailed) && (
          <Card className="border-green-200 dark:border-green-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-600 dark:text-green-400 flex items-center gap-2">
                <CheckCircledIcon className="h-5 w-5" /> {t('universalCompressor.results.title') || "Compression Results"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('compressPdf.results.totalOriginal')}</p>
                  <p className="text-lg font-semibold">{formatFileSize(totalStats.totalOriginalSize)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('compressPdf.results.totalCompressed')}</p>
                  <p className="text-lg font-semibold">{formatFileSize(totalStats.totalCompressedSize)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('compressPdf.results.spaceSaved')}</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {formatFileSize(totalStats.totalSaved)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{t('compressPdf.results.averageReduction')}</p>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    {totalStats.compressionRatio}%
                  </p>
                </div>
              </div>
              {allFilesProcessed && files.length > 1 && (
                <Button 
                  className="w-full" 
                  type="button" 
                  variant="outline" 
                  onClick={handleDownloadAll}
                >
                  <DownloadIcon className="h-4 w-4 mr-2" /> {t('universalCompressor.results.downloadAll') || "Download All Compressed Files"}
                </Button>
              )}
            </CardContent>
            <CardFooter className="text-xs text-muted-foreground">
              {t('fileUploader.filesSecurity')}
            </CardFooter>
          </Card>
        )}
      </form>
    </Form>
  );
}

// Export the component
export default UniversalFileCompressor;