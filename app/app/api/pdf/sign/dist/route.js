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
exports.POST = void 0;
// app/api/pdf/sign/route.ts
var server_1 = require("next/server");
var promises_1 = require("fs/promises");
var fs_1 = require("fs");
var path_1 = require("path");
var uuid_1 = require("uuid");
var validate_key_1 = require("@/lib/validate-key");
var sharp_1 = require("sharp");
var pdf_lib_1 = require("pdf-lib");
var child_process_1 = require("child_process");
var util_1 = require("util");
var execPromise = util_1.promisify(child_process_1.exec);
// Define directories
var UPLOAD_DIR = path_1.join(process.cwd(), "uploads");
var SIGNATURES_DIR = path_1.join(process.cwd(), "public", "signatures");
var TEMP_DIR = path_1.join(process.cwd(), "temp");
var OCR_DIR = path_1.join(process.cwd(), "public", "ocr");
// Ensure directories exist
function ensureDirectories() {
    return __awaiter(this, void 0, void 0, function () {
        var dirs, _i, dirs_1, dir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirs = [UPLOAD_DIR, SIGNATURES_DIR, TEMP_DIR, OCR_DIR];
                    _i = 0, dirs_1 = dirs;
                    _a.label = 1;
                case 1:
                    if (!(_i < dirs_1.length)) return [3 /*break*/, 4];
                    dir = dirs_1[_i];
                    if (!!fs_1.existsSync(dir)) return [3 /*break*/, 3];
                    return [4 /*yield*/, promises_1.mkdir(dir, { recursive: true })];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Check if system commands exist
function commandExists(command) {
    return __awaiter(this, void 0, Promise, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!(process.platform === "win32")) return [3 /*break*/, 2];
                    return [4 /*yield*/, execPromise("where " + command)];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, execPromise("which " + command)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/, true];
                case 5:
                    error_1 = _a.sent();
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Check if OCRmyPDF is installed
function isOcrmypdfInstalled() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commandExists("ocrmypdf")];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Check if Tesseract is installed
function isTesseractInstalled() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commandExists("tesseract")];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Check if pdftotext is installed
function isPdftotextInstalled() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, commandExists("pdftotext")];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    });
}
// Extract text from PDF using pdftotext
function extractTextFromPdf(pdfPath) {
    return __awaiter(this, void 0, Promise, function () {
        var hasPdftotext, outputPath_1, text, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, isPdftotextInstalled()];
                case 1:
                    hasPdftotext = _a.sent();
                    if (!hasPdftotext) {
                        return [2 /*return*/, "Cannot extract text - pdftotext not installed"];
                    }
                    outputPath_1 = pdfPath + ".txt";
                    return [4 /*yield*/, execPromise("pdftotext -layout \"" + pdfPath + "\" \"" + outputPath_1 + "\"")];
                case 2:
                    _a.sent();
                    if (!fs_1.existsSync(outputPath_1)) return [3 /*break*/, 5];
                    return [4 /*yield*/, promises_1.readFile(outputPath_1, "utf-8")];
                case 3:
                    text = _a.sent();
                    return [4 /*yield*/, promises_1.unlink(outputPath_1)["catch"](function (error) {
                            return console.error("Failed to delete text file " + outputPath_1 + ":", error);
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, text];
                case 5: return [2 /*return*/, "Failed to extract text from PDF"];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error extracting text from PDF:", error_2);
                    return [2 /*return*/, "Error: " + (error_2 instanceof Error ? error_2.message : String(error_2))];
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Create searchable PDF using OCRmyPDF
function createSearchablePdf(pdfPath, outputPath, language) {
    if (language === void 0) { language = "eng"; }
    return __awaiter(this, void 0, Promise, function () {
        var scriptPath, command, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    scriptPath = path_1.join(process.cwd(), "scripts", "ocr.py");
                    command = "python3 \"" + scriptPath + "\" \"" + pdfPath + "\" \"" + outputPath + "\" \"" + language + "\"";
                    console.log("Running: " + command);
                    return [4 /*yield*/, execPromise(command)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, fs_1.existsSync(outputPath)];
                case 2:
                    error_3 = _a.sent();
                    console.error("Error during OCR process:", error_3);
                    return [2 /*return*/, false];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Convert SVG string to PNG data URL with transparency
function svgToPngDataUrl(svgString, width, height) {
    return __awaiter(this, void 0, Promise, function () {
        var svgOpenTag, styleAttr, buffer, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Ensure SVG has transparent background by adding background: transparent or by not specifying a background
                    if (!svgString.includes('background')) {
                        svgOpenTag = svgString.match(/<svg[^>]*>/);
                        if (svgOpenTag) {
                            styleAttr = svgOpenTag[0].includes('style=')
                                ? svgOpenTag[0].replace(/style="([^"]*)"/, function (match, p1) { return "style=\"" + p1 + ";background:transparent\""; })
                                : svgOpenTag[0].replace(/>$/, ' style="background:transparent">');
                            svgString = svgString.replace(/<svg[^>]*>/, styleAttr);
                        }
                    }
                    return [4 /*yield*/, sharp_1["default"](Buffer.from(svgString))
                            .resize(width, height)
                            .png()
                            .toBuffer()];
                case 1:
                    buffer = _a.sent();
                    return [2 /*return*/, "data:image/png;base64," + buffer.toString('base64')];
                case 2:
                    error_4 = _a.sent();
                    console.error("Error converting SVG to PNG:", error_4);
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Process image buffer to ensure transparency
function ensureTransparentBackground(imageBuffer, isJpeg) {
    return __awaiter(this, void 0, Promise, function () {
        var error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    if (!isJpeg) return [3 /*break*/, 2];
                    return [4 /*yield*/, sharp_1["default"](imageBuffer)
                            .toFormat('png')
                            .ensureAlpha() // Ensure alpha channel exists
                            .composite([
                            {
                                input: {
                                    create: {
                                        width: 1,
                                        height: 1,
                                        channels: 4,
                                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                                    }
                                },
                                blend: 'dest-in',
                                raw: {
                                    width: 1,
                                    height: 1,
                                    channels: 4
                                }
                            }
                        ])
                            .png()
                            .toBuffer()];
                case 1: 
                // If JPEG (which doesn't support transparency), convert to PNG and make white transparent
                return [2 /*return*/, _a.sent()];
                case 2: return [4 /*yield*/, sharp_1["default"](imageBuffer)
                        .ensureAlpha()
                        .png()
                        .toBuffer()];
                case 3: 
                // If PNG, ensure alpha channel exists and is used
                return [2 /*return*/, _a.sent()];
                case 4: return [3 /*break*/, 6];
                case 5:
                    error_5 = _a.sent();
                    console.error("Error ensuring transparent background:", error_5);
                    return [2 /*return*/, imageBuffer]; // Return original on error
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Determine if a string is an SVG
function isSvgString(str) {
    return str.trim().startsWith('<svg') || (str.includes('<?xml') && str.includes('<svg'));
}
function POST(request) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var headers, url, apiKey, validation, formData, pdfFile, elements, pages, shouldPerformOcr, ocrLanguage, sessionId, tempPdfPath_1, outputPdfPath, ocrPdfPath, ocrTextPath, pdfBytes, pdfDoc, _b, _c, _loop_1, pageIndex, pdfBytesOutput, responseData, ocrSuccess, extractedText, error_6, error_7;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 24, , 25]);
                    console.log("Starting PDF signing process...");
                    headers = request.headers;
                    url = new URL(request.url);
                    apiKey = headers.get("x-api-key") || url.searchParams.get("api_key");
                    if (!apiKey) return [3 /*break*/, 2];
                    console.log("Validating API key for signing operation");
                    return [4 /*yield*/, validate_key_1.validateApiKey(apiKey, "sign")];
                case 1:
                    validation = _d.sent();
                    if (!validation.valid) {
                        console.error("API key validation failed:", validation.error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: validation.error || "Invalid API key" }, { status: 401 })];
                    }
                    if (validation.userId) {
                        validate_key_1.trackApiUsage(validation.userId, "sign");
                    }
                    _d.label = 2;
                case 2: return [4 /*yield*/, ensureDirectories()];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, request.formData()];
                case 4:
                    formData = _d.sent();
                    pdfFile = formData.get("file");
                    if (!pdfFile) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "No PDF file uploaded" }, { status: 400 })];
                    }
                    elements = JSON.parse(formData.get("elements") || "[]");
                    pages = JSON.parse(formData.get("pages") || "[]");
                    shouldPerformOcr = formData.get("performOcr") === "true";
                    ocrLanguage = formData.get("ocrLanguage") || "eng";
                    if (!elements || !Array.isArray(elements) || elements.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "No elements provided for signing" }, { status: 400 })];
                    }
                    if (!pages || !Array.isArray(pages) || pages.length === 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "No pages data provided" }, { status: 400 })];
                    }
                    sessionId = uuid_1.v4();
                    tempPdfPath_1 = path_1.join(TEMP_DIR, sessionId + "-original.pdf");
                    outputPdfPath = path_1.join(SIGNATURES_DIR, sessionId + "-signed.pdf");
                    ocrPdfPath = path_1.join(OCR_DIR, sessionId + "-searchable.pdf");
                    ocrTextPath = path_1.join(OCR_DIR, sessionId + "-ocr.txt");
                    console.log("Creating signed PDF at " + outputPdfPath);
                    console.log("Number of elements: " + elements.length);
                    console.log("Number of pages: " + pages.length);
                    return [4 /*yield*/, pdfFile.arrayBuffer()];
                case 5:
                    pdfBytes = _d.sent();
                    return [4 /*yield*/, promises_1.writeFile(tempPdfPath_1, Buffer.from(pdfBytes))];
                case 6:
                    _d.sent();
                    _c = (_b = pdf_lib_1.PDFDocument).load;
                    return [4 /*yield*/, promises_1.readFile(tempPdfPath_1)];
                case 7: return [4 /*yield*/, _c.apply(_b, [_d.sent()])];
                case 8:
                    pdfDoc = _d.sent();
                    _loop_1 = function (pageIndex) {
                        var page, pageData, pageElements, pdfPageWidth, pdfPageHeight, scaleX, scaleY, _i, pageElements_1, element, pdfX, pdfY, base64Data, buffer, isJpeg, transparentBuffer, elementImage, error_8, fontName, fontFamily, font, fontSize, color, red, green, blue, textContent, textHeight, verticalOffset, error_9, pngDataUrl, pngData, pngBuffer, stampImage, base64Data, buffer, isJpeg, transparentBuffer, stampImage, error_10;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    page = pdfDoc.getPage(pageIndex);
                                    pageData = pages[pageIndex];
                                    console.log("Processing page " + (pageIndex + 1));
                                    if (!(pageData === null || pageData === void 0 ? void 0 : pageData.originalWidth) || !(pageData === null || pageData === void 0 ? void 0 : pageData.originalHeight)) {
                                        console.log("Skipping page " + (pageIndex + 1) + " due to missing dimensions");
                                        return [2 /*return*/, "continue"];
                                    }
                                    pageElements = elements.filter(function (el) { return el.page === pageIndex; });
                                    pdfPageWidth = page.getWidth();
                                    pdfPageHeight = page.getHeight();
                                    scaleX = pdfPageWidth / pageData.width;
                                    scaleY = pdfPageHeight / pageData.height;
                                    _i = 0, pageElements_1 = pageElements;
                                    _a.label = 1;
                                case 1:
                                    if (!(_i < pageElements_1.length)) return [3 /*break*/, 23];
                                    element = pageElements_1[_i];
                                    console.log("Adding element type " + element.type + " to page " + (pageIndex + 1));
                                    pdfX = element.position.x * scaleX;
                                    pdfY = pdfPageHeight - (element.position.y * scaleY) - (element.size.height * scaleY);
                                    if (!(element.type === "signature" || element.type === "image" || element.type === "drawing")) return [3 /*break*/, 7];
                                    if (!element.data.startsWith("data:image")) return [3 /*break*/, 6];
                                    base64Data = element.data.split(",")[1];
                                    buffer = Buffer.from(base64Data, "base64");
                                    isJpeg = element.data.includes("image/jpeg");
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 5, , 6]);
                                    return [4 /*yield*/, ensureTransparentBackground(buffer, isJpeg)];
                                case 3:
                                    transparentBuffer = _a.sent();
                                    return [4 /*yield*/, pdfDoc.embedPng(transparentBuffer)];
                                case 4:
                                    elementImage = _a.sent();
                                    page.drawImage(elementImage, {
                                        x: pdfX,
                                        y: pdfY,
                                        width: element.size.width * scaleX,
                                        height: element.size.height * scaleY,
                                        rotate: element.rotation ? pdf_lib_1.degrees(element.rotation) : undefined,
                                        opacity: element.scale || 1.0
                                    });
                                    console.log("Added " + element.type + " to page " + (pageIndex + 1) + " at (" + pdfX + ", " + pdfY + ")");
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_8 = _a.sent();
                                    console.error("Error embedding " + element.type + ":", error_8);
                                    return [3 /*break*/, 6];
                                case 6: return [3 /*break*/, 22];
                                case 7:
                                    if (!(element.type === "text" || element.type === "name" || element.type === "date")) return [3 /*break*/, 12];
                                    _a.label = 8;
                                case 8:
                                    _a.trys.push([8, 10, , 11]);
                                    fontName = void 0;
                                    fontFamily = ((_a = element.fontFamily) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || "arial";
                                    if (fontFamily.includes("arial") || fontFamily.includes("helvetica")) {
                                        fontName = pdf_lib_1.StandardFonts.Helvetica;
                                    }
                                    else if (fontFamily.includes("times") || fontFamily.includes("serif")) {
                                        fontName = pdf_lib_1.StandardFonts.TimesRoman;
                                    }
                                    else if (fontFamily.includes("courier")) {
                                        fontName = pdf_lib_1.StandardFonts.Courier;
                                    }
                                    else {
                                        // Default to Helvetica if font is not recognized
                                        fontName = pdf_lib_1.StandardFonts.Helvetica;
                                    }
                                    return [4 /*yield*/, pdfDoc.embedFont(fontName)];
                                case 9:
                                    font = _a.sent();
                                    fontSize = (element.fontSize || 16) * scaleX;
                                    color = element.color || "#000000";
                                    red = parseInt(color.slice(1, 3), 16) / 255;
                                    green = parseInt(color.slice(3, 5), 16) / 255;
                                    blue = parseInt(color.slice(5, 7), 16) / 255;
                                    textContent = element.data;
                                    if (element.type === "date" && (textContent === "Date Placeholder" || !textContent)) {
                                        textContent = new Date().toLocaleDateString();
                                    }
                                    textHeight = font.heightAtSize(fontSize);
                                    verticalOffset = (element.size.height * scaleY - textHeight) / 2;
                                    page.drawText(textContent, {
                                        x: pdfX + 5,
                                        y: pdfY + verticalOffset,
                                        size: fontSize,
                                        font: font,
                                        color: pdf_lib_1.rgb(red, green, blue),
                                        rotate: element.rotation ? pdf_lib_1.degrees(element.rotation) : undefined,
                                        opacity: element.scale || 1.0
                                    });
                                    console.log("Added text to page " + (pageIndex + 1) + " at (" + pdfX + ", " + pdfY + "): \"" + textContent + "\"");
                                    return [3 /*break*/, 11];
                                case 10:
                                    error_9 = _a.sent();
                                    console.error("Error adding text:", error_9);
                                    return [3 /*break*/, 11];
                                case 11: return [3 /*break*/, 22];
                                case 12:
                                    if (!(element.type === "stamp")) return [3 /*break*/, 22];
                                    _a.label = 13;
                                case 13:
                                    _a.trys.push([13, 21, , 22]);
                                    if (!isSvgString(element.data)) return [3 /*break*/, 16];
                                    return [4 /*yield*/, svgToPngDataUrl(element.data, Math.round(element.size.width * 2), // Higher resolution for better quality
                                        Math.round(element.size.height * 2))];
                                case 14:
                                    pngDataUrl = _a.sent();
                                    pngData = pngDataUrl.split(",")[1];
                                    pngBuffer = Buffer.from(pngData, "base64");
                                    return [4 /*yield*/, pdfDoc.embedPng(pngBuffer)];
                                case 15:
                                    stampImage = _a.sent();
                                    page.drawImage(stampImage, {
                                        x: pdfX,
                                        y: pdfY,
                                        width: element.size.width * scaleX,
                                        height: element.size.height * scaleY,
                                        rotate: element.rotation ? pdf_lib_1.degrees(element.rotation) : undefined,
                                        opacity: element.scale || 1.0
                                    });
                                    console.log("Added stamp (SVG converted to PNG) to page " + (pageIndex + 1));
                                    return [3 /*break*/, 20];
                                case 16:
                                    if (!element.data.startsWith("data:image")) return [3 /*break*/, 19];
                                    base64Data = element.data.split(",")[1];
                                    buffer = Buffer.from(base64Data, "base64");
                                    isJpeg = element.data.includes("image/jpeg");
                                    return [4 /*yield*/, ensureTransparentBackground(buffer, isJpeg)];
                                case 17:
                                    transparentBuffer = _a.sent();
                                    return [4 /*yield*/, pdfDoc.embedPng(transparentBuffer)];
                                case 18:
                                    stampImage = _a.sent();
                                    page.drawImage(stampImage, {
                                        x: pdfX,
                                        y: pdfY,
                                        width: element.size.width * scaleX,
                                        height: element.size.height * scaleY,
                                        rotate: element.rotation ? pdf_lib_1.degrees(element.rotation) : undefined,
                                        opacity: element.scale || 1.0
                                    });
                                    console.log("Added stamp (image) to page " + (pageIndex + 1));
                                    return [3 /*break*/, 20];
                                case 19:
                                    // Fall back to text-based stamp if no image data is available
                                    console.log("No image data for stamp, skipping");
                                    _a.label = 20;
                                case 20: return [3 /*break*/, 22];
                                case 21:
                                    error_10 = _a.sent();
                                    console.error("Error adding stamp:", error_10);
                                    return [3 /*break*/, 22];
                                case 22:
                                    _i++;
                                    return [3 /*break*/, 1];
                                case 23: return [2 /*return*/];
                            }
                        });
                    };
                    pageIndex = 0;
                    _d.label = 9;
                case 9:
                    if (!(pageIndex < pdfDoc.getPageCount())) return [3 /*break*/, 12];
                    return [5 /*yield**/, _loop_1(pageIndex)];
                case 10:
                    _d.sent();
                    _d.label = 11;
                case 11:
                    pageIndex++;
                    return [3 /*break*/, 9];
                case 12: return [4 /*yield*/, pdfDoc.save()];
                case 13:
                    pdfBytesOutput = _d.sent();
                    return [4 /*yield*/, promises_1.writeFile(outputPdfPath, pdfBytesOutput)];
                case 14:
                    _d.sent();
                    console.log("PDF saved to " + outputPdfPath);
                    return [4 /*yield*/, promises_1.unlink(tempPdfPath_1)["catch"](function (error) {
                            return console.error("Failed to delete temp file " + tempPdfPath_1 + ":", error);
                        })];
                case 15:
                    _d.sent();
                    responseData = {
                        success: true,
                        message: "PDF signed successfully",
                        fileUrl: "/api/file?folder=signatures&filename=" + sessionId + "-signed.pdf",
                        filename: sessionId + "-signed.pdf",
                        originalName: pdfFile.name || "signed-document.pdf"
                    };
                    if (!shouldPerformOcr) return [3 /*break*/, 23];
                    _d.label = 16;
                case 16:
                    _d.trys.push([16, 22, , 23]);
                    console.log("Creating searchable PDF with OCR...");
                    return [4 /*yield*/, createSearchablePdf(outputPdfPath, ocrPdfPath, ocrLanguage)];
                case 17:
                    ocrSuccess = _d.sent();
                    if (!ocrSuccess) return [3 /*break*/, 20];
                    return [4 /*yield*/, extractTextFromPdf(ocrPdfPath)];
                case 18:
                    extractedText = _d.sent();
                    return [4 /*yield*/, promises_1.writeFile(ocrTextPath, extractedText)];
                case 19:
                    _d.sent();
                    responseData.ocrComplete = true;
                    responseData.searchablePdfUrl = "/api/file?folder=ocr&filename=" + sessionId + "-searchable.pdf";
                    responseData.searchablePdfFilename = sessionId + "-searchable.pdf";
                    responseData.ocrText = extractedText;
                    responseData.ocrTextUrl = "/ocr/" + path_1["default"].basename(ocrTextPath);
                    console.log("Searchable PDF created successfully");
                    return [3 /*break*/, 21];
                case 20:
                    responseData.ocrComplete = false;
                    responseData.ocrError = "OCR failed - OCRmyPDF may not be installed or configured correctly";
                    console.log("OCR failed - check if OCRmyPDF is installed");
                    _d.label = 21;
                case 21: return [3 /*break*/, 23];
                case 22:
                    error_6 = _d.sent();
                    console.error("Error during OCR processing:", error_6);
                    responseData.ocrComplete = false;
                    responseData.ocrError = "OCR failed: " + (error_6 instanceof Error ? error_6.message : String(error_6));
                    return [3 /*break*/, 23];
                case 23: return [2 /*return*/, server_1.NextResponse.json(responseData)];
                case 24:
                    error_7 = _d.sent();
                    console.error("PDF signing error:", error_7);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: error_7 instanceof Error ? error_7.message : "An unknown error occurred during PDF signing",
                            success: false
                        }, { status: 500 })];
                case 25: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
