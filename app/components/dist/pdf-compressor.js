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
exports.MultiPdfCompressor = void 0;
var react_1 = require("react");
var react_dropzone_1 = require("react-dropzone");
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var zod_2 = require("zod");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var form_1 = require("@/components/ui/form");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var checkbox_1 = require("@/components/ui/checkbox");
var react_icons_1 = require("@radix-ui/react-icons");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var store_1 = require("@/src/store/store");
var jszip_1 = require("jszip");
// Form schema
var formSchema = zod_2.z.object({
    quality: zod_2.z["enum"](["high", "medium", "low"])["default"]("medium"),
    processAllTogether: zod_2.z.boolean()["default"](true)
});
var compressPdfClientSide = function (file, quality) { return __awaiter(void 0, void 0, Promise, function () {
    var originalSize, compressionFactors, compressionFactor, compressedSize, compressedData;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                originalSize = file.size;
                compressionFactors = {
                    high: 0.9,
                    medium: 0.7,
                    low: 0.5
                };
                compressionFactor = (_a = compressionFactors[quality]) !== null && _a !== void 0 ? _a : 0.7;
                compressedSize = Math.round(originalSize * compressionFactor);
                compressedData = new Blob([file], { type: "application/pdf" });
                // Simulate processing time
                return [4 /*yield*/, new Promise(function (resolve) {
                        return setTimeout(resolve, 1000 + Math.random() * 2000);
                    })];
            case 1:
                // Simulate processing time
                _b.sent();
                return [2 /*return*/, { compressedData: compressedData, originalSize: originalSize, compressedSize: compressedSize }];
        }
    });
}); };
function MultiPdfCompressor() {
    var _this = this;
    var t = store_1.useLanguageStore().t;
    var _a = react_1.useState([]), files = _a[0], setFiles = _a[1];
    var _b = react_1.useState(false), isProcessing = _b[0], setIsProcessing = _b[1];
    var _c = react_1.useState({}), progress = _c[0], setProgress = _c[1];
    var _d = react_1.useState({}), compressedFiles = _d[0], setCompressedFiles = _d[1];
    var _e = react_1.useState(null), error = _e[0], setError = _e[1];
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(formSchema),
        defaultValues: {
            quality: "medium",
            processAllTogether: true
        }
    });
    var _f = react_dropzone_1.useDropzone({
        accept: { "application/pdf": [".pdf"] },
        maxSize: 100 * 1024 * 1024,
        onDrop: function (acceptedFiles, rejectedFiles) {
            if (rejectedFiles.length > 0) {
                var rejection = rejectedFiles[0];
                setError(rejection.file.size > 100 * 1024 * 1024
                    ? t("fileUploader.maxSize")
                    : t("fileUploader.inputFormat"));
                return;
            }
            if (acceptedFiles.length > 0) {
                setFiles(function (prev) {
                    var existingFileNames = new Set(prev.map(function (f) { return f.file.name; }));
                    var newFiles = acceptedFiles
                        .filter(function (file) { return !existingFileNames.has(file.name); })
                        .map(function (file) { return ({ file: file, status: "idle" }); });
                    return __spreadArrays(prev, newFiles);
                });
                setError(null);
            }
        },
        multiple: true
    }), getRootProps = _f.getRootProps, getInputProps = _f.getInputProps, isDragActive = _f.isDragActive;
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (files.length === 0) {
                        setError(t("compressPdf.error.noFiles"));
                        return [2 /*return*/];
                    }
                    setIsProcessing(true);
                    setError(null);
                    if (!values.processAllTogether) return [3 /*break*/, 2];
                    return [4 /*yield*/, processAllFiles(values.quality)];
                case 1:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, processFilesSequentially(values.quality)];
                case 3:
                    _a = _b.sent();
                    _b.label = 4;
                case 4:
                    _a;
                    setIsProcessing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var processAllFiles = function (quality) { return __awaiter(_this, void 0, void 0, function () {
        var compressionPromises;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    compressionPromises = files
                        .filter(function (fileItem) { return fileItem.status !== "completed"; })
                        .map(function (fileItem) { return compressFile(fileItem.file, quality); });
                    return [4 /*yield*/, Promise.all(compressionPromises)];
                case 1:
                    _a.sent();
                    sonner_1.toast.success(t("compressPdf.success"));
                    return [2 /*return*/];
            }
        });
    }); };
    var processFilesSequentially = function (quality) { return __awaiter(_this, void 0, void 0, function () {
        var filesToProcess, _i, filesToProcess_1, fileItem, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    filesToProcess = files.filter(function (fileItem) { return fileItem.status !== "completed"; });
                    _i = 0, filesToProcess_1 = filesToProcess;
                    _a.label = 1;
                case 1:
                    if (!(_i < filesToProcess_1.length)) return [3 /*break*/, 6];
                    fileItem = filesToProcess_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, compressFile(fileItem.file, quality)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    console.error("Failed to compress " + fileItem.file.name + ":", err_1);
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    sonner_1.toast.success(t("compressPdf.success"));
                    return [2 /*return*/];
            }
        });
    }); };
    var compressFile = function (file, quality) { return __awaiter(_this, void 0, Promise, function () {
        var progressInterval_1, formData, response, errorData, data_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setFiles(function (prev) {
                        return prev.map(function (f) {
                            return f.file.name === file.name
                                ? __assign(__assign({}, f), { status: "processing", error: undefined }) : f;
                        });
                    });
                    setProgress(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = 0, _a)));
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    progressInterval_1 = setInterval(function () {
                        setProgress(function (prev) {
                            var _a;
                            var currentProgress = prev[file.name] || 0;
                            if (currentProgress >= 95) {
                                clearInterval(progressInterval_1);
                                return prev;
                            }
                            return __assign(__assign({}, prev), (_a = {}, _a[file.name] = currentProgress + 5, _a));
                        });
                    }, 300 + Math.random() * 300);
                    formData = new FormData();
                    formData.append("file", file);
                    formData.append("quality", quality);
                    return [4 /*yield*/, fetch("/api/pdf/compress", {
                            method: "POST",
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || "Compression failed");
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data_1 = _a.sent();
                    clearInterval(progressInterval_1);
                    setProgress(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = 100, _a)));
                    });
                    setCompressedFiles(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = {
                            originalSize: data_1.originalSize,
                            compressedSize: data_1.compressedSize,
                            compressionRatio: data_1.compressionRatio,
                            fileUrl: data_1.fileUrl,
                            filename: data_1.filename,
                            originalName: file.name
                        }, _a)));
                    });
                    setFiles(function (prev) {
                        return prev.map(function (f) {
                            return f.file.name === file.name ? __assign(__assign({}, f), { status: "completed" }) : f;
                        });
                    });
                    sonner_1.toast.success(t("compressPdf.success"), {
                        description: file.name + " " + t("compressPdf.reducedBy") + " " + data_1.compressionRatio
                    });
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _a.sent();
                    setFiles(function (prev) {
                        return prev.map(function (f) {
                            return f.file.name === file.name
                                ? __assign(__assign({}, f), { status: "error", error: err_2 instanceof Error
                                        ? err_2.message
                                        : t("compressPdf.error.unknown") }) : f;
                        });
                    });
                    setProgress(function (prev) {
                        var _a;
                        return (__assign(__assign({}, prev), (_a = {}, _a[file.name] = 0, _a)));
                    });
                    sonner_1.toast.error(t("compressPdf.error.failed"), {
                        description: err_2 instanceof Error ? err_2.message : t("compressPdf.error.unknown")
                    });
                    throw err_2;
                case 7: return [2 /*return*/];
            }
        });
    }); };
    var handleRemoveFile = function (fileName) {
        setFiles(function (prev) { return prev.filter(function (f) { return f.file.name !== fileName; }); });
        setProgress(function (prev) {
            var newProgress = __assign({}, prev);
            delete newProgress[fileName];
            return newProgress;
        });
        setCompressedFiles(function (prev) {
            var _a;
            var newCompressedFiles = __assign({}, prev);
            if ((_a = newCompressedFiles[fileName]) === null || _a === void 0 ? void 0 : _a.fileUrl) {
                URL.revokeObjectURL(newCompressedFiles[fileName].fileUrl);
            }
            delete newCompressedFiles[fileName];
            return newCompressedFiles;
        });
    };
    var formatFileSize = function (sizeInBytes) {
        if (sizeInBytes < 1024)
            return sizeInBytes + " B";
        if (sizeInBytes < 1024 * 1024)
            return (sizeInBytes / 1024).toFixed(2) + " KB";
        return (sizeInBytes / (1024 * 1024)).toFixed(2) + " MB";
    };
    var getTotalStats = react_1.useCallback(function () {
        if (Object.keys(compressedFiles).length === 0)
            return null;
        var totalOriginalSize = Object.values(compressedFiles).reduce(function (sum, file) { return sum + file.originalSize; }, 0);
        var totalCompressedSize = Object.values(compressedFiles).reduce(function (sum, file) { return sum + file.compressedSize; }, 0);
        var totalSaved = totalOriginalSize - totalCompressedSize;
        var compressionRatio = ((totalSaved / totalOriginalSize) * 100).toFixed(2);
        return {
            totalOriginalSize: totalOriginalSize,
            totalCompressedSize: totalCompressedSize,
            totalSaved: totalSaved,
            compressionRatio: compressionRatio
        };
    }, [compressedFiles]);
    var handleDownloadAllAsZip = function () { return __awaiter(_this, void 0, void 0, function () {
        var completedFiles, zip, _i, completedFiles_1, file, response, blob, zipBlob, url, link, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    completedFiles = Object.values(compressedFiles);
                    if (completedFiles.length === 0) {
                        sonner_1.toast.error(t("compressPdf.error.noCompressed"));
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    zip = new jszip_1["default"]();
                    _i = 0, completedFiles_1 = completedFiles;
                    _a.label = 2;
                case 2:
                    if (!(_i < completedFiles_1.length)) return [3 /*break*/, 6];
                    file = completedFiles_1[_i];
                    return [4 /*yield*/, fetch(file.fileUrl)];
                case 3:
                    response = _a.sent();
                    return [4 /*yield*/, response.blob()];
                case 4:
                    blob = _a.sent();
                    zip.file(file.filename, blob);
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 2];
                case 6: return [4 /*yield*/, zip.generateAsync({ type: "blob" })];
                case 7:
                    zipBlob = _a.sent();
                    url = window.URL.createObjectURL(zipBlob);
                    link = document.createElement("a");
                    link.href = url;
                    link.download = "compressed-pdfs-" + new Date().toISOString().split("T")[0] + ".zip";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);
                    sonner_1.toast.success(t("compressPdf.zipDownloadSuccess"));
                    return [3 /*break*/, 9];
                case 8:
                    err_3 = _a.sent();
                    sonner_1.toast.error(t("compressPdf.error.downloadZip"), {
                        description: err_3 instanceof Error ? err_3.message : t("compressPdf.error.unknown")
                    });
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var totalStats = getTotalStats();
    var allFilesProcessed = files.every(function (f) { return f.status === "completed"; });
    var anyFilesFailed = files.some(function (f) { return f.status === "error"; });
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
            React.createElement(card_1.Card, { className: "border shadow-sm" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, t("compressPdf.title")),
                    React.createElement(card_1.CardDescription, null, t("compressPdf.description"))),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement(form_1.FormField, { control: form.control, name: "processAllTogether", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, { className: "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: field.onChange, disabled: isProcessing })),
                                React.createElement("div", { className: "space-y-1 leading-none" },
                                    React.createElement(form_1.FormLabel, null, t("compressPdf.processing.title")),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, t("compressPdf.processing.processAllTogether")))));
                        } }),
                    React.createElement("div", __assign({}, getRootProps(), { className: utils_1.cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer", isDragActive
                            ? "border-primary bg-primary/10"
                            : files.length > 0
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50", isProcessing && "pointer-events-none opacity-80") }),
                        React.createElement("input", __assign({}, getInputProps(), { disabled: isProcessing })),
                        React.createElement("div", { className: "flex flex-col items-center gap-2" },
                            React.createElement("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center" },
                                React.createElement(react_icons_1.UploadIcon, { className: "h-6 w-6 text-muted-foreground" })),
                            React.createElement("div", { className: "text-lg font-medium" }, isDragActive
                                ? t("fileUploader.dropHere")
                                : t("fileUploader.dragAndDrop")),
                            React.createElement("p", { className: "text-sm text-muted-foreground max-w-sm" },
                                t("fileUploader.dropHereDesc"),
                                " ",
                                t("fileUploader.maxSize")),
                            React.createElement(button_1.Button, { type: "button", variant: "secondary", size: "sm", className: "mt-2" }, t("fileUploader.browse")))),
                    files.length > 0 && (React.createElement("div", { className: "border rounded-lg" },
                        React.createElement("div", { className: "p-3 border-b bg-muted/30 flex justify-between items-center" },
                            React.createElement("h3", { className: "font-medium" },
                                t("compressPdf.filesToCompress"),
                                " (",
                                files.length,
                                ")"),
                            !isProcessing && (React.createElement(button_1.Button, { type: "button", size: "sm", variant: "outline", onClick: function () {
                                    Object.values(compressedFiles).forEach(function (file) {
                                        if (file.fileUrl)
                                            URL.revokeObjectURL(file.fileUrl);
                                    });
                                    setFiles([]);
                                    setCompressedFiles({});
                                    setProgress({});
                                } },
                                React.createElement(react_icons_1.TrashIcon, { className: "h-4 w-4 mr-1" }),
                                " ",
                                t("ui.clearAll")))),
                        React.createElement("div", { className: "divide-y overflow-y-auto max-h-[300px]" }, files.map(function (fileItem) { return (React.createElement("div", { key: fileItem.file.name, className: "p-3 flex items-center justify-between gap-4" },
                            React.createElement("div", { className: "flex items-center gap-3 min-w-0 flex-1" },
                                React.createElement("div", { className: "h-9 w-9 rounded-md bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0" },
                                    React.createElement(react_icons_1.FileIcon, { className: "h-5 w-5 text-green-600 dark:text-green-400" })),
                                React.createElement("div", { className: "min-w-0 flex-1" },
                                    React.createElement("p", { className: "text-sm font-medium truncate" }, fileItem.file.name),
                                    React.createElement("p", { className: "text-xs text-muted-foreground" },
                                        formatFileSize(fileItem.file.size),
                                        compressedFiles[fileItem.file.name] && (React.createElement("span", { className: "ml-2 text-green-600 dark:text-green-400" },
                                            "\u2192",
                                            " ",
                                            formatFileSize(compressedFiles[fileItem.file.name]
                                                .compressedSize),
                                            " ",
                                            "(",
                                            compressedFiles[fileItem.file.name]
                                                .compressionRatio,
                                            " ",
                                            t("compressPdf.reduction"),
                                            ")"))))),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                fileItem.status === "idle" && !isProcessing && (React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () { return handleRemoveFile(fileItem.file.name); } },
                                    React.createElement(react_icons_1.Cross2Icon, { className: "h-4 w-4" }))),
                                fileItem.status === "processing" && (React.createElement("div", { className: "flex items-center gap-2 min-w-32" },
                                    React.createElement(progress_1.Progress, { value: progress[fileItem.file.name] || 0, className: "h-2 w-20" }),
                                    React.createElement("span", { className: "text-xs text-muted-foreground" },
                                        progress[fileItem.file.name] || 0,
                                        "%"))),
                                fileItem.status === "completed" && (React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
                                        React.createElement(react_icons_1.CheckCircledIcon, { className: "h-3 w-3 mr-1" }),
                                        " ",
                                        t("compressPdf.status.completed")),
                                    React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", asChild: true, className: "text-sm" },
                                        React.createElement("a", { href: compressedFiles[fileItem.file.name].fileUrl, download: compressedFiles[fileItem.file.name].filename, onClick: function (e) {
                                                // Prevent default to ensure download works
                                                e.stopPropagation();
                                            } },
                                            React.createElement(react_icons_1.DownloadIcon, { className: "h-3.5 w-3.5 mr-1" }),
                                            " ",
                                            t("ui.download"))))),
                                fileItem.status === "error" && (React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
                                        React.createElement(react_icons_1.CrossCircledIcon, { className: "h-3 w-3 mr-1" }),
                                        " ",
                                        t("compressPdf.status.failed")),
                                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: function () {
                                            return handleRemoveFile(fileItem.file.name);
                                        } },
                                        React.createElement(react_icons_1.Cross2Icon, { className: "h-4 w-4" }))))))); }))))),
                React.createElement(card_1.CardFooter, { className: "flex justify-end" },
                    React.createElement(button_1.Button, { type: "submit", disabled: files.length === 0 || isProcessing, className: "min-w-32" }, isProcessing ? t("ui.processing") : t("compressPdf.compressAll")))),
            error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                React.createElement(alert_1.AlertDescription, null, error))),
            isProcessing && files.length > 1 && (React.createElement("div", { className: "space-y-2" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("span", { className: "text-sm font-medium" }, t("compressPdf.overallProgress")),
                    React.createElement("span", { className: "text-sm text-muted-foreground" },
                        Object.values(progress).filter(function (p) { return p === 100; }).length,
                        " ",
                        t("compressPdf.of"),
                        " ",
                        files.length,
                        " ",
                        t("compressPdf.files"))),
                React.createElement(progress_1.Progress, { value: (Object.values(progress).reduce(function (a, b) { return a + b; }, 0) /
                        (files.length * 100)) *
                        100, className: "h-2" }))),
            totalStats &&
                files.length > 1 &&
                (allFilesProcessed || anyFilesFailed) && (React.createElement(card_1.Card, { className: "border-green-200 dark:border-green-900" },
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-green-600 dark:text-green-400 flex items-center gap-2" },
                        React.createElement(react_icons_1.CheckCircledIcon, { className: "h-5 w-5" }),
                        " ",
                        t("compressPdf.results.title"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" },
                        React.createElement("div", { className: "text-center" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, t("compressPdf.results.totalOriginal")),
                            React.createElement("p", { className: "text-lg font-semibold" }, formatFileSize(totalStats.totalOriginalSize))),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, t("compressPdf.results.totalCompressed")),
                            React.createElement("p", { className: "text-lg font-semibold" }, formatFileSize(totalStats.totalCompressedSize))),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, t("compressPdf.results.spaceSaved")),
                            React.createElement("p", { className: "text-lg font-semibold text-green-600 dark:text-green-400" }, formatFileSize(totalStats.totalSaved))),
                        React.createElement("div", { className: "text-center" },
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, t("compressPdf.results.averageReduction")),
                            React.createElement("p", { className: "text-lg font-semibold text-green-600 dark:text-green-400" },
                                totalStats.compressionRatio,
                                "%"))),
                    allFilesProcessed && files.length > 1 && (React.createElement(button_1.Button, { className: "w-full", type: "button", variant: "outline", onClick: handleDownloadAllAsZip },
                        React.createElement(react_icons_1.DownloadIcon, { className: "h-4 w-4 mr-2" }),
                        " ",
                        t("compressPdf.results.downloadAll")))),
                React.createElement(card_1.CardFooter, { className: "text-xs text-muted-foreground" }, t("fileUploader.filesSecurity")))))));
}
exports.MultiPdfCompressor = MultiPdfCompressor;
