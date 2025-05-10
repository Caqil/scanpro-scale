"use client";
"use strict";
exports.__esModule = true;
exports.FileUploadSection = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var store_1 = require("@/src/store/store");
var sonner_1 = require("sonner");
function FileUploadSection(_a) {
    var file = _a.file, onFileSelect = _a.onFileSelect, onFileRemove = _a.onFileRemove, _b = _a.accept, accept = _b === void 0 ? ".pdf" : _b, _c = _a.maxSize, maxSize = _c === void 0 ? 100 * 1024 * 1024 : _c, // 100MB default
    _d = _a.isProcessing, // 100MB default
    isProcessing = _d === void 0 ? false : _d, _e = _a.isDragOver, isDragOver = _e === void 0 ? false : _e, onDragOver = _a.onDragOver, title = _a.title, description = _a.description, maxSizeText = _a.maxSizeText, securityText = _a.securityText, _f = _a.showFileInfo, showFileInfo = _f === void 0 ? true : _f, _g = _a.disabled, disabled = _g === void 0 ? false : _g, className = _a.className, customFormatFileSize = _a.formatFileSize, additional = _a.additional;
    var t = store_1.useLanguageStore().t;
    var fileInputRef = react_1.useRef(null);
    // Default file size formatter
    var defaultFormatFileSize = function (sizeInBytes) {
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
    var formatFileSize = customFormatFileSize || defaultFormatFileSize;
    var handleFileChange = function (event) {
        var files = event.target.files;
        if (!files || files.length === 0)
            return;
        var selectedFile = files[0];
        // Validate file type
        if (accept && !selectedFile.type.match(accept.replace(".", ""))) {
            sonner_1.toast.error(t("ui.error") || "Invalid file type. Please upload a valid file.");
            return;
        }
        // Validate file size
        if (selectedFile.size > maxSize) {
            sonner_1.toast.error(maxSizeText ||
                t("fileUploader.maxSize") ||
                "File size exceeds the maximum limit.");
            return;
        }
        onFileSelect(selectedFile);
    };
    var handleDrop = function (event) {
        event.preventDefault();
        event.stopPropagation();
        onDragOver === null || onDragOver === void 0 ? void 0 : onDragOver(false);
        var files = event.dataTransfer.files;
        if (!files || files.length === 0)
            return;
        var droppedFile = files[0];
        // Validate file type
        if (accept && !droppedFile.type.match(accept.replace(".", ""))) {
            sonner_1.toast.error(t("ui.error") || "Invalid file type. Please upload a valid file.");
            return;
        }
        // Validate file size
        if (droppedFile.size > maxSize) {
            sonner_1.toast.error(maxSizeText ||
                t("fileUploader.maxSize") ||
                "File size exceeds the maximum limit.");
            return;
        }
        onFileSelect(droppedFile);
    };
    var handleDragOver = function (event) {
        event.preventDefault();
        event.stopPropagation();
        onDragOver === null || onDragOver === void 0 ? void 0 : onDragOver(true);
    };
    var handleDragLeave = function (event) {
        event.preventDefault();
        event.stopPropagation();
        onDragOver === null || onDragOver === void 0 ? void 0 : onDragOver(false);
    };
    var handleClick = function () {
        var _a;
        if (!disabled && !isProcessing) {
            (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click();
        }
    };
    if (!file) {
        return (react_1["default"].createElement("div", { className: utils_1.cn("flex-1 flex items-center justify-center p-6", className) },
            react_1["default"].createElement("div", { className: utils_1.cn("border-2 border-dashed rounded-lg p-12 text-center transition-colors w-full max-w-4xl cursor-pointer", isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20 hover:border-muted-foreground/30", (isProcessing || disabled) && "pointer-events-none opacity-50"), onDragOver: handleDragOver, onDragLeave: handleDragLeave, onDrop: handleDrop, onClick: handleClick },
                react_1["default"].createElement("input", { type: "file", ref: fileInputRef, className: "hidden", accept: accept, onChange: handleFileChange, disabled: disabled || isProcessing }),
                react_1["default"].createElement("div", { className: "mb-6 p-4 rounded-full bg-primary/10 mx-auto w-20 h-20 flex items-center justify-center" },
                    react_1["default"].createElement(lucide_react_1.Upload, { className: "h-10 w-10 text-primary" })),
                react_1["default"].createElement("h3", { className: "text-2xl font-semibold mb-3" }, title || t("fileUploader.dragAndDrop") || "Upload Your File"),
                react_1["default"].createElement("p", { className: "text-muted-foreground mb-8 max-w-md mx-auto" }, description ||
                    t("fileUploader.dropHereDesc") ||
                    "Drag and drop your file here or click to browse"),
                react_1["default"].createElement(button_1.Button, { size: "lg", className: "px-8", disabled: disabled || isProcessing, type: "button" }, t("ui.browse") || "Browse Files"),
                react_1["default"].createElement("p", { className: "mt-6 text-sm text-muted-foreground" }, securityText ||
                    t("ui.filesSecurity") ||
                    "Your files are processed securely and deleted after processing."))));
    }
    // File is uploaded - show file info
    return (react_1["default"].createElement("div", { className: utils_1.cn("border-2 border-dashed rounded-lg p-8 text-center transition-colors", className) },
        react_1["default"].createElement("div", { className: "flex flex-col items-center gap-4" },
            react_1["default"].createElement("div", { className: "h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center" },
                react_1["default"].createElement(lucide_react_1.FileText, { className: "h-8 w-8 text-green-600 dark:text-green-400" })),
            react_1["default"].createElement("div", { className: "text-center" },
                react_1["default"].createElement("p", { className: "text-lg font-medium" }, file.name),
                showFileInfo && (react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                    formatFileSize(file.size),
                    additional))),
            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: onFileRemove, disabled: disabled || isProcessing, type: "button" },
                react_1["default"].createElement(lucide_react_1.X, { className: "h-4 w-4 mr-1" }),
                t("ui.remove") || "Remove"))));
}
exports.FileUploadSection = FileUploadSection;
