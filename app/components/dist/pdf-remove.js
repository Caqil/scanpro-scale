"use client";
"use strict";
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
exports.PdfRemove = void 0;
var react_1 = require("react");
var react_pdf_1 = require("react-pdf");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var progress_1 = require("@/components/ui/progress");
var checkbox_1 = require("@/components/ui/checkbox");
var sonner_1 = require("sonner");
var store_1 = require("@/src/store/store");
var lucide_react_1 = require("lucide-react");
var dialog_1 = require("./ui/dialog");
react_pdf_1.pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
function PdfRemove() {
    var _this = this;
    var t = store_1.useLanguageStore().t;
    var _a = react_1.useState(null), file = _a[0], setFile = _a[1];
    var _b = react_1.useState([]), pages = _b[0], setPages = _b[1];
    var _c = react_1.useState(new Set()), selectedPages = _c[0], setSelectedPages = _c[1];
    var _d = react_1.useState(false), processing = _d[0], setProcessing = _d[1];
    var _e = react_1.useState(0), progress = _e[0], setProgress = _e[1];
    var _f = react_1.useState(""), processedPdfUrl = _f[0], setProcessedPdfUrl = _f[1];
    var _g = react_1.useState(false), isDragOver = _g[0], setIsDragOver = _g[1];
    var _h = react_1.useState(null), previewPage = _h[0], setPreviewPage = _h[1];
    var _j = react_1.useState(1), previewScale = _j[0], setPreviewScale = _j[1];
    var fileInputRef = react_1.useRef(null);
    var handleFileUpload = function (event) {
        var files = event.target.files;
        if (!files || files.length === 0)
            return;
        var uploadedFile = files[0];
        if (uploadedFile.type !== "application/pdf") {
            sonner_1.toast.error(t("removePdf.messages.invalidFile"));
            return;
        }
        setFile(uploadedFile);
        setSelectedPages(new Set());
        setProcessedPdfUrl("");
        processPdf(uploadedFile);
    };
    var processPdf = function (pdfFile) { return __awaiter(_this, void 0, void 0, function () {
        var fileUrl, pdf, numPages, newPages, i, page, viewport, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setProcessing(true);
                    setProgress(0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, 8, 9]);
                    fileUrl = URL.createObjectURL(pdfFile);
                    return [4 /*yield*/, react_pdf_1.pdfjs.getDocument(fileUrl).promise];
                case 2:
                    pdf = _a.sent();
                    numPages = pdf.numPages;
                    newPages = [];
                    i = 1;
                    _a.label = 3;
                case 3:
                    if (!(i <= numPages)) return [3 /*break*/, 6];
                    return [4 /*yield*/, pdf.getPage(i)];
                case 4:
                    page = _a.sent();
                    viewport = page.getViewport({ scale: 1 });
                    newPages.push({
                        width: viewport.width,
                        height: viewport.height,
                        originalWidth: viewport.width,
                        originalHeight: viewport.height
                    });
                    setProgress(Math.floor((i / numPages) * 100));
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 3];
                case 6:
                    setPages(newPages);
                    setProgress(100);
                    URL.revokeObjectURL(fileUrl);
                    return [3 /*break*/, 9];
                case 7:
                    error_1 = _a.sent();
                    console.error("Error processing PDF:", error_1);
                    sonner_1.toast.error(t("removePdf.messages.error"));
                    return [3 /*break*/, 9];
                case 8:
                    setProcessing(false);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    }); };
    var handlePageSelect = function (event, pageNumber) {
        event.stopPropagation();
        var newSelectedPages = new Set(selectedPages);
        if (newSelectedPages.has(pageNumber)) {
            newSelectedPages["delete"](pageNumber);
        }
        else {
            // Don't allow selecting all pages
            if (newSelectedPages.size >= pages.length - 1) {
                sonner_1.toast.error(t("removePdf.messages.cannotRemoveAll"));
                return;
            }
            newSelectedPages.add(pageNumber);
        }
        setSelectedPages(newSelectedPages);
    };
    var handlePageClick = function (pageNumber) {
        setPreviewPage(pageNumber);
        setPreviewScale(1);
    };
    var handleSelectAll = function () {
        if (selectedPages.size === pages.length - 1) {
            // If already at max, clear all
            setSelectedPages(new Set());
        }
        else {
            // Select all except one
            var newSelection = new Set();
            for (var i = 0; i < pages.length - 1; i++) {
                newSelection.add(i);
            }
            setSelectedPages(newSelection);
        }
    };
    var handleSaveDocument = function () { return __awaiter(_this, void 0, void 0, function () {
        var formData, pagesToRemove, response, errorData, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file || selectedPages.size === 0)
                        return [2 /*return*/];
                    setProcessing(true);
                    setProgress(0);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    formData = new FormData();
                    formData.append("file", file);
                    pagesToRemove = Array.from(selectedPages).map(function (page) { return page + 1; });
                    formData.append("pagesToRemove", JSON.stringify(pagesToRemove));
                    return [4 /*yield*/, fetch("/api/pdf/remove", {
                            method: "POST",
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    setProgress(50);
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    errorData = _a.sent();
                    throw new Error(errorData.error || t("removePdf.messages.error"));
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    result = _a.sent();
                    if (result.success) {
                        setProcessedPdfUrl(result.fileUrl);
                        setProgress(100);
                        sonner_1.toast.success(t("removePdf.messages.success"));
                    }
                    else {
                        throw new Error(result.error || t("removePdf.messages.error"));
                    }
                    return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error removing pages:", error_2);
                    sonner_1.toast.error(error_2 instanceof Error ? error_2.message : t("removePdf.messages.error"));
                    return [3 /*break*/, 8];
                case 7:
                    setProcessing(false);
                    setProgress(0);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    var reset = function () {
        setFile(null);
        setSelectedPages(new Set());
        setProcessedPdfUrl("");
        setPages([]);
        setPreviewPage(null);
        setPreviewScale(1);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };
    var renderPageThumbnails = function () {
        return (react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" }, pages.map(function (_, index) {
            var isSelected = selectedPages.has(index);
            return (react_1["default"].createElement("div", { key: index, className: "relative cursor-pointer transition-all duration-200 " + (isSelected ? "opacity-50" : ""), onClick: function () { return handlePageClick(index); } },
                react_1["default"].createElement("div", { className: "border rounded-lg overflow-hidden shadow-sm bg-white hover:shadow-md transition-shadow" },
                    react_1["default"].createElement(react_pdf_1.Document, { file: file },
                        react_1["default"].createElement(react_pdf_1.Page, { pageNumber: index + 1, width: 150, renderTextLayer: false, renderAnnotationLayer: false })),
                    react_1["default"].createElement("div", { className: "absolute top-2 right-2 z-10" },
                        react_1["default"].createElement(checkbox_1.Checkbox, { checked: isSelected, onCheckedChange: function () { }, onClick: function (e) { return handlePageSelect(e, index); }, className: "bg-white border-gray-400" })),
                    isSelected && (react_1["default"].createElement("div", { className: "absolute inset-0 bg-red-500 bg-opacity-20 flex items-center justify-center pointer-events-none" },
                        react_1["default"].createElement(lucide_react_1.XCircleIcon, { className: "h-12 w-12 text-red-500" })))),
                react_1["default"].createElement("div", { className: "text-center mt-2 text-sm font-medium" },
                    t("removePdf.page"),
                    " ",
                    index + 1)));
        })));
    };
    var getRemainingPages = function () {
        var remaining = [];
        for (var i = 0; i < pages.length; i++) {
            if (!selectedPages.has(i)) {
                remaining.push(i + 1);
            }
        }
        return remaining;
    };
    return (react_1["default"].createElement("div", { className: "bg-muted/30 rounded-lg p-4 w-full" },
        react_1["default"].createElement("div", { className: "flex flex-col min-h-[600px] bg-background rounded-lg border shadow-sm" },
            !file && (react_1["default"].createElement("div", { className: "flex-1 flex items-center justify-center p-6" },
                react_1["default"].createElement("div", { className: "border-2 border-dashed rounded-lg p-12 text-center transition-colors " + (isDragOver
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/20"), onDragOver: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOver(true);
                    }, onDragLeave: function () { return setIsDragOver(false); }, onDrop: function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsDragOver(false);
                        var files = e.dataTransfer.files;
                        if (files && files.length > 0) {
                            var uploadedFile = files[0];
                            if (uploadedFile.type !== "application/pdf") {
                                sonner_1.toast.error(t("removePdf.messages.invalidFile"));
                                return;
                            }
                            setFile(uploadedFile);
                            setSelectedPages(new Set());
                            setProcessedPdfUrl("");
                            processPdf(uploadedFile);
                        }
                    } },
                    react_1["default"].createElement("input", { type: "file", ref: fileInputRef, className: "hidden", accept: ".pdf", onChange: handleFileUpload }),
                    react_1["default"].createElement("div", { className: "mb-6 p-4 rounded-full bg-primary/10 mx-auto w-20 h-20 flex items-center justify-center" },
                        react_1["default"].createElement(lucide_react_1.UploadIcon, { className: "h-10 w-10 text-primary" })),
                    react_1["default"].createElement("h3", { className: "text-2xl font-semibold mb-3" }, t("removePdf.uploadTitle")),
                    react_1["default"].createElement("p", { className: "text-muted-foreground mb-8 max-w-md mx-auto" }, t("removePdf.uploadDesc")),
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "px-8", onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } }, t("ui.browse")),
                    react_1["default"].createElement("p", { className: "mt-6 text-sm text-muted-foreground" }, t("ui.filesSecurity"))))),
            file && !processing && !processedPdfUrl && pages.length > 0 && (react_1["default"].createElement("div", { className: "p-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-6" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h3", { className: "text-xl font-semibold" }, t("removePdf.selectPages")),
                        react_1["default"].createElement("p", { className: "text-muted-foreground" }, t("removePdf.selectPagesDesc")),
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-1" },
                            selectedPages.size,
                            " ",
                            t("removePdf.pagesSelected"),
                            " \u00B7",
                            " ",
                            getRemainingPages().length,
                            " ",
                            t("removePdf.pagesRemaining"))),
                    react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return reset(); } },
                            react_1["default"].createElement(lucide_react_1.RefreshCwIcon, { className: "h-4 w-4 mr-2" }),
                            t("ui.clearAll")),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleSelectAll },
                            react_1["default"].createElement(lucide_react_1.CheckIcon, { className: "h-4 w-4 mr-2" }),
                            selectedPages.size === pages.length - 1
                                ? t("removePdf.clearSelection")
                                : t("removePdf.selectMax")),
                        selectedPages.size > 0 && (react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleSaveDocument },
                            react_1["default"].createElement(lucide_react_1.SaveIcon, { className: "h-4 w-4 mr-2" }),
                            t("removePdf.saveDocument"))))),
                renderPageThumbnails())),
            file && processing && !processedPdfUrl && (react_1["default"].createElement("div", { className: "flex-1 flex flex-col items-center justify-center" },
                react_1["default"].createElement("div", { className: "bg-background rounded-lg p-8 shadow-sm border w-96 text-center" },
                    react_1["default"].createElement(lucide_react_1.LoaderIcon, { className: "h-16 w-16 animate-spin text-primary mb-6 mx-auto" }),
                    react_1["default"].createElement("h3", { className: "text-xl font-semibold mb-3" }, t("removePdf.processing")),
                    react_1["default"].createElement("p", { className: "text-muted-foreground mb-6" }, t("removePdf.messages.processing")),
                    react_1["default"].createElement(progress_1.Progress, { value: progress, className: "w-full h-2" })))),
            file && !processing && processedPdfUrl && (react_1["default"].createElement("div", { className: "flex-1 flex items-center justify-center p-6" },
                react_1["default"].createElement(card_1.Card, { className: "w-full max-w-md" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-8 text-center" },
                        react_1["default"].createElement("div", { className: "mb-6 p-4 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 mx-auto w-20 h-20 flex items-center justify-center" },
                            react_1["default"].createElement(lucide_react_1.CheckIcon, { className: "h-10 w-10" })),
                        react_1["default"].createElement("h3", { className: "text-2xl font-semibold mb-3" }, t("removePdf.messages.success")),
                        react_1["default"].createElement("p", { className: "text-muted-foreground mb-6" }, t("removePdf.messages.downloadReady")),
                        react_1["default"].createElement("div", { className: "flex gap-4 justify-center" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: reset },
                                react_1["default"].createElement(lucide_react_1.RefreshCwIcon, { className: "h-4 w-4 mr-2" }),
                                t("ui.startOver")),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return window.open(processedPdfUrl, "_blank"); } },
                                react_1["default"].createElement(lucide_react_1.DownloadIcon, { className: "h-4 w-4 mr-2" }),
                                t("ui.download")))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: previewPage !== null, onOpenChange: function () { return setPreviewPage(null); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "w-[90vw] max-w-6xl h-[90vh] flex flex-col p-0" },
                react_1["default"].createElement(dialog_1.DialogHeader, { className: "p-4 pb-2" },
                    react_1["default"].createElement(dialog_1.DialogTitle, null,
                        t("removePdf.pagePreview"),
                        " ",
                        previewPage !== null ? previewPage + 1 : "")),
                previewPage !== null && (react_1["default"].createElement("div", { className: "flex flex-col flex-1 p-4 pt-0 gap-3" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between flex-shrink-0" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                    return setPreviewScale(function (prev) { return Math.max(prev - 0.2, 0.5); });
                                }, disabled: previewScale <= 0.5 },
                                react_1["default"].createElement(lucide_react_1.ZoomOutIcon, { className: "h-4 w-4" })),
                            react_1["default"].createElement("span", { className: "text-sm font-medium min-w-[60px] text-center" },
                                Math.round(previewScale * 100),
                                "%"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                    return setPreviewScale(function (prev) { return Math.min(prev + 0.2, 3); });
                                }, disabled: previewScale >= 3 },
                                react_1["default"].createElement(lucide_react_1.ZoomInIcon, { className: "h-4 w-4" })),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setPreviewScale(1); } },
                                react_1["default"].createElement(lucide_react_1.EyeIcon, { className: "h-4 w-4 mr-2" }),
                                "Fit")),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" }, selectedPages.has(previewPage) ? (react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function (e) { return handlePageSelect(e, previewPage); } },
                            react_1["default"].createElement(lucide_react_1.XCircleIcon, { className: "h-4 w-4 mr-2" }),
                            t("removePdf.removeFromDocument"))) : (react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function (e) { return handlePageSelect(e, previewPage); }, disabled: selectedPages.size >= pages.length - 1 },
                            react_1["default"].createElement(lucide_react_1.Trash2Icon, { className: "h-4 w-4 mr-2" }),
                            t("removePdf.markForRemoval"))))),
                    react_1["default"].createElement("div", { className: "flex-1 border rounded-lg bg-gray-50 overflow-auto min-h-0" },
                        react_1["default"].createElement("div", { className: "p-4 flex items-center justify-center min-h-full" },
                            react_1["default"].createElement("div", { style: {
                                    transform: "scale(" + previewScale + ")",
                                    transformOrigin: "center"
                                } },
                                react_1["default"].createElement(react_pdf_1.Document, { file: file },
                                    react_1["default"].createElement(react_pdf_1.Page, { pageNumber: previewPage + 1, renderTextLayer: false, renderAnnotationLayer: false, height: window.innerHeight * 0.6 }))))),
                    react_1["default"].createElement("div", { className: "flex justify-between items-center flex-shrink-0" },
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                return setPreviewPage(function (prev) { return Math.max(0, prev - 1); });
                            }, disabled: previewPage === 0 }, "Previous Page"),
                        react_1["default"].createElement("span", { className: "text-sm font-medium" },
                            "Page ",
                            previewPage + 1,
                            " of ",
                            pages.length),
                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () {
                                return setPreviewPage(function (prev) {
                                    return Math.min(pages.length - 1, prev + 1);
                                });
                            }, disabled: previewPage === pages.length - 1 }, "Next Page"))))))));
}
exports.PdfRemove = PdfRemove;
