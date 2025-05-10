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
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var PDFTextEditor = function () {
    var _a;
    var _b = react_1.useState(null), file = _b[0], setFile = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(null), extractedData = _d[0], setExtractedData = _d[1];
    var _e = react_1.useState(null), editedData = _e[0], setEditedData = _e[1];
    var _f = react_1.useState(1), currentPage = _f[0], setCurrentPage = _f[1];
    var _g = react_1.useState(""), status = _g[0], setStatus = _g[1];
    var _h = react_1.useState(false), editMode = _h[0], setEditMode = _h[1];
    var _j = react_1.useState(null), sessionId = _j[0], setSessionId = _j[1];
    var fileInputRef = react_1.useRef(null);
    react_1.useEffect(function () {
        if (extractedData) {
            setEditedData(JSON.parse(JSON.stringify(extractedData)));
        }
    }, [extractedData]);
    var handleFileSelect = function (e) {
        var _a;
        var selectedFile = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (selectedFile && selectedFile.type === "application/pdf") {
            setFile(selectedFile);
            setExtractedData(null);
            setEditedData(null);
            setCurrentPage(1);
            setEditMode(false);
            setStatus('File selected. Click "Extract Text" to begin.');
        }
        else {
            setStatus("Please select a valid PDF file.");
        }
    };
    var extractText = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formData, response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file)
                        return [2 /*return*/];
                    setLoading(true);
                    setStatus("Extracting text from PDF...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    formData = new FormData();
                    formData.append("file", file);
                    formData.append("mode", "extract");
                    return [4 /*yield*/, fetch("/api/pdf/edit-text", {
                            method: "POST",
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to extract text");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    setExtractedData(result.data);
                    setSessionId(result.sessionId);
                    setStatus('Text extracted successfully. Click "Edit Text" to modify content.');
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    setStatus("Error extracting text. Please try again.");
                    console.error(error_1);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var handleTextChange = function (pageIndex, blockIndex, newText) {
        if (!editedData)
            return;
        var updatedData = __assign({}, editedData);
        updatedData.pages[pageIndex].textBlocks[blockIndex].text = newText;
        setEditedData(updatedData);
    };
    var saveEditedPDF = function () { return __awaiter(void 0, void 0, void 0, function () {
        var formData, response, result, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!file || !editedData)
                        return [2 /*return*/];
                    setLoading(true);
                    setStatus("Creating edited PDF...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    formData = new FormData();
                    formData.append("file", file);
                    formData.append("mode", "apply");
                    formData.append("edits", JSON.stringify(editedData));
                    return [4 /*yield*/, fetch("/api/pdf/edit-text", {
                            method: "POST",
                            body: formData
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to create edited PDF");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    result = _a.sent();
                    setStatus("PDF edited successfully! Downloading...");
                    // Download the file
                    window.open(result.fileUrl, "_blank");
                    return [3 /*break*/, 6];
                case 4:
                    error_2 = _a.sent();
                    setStatus("Error saving PDF. Please try again.");
                    console.error(error_2);
                    return [3 /*break*/, 6];
                case 5:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    var resetBlock = function (pageIndex, blockIndex) {
        if (!editedData || !extractedData)
            return;
        var updatedData = __assign({}, editedData);
        updatedData.pages[pageIndex].textBlocks[blockIndex].text =
            extractedData.pages[pageIndex].textBlocks[blockIndex].originalText;
        setEditedData(updatedData);
    };
    var hasChanges = function () {
        if (!editedData || !extractedData)
            return false;
        return editedData.pages.some(function (page, pageIndex) {
            return page.textBlocks.some(function (block, blockIndex) {
                return block.text !==
                    extractedData.pages[pageIndex].textBlocks[blockIndex].originalText;
            });
        });
    };
    var renderTextBlock = function (block, pageIndex, blockIndex) {
        var isModified = extractedData &&
            (editedData === null || editedData === void 0 ? void 0 : editedData.pages[pageIndex].textBlocks[blockIndex].text) !==
                extractedData.pages[pageIndex].textBlocks[blockIndex].originalText;
        return (react_1["default"].createElement("div", { key: block.id, className: "mb-4 border rounded-lg p-4 bg-white" },
            react_1["default"].createElement("div", { className: "flex justify-between items-start mb-2" },
                react_1["default"].createElement("label", { className: "text-sm font-medium text-gray-600" },
                    "Block ",
                    blockIndex + 1,
                    isModified && (react_1["default"].createElement("span", { className: "ml-2 text-green-600" }, "(Modified)"))),
                isModified && (react_1["default"].createElement("button", { onClick: function () { return resetBlock(pageIndex, blockIndex); }, className: "text-sm text-blue-600 hover:text-blue-800" }, "Reset"))),
            editMode ? (react_1["default"].createElement("textarea", { value: (editedData === null || editedData === void 0 ? void 0 : editedData.pages[pageIndex].textBlocks[blockIndex].text) || "", onChange: function (e) {
                    return handleTextChange(pageIndex, blockIndex, e.target.value);
                }, className: "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50", rows: Math.max(3, Math.ceil(((editedData === null || editedData === void 0 ? void 0 : editedData.pages[pageIndex].textBlocks[blockIndex].text.length) || 0) / 80)) })) : (react_1["default"].createElement("div", { className: "px-3 py-2 bg-gray-50 rounded-lg whitespace-pre-wrap" }, editedData === null || editedData === void 0 ? void 0 : editedData.pages[pageIndex].textBlocks[blockIndex].text))));
    };
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-gray-50" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto p-6" },
            react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow-lg" },
                react_1["default"].createElement("div", { className: "p-6 border-b" },
                    react_1["default"].createElement("div", { className: "flex items-center mb-4" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "w-8 h-8 text-blue-500 mr-3" }),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("h1", { className: "text-2xl font-bold" }, "PDF Text Editor"),
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Extract and edit text content from PDF files"))),
                    react_1["default"].createElement("div", { className: "mb-4" },
                        react_1["default"].createElement("input", { type: "file", ref: fileInputRef, onChange: handleFileSelect, accept: ".pdf", className: "hidden" }),
                        react_1["default"].createElement("button", { onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); }, className: "bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition flex items-center" },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "w-5 h-5 mr-2" }),
                            "Select PDF File"),
                        file && (react_1["default"].createElement("p", { className: "mt-2 text-sm text-gray-600" },
                            "Selected: ",
                            react_1["default"].createElement("span", { className: "font-medium" }, file.name)))),
                    status && (react_1["default"].createElement("div", { className: "mb-4 p-3 rounded " + (status.includes("Error")
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700") }, status)),
                    react_1["default"].createElement("div", { className: "flex gap-3 flex-wrap" },
                        react_1["default"].createElement("button", { onClick: extractText, disabled: !file || loading, className: "px-6 py-3 rounded-lg flex items-center transition " + (!file || loading
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600") },
                            react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-5 h-5 mr-2 " + (loading ? "animate-spin" : "") }),
                            "Extract Text"),
                        extractedData && (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement("button", { onClick: function () { return setEditMode(!editMode); }, className: "px-6 py-3 rounded-lg flex items-center transition " + (editMode
                                    ? "bg-gray-500 text-white hover:bg-gray-600"
                                    : "bg-purple-500 text-white hover:bg-purple-600") }, editMode ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Eye, { className: "w-5 h-5 mr-2" }),
                                "View Mode")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                                react_1["default"].createElement(lucide_react_1.Edit3, { className: "w-5 h-5 mr-2" }),
                                "Edit Text"))),
                            react_1["default"].createElement("button", { onClick: saveEditedPDF, disabled: !hasChanges() || loading, className: "px-6 py-3 rounded-lg flex items-center transition " + (!hasChanges() || loading
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-500 text-white hover:bg-blue-600") },
                                react_1["default"].createElement(lucide_react_1.Save, { className: "w-5 h-5 mr-2" }),
                                "Save Changes"))))),
                extractedData && editedData && (react_1["default"].createElement("div", { className: "flex" },
                    react_1["default"].createElement("div", { className: "w-48 border-r bg-gray-50 p-4" },
                        react_1["default"].createElement("h3", { className: "font-semibold mb-3" }, "Pages"),
                        react_1["default"].createElement("div", { className: "space-y-2" }, editedData.pages.map(function (page) { return (react_1["default"].createElement("button", { key: page.pageNumber, onClick: function () { return setCurrentPage(page.pageNumber); }, className: "w-full text-left px-3 py-2 rounded transition " + (currentPage === page.pageNumber
                                ? "bg-blue-500 text-white"
                                : "bg-white hover:bg-gray-100") },
                            "Page ",
                            page.pageNumber)); }))),
                    react_1["default"].createElement("div", { className: "flex-1 p-6" },
                        react_1["default"].createElement("div", { className: "mb-4 flex justify-between items-center" },
                            react_1["default"].createElement("h2", { className: "text-xl font-semibold" },
                                "Page ",
                                currentPage,
                                " of ",
                                editedData.pageCount),
                            editMode && (react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Click on any text block to edit"))),
                        react_1["default"].createElement("div", { className: "space-y-4" }, (_a = editedData.pages
                            .find(function (p) { return p.pageNumber === currentPage; })) === null || _a === void 0 ? void 0 : _a.textBlocks.map(function (block, blockIndex) {
                            return renderTextBlock(block, editedData.pages.findIndex(function (p) { return p.pageNumber === currentPage; }), blockIndex);
                        })))))))));
};
exports["default"] = PDFTextEditor;
