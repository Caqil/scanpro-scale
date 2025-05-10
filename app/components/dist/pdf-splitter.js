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
exports.__esModule = true;
exports.PdfSplitter = void 0;
var react_1 = require("react");
var react_dropzone_1 = require("react-dropzone");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var alert_1 = require("@/components/ui/alert");
var form_1 = require("@/components/ui/form");
var radio_group_1 = require("@/components/ui/radio-group");
var card_1 = require("@/components/ui/card");
var react_icons_1 = require("@radix-ui/react-icons");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var react_hook_form_1 = require("react-hook-form");
var zod_1 = require("@hookform/resolvers/zod");
var zod_2 = require("zod");
var store_1 = require("@/src/store/store");
var upload_progress_1 = require("@/components/ui/upload-progress");
var useFileUpload_1 = require("@/hooks/useFileUpload");
// Form schema
var formSchema = zod_2.z.object({
    splitMethod: zod_2.z["enum"](["range", "extract", "every"])["default"]("range"),
    pageRanges: zod_2.z.string().optional(),
    everyNPages: zod_2.z.coerce.number().min(1)["default"](1)
});
function PdfSplitter() {
    var _this = this;
    var t = store_1.useLanguageStore().t;
    var _a = react_1.useState(null), file = _a[0], setFile = _a[1];
    var _b = react_1.useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var _c = react_1.useState(0), progress = _c[0], setProgress = _c[1];
    var _d = react_1.useState(null), splitResult = _d[0], setSplitResult = _d[1];
    var _e = react_1.useState(null), error = _e[0], setError = _e[1];
    var _f = react_1.useState(0), totalPages = _f[0], setTotalPages = _f[1];
    // For large job status polling
    var _g = react_1.useState(null), jobId = _g[0], setJobId = _g[1];
    var _h = react_1.useState(null), statusUrl = _h[0], setStatusUrl = _h[1];
    var _j = react_1.useState(false), isPolling = _j[0], setIsPolling = _j[1];
    var _k = useFileUpload_1["default"](), isUploading = _k.isUploading, uploadProgress = _k.progress, uploadError = _k.error, uploadFile = _k.uploadFile, resetUpload = _k.resetUpload, uploadStats = _k.uploadStats;
    // Initialize form
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(formSchema),
        defaultValues: {
            splitMethod: "range",
            pageRanges: "",
            everyNPages: 1
        }
    });
    // Watch fields for conditional rendering
    var splitMethod = form.watch("splitMethod");
    // Setup dropzone
    var _l = react_dropzone_1.useDropzone({
        accept: {
            "application/pdf": [".pdf"]
        },
        maxSize: 100 * 1024 * 1024,
        maxFiles: 1,
        onDrop: function (acceptedFiles, rejectedFiles) {
            if (rejectedFiles.length > 0) {
                var rejection = rejectedFiles[0];
                if (rejection.file.size > 100 * 1024 * 1024) {
                    setError(t("fileUploader.maxSize"));
                }
                else {
                    setError(t("fileUploader.inputFormat"));
                }
                return;
            }
            if (acceptedFiles.length > 0) {
                var newFile = acceptedFiles[0];
                setFile(newFile);
                setSplitResult(null);
                setError(null);
                setJobId(null);
                setStatusUrl(null);
                setIsPolling(false);
                resetUpload();
                // Estimate number of pages based on file size for better UX
                var fileSizeInMB = newFile.size / (1024 * 1024);
                var estimatedPages = Math.max(1, Math.round(fileSizeInMB * 10));
                setTotalPages(estimatedPages);
                // Examine file to get actual page count
                examineFile(newFile);
            }
        }
    }), getRootProps = _l.getRootProps, getInputProps = _l.getInputProps, isDragActive = _l.isDragActive;
    // Function to examine PDF and get page count
    var examineFile = function (file) { return __awaiter(_this, void 0, void 0, function () {
        var formData, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    formData = new FormData();
                    formData.append("file", file);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, fetch("/api/pdf/info", {
                            method: "POST",
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    if (data.pageCount) {
                        setTotalPages(data.pageCount);
                    }
                    _a.label = 4;
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error getting PDF info:", error_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); };
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
    // Handle file removal
    var handleRemoveFile = function () {
        setFile(null);
        setSplitResult(null);
        setError(null);
        setTotalPages(0);
        setJobId(null);
        setStatusUrl(null);
        setIsPolling(false);
        setProgress(0);
    };
    // Retry counter for status polling
    var _m = react_1.useState(0), retryCount = _m[0], setRetryCount = _m[1];
    // Poll for job status
    var pollJobStatus = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var response, status, splittingProgress, result, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!statusUrl || !jobId)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch(statusUrl)];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Error fetching status: " + response.status);
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    status = _a.sent();
                    splittingProgress = 50 + status.progress / 2;
                    setProgress(splittingProgress);
                    if (status.status === "completed") {
                        // Job completed successfully
                        setIsPolling(false);
                        setIsProcessing(false);
                        setProgress(100);
                        result = {
                            success: true,
                            message: "PDF split into " + status.results.length + " files",
                            originalName: (file === null || file === void 0 ? void 0 : file.name) || "document.pdf",
                            totalPages: totalPages,
                            results: status.results
                        };
                        setSplitResult(result);
                        sonner_1.toast.success(t("splitPdf.success"), {
                            description: t("splitPdf.successDesc")
                        });
                    }
                    else if (status.status === "error") {
                        // Job failed
                        setIsPolling(false);
                        setIsProcessing(false);
                        setError(status.error || t("splitPdf.error.failed"));
                        setProgress(0);
                        sonner_1.toast.error(t("splitPdf.error.failed"), {
                            description: status.error || t("splitPdf.error.unknown")
                        });
                    }
                    else {
                        // Job still processing, continue polling
                        setTimeout(pollJobStatus, 2000);
                    }
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Error polling job status:", err_1);
                    if (retryCount < 5) {
                        setRetryCount(function (prev) { return prev + 1; });
                        setTimeout(pollJobStatus, 3000);
                    }
                    else {
                        setIsPolling(false);
                        setIsProcessing(false);
                        setError(t("splitPdf.error.statusFailed"));
                        setProgress(0);
                        sonner_1.toast.error(t("splitPdf.error.failed"));
                    }
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [statusUrl, jobId, file, totalPages, t, retryCount]);
    // Start polling when status URL is available
    react_1.useEffect(function () {
        if (statusUrl && jobId && isPolling) {
            pollJobStatus();
        }
        return function () {
            setRetryCount(0);
        };
    }, [statusUrl, jobId, isPolling, pollJobStatus]);
    // Submit handler
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var formData;
        var _this = this;
        return __generator(this, function (_a) {
            if (!file) {
                setError(t("splitPdf.error.noFile"));
                return [2 /*return*/];
            }
            setIsProcessing(false);
            setProgress(0);
            setError(null);
            setSplitResult(null);
            setJobId(null);
            setStatusUrl(null);
            setIsPolling(false);
            setRetryCount(0);
            formData = new FormData();
            formData.append("file", file);
            formData.append("splitMethod", values.splitMethod);
            if (values.splitMethod === "range" && values.pageRanges) {
                formData.append("pageRanges", values.pageRanges);
            }
            else if (values.splitMethod === "every") {
                formData.append("everyNPages", values.everyNPages.toString());
            }
            uploadFile(file, formData, {
                url: "/api/pdf/split",
                onProgress: function (progress) {
                    // Update progress for upload phase (0–50%)
                    setProgress(progress / 2);
                },
                onSuccess: function (data) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        // Upload complete, start processing phase
                        setIsProcessing(true);
                        if (data.isLargeJob && data.jobId && data.statusUrl) {
                            // Large job: start polling
                            setJobId(data.jobId);
                            setStatusUrl(data.statusUrl);
                            setIsPolling(true);
                            sonner_1.toast.info(t("splitPdf.largeSplitStarted"), {
                                description: t("splitPdf.largeSplitDesc")
                            });
                        }
                        else {
                            // Small job: immediate result
                            setProgress(100);
                            setSplitResult(data);
                            setIsProcessing(false);
                            sonner_1.toast.success(t("splitPdf.success"), {
                                description: t("splitPdf.successDesc")
                            });
                        }
                        return [2 /*return*/];
                    });
                }); },
                onError: function (err) {
                    setError(err.message || t("splitPdf.error.unknown"));
                    setProgress(0);
                    setIsProcessing(false);
                    sonner_1.toast.error(t("splitPdf.error.failed"), {
                        description: err.message || t("splitPdf.error.unknown")
                    });
                }
            });
            return [2 /*return*/];
        });
    }); };
    // Helper function to get split parts safely
    var getSplitParts = react_1.useCallback(function (result) {
        if (!result)
            return [];
        if (result.results && Array.isArray(result.results)) {
            return result.results;
        }
        if (result.splitParts && Array.isArray(result.splitParts)) {
            return result.splitParts;
        }
        return [];
    }, []);
    // Get parts count safely
    var getPartsCount = react_1.useCallback(function (result) {
        return getSplitParts(result).length;
    }, [getSplitParts]);
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
            React.createElement(card_1.Card, { className: "border shadow-sm" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, t("splitPdf.title")),
                    React.createElement(card_1.CardDescription, null, t("splitPdf.description"))),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", __assign({}, getRootProps(), { className: utils_1.cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer", isDragActive
                            ? "border-primary bg-primary/10"
                            : file
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50", (isUploading || isProcessing) &&
                            "pointer-events-none opacity-80") }),
                        React.createElement("input", __assign({}, getInputProps(), { disabled: isUploading || isProcessing })),
                        file ? (React.createElement("div", { className: "flex flex-col items-center gap-2" },
                            React.createElement("div", { className: "h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center" },
                                React.createElement(react_icons_1.FileIcon, { className: "h-6 w-6 text-green-600 dark:text-green-400" })),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, file.name),
                                React.createElement("p", { className: "text-xs text-muted-foreground" },
                                    formatFileSize(file.size),
                                    " \u2022 ",
                                    totalPages,
                                    " ",
                                    t("splitPdf.pages"))),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", disabled: isUploading || isProcessing, onClick: function (e) {
                                    e.stopPropagation();
                                    handleRemoveFile();
                                } },
                                React.createElement(react_icons_1.Cross2Icon, { className: "h-4 w-4 mr-1" }),
                                " ",
                                t("ui.remove")))) : (React.createElement("div", { className: "flex flex-col items-center gap-2" },
                            React.createElement("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center" },
                                React.createElement(react_icons_1.UploadIcon, { className: "h-6 w-6 text-muted-foreground" })),
                            React.createElement("div", { className: "text-lg font-medium" }, isDragActive
                                ? t("fileUploader.dropHere")
                                : t("fileUploader.dragAndDrop")),
                            React.createElement("p", { className: "text-sm text-muted-foreground max-w-sm" },
                                t("fileUploader.dropHereDesc"),
                                " ",
                                t("fileUploader.maxSize")),
                            React.createElement(button_1.Button, { type: "button", variant: "secondary", size: "sm", className: "mt-2" }, t("fileUploader.browse"))))),
                    file && !splitResult && (React.createElement("div", null,
                        React.createElement(form_1.FormField, { control: form.control, name: "splitMethod", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "space-y-3" },
                                    React.createElement(form_1.FormLabel, null, t("splitPdf.options.splitMethod")),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(radio_group_1.RadioGroup, { onValueChange: field.onChange, defaultValue: field.value, className: "flex flex-col space-y-1", disabled: isUploading || isProcessing },
                                            React.createElement("div", { className: "flex items-center space-x-2" },
                                                React.createElement(radio_group_1.RadioGroupItem, { value: "range", id: "range-option" }),
                                                React.createElement("label", { htmlFor: "range-option", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }, t("splitPdf.options.byRange"))),
                                            React.createElement("div", { className: "flex items-center space-x-2" },
                                                React.createElement(radio_group_1.RadioGroupItem, { value: "extract", id: "extract-option" }),
                                                React.createElement("label", { htmlFor: "extract-option", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }, t("splitPdf.options.extractAll"))),
                                            React.createElement("div", { className: "flex items-center space-x-2" },
                                                React.createElement(radio_group_1.RadioGroupItem, { value: "every", id: "every-option" }),
                                                React.createElement("label", { htmlFor: "every-option", className: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" }, t("splitPdf.options.everyNPages"))))),
                                    React.createElement(form_1.FormMessage, null)));
                            } }),
                        splitMethod === "range" && (React.createElement(form_1.FormField, { control: form.control, name: "pageRanges", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "mt-4" },
                                    React.createElement(form_1.FormLabel, null, t("splitPdf.options.pageRanges")),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ placeholder: "Example: 1-5, 8, 11-13" }, field, { disabled: isUploading || isProcessing }))),
                                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, t("splitPdf.options.pageRangesHint")),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                        splitMethod === "every" && (React.createElement(form_1.FormField, { control: form.control, name: "everyNPages", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, { className: "mt-4" },
                                    React.createElement(form_1.FormLabel, null, t("splitPdf.options.everyNPagesNumber")),
                                    React.createElement(form_1.FormControl, null,
                                        React.createElement(input_1.Input, __assign({ type: "number", min: 1, max: totalPages }, field, { onChange: function (e) {
                                                var value = parseInt(e.target.value);
                                                if (!isNaN(value) && value > 0) {
                                                    field.onChange(value);
                                                }
                                            }, disabled: isUploading || isProcessing }))),
                                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, t("splitPdf.options.everyNPagesHint")),
                                    React.createElement(form_1.FormMessage, null)));
                            } })))),
                    (error || uploadError) && (React.createElement(alert_1.Alert, { variant: "destructive" },
                        React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                        React.createElement(alert_1.AlertDescription, null, "uploadError"))),
                    (isUploading || isProcessing || isPolling) && (React.createElement(upload_progress_1.UploadProgress, { progress: progress, isUploading: isUploading, isProcessing: isProcessing || isPolling, label: isUploading
                            ? t("splitPdf.uploading")
                            : isPolling
                                ? t("splitPdf.splittingLarge")
                                : t("splitPdf.splitting"), error: uploadError, uploadStats: isUploading ? uploadStats : undefined })),
                    splitResult && (React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", { className: "p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/30" },
                            React.createElement("div", { className: "flex items-start gap-3" },
                                React.createElement("div", { className: "mt-1" },
                                    React.createElement(react_icons_1.CheckCircledIcon, { className: "h-5 w-5 text-green-600 dark:text-green-400" })),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("h3", { className: "font-medium text-green-600 dark:text-green-400" }, t("splitPdf.splitSuccess")),
                                    React.createElement("p", { className: "text-sm text-muted-foreground mt-1 mb-3" }, t("splitPdf.splitSuccessDesc").replace("{count}", getPartsCount(splitResult).toString()))))),
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("h3", { className: "font-medium" }, t("splitPdf.results.title")),
                            React.createElement("div", { className: "divide-y border rounded-md max-h-[400px] overflow-y-auto" }, getSplitParts(splitResult).map(function (part, index) { return (React.createElement("div", { key: index, className: "p-3 flex items-center justify-between" },
                                React.createElement("div", { className: "flex items-center gap-3" },
                                    React.createElement("div", { className: "h-9 w-9 flex-shrink-0 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center" },
                                        React.createElement(lucide_react_1.FileTextIcon, { className: "h-5 w-5 text-blue-500" })),
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "text-sm font-medium" },
                                            t("splitPdf.results.part"),
                                            " ",
                                            index + 1),
                                        React.createElement("p", { className: "text-xs text-muted-foreground" },
                                            t("splitPdf.results.pages"),
                                            ":",
                                            " ",
                                            part.pages.join(", "),
                                            " (",
                                            part.pageCount,
                                            " ",
                                            t("splitPdf.results.pagesCount"),
                                            ")"))),
                                React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", asChild: true },
                                    React.createElement("a", { href: part.fileUrl, download: true, target: "_blank" },
                                        React.createElement(react_icons_1.DownloadIcon, { className: "h-4 w-4 mr-1" }),
                                        " ",
                                        t("ui.download"))))); }))),
                        React.createElement("p", { className: "text-xs text-center text-muted-foreground mt-4" }, t("fileUploader.filesSecurity"))))),
                React.createElement(card_1.CardFooter, { className: "flex justify-end" },
                    file &&
                        !splitResult &&
                        !isUploading &&
                        !isProcessing &&
                        !isPolling && (React.createElement(button_1.Button, { type: "submit", disabled: isUploading || isProcessing }, t("splitPdf.splitDocument"))),
                    (splitResult || isUploading || isProcessing || isPolling) && (React.createElement(button_1.Button, { variant: "outline", onClick: function () {
                            setFile(null);
                            setSplitResult(null);
                            setIsPolling(false);
                            setJobId(null);
                            setStatusUrl(null);
                            setProgress(0);
                            form.reset();
                        }, disabled: isUploading || isProcessing }, t("ui.reupload"))))))));
}
exports.PdfSplitter = PdfSplitter;
