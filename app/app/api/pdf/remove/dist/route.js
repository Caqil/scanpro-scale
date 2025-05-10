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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.POST = void 0;
// app/api/pdf/remove/route.ts
var server_1 = require("next/server");
var promises_1 = require("fs/promises");
var fs_1 = require("fs");
var path_1 = require("path");
var uuid_1 = require("uuid");
var child_process_1 = require("child_process");
var util_1 = require("util");
var validate_key_1 = require("@/lib/validate-key");
var execAsync = util_1.promisify(child_process_1.exec);
// Define directories
var UPLOAD_DIR = path_1.join(process.cwd(), 'uploads');
var PROCESSED_DIR = path_1.join(process.cwd(), 'public', 'processed');
// Ensure directories exist
function ensureDirectories() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!fs_1.existsSync(UPLOAD_DIR)) return [3 /*break*/, 2];
                    return [4 /*yield*/, promises_1.mkdir(UPLOAD_DIR, { recursive: true })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    if (!!fs_1.existsSync(PROCESSED_DIR)) return [3 /*break*/, 4];
                    return [4 /*yield*/, promises_1.mkdir(PROCESSED_DIR, { recursive: true })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Get total pages using pdfcpu
function getTotalPages(inputPath) {
    return __awaiter(this, void 0, Promise, function () {
        var stdout, pagesMatch, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execAsync("pdfcpu info \"" + inputPath + "\"")];
                case 1:
                    stdout = (_a.sent()).stdout;
                    pagesMatch = stdout.match(/Page count:\s*(\d+)/);
                    if (pagesMatch && pagesMatch[1]) {
                        return [2 /*return*/, parseInt(pagesMatch[1], 10)];
                    }
                    throw new Error('Could not parse page count from pdfcpu output');
                case 2:
                    error_1 = _a.sent();
                    console.error('Error getting page count:', error_1);
                    throw new Error("Failed to get page count: " + (error_1 instanceof Error ? error_1.message : String(error_1)));
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Format page selection for pdfcpu
function formatPageSelection(pagesToRemove) {
    // Sort pages and create ranges where possible
    var sorted = __spreadArrays(pagesToRemove).sort(function (a, b) { return a - b; });
    var ranges = [];
    var rangeStart = sorted[0];
    var rangeEnd = sorted[0];
    for (var i = 1; i < sorted.length; i++) {
        if (sorted[i] === rangeEnd + 1) {
            rangeEnd = sorted[i];
        }
        else {
            if (rangeStart === rangeEnd) {
                ranges.push(rangeStart.toString());
            }
            else {
                ranges.push(rangeStart + "-" + rangeEnd);
            }
            rangeStart = sorted[i];
            rangeEnd = sorted[i];
        }
    }
    // Add the last range
    if (rangeStart === rangeEnd) {
        ranges.push(rangeStart.toString());
    }
    else {
        ranges.push(rangeStart + "-" + rangeEnd);
    }
    return ranges.join(',');
}
function POST(request) {
    return __awaiter(this, void 0, void 0, function () {
        var headers, url, apiKey, validation, formData, file, pagesToRemoveStr, pagesToRemove, uniqueId, inputPath, outputPath, buffer, _a, _b, pageCount_1, invalidPages, pageSelection, command, _c, stdout, stderr, error_2, error_3, error_4;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 16, , 17]);
                    console.log('Starting PDF remove pages process using pdfcpu...');
                    headers = request.headers;
                    url = new URL(request.url);
                    apiKey = headers.get('x-api-key') || url.searchParams.get('api_key');
                    if (!apiKey) return [3 /*break*/, 2];
                    console.log('Validating API key for remove operation');
                    return [4 /*yield*/, validate_key_1.validateApiKey(apiKey, 'remove')];
                case 1:
                    validation = _d.sent();
                    if (!validation.valid) {
                        console.error('API key validation failed:', validation.error);
                        return [2 /*return*/, server_1.NextResponse.json({ error: validation.error || 'Invalid API key' }, { status: 401 })];
                    }
                    // Track usage (non-blocking)
                    if (validation.userId) {
                        validate_key_1.trackApiUsage(validation.userId, 'remove');
                    }
                    _d.label = 2;
                case 2: return [4 /*yield*/, ensureDirectories()];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, request.formData()];
                case 4:
                    formData = _d.sent();
                    file = formData.get('file');
                    pagesToRemoveStr = formData.get('pagesToRemove');
                    if (!file) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })];
                    }
                    // Verify it's a PDF
                    if (!file.name.toLowerCase().endsWith('.pdf')) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })];
                    }
                    if (!pagesToRemoveStr) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'No pages specified for removal' }, { status: 400 })];
                    }
                    pagesToRemove = void 0;
                    try {
                        pagesToRemove = JSON.parse(pagesToRemoveStr);
                        if (!Array.isArray(pagesToRemove) || pagesToRemove.length === 0) {
                            throw new Error('Invalid pages array');
                        }
                    }
                    catch (e) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Invalid pages format' }, { status: 400 })];
                    }
                    uniqueId = uuid_1.v4();
                    inputPath = path_1.join(UPLOAD_DIR, uniqueId + "-input.pdf");
                    outputPath = path_1.join(PROCESSED_DIR, uniqueId + "-processed.pdf");
                    _b = (_a = Buffer).from;
                    return [4 /*yield*/, file.arrayBuffer()];
                case 5:
                    buffer = _b.apply(_a, [_d.sent()]);
                    return [4 /*yield*/, promises_1.writeFile(inputPath, buffer)];
                case 6:
                    _d.sent();
                    console.log("PDF saved to " + inputPath);
                    return [4 /*yield*/, getTotalPages(inputPath)];
                case 7:
                    pageCount_1 = _d.sent();
                    console.log("PDF has " + pageCount_1 + " pages");
                    invalidPages = pagesToRemove.filter(function (page) { return page < 1 || page > pageCount_1; });
                    if (invalidPages.length > 0) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: "Invalid page numbers: " + invalidPages.join(', ') }, { status: 400 })];
                    }
                    // Check if all pages are selected for removal
                    if (pagesToRemove.length === pageCount_1) {
                        return [2 /*return*/, server_1.NextResponse.json({ error: 'Cannot remove all pages from the document' }, { status: 400 })];
                    }
                    pageSelection = formatPageSelection(pagesToRemove);
                    console.log("Pages to remove: " + pageSelection);
                    command = "pdfcpu pages remove -pages " + pageSelection + " \"" + inputPath + "\" \"" + outputPath + "\"";
                    console.log("Executing: " + command);
                    _d.label = 8;
                case 8:
                    _d.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, execAsync(command)];
                case 9:
                    _c = _d.sent(), stdout = _c.stdout, stderr = _c.stderr;
                    if (stdout.trim()) {
                        console.log('pdfcpu stdout:', stdout);
                    }
                    if (stderr) {
                        console.warn('pdfcpu stderr:', stderr);
                    }
                    return [3 /*break*/, 11];
                case 10:
                    error_2 = _d.sent();
                    console.error('Page removal error:', error_2);
                    throw new Error("pdfcpu failed: " + (error_2 instanceof Error ? error_2.message : String(error_2)));
                case 11:
                    console.log("Processed PDF saved to " + outputPath);
                    _d.label = 12;
                case 12:
                    _d.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, promises_1.unlink(inputPath)];
                case 13:
                    _d.sent();
                    console.log("Deleted input file: " + inputPath);
                    return [3 /*break*/, 15];
                case 14:
                    error_3 = _d.sent();
                    console.warn("Failed to delete input file " + inputPath + ":", error_3);
                    return [3 /*break*/, 15];
                case 15: 
                // Return success response with the file URL
                return [2 /*return*/, server_1.NextResponse.json({
                        success: true,
                        message: 'Pages removed successfully',
                        fileUrl: "/api/file?folder=processed&filename=" + uniqueId + "-processed.pdf",
                        fileName: uniqueId + "-processed.pdf",
                        originalName: file.name,
                        pagesRemoved: pagesToRemove.length,
                        remainingPages: pageCount_1 - pagesToRemove.length
                    })];
                case 16:
                    error_4 = _d.sent();
                    console.error('PDF page removal error:', error_4);
                    return [2 /*return*/, server_1.NextResponse.json({
                            error: error_4 instanceof Error ? error_4.message : 'An unknown error occurred during page removal',
                            success: false
                        }, { status: 500 })];
                case 17: return [2 /*return*/];
            }
        });
    });
}
exports.POST = POST;
