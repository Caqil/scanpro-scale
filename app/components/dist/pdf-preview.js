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
exports.PdfPreview = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var pdfjsLib = require("pdfjs-dist");
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
function PdfPreview(_a) {
    var _this = this;
    var file = _a.file;
    var _b = react_1.useState(0), numPages = _b[0], setNumPages = _b[1];
    var _c = react_1.useState(1), pageNumber = _c[0], setPageNumber = _c[1];
    var _d = react_1.useState(1.0), scale = _d[0], setScale = _d[1];
    var _e = react_1.useState(0), pageHeight = _e[0], setPageHeight = _e[1]; // Added to store page height
    var _f = react_1.useState(true), loading = _f[0], setLoading = _f[1];
    var _g = react_1.useState(null), error = _g[0], setError = _g[1];
    var _h = react_1.useState(false), isDragging = _h[0], setIsDragging = _h[1];
    var _j = react_1.useState(false), isResizing = _j[0], setIsResizing = _j[1];
    var _k = react_1.useState({ x: 0, y: 0 }), dragOffset = _k[0], setDragOffset = _k[1];
    var canvasRef = react_1.useRef(null);
    var containerRef = react_1.useRef(null);
    var signatureRef = react_1.useRef(null);
    var pdfRef = react_1.useRef(undefined);
    react_1.useEffect(function () {
        var loadPdf = function () { return __awaiter(_this, void 0, void 0, function () {
            var arrayBuffer, pdf, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        setLoading(true);
                        return [4 /*yield*/, file.arrayBuffer()];
                    case 1:
                        arrayBuffer = _a.sent();
                        return [4 /*yield*/, pdfjsLib.getDocument(arrayBuffer).promise];
                    case 2:
                        pdf = _a.sent();
                        pdfRef.current = pdf;
                        setNumPages(pdf.numPages);
                        setLoading(false);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error("Error loading PDF:", err_1);
                        setError("Failed to load PDF");
                        setLoading(false);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        if (file) {
            loadPdf();
        }
        return function () {
            if (pdfRef.current) {
                pdfRef.current.destroy();
            }
        };
    }, [file]);
    react_1.useEffect(function () {
        var renderPage = function () { return __awaiter(_this, void 0, void 0, function () {
            var page, viewport, canvas, context, renderContext, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!pdfRef.current || !canvasRef.current)
                            return [2 /*return*/];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, pdfRef.current.getPage(pageNumber)];
                    case 2:
                        page = _a.sent();
                        viewport = page.getViewport({ scale: scale });
                        canvas = canvasRef.current;
                        context = canvas.getContext('2d');
                        if (!context)
                            return [2 /*return*/];
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        setPageHeight(viewport.height / scale); // Store unscaled page height
                        renderContext = {
                            canvasContext: context,
                            viewport: viewport
                        };
                        return [4 /*yield*/, page.render(renderContext).promise];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _a.sent();
                        console.error("Error rendering page:", err_2);
                        setError("Failed to render PDF page");
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        if (!loading && !error) {
            renderPage();
        }
    }, [pageNumber, scale, loading, error]);
    var goToPrevPage = function () { return setPageNumber(function (prev) { return Math.max(prev - 1, 1); }); };
    var goToNextPage = function () { return setPageNumber(function (prev) { return Math.min(prev + 1, numPages); }); };
    var zoomIn = function () { return setScale(function (prev) { return Math.min(prev + 0.1, 2.0); }); };
    var zoomOut = function () { return setScale(function (prev) { return Math.max(prev - 0.1, 0.5); }); };
    var handleDragStart = function (e) {
        if (!signatureRef.current)
            return;
        setIsDragging(true);
        var rect = signatureRef.current.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        e.preventDefault();
    };
    var handleResizeStart = function (e) {
        setIsResizing(true);
        e.stopPropagation();
        e.preventDefault();
    };
    var LoadingComponent = function () { return (React.createElement("div", { className: "flex items-center justify-center h-80" },
        React.createElement("div", { className: "animate-spin mr-2 h-6 w-6 border-2 border-primary border-t-transparent rounded-full" }),
        React.createElement("span", null, "Loading PDF..."))); };
    var ErrorComponent = function () { return (React.createElement("div", { className: "flex flex-col items-center justify-center h-80 text-red-500" },
        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "mb-2" },
            React.createElement("circle", { cx: "12", cy: "12", r: "10" }),
            React.createElement("line", { x1: "12", y1: "8", x2: "12", y2: "12" }),
            React.createElement("line", { x1: "12", y1: "16", x2: "12.01", y2: "16" })),
        React.createElement("span", null, error || "Failed to load PDF preview"))); };
    return (React.createElement("div", { className: "flex flex-col items-center border rounded-lg p-4 bg-muted/10" },
        React.createElement("div", { className: "flex justify-between w-full mb-4" },
            React.createElement("div", { className: "flex items-center gap-1" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: goToPrevPage, disabled: pageNumber <= 1 || loading },
                    React.createElement(lucide_react_1.ChevronLeftIcon, { className: "h-4 w-4" })),
                React.createElement("span", { className: "text-sm mx-2" },
                    "Page ",
                    pageNumber,
                    " of ",
                    numPages),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: goToNextPage, disabled: pageNumber >= numPages || loading },
                    React.createElement(lucide_react_1.ChevronRightIcon, { className: "h-4 w-4" }))),
            React.createElement("div", { className: "flex items-center gap-1" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: zoomOut, disabled: scale <= 0.5 || loading },
                    React.createElement(lucide_react_1.MinusIcon, { className: "h-4 w-4" })),
                React.createElement("span", { className: "text-sm mx-2" },
                    Math.round(scale * 100),
                    "%"),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: zoomIn, disabled: scale >= 2.0 || loading },
                    React.createElement(lucide_react_1.PlusIcon, { className: "h-4 w-4" })))),
        React.createElement("div", { ref: containerRef, className: "relative border overflow-hidden bg-white rounded-md w-full", style: { minHeight: 500, maxHeight: 700 } }, loading ? (React.createElement(LoadingComponent, null)) : error ? (React.createElement(ErrorComponent, null)) : (React.createElement("div", { className: "relative" },
            React.createElement("canvas", { ref: canvasRef, className: "w-full" }))))));
}
exports.PdfPreview = PdfPreview;
