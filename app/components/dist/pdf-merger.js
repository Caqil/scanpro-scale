"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.PdfMerger = void 0;
var react_1 = require("react");
var react_dropzone_1 = require("react-dropzone");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var react_icons_1 = require("@radix-ui/react-icons");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var store_1 = require("@/src/store/store");
var upload_progress_1 = require("@/components/ui/upload-progress");
var useFileUpload_1 = require("@/hooks/useFileUpload");
function PdfMerger() {
    var _this = this;
    var t = store_1.useLanguageStore().t;
    var _a = react_1.useState([]), files = _a[0], setFiles = _a[1];
    var _b = react_1.useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var _c = react_1.useState(0), progress = _c[0], setProgress = _c[1];
    var _d = react_1.useState(null), mergedFileUrl = _d[0], setMergedFileUrl = _d[1];
    var _e = react_1.useState(null), error = _e[0], setError = _e[1];
    var _f = react_1.useState(null), dragId = _f[0], setDragId = _f[1];
    // Use our custom upload hook
    var _g = useFileUpload_1["default"](), isUploading = _g.isUploading, uploadProgress = _g.progress, uploadError = _g.error, uploadFile = _g.uploadFile, resetUpload = _g.resetUpload, uploadStats = _g.uploadStats;
    // Generate a unique ID
    var generateId = function () {
        return "file-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);
    };
    // Set up dropzone for PDF files only
    var _h = react_dropzone_1.useDropzone({
        accept: {
            "application/pdf": [".pdf"]
        },
        maxSize: 100 * 1024 * 1024,
        onDrop: function (acceptedFiles, rejectedFiles) {
            if (rejectedFiles.length > 0) {
                var rejection = rejectedFiles[0];
                if (rejection.file.size > 100 * 1024 * 1024) {
                    setError("One or more files are too large. Maximum size is 100MB per file.");
                }
                else {
                    setError("Please upload valid PDF files only.");
                }
                return;
            }
            if (acceptedFiles.length > 0) {
                // Clear any previous errors
                setError(null);
                resetUpload();
                // Add new files to the list, avoid duplicates
                setFiles(function (prev) {
                    var existingFileNames = new Set(prev.map(function (f) { return f.file.name; }));
                    var newFiles = acceptedFiles
                        .filter(function (file) { return !existingFileNames.has(file.name); })
                        .map(function (file) { return ({
                        file: file,
                        id: generateId(),
                        // Create preview URL for PDF files
                        preview: URL.createObjectURL(file),
                        isUploading: false,
                        uploadProgress: 0,
                        error: null
                    }); });
                    return __spreadArrays(prev, newFiles);
                });
            }
        },
        multiple: true
    }), getRootProps = _h.getRootProps, getInputProps = _h.getInputProps, isDragActive = _h.isDragActive;
    // Clean up previews when component unmounts
    var cleanUpPreviews = react_1.useCallback(function () {
        files.forEach(function (file) {
            if (file.preview)
                URL.revokeObjectURL(file.preview);
        });
    }, [files]);
    // Handle drag start
    var handleDragStart = function (e, id) {
        if (isProcessing || isUploading)
            return;
        setDragId(id);
        e.dataTransfer.setData("text/plain", id);
    };
    // Handle drag over
    var handleDragOver = function (e) {
        e.preventDefault();
    };
    // Handle drop
    var handleDrop = function (e, targetId) {
        e.preventDefault();
        if (!dragId || dragId === targetId || isProcessing || isUploading)
            return;
        var newFiles = __spreadArrays(files);
        var draggedIndex = newFiles.findIndex(function (f) { return f.id === dragId; });
        var targetIndex = newFiles.findIndex(function (f) { return f.id === targetId; });
        if (draggedIndex === -1 || targetIndex === -1)
            return;
        var draggedItem = newFiles.splice(draggedIndex, 1)[0];
        newFiles.splice(targetIndex, 0, draggedItem);
        setFiles(newFiles);
        setDragId(null);
    };
    // Move file up in the list
    var moveFileUp = function (index) {
        var _a;
        if (index <= 0)
            return;
        var newFiles = __spreadArrays(files);
        _a = [
            newFiles[index],
            newFiles[index - 1],
        ], newFiles[index - 1] = _a[0], newFiles[index] = _a[1];
        setFiles(newFiles);
    };
    // Move file down in the list
    var moveFileDown = function (index) {
        var _a;
        if (index >= files.length - 1)
            return;
        var newFiles = __spreadArrays(files);
        _a = [
            newFiles[index + 1],
            newFiles[index],
        ], newFiles[index] = _a[0], newFiles[index + 1] = _a[1];
        setFiles(newFiles);
    };
    // Handle file removal
    var handleRemoveFile = function (id) {
        setFiles(function (prev) {
            var fileToRemove = prev.find(function (f) { return f.id === id; });
            if (fileToRemove === null || fileToRemove === void 0 ? void 0 : fileToRemove.preview)
                URL.revokeObjectURL(fileToRemove.preview);
            return prev.filter(function (f) { return f.id !== id; });
        });
    };
    // Format file size for display
    var formatFileSize = function (sizeInBytes) {
        if (sizeInBytes < 1024) {
            return sizeInBytes + " B";
        }
        else if (sizeInBytes < 1024 * 1024) {
            return (sizeInBytes / 1024).toFixed(2) + " KB";
        }
        else {
            return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
        }
    };
    // Process merging PDFs
    var handleMerge = function () { return __awaiter(_this, void 0, void 0, function () {
        var formData;
        return __generator(this, function (_a) {
            if (files.length < 2) {
                setError("Please upload at least two PDF files to merge");
                return [2 /*return*/];
            }
            setIsProcessing(true);
            setProgress(0);
            setError(null);
            setMergedFileUrl(null);
            formData = new FormData();
            // Append files in the correct order
            files.forEach(function (fileObj) {
                formData.append("files", fileObj.file);
            });
            // Add the order of files as a separate field
            formData.append("order", JSON.stringify(files.map(function (_, index) { return index; })));
            // Use our custom upload hook
            uploadFile(files[0].file, formData, {
                url: "/api/pdf/merge",
                onProgress: function (progress) {
                    // Update UI with upload progress
                    setProgress(progress / 2); // First half is upload, second half is processing
                },
                onSuccess: function (data) {
                    // Start processing progress simulation
                    var processingProgress = 50; // Start at 50% (upload complete)
                    var processingInterval = setInterval(function () {
                        processingProgress += 2;
                        setProgress(Math.min(processingProgress, 95));
                        if (processingProgress >= 95) {
                            clearInterval(processingInterval);
                        }
                    }, 200);
                    // Complete the process
                    setTimeout(function () {
                        clearInterval(processingInterval);
                        setProgress(100);
                        setMergedFileUrl(data.filename);
                        setIsProcessing(false);
                        sonner_1.toast.success(t("mergePdf.ui.successMessage") || "Merge Successful");
                    }, 1000); // Simulate some processing time
                },
                onError: function (err) {
                    setProgress(0);
                    setError(err.message || "An unknown error occurred");
                    setIsProcessing(false);
                    sonner_1.toast.error("Merge Failed");
                }
            });
            return [2 /*return*/];
        });
    }); };
    return (React.createElement(card_1.Card, { className: "border shadow-sm" },
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, t("mergePdf.title") || "Merge PDF Files")),
        React.createElement(card_1.CardContent, { className: "space-y-6" },
            React.createElement("div", __assign({}, getRootProps(), { className: utils_1.cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer", isDragActive
                    ? "border-primary bg-primary/10"
                    : files.length > 0
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-muted-foreground/25 hover:border-muted-foreground/50", (isProcessing || isUploading) && "pointer-events-none opacity-80") }),
                React.createElement("input", __assign({}, getInputProps(), { disabled: isProcessing || isUploading })),
                React.createElement("div", { className: "flex flex-col items-center gap-2" },
                    React.createElement("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center" },
                        React.createElement(react_icons_1.UploadIcon, { className: "h-6 w-6 text-muted-foreground" })),
                    React.createElement("div", { className: "text-lg font-medium" }, isDragActive
                        ? t("fileUploader.dropHere") || "Drop your PDF files here"
                        : t("fileUploader.dragAndDrop") || "Drag & drop your PDF files"),
                    React.createElement("p", { className: "text-sm text-muted-foreground max-w-sm" },
                        t("fileUploader.dropHereDesc") ||
                            "Drop your PDF files here or click to browse.",
                        " ",
                        t("fileUploader.maxSize") || "Maximum size is 100MB per file."),
                    React.createElement(button_1.Button, { type: "button", variant: "default", size: "sm", className: "mt-2" }, t("fileUploader.browse") || "Browse Files"))),
            files.length > 0 && (React.createElement("div", { className: "border rounded-lg" },
                React.createElement("div", { className: "p-3 border-b bg-muted/30 flex justify-between items-center" },
                    React.createElement("h3", { className: "font-medium" },
                        t("mergePdf.ui.filesToMerge") || "Files to Merge",
                        " (",
                        files.length,
                        ")"),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(badge_1.Badge, { variant: "outline", className: "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
                            React.createElement(react_icons_1.MoveIcon, { className: "h-3 w-3 mr-1" }),
                            " ",
                            t("mergePdf.ui.dragToReorder") || "Drag to reorder"),
                        !isProcessing && !isUploading && (React.createElement(button_1.Button, { type: "button", size: "sm", variant: "outline", onClick: function () {
                                cleanUpPreviews();
                                setFiles([]);
                            } },
                            React.createElement(react_icons_1.TrashIcon, { className: "h-4 w-4 mr-1" }),
                            " ",
                            t("ui.clearAll") || "Clear All")))),
                React.createElement("div", { className: "divide-y overflow-y-auto max-h-[400px]" }, files.map(function (fileObj, index) { return (React.createElement("div", { key: fileObj.id, draggable: !isProcessing && !isUploading, onDragStart: function (e) { return handleDragStart(e, fileObj.id); }, onDragOver: handleDragOver, onDrop: function (e) { return handleDrop(e, fileObj.id); }, className: utils_1.cn("p-3 flex items-center justify-between gap-4 hover:bg-muted/30", dragId === fileObj.id && "opacity-50 bg-muted/50") },
                    React.createElement("div", { className: "flex items-center justify-center p-1 rounded hover:bg-muted cursor-move" },
                        React.createElement(react_icons_1.MoveIcon, { className: "h-5 w-5 text-muted-foreground" })),
                    React.createElement("div", { className: "flex items-center gap-3 min-w-0 flex-1" },
                        React.createElement("div", { className: "flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium" }, index + 1),
                        React.createElement("div", { className: "h-9 w-9 rounded-md bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0" },
                            React.createElement(react_icons_1.FileIcon, { className: "h-5 w-5 text-red-600 dark:text-red-400" })),
                        React.createElement("div", { className: "min-w-0 flex-1" },
                            React.createElement("p", { className: "text-sm font-medium truncate" }, fileObj.file.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, formatFileSize(fileObj.file.size)))),
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return moveFileUp(index); }, disabled: index === 0 || isProcessing || isUploading, className: "h-8 w-8" },
                            React.createElement(lucide_react_1.ArrowUp, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return moveFileDown(index); }, disabled: index === files.length - 1 ||
                                isProcessing ||
                                isUploading, className: "h-8 w-8" },
                            React.createElement(lucide_react_1.ArrowDown, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () { return handleRemoveFile(fileObj.id); }, disabled: isProcessing || isUploading },
                            React.createElement(react_icons_1.Cross2Icon, { className: "h-4 w-4" }))))); })))),
            error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertDescription, null, error))),
            (isUploading || isProcessing) && (React.createElement(upload_progress_1.UploadProgress, { progress: progress, isUploading: isUploading, isProcessing: isProcessing, processingProgress: progress, error: uploadError, label: isUploading
                    ? t("watermarkPdf.uploading")
                    : t("splitPdf.splitting"), uploadStats: uploadStats })),
            mergedFileUrl && (React.createElement("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30" },
                React.createElement("div", { className: "flex items-start gap-3" },
                    React.createElement("div", { className: "mt-1" },
                        React.createElement(react_icons_1.CheckCircledIcon, { className: "h-5 w-5 text-green-600 dark:text-green-400" })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("h3", { className: "font-medium text-green-600 dark:text-green-400" }, t("mergePdf.ui.successMessage") ||
                            "PDFs successfully merged!"),
                        React.createElement("p", { className: "text-sm text-muted-foreground mt-1 mb-3" }, t("mergePdf.ui.downloadReady") ||
                            "Your merged PDF file is now ready for download."),
                        React.createElement(button_1.Button, { className: "w-full sm:w-auto", asChild: true, variant: "default" },
                            React.createElement("a", { href: "/api/file?folder=merges&filename=" + encodeURIComponent(mergedFileUrl), download: true },
                                React.createElement(react_icons_1.DownloadIcon, { className: "h-4 w-4 mr-2" }),
                                t("mergePdf.ui.downloadMerged") || "Download Merged PDF"))))))),
        React.createElement(card_1.CardFooter, { className: "flex justify-between flex-col sm:flex-row gap-2" },
            files.length > 0 &&
                !isProcessing &&
                !isUploading &&
                !mergedFileUrl && (React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () {
                    cleanUpPreviews();
                    setFiles([]);
                } },
                React.createElement(react_icons_1.TrashIcon, { className: "h-4 w-4 mr-2" }),
                t("ui.clear") || "Clear All")),
            React.createElement(button_1.Button, { className: utils_1.cn("sm:ml-auto", files.length === 0 && !mergedFileUrl && "w-full"), onClick: handleMerge, disabled: files.length < 2 || isProcessing || isUploading }, isProcessing || isUploading
                ? t("ui.processing") || "Merging..."
                : t("mergePdf.ui.mergePdfs") || "Merge PDFs"))));
}
exports.PdfMerger = PdfMerger;
