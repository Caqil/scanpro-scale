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
exports.FileUploader = void 0;
var react_1 = require("react");
var react_dropzone_1 = require("react-dropzone");
var zod_1 = require("@hookform/resolvers/zod");
var react_hook_form_1 = require("react-hook-form");
var zod_2 = require("zod");
var sonner_1 = require("sonner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var progress_1 = require("@/components/ui/progress");
var alert_1 = require("@/components/ui/alert");
var form_1 = require("@/components/ui/form");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var checkbox_1 = require("@/components/ui/checkbox");
var react_icons_1 = require("@radix-ui/react-icons");
var utils_1 = require("@/lib/utils");
var store_1 = require("@/src/store/store");
var FORMAT_CATEGORIES = [
    {
        name: "Documents",
        icon: React.createElement(react_icons_1.FileTextIcon, { className: "h-4 w-4" }),
        formats: [
            { value: "pdf", label: "PDF Document (.pdf)", accept: "application/pdf" },
            {
                value: "docx",
                label: "Word Document (.docx)",
                accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            },
            {
                value: "rtf",
                label: "Rich Text Format (.rtf)",
                accept: "application/rtf"
            },
            { value: "txt", label: "Text File (.txt)", accept: "text/plain" },
            { value: "html", label: "HTML Document (.html)", accept: "text/html" },
        ]
    },
    {
        name: "Spreadsheets",
        icon: React.createElement(react_icons_1.TableIcon, { className: "h-4 w-4" }),
        formats: [
            {
                value: "xlsx",
                label: "Excel Spreadsheet (.xlsx)",
                accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            },
        ]
    },
    {
        name: "Presentations",
        icon: React.createElement(react_icons_1.FileTextIcon, { className: "h-4 w-4" }),
        formats: [
            {
                value: "pptx",
                label: "PowerPoint Presentation (.pptx)",
                accept: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
            },
        ]
    },
    {
        name: "Images",
        icon: React.createElement(react_icons_1.ImageIcon, { className: "h-4 w-4" }),
        formats: [
            { value: "jpg", label: "JPEG Image (.jpg)", accept: "image/jpeg" },
            { value: "png", label: "PNG Image (.png)", accept: "image/png" },
        ]
    },
];
// Form schema
var formSchema = zod_2.z.object({
    inputFormat: zod_2.z.string().min(1, "Please select an input format"),
    outputFormat: zod_2.z.string().min(1, "Please select an output format"),
    enableOcr: zod_2.z.boolean()["default"](false),
    quality: zod_2.z.number().min(10).max(100)["default"](90),
    password: zod_2.z.string().optional()
});
// Get all input formats as flattened array
var getAllInputFormats = function () {
    return FORMAT_CATEGORIES.flatMap(function (category) { return category.formats; });
};
// Get all acceptable MIME types for the selected input format
var getAcceptedFileTypes = function (inputFormat) {
    var _a;
    var allFormats = getAllInputFormats();
    var format = allFormats.find(function (f) { return f.value === inputFormat; });
    return format ? (_a = {}, _a[format.accept] = ["." + format.value], _a) : {};
};
// Get file Icon based on format
var getFileIcon = function (format) {
    if (["jpg", "jpeg", "png"].includes(format)) {
        return React.createElement(react_icons_1.ImageIcon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" });
    }
    else if (["xlsx", "xls"].includes(format)) {
        return React.createElement(react_icons_1.TableIcon, { className: "h-6 w-6 text-green-600 dark:text-green-400" });
    }
    else if (["pptx"].includes(format)) {
        return (React.createElement(react_icons_1.FileTextIcon, { className: "h-6 w-6 text-orange-600 dark:text-orange-400" }));
    }
    else {
        return React.createElement(react_icons_1.FileIcon, { className: "h-6 w-6 text-blue-600 dark:text-blue-400" });
    }
};
function FileUploader(_a) {
    var _this = this;
    var _b = _a.initialInputFormat, initialInputFormat = _b === void 0 ? "pdf" : _b, _c = _a.initialOutputFormat, initialOutputFormat = _c === void 0 ? "docx" : _c;
    var t = store_1.useLanguageStore().t;
    var _d = react_1.useState(null), file = _d[0], setFile = _d[1];
    var _e = react_1.useState(false), isUploading = _e[0], setIsUploading = _e[1];
    var _f = react_1.useState(0), progress = _f[0], setProgress = _f[1];
    var _g = react_1.useState(null), convertedFileUrl = _g[0], setConvertedFileUrl = _g[1];
    var _h = react_1.useState(null), error = _h[0], setError = _h[1];
    var _j = react_1.useState({}), acceptedFileTypes = _j[0], setAcceptedFileTypes = _j[1];
    // Initialize form with provided initial values
    var form = react_hook_form_1.useForm({
        resolver: zod_1.zodResolver(formSchema),
        defaultValues: {
            inputFormat: initialInputFormat,
            outputFormat: initialOutputFormat,
            enableOcr: false,
            quality: 90,
            password: ""
        }
    });
    // Update form when initialInputFormat or initialOutputFormat changes
    react_1.useEffect(function () {
        form.setValue("inputFormat", initialInputFormat);
        form.setValue("outputFormat", initialOutputFormat);
        // Also update the accepted file types when initialInputFormat changes
        setAcceptedFileTypes(getAcceptedFileTypes(initialInputFormat));
    }, [initialInputFormat, initialOutputFormat, form]);
    // Watch inputFormat to update accepted file types for the dropzone
    var inputFormat = form.watch("inputFormat");
    react_1.useEffect(function () {
        setAcceptedFileTypes(getAcceptedFileTypes(inputFormat));
        // Reset file if format changes
        if (file) {
            setFile(null);
            setConvertedFileUrl(null);
        }
    }, [inputFormat]);
    // Set up dropzone
    var _k = react_dropzone_1.useDropzone({
        accept: acceptedFileTypes,
        maxFiles: 1,
        maxSize: 50 * 1024 * 1024,
        onDrop: function (acceptedFiles, rejectedFiles) {
            if (rejectedFiles.length > 0) {
                var rejection = rejectedFiles[0];
                if (rejection.file.size > 50 * 1024 * 1024) {
                    setError(t("fileUploader.maxSize"));
                }
                else {
                    setError(t("fileUploader.inputFormat") + " " + inputFormat.toUpperCase());
                }
                return;
            }
            if (acceptedFiles.length > 0) {
                setFile(acceptedFiles[0]);
                setConvertedFileUrl(null);
                setError(null);
            }
        }
    }), getRootProps = _k.getRootProps, getInputProps = _k.getInputProps, isDragActive = _k.isDragActive;
    // Handle form submission
    var onSubmit = function (values) { return __awaiter(_this, void 0, void 0, function () {
        var formData, progressInterval_1, response, errorData, data, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file) {
                        setError(t("compressPdf.error.noFiles"));
                        return [2 /*return*/];
                    }
                    setIsUploading(true);
                    setProgress(0);
                    setError(null);
                    setConvertedFileUrl(null);
                    formData = new FormData();
                    formData.append("file", file);
                    formData.append("inputFormat", values.inputFormat);
                    formData.append("outputFormat", values.outputFormat);
                    formData.append("ocr", values.enableOcr ? "true" : "false");
                    formData.append("quality", values.quality.toString());
                    if (values.password) {
                        formData.append("password", values.password);
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    progressInterval_1 = setInterval(function () {
                        setProgress(function (prev) {
                            if (prev >= 95) {
                                clearInterval(progressInterval_1);
                                return 95;
                            }
                            return prev + 5;
                        });
                    }, 300);
                    return [4 /*yield*/, fetch("/api/pdf/convert", {
                            method: "POST",
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    clearInterval(progressInterval_1);
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error ||
                        t("compressPdf.error.failed") + " " + values.inputFormat.toUpperCase() + " to " + values.outputFormat.toUpperCase());
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    setProgress(100);
                    setConvertedFileUrl(data.filename);
                    sonner_1.toast.success(t("fileUploader.successful"), {
                        description: t("fileUploader.successDesc") + " " + values.inputFormat.toUpperCase() + " to " + values.outputFormat.toUpperCase() + "."
                    });
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _a.sent();
                    setError(err_1 instanceof Error ? err_1.message : t("compressPdf.error.unknown"));
                    sonner_1.toast.error(t("compressPdf.error.failed"), {
                        description: err_1 instanceof Error ? err_1.message : t("compressPdf.error.unknown")
                    });
                    return [3 /*break*/, 8];
                case 7:
                    setIsUploading(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Handle file removal
    var handleRemoveFile = function () {
        setFile(null);
        setConvertedFileUrl(null);
        setError(null);
    };
    // Get file extension
    var getFileExtension = function (filename) {
        var _a;
        return ((_a = filename.split(".").pop()) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "";
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
    // Check if format is an image format
    var isImageFormat = form.watch("outputFormat") === "jpg" ||
        form.watch("outputFormat") === "png";
    return (React.createElement(form_1.Form, __assign({}, form),
        React.createElement("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "text-lg font-medium" },
                        "1. ",
                        t("ui.upload")),
                    React.createElement("div", { className: "hidden" },
                        React.createElement(form_1.FormField, { control: form.control, name: "inputFormat", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, t("fileUploader.inputFormat")),
                                    React.createElement(select_1.Select, { disabled: isUploading, onValueChange: field.onChange, value: field.value },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: t("fileUploader.inputFormat") }))),
                                        React.createElement(select_1.SelectContent, null, FORMAT_CATEGORIES.map(function (category) { return (React.createElement("div", { key: category.name },
                                            React.createElement("div", { className: "px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center" },
                                                category.icon,
                                                React.createElement("span", { className: "ml-1" }, t("fileUploader.categories." + category.name.toLowerCase()))),
                                            category.formats.map(function (format) { return (React.createElement(select_1.SelectItem, { key: format.value, value: format.value }, format.label)); }))); }))),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement("div", __assign({}, getRootProps(), { className: utils_1.cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer", isDragActive
                            ? "border-primary bg-primary/10"
                            : file
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-muted-foreground/25 hover:border-muted-foreground/50", isUploading && "pointer-events-none opacity-60") }),
                        React.createElement("input", __assign({}, getInputProps(), { disabled: isUploading })),
                        file ? (React.createElement("div", { className: "flex flex-col items-center gap-2" },
                            React.createElement("div", { className: "h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center" }, getFileIcon(getFileExtension(file.name).toLowerCase())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm font-medium" }, file.name),
                                React.createElement("p", { className: "text-xs text-muted-foreground" },
                                    formatFileSize(file.size),
                                    " \u2022",
                                    " ",
                                    getFileExtension(file.name))),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", disabled: isUploading, onClick: function (e) {
                                    e.stopPropagation();
                                    handleRemoveFile();
                                } },
                                React.createElement(react_icons_1.Cross2Icon, { className: "h-4 w-4 mr-1" }),
                                " ",
                                t("fileUploader.remove")))) : (React.createElement("div", { className: "flex flex-col items-center gap-2" },
                            React.createElement("div", { className: "h-12 w-12 rounded-full bg-muted flex items-center justify-center" },
                                React.createElement(react_icons_1.UploadIcon, { className: "h-6 w-6 text-muted-foreground" })),
                            React.createElement("div", { className: "text-lg font-medium" }, isDragActive
                                ? t("fileUploader.dropHere")
                                : t("fileUploader.dragAndDrop")),
                            React.createElement("p", { className: "text-sm text-muted-foreground max-w-sm" },
                                t("fileUploader.dropHereDesc"),
                                " ",
                                t("fileUploader.maxSize")),
                            React.createElement(button_1.Button, { type: "button", variant: "secondary", size: "sm", className: "mt-2" }, t("fileUploader.browse")))))),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", { className: "text-lg font-medium" },
                        "2. ",
                        t("convert.options.title")),
                    React.createElement("div", { className: "hidden" },
                        React.createElement(form_1.FormField, { control: form.control, name: "outputFormat", render: function (_a) {
                                var field = _a.field;
                                return (React.createElement(form_1.FormItem, null,
                                    React.createElement(form_1.FormLabel, null, t("fileUploader.outputFormat")),
                                    React.createElement(select_1.Select, { disabled: isUploading, onValueChange: field.onChange, value: field.value },
                                        React.createElement(form_1.FormControl, null,
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: t("fileUploader.outputFormat") }))),
                                        React.createElement(select_1.SelectContent, null, FORMAT_CATEGORIES.map(function (category) { return (React.createElement("div", { key: category.name },
                                            React.createElement("div", { className: "px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center" },
                                                category.icon,
                                                React.createElement("span", { className: "ml-1" }, t("fileUploader.categories." + category.name.toLowerCase()))),
                                            category.formats.map(function (format) { return (React.createElement(select_1.SelectItem, { key: format.value, value: format.value }, format.label)); }))); }))),
                                    React.createElement(form_1.FormMessage, null)));
                            } })),
                    React.createElement(card_1.Card, { className: "bg-muted/30" },
                        React.createElement(card_1.CardContent, { className: "pt-6" },
                            React.createElement("div", { className: "flex items-center gap-4 mb-4" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("div", { className: "p-2 rounded-lg " + (getFileIcon(inputFormat) === getFileIcon("pdf")
                                            ? "bg-blue-100 dark:bg-blue-900/30"
                                            : inputFormat === "xlsx"
                                                ? "bg-green-100 dark:bg-green-900/30"
                                                : inputFormat === "pptx"
                                                    ? "bg-orange-100 dark:bg-orange-900/30"
                                                    : "bg-blue-100 dark:bg-blue-900/30") }, getFileIcon(inputFormat)),
                                    React.createElement("span", { className: "font-medium" }, inputFormat.toUpperCase())),
                                React.createElement("div", { className: "text-muted-foreground" }, "\u2192"),
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("div", { className: "p-2 rounded-lg " + (getFileIcon(form.watch("outputFormat")) ===
                                            getFileIcon("pdf")
                                            ? "bg-blue-100 dark:bg-blue-900/30"
                                            : form.watch("outputFormat") === "xlsx"
                                                ? "bg-green-100 dark:bg-green-900/30"
                                                : form.watch("outputFormat") === "pptx"
                                                    ? "bg-orange-100 dark:bg-orange-900/30"
                                                    : "bg-blue-100 dark:bg-blue-900/30") }, getFileIcon(form.watch("outputFormat"))),
                                    React.createElement("span", { className: "font-medium" }, form.watch("outputFormat").toUpperCase()))),
                            React.createElement("p", { className: "text-sm text-muted-foreground" },
                                t("converter.description"),
                                " ",
                                React.createElement("span", { className: "font-medium" }, inputFormat.toUpperCase()),
                                " ",
                                t("ui.to"),
                                " ",
                                React.createElement("span", { className: "font-medium" }, form.watch("outputFormat").toUpperCase())))),
                    React.createElement(form_1.FormField, { control: form.control, name: "enableOcr", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, { className: "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4" },
                                React.createElement(form_1.FormControl, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: field.value, onCheckedChange: field.onChange, disabled: isUploading })),
                                React.createElement("div", { className: "space-y-1 leading-none" },
                                    React.createElement(form_1.FormLabel, null, t("fileUploader.ocr")),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, t("fileUploader.ocrDesc")))));
                        } }),
                    isImageFormat && (React.createElement(form_1.FormField, { control: form.control, name: "quality", render: function (_a) {
                            var field = _a.field;
                            return (React.createElement(form_1.FormItem, null,
                                React.createElement(form_1.FormLabel, null,
                                    t("fileUploader.quality"),
                                    ": ",
                                    field.value,
                                    "%"),
                                React.createElement(form_1.FormControl, null,
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("span", { className: "text-xs" }, t("fileUploader.low")),
                                        React.createElement(input_1.Input, { type: "range", min: 10, max: 100, step: 5, value: field.value, onChange: function (e) {
                                                return field.onChange(parseInt(e.target.value));
                                            }, disabled: isUploading, className: "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4" }),
                                        React.createElement("span", { className: "text-xs" }, t("fileUploader.high")))),
                                React.createElement(form_1.FormMessage, null)));
                        } })))),
            error && (React.createElement(alert_1.Alert, { variant: "destructive" },
                React.createElement(alert_1.AlertDescription, null,
                    React.createElement("div", { className: "flex items-center gap-2" },
                        React.createElement(react_icons_1.CrossCircledIcon, { className: "h-4 w-4" }),
                        error)))),
            isUploading && (React.createElement("div", { className: "space-y-2" },
                React.createElement(progress_1.Progress, { value: progress, className: "h-2" }),
                React.createElement("div", { className: "flex items-center justify-center gap-2 text-sm text-muted-foreground" },
                    React.createElement(react_icons_1.ReloadIcon, { className: "h-4 w-4 animate-spin" }),
                    t("fileUploader.converting"),
                    "... ",
                    progress,
                    "%"))),
            convertedFileUrl && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-green-600 dark:text-green-400 flex items-center gap-2" },
                        React.createElement(react_icons_1.CheckCircledIcon, { className: "h-5 w-5" }),
                        t("fileUploader.successful"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-muted-foreground mb-4" }, t("fileUploader.successDesc")),
                    React.createElement(button_1.Button, { className: "w-full", asChild: true, variant: "default" },
                        React.createElement("a", { href: "/api/file?folder=conversions&filename=" + encodeURIComponent(convertedFileUrl), download: true },
                            React.createElement(react_icons_1.DownloadIcon, { className: "h-4 w-4 mr-2" }),
                            t("fileUploader.download")))),
                React.createElement(card_1.CardFooter, { className: "text-xs text-muted-foreground" }, t("fileUploader.filesSecurity")))),
            React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: !file || isUploading }, isUploading ? t("ui.processing") : t("convert.howTo.step2.title")))));
}
exports.FileUploader = FileUploader;
