"use client";

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from 'sonner';
import { LoaderCircleIcon, CheckCircle, Upload, Download, Info, Crop as CropIcon } from "lucide-react";
import { useLanguageStore } from '@/src/store/store';
import CropPreview from './crop-preview';

export function PdfCropper() {
  const { t } = useLanguageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ fileUrl: string; fileName: string } | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Crop settings
  const [cropLeft, setCropLeft] = useState(0);
  const [cropBottom, setCropBottom] = useState(0);
  const [cropRight, setCropRight] = useState(595); // Default A4 width
  const [cropTop, setCropTop] = useState(842); // Default A4 height
  const [selectedPages, setSelectedPages] = useState('');
  const [allPages, setAllPages] = useState(true);
  const [pageSelections, setPageSelections] = useState<{[key: number]: boolean}>({});
  const [pageCropSettings, setPageCropSettings] = useState<{[key: number]: {
    left: number;
    bottom: number;
    right: number;
    top: number;
  }}>({});

  // Reset the state when the file changes
  useEffect(() => {
    if (file) {
      setResult(null);
      setProcessing(false);
      
      // Generate a preview for the first page
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      // Reset crop settings to default
      setCropLeft(0);
      setCropBottom(0);
      setCropRight(595);
      setCropTop(842);
      
      // Reset page selections
      setPageSelections({});
      setPageCropSettings({});
      
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file]);
  
  // Update crop settings when changing pages
  useEffect(() => {
    if (currentPage && !allPages) {
      // If this page has custom settings, load them
      if (pageCropSettings[currentPage]) {
        const settings = pageCropSettings[currentPage];
        setCropLeft(settings.left);
        setCropBottom(settings.bottom);
        setCropRight(settings.right);
        setCropTop(settings.top);
      }
    }
  }, [currentPage, pageCropSettings, allPages]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const selectedFile = selectedFiles[0];
      if (selectedFile.type === "application/pdf") {
        setFile(selectedFile);
      } else {
        toast.error(t("common.invalidFileType"), {
          description: t("common.pleaseSelectPdf"),
        });
      }
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
      } else {
        toast.error(t("common.invalidFileType"), {
          description: t("common.pleaseSelectPdf"),
        });
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handlePageRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPages(e.target.value);
  };
  
  const handlePageTypeChange = (value: string) => {
    if (value === 'all') {
      setAllPages(true);
      setSelectedPages('');
    } else if (value === 'custom') {
      setAllPages(false);
      // Keep existing selectedPages value
    } else if (value === 'selected') {
      setAllPages(false);
      setSelectedPages(''); // Clear text-based selection
    }
  };
  
  const handleCrop = async () => {
    if (!file) return;
    
    setProcessing(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (allPages) {
        // Apply same crop to all pages
        formData.append('left', cropLeft.toString());
        formData.append('bottom', cropBottom.toString());
        formData.append('right', cropRight.toString());
        formData.append('top', cropTop.toString());
      } else if (selectedPages) {
        // Using custom range specification (text-based)
        formData.append('left', cropLeft.toString());
        formData.append('bottom', cropBottom.toString());
        formData.append('right', cropRight.toString());
        formData.append('top', cropTop.toString());
        formData.append('pages', selectedPages);
      } else {
        // Using individually selected pages
        const selectedPageNumbers = Object.entries(pageSelections)
          .filter(([_, selected]) => selected)
          .map(([pageNum]) => pageNum);
        
        if (selectedPageNumbers.length === 0) {
          toast.warning(t("cropPdf.toast.noPageSelected"));
          setProcessing(false);
          return;
        }
        
        // Check if we have per-page settings
        const hasPerPageSettings = Object.keys(pageCropSettings).length > 0;
        
        if (hasPerPageSettings) {
          // Create separate crop operations for each page with custom settings
          const perPageSettings = [];
          
          for (const pageNum of selectedPageNumbers) {
            // Use page-specific settings if available, otherwise use current settings
            const settings = pageCropSettings[pageNum] || {
              left: cropLeft,
              bottom: cropBottom,
              right: cropRight,
              top: cropTop
            };
            
            perPageSettings.push({
              page: pageNum,
              ...settings
            });
          }
          
          // Serialize the per-page settings
          formData.append('perPageSettings', JSON.stringify(perPageSettings));
        } else {
          // Apply same crop to all selected pages
          formData.append('left', cropLeft.toString());
          formData.append('bottom', cropBottom.toString());
          formData.append('right', cropRight.toString());
          formData.append('top', cropTop.toString());
          formData.append('pages', selectedPageNumbers.join(','));
        }
      }
      
      const response = await fetch('/api/pdf/crop', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          fileUrl: data.fileUrl,
          fileName: data.fileName,
        });
        toast.success(t("cropPdf.toast.success"), {
          description: t("cropPdf.toast.successDescription"),
        });
      } else {
        toast.error(t("cropPdf.toast.error"), {
          description: data.error || t("cropPdf.toast.errorDescription"),
        });
      }
    } catch (error) {
      console.error('Error cropping PDF:', error);
      toast.error(t("cropPdf.toast.error"), {
        description: t("cropPdf.toast.errorDescription"),
      });
    } finally {
      setProcessing(false);
    }
  };
  
  const handleDownload = () => {
    if (result?.fileUrl) {
      const link = document.createElement('a');
      link.href = result.fileUrl;
      link.setAttribute('download', file?.name.replace('.pdf', '-cropped.pdf') || 'cropped.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        {!file ? (
          <div 
            className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center hover:border-primary transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-4 cursor-pointer">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <Upload className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t("cropPdf.dropzone.title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">{t("cropPdf.dropzone.subtitle")}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CropIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-medium">{file.name}</h3>
              </div>
              <Button variant="ghost" onClick={() => setFile(null)}>
                {t("common.change")}
              </Button>
            </div>
            
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">{t("cropPdf.tabs.preview")}</TabsTrigger>
                <TabsTrigger value="settings">{t("cropPdf.tabs.settings")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                <div className="bg-muted rounded-lg overflow-hidden aspect-[3/4] flex items-center justify-center">
                  {preview && (
                    <CropPreview 
                      pdfUrl={preview} 
                      cropCoordinates={{
                        left: cropLeft,
                        bottom: cropBottom,
                        right: cropRight,
                        top: cropTop
                      }}
                      onPageChange={setCurrentPage}
                      totalPages={numPages}
                      onTotalPagesChange={setNumPages}
                    />
                  )}
                </div>
                
                {numPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage <= 1}
                    >
                      {t("common.previous")}
                    </Button>
                    <span className="text-sm">
                      {t("common.pageXofY")}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                      disabled={currentPage >= numPages}
                    >
                      {t("common.next")}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">{t("cropPdf.cropBox.title")}</h4>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cropLeft">{t("cropPdf.cropBox.left")}</Label>
                      <Input
                        id="cropLeft"
                        type="number"
                        min="0"
                        value={cropLeft}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCropLeft(value);
                          if (currentPage && !allPages) {
                            setPageCropSettings(prev => ({
                              ...prev,
                              [currentPage]: {
                                ...prev[currentPage] || { bottom: cropBottom, right: cropRight, top: cropTop },
                                left: value
                              }
                            }));
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cropBottom">{t("cropPdf.cropBox.bottom")}</Label>
                      <Input
                        id="cropBottom"
                        type="number"
                        min="0"
                        value={cropBottom}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCropBottom(value);
                          if (currentPage && !allPages) {
                            setPageCropSettings(prev => ({
                              ...prev,
                              [currentPage]: {
                                ...prev[currentPage] || { left: cropLeft, right: cropRight, top: cropTop },
                                bottom: value
                              }
                            }));
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cropRight">{t("cropPdf.cropBox.right")}</Label>
                      <Input
                        id="cropRight"
                        type="number"
                        min="0"
                        value={cropRight}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCropRight(value);
                          if (currentPage && !allPages) {
                            setPageCropSettings(prev => ({
                              ...prev,
                              [currentPage]: {
                                ...prev[currentPage] || { left: cropLeft, bottom: cropBottom, top: cropTop },
                                right: value
                              }
                            }));
                          }
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cropTop">{t("cropPdf.cropBox.top")}</Label>
                      <Input
                        id="cropTop"
                        type="number"
                        min="0"
                        value={cropTop}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          setCropTop(value);
                          if (currentPage && !allPages) {
                            setPageCropSettings(prev => ({
                              ...prev,
                              [currentPage]: {
                                ...prev[currentPage] || { left: cropLeft, bottom: cropBottom, right: cropRight },
                                top: value
                              }
                            }));
                          }
                        }}
                      />
                    </div>
                  </div>
                  
                  <Alert className="bg-muted">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      {t("cropPdf.cropBox.info")}
                    </AlertDescription>
                  </Alert>
                </div>

                {numPages > 1 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">{t("cropPdf.pageRange.title")}</h4>
                    
                    <Tabs defaultValue="all" onValueChange={handlePageTypeChange}>
                      <TabsList>
                        <TabsTrigger value="all">{t("cropPdf.pageRange.allPages")}</TabsTrigger>
                        <TabsTrigger value="custom">{t("cropPdf.pageRange.customPages")}</TabsTrigger>
                        <TabsTrigger value="selected">{t("cropPdf.pageRange.selectedPages")}</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="all">
                        <p className="text-sm text-muted-foreground mt-2">
                          {t("cropPdf.pageRange.allPagesDescription")}
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="custom" className="space-y-2">
                        <Input
                          placeholder={t("cropPdf.pageRange.placeholder")}
                          value={selectedPages}
                          onChange={handlePageRangeChange}
                        />
                        <p className="text-sm text-muted-foreground">
                          {t("cropPdf.pageRange.customPagesDescription")}
                        </p>
                      </TabsContent>
                      
                      <TabsContent value="selected" className="space-y-4">
                        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                          {Array.from({ length: numPages }, (_, i) => i + 1).map((page) => (
                            <div 
                              key={page}
                              className={`
                                px-2 py-1 rounded cursor-pointer border
                                ${pageSelections[page] ? 'bg-primary text-primary-foreground' : 'bg-card'}
                              `}
                              onClick={() => {
                                setPageSelections(prev => ({
                                  ...prev,
                                  [page]: !prev[page]
                                }));
                                
                                // If selecting this page and it has custom settings, load them
                                if (!pageSelections[page] && pageCropSettings[page]) {
                                  const settings = pageCropSettings[page];
                                  setCropLeft(settings.left);
                                  setCropBottom(settings.bottom);
                                  setCropRight(settings.right);
                                  setCropTop(settings.top);
                                }
                                
                                // If this is the first selection, navigate to that page
                                if (currentPage !== page) {
                                  setCurrentPage(page);
                                }
                              }}
                            >
                              {page}
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setPageSelections(
                              Object.fromEntries(Array.from({ length: numPages }, (_, i) => [i + 1, true])
                            ))}
                          >
                            {t("cropPdf.pageRange.selectAll")}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setPageSelections({})}
                          >
                            {t("cropPdf.pageRange.deselectAll")}
                          </Button>
                        </div>
                        
                        <Alert className="bg-muted">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            {t("cropPdf.pageRange.selectedPagesDescription")}
                          </AlertDescription>
                        </Alert>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="w-full sm:w-auto flex-1" 
                onClick={handleCrop}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.processing")}
                  </>
                ) : (
                  <>
                    <CropIcon className="mr-2 h-4 w-4" />
                    {t("cropPdf.cropButton")}
                  </>
                )}
              </Button>
              
              {result && (
                <Button 
                  variant="outline" 
                  className="w-full sm:w-auto flex-1"
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  {t("common.download")}
                </Button>
              )}
            </div>
            
            {result && (
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900 text-green-800 dark:text-green-200">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription>
                  {t("cropPdf.success")}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}