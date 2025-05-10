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
exports.getUserUsage = exports.trackApiUsage = exports.validateApiKey = exports.USAGE_LIMITS = exports.API_OPERATIONS = void 0;
// lib/validate-key.ts with expanded permissions
var prisma_1 = require("@/lib/prisma");
// Define all available operations for API permissions
exports.API_OPERATIONS = [
    'convert',
    'compress',
    'merge',
    'split',
    'protect',
    'unlock',
    'watermark',
    'sign',
    'rotate',
    'ocr',
    'repair',
    'edit',
    'annotate',
    'extract',
    'redact',
    'organize',
    'chat',
    'extract',
    'remove'
];
// Define usage limits by tier (operations per month)
exports.USAGE_LIMITS = {
    free: 500,
    basic: 5000,
    pro: 50000,
    enterprise: 100000 // 100k operations
};
/**
 * Validates an API key and checks if it has permission to perform the specified operation
 * Also verifies that usage limits haven't been exceeded
 */
function validateApiKey(apiKey, operation) {
    return __awaiter(this, void 0, Promise, function () {
        var keyRecord, subscription, canProceed_1, canProceed_2, canProceed_3, canProceed, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    return [4 /*yield*/, prisma_1.prisma.apiKey.findUnique({
                            where: { key: apiKey },
                            include: {
                                user: {
                                    include: { subscription: true }
                                }
                            }
                        })];
                case 1:
                    keyRecord = _a.sent();
                    if (!keyRecord) {
                        return [2 /*return*/, { valid: false, error: 'Invalid API key' }];
                    }
                    // Check expiration
                    if (keyRecord.expiresAt && keyRecord.expiresAt < new Date()) {
                        return [2 /*return*/, { valid: false, error: 'API key has expired' }];
                    }
                    // Check permissions
                    if (!keyRecord.permissions.includes(operation) && !keyRecord.permissions.includes('*')) {
                        return [2 /*return*/, {
                                valid: false,
                                error: "This API key does not have permission to perform the '" + operation + "' operation"
                            }];
                    }
                    subscription = keyRecord.user.subscription;
                    if (!!subscription) return [3 /*break*/, 3];
                    return [4 /*yield*/, checkUsageLimit(keyRecord.user.id, 'free')];
                case 2:
                    canProceed_1 = _a.sent();
                    return [2 /*return*/, canProceed_1
                            ? { valid: true, userId: keyRecord.user.id }
                            : { valid: false, error: 'Free tier usage limit reached' }];
                case 3:
                    if (!(subscription.status !== 'active')) return [3 /*break*/, 5];
                    return [4 /*yield*/, checkUsageLimit(keyRecord.user.id, 'free')];
                case 4:
                    canProceed_2 = _a.sent();
                    return [2 /*return*/, canProceed_2
                            ? { valid: true, userId: keyRecord.user.id }
                            : { valid: false, error: 'Free tier usage limit reached' }];
                case 5:
                    if (!(subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date())) return [3 /*break*/, 8];
                    // Automatically downgrade to free tier
                    return [4 /*yield*/, downgradeToFreeTier(keyRecord.user.id)];
                case 6:
                    // Automatically downgrade to free tier
                    _a.sent();
                    return [4 /*yield*/, checkUsageLimit(keyRecord.user.id, 'free')];
                case 7:
                    canProceed_3 = _a.sent();
                    return [2 /*return*/, canProceed_3
                            ? { valid: true, userId: keyRecord.user.id }
                            : { valid: false, error: 'Free tier usage limit reached' }];
                case 8: return [4 /*yield*/, checkUsageLimit(keyRecord.user.id, subscription.tier)];
                case 9:
                    canProceed = _a.sent();
                    return [2 /*return*/, canProceed
                            ? { valid: true, userId: keyRecord.user.id }
                            : { valid: false, error: subscription.tier + " tier usage limit reached" }];
                case 10:
                    error_1 = _a.sent();
                    console.error('Error validating API key:', error_1);
                    return [2 /*return*/, { valid: false, error: 'Internal server error' }];
                case 11: return [2 /*return*/];
            }
        });
    });
}
exports.validateApiKey = validateApiKey;
// Check if the user has exceeded their usage limit
function checkUsageLimit(userId, tier) {
    return __awaiter(this, void 0, Promise, function () {
        var firstDayOfMonth, usage, totalUsage, limit, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    firstDayOfMonth = new Date();
                    firstDayOfMonth.setDate(1);
                    firstDayOfMonth.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, prisma_1.prisma.usageStats.aggregate({
                            where: {
                                userId: userId,
                                date: { gte: firstDayOfMonth }
                            },
                            _sum: {
                                count: true
                            }
                        })];
                case 1:
                    usage = _a.sent();
                    totalUsage = usage._sum.count || 0;
                    limit = exports.USAGE_LIMITS[tier] || exports.USAGE_LIMITS.free;
                    return [2 /*return*/, totalUsage < limit];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error checking usage limit:', error_2);
                    // In case of an error, allow the operation to proceed
                    return [2 /*return*/, true];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Downgrade a user to the free tier
function downgradeToFreeTier(userId) {
    return __awaiter(this, void 0, Promise, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, prisma_1.prisma.subscription.update({
                            where: { userId: userId },
                            data: {
                                tier: 'free',
                                status: 'expired'
                            }
                        })];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error downgrading to free tier:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Track API usage for a user
 * This creates or updates a usage record for the current day
 */
function trackApiUsage(userId, operation) {
    return __awaiter(this, void 0, void 0, function () {
        var today, existingRecord, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, prisma_1.prisma.usageStats.findUnique({
                            where: {
                                userId_operation_date: {
                                    userId: userId,
                                    operation: operation,
                                    date: today
                                }
                            }
                        })];
                case 1:
                    existingRecord = _a.sent();
                    if (!existingRecord) return [3 /*break*/, 3];
                    // Update existing record
                    return [4 /*yield*/, prisma_1.prisma.usageStats.update({
                            where: {
                                id: existingRecord.id
                            },
                            data: {
                                count: {
                                    increment: 1
                                }
                            }
                        })];
                case 2:
                    // Update existing record
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: 
                // Create new record
                return [4 /*yield*/, prisma_1.prisma.usageStats.create({
                        data: {
                            userId: userId,
                            operation: operation,
                            count: 1,
                            date: today
                        }
                    })];
                case 4:
                    // Create new record
                    _a.sent();
                    _a.label = 5;
                case 5: 
                // For high-volume systems, you might want to use a queue
                // or batch updates instead of direct database writes
                return [2 /*return*/, true];
                case 6:
                    error_4 = _a.sent();
                    console.error('Error tracking API usage:', error_4);
                    // Don't fail the main operation if tracking fails
                    return [2 /*return*/, false];
                case 7: return [2 /*return*/];
            }
        });
    });
}
exports.trackApiUsage = trackApiUsage;
/**
 * Get the current usage for a user
 * Returns total operations and breakdown by operation type
 */
function getUserUsage(userId) {
    return __awaiter(this, void 0, void 0, function () {
        var firstDayOfMonth, usageStats, totalOperations, operationCounts, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    firstDayOfMonth = new Date();
                    firstDayOfMonth.setDate(1);
                    firstDayOfMonth.setHours(0, 0, 0, 0);
                    return [4 /*yield*/, prisma_1.prisma.usageStats.findMany({
                            where: {
                                userId: userId,
                                date: { gte: firstDayOfMonth }
                            }
                        })];
                case 1:
                    usageStats = _a.sent();
                    totalOperations = usageStats.reduce(function (sum, stat) { return sum + stat.count; }, 0);
                    operationCounts = usageStats.reduce(function (acc, stat) {
                        acc[stat.operation] = (acc[stat.operation] || 0) + stat.count;
                        return acc;
                    }, {});
                    return [2 /*return*/, {
                            totalOperations: totalOperations,
                            operationCounts: operationCounts
                        }];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error getting user usage:', error_5);
                    return [2 /*return*/, {
                            totalOperations: 0,
                            operationCounts: {}
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getUserUsage = getUserUsage;
