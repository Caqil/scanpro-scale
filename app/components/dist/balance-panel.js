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
exports.BalancePanel = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var progress_1 = require("@/components/ui/progress");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var store_1 = require("@/src/store/store");
var auth_context_1 = require("@/src/context/auth-context");
function BalancePanel() {
    var _this = this;
    var t = store_1.useLanguageStore().t;
    var _a = auth_context_1.useAuth(), isAuthenticated = _a.isAuthenticated, user = _a.user, authLoading = _a.isLoading;
    var _b = react_1.useState(0), balance = _b[0], setBalance = _b[1];
    var _c = react_1.useState(0), freeOpsUsed = _c[0], setFreeOpsUsed = _c[1];
    var _d = react_1.useState(500), freeOpsTotal = _d[0], setFreeOpsTotal = _d[1];
    var _e = react_1.useState(0), freeOpsRemaining = _e[0], setFreeOpsRemaining = _e[1];
    var _f = react_1.useState(null), resetDate = _f[0], setResetDate = _f[1];
    var _g = react_1.useState([]), transactions = _g[0], setTransactions = _g[1];
    var _h = react_1.useState("10"), depositAmount = _h[0], setDepositAmount = _h[1];
    var _j = react_1.useState(true), isLoading = _j[0], setIsLoading = _j[1];
    var _k = react_1.useState(false), isProcessing = _k[0], setIsProcessing = _k[1];
    // Get API URL from environment variable
    var apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    // Fetch balance information
    var fetchBalance = function () { return __awaiter(_this, void 0, void 0, function () {
        var response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated) {
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, 5, 6]);
                    setIsLoading(true);
                    return [4 /*yield*/, fetch(apiUrl + "/api/user/balance", {
                            method: "GET",
                            credentials: "include",
                            headers: {
                                Accept: "application/json"
                            }
                        })];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        throw new Error("Failed to fetch balance information");
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    setBalance(data.balance || 0);
                    setFreeOpsUsed(data.freeOperationsUsed || 0);
                    setFreeOpsTotal(data.freeOperationsTotal || 500);
                    setFreeOpsRemaining(data.freeOperationsRemaining || 0);
                    setResetDate(data.nextResetDate ? new Date(data.nextResetDate) : null);
                    setTransactions(data.transactions || []);
                    return [3 /*break*/, 6];
                case 4:
                    error_1 = _a.sent();
                    console.error("Error fetching balance:", error_1);
                    sonner_1.toast.error(t("balancePanel.errors.balanceFetchFailed") ||
                        "Could not load balance information");
                    return [3 /*break*/, 6];
                case 5:
                    setIsLoading(false);
                    return [7 /*endfinally*/];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    react_1.useEffect(function () {
        if (!authLoading && isAuthenticated) {
            fetchBalance();
        }
    }, [authLoading, isAuthenticated]);
    // Handle deposit
    var handleDeposit = function () { return __awaiter(_this, void 0, void 0, function () {
        var amount, response, error, data, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isAuthenticated) {
                        sonner_1.toast.error(t("balancePanel.errors.notAuthenticated") ||
                            "Please sign in to deposit funds");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    setIsProcessing(true);
                    amount = parseFloat(depositAmount);
                    if (isNaN(amount) || amount <= 0) {
                        sonner_1.toast.error(t("balancePanel.errors.invalidAmount") || "Invalid deposit amount");
                        return [2 /*return*/];
                    }
                    if (amount < 5) {
                        sonner_1.toast.error(t("balancePanel.errors.minimumDeposit") || "Minimum deposit is $5");
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, fetch(apiUrl + "/api/user/deposit", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            credentials: "include",
                            body: JSON.stringify({ amount: amount })
                        })];
                case 2:
                    response = _a.sent();
                    if (!!response.ok) return [3 /*break*/, 4];
                    return [4 /*yield*/, response.json()];
                case 3:
                    error = _a.sent();
                    throw new Error(error.error ||
                        t("balancePanel.errors.depositFailed") ||
                        "Deposit failed");
                case 4: return [4 /*yield*/, response.json()];
                case 5:
                    data = _a.sent();
                    if (data.checkoutUrl) {
                        // Redirect to PayPal
                        window.location.href = data.checkoutUrl;
                    }
                    else {
                        throw new Error("No checkout URL returned");
                    }
                    return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    console.error("Deposit error:", error_2);
                    sonner_1.toast.error(error_2 instanceof Error
                        ? error_2.message
                        : t("balancePanel.errors.depositFailed") || "Deposit failed");
                    return [3 /*break*/, 8];
                case 7:
                    setIsProcessing(false);
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    // Format date
    var formatDate = function (dateString) {
        if (!dateString)
            return "N/A";
        var date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };
    // Calculate free operations progress percentage
    var freeOpsPercentage = Math.min(Math.round((freeOpsUsed / freeOpsTotal) * 100), 100);
    if (authLoading) {
        return react_1["default"].createElement("div", null, t("balancePanel.status.loading") || "Loading...");
    }
    if (!isAuthenticated) {
        return (react_1["default"].createElement("div", null, t("balancePanel.status.pleaseSignIn") ||
            "Please sign in to view your balance"));
    }
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-3" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, t("balancePanel.title.currentBalance") || "Current Balance"),
                    react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" })),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                        "$",
                        isLoading ? "..." : balance.toFixed(2)),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, t("balancePanel.description.operationCost") ||
                        "$0.005 per operation")),
                react_1["default"].createElement(card_1.CardFooter, { className: "p-4" },
                    react_1["default"].createElement(button_1.Button, { onClick: function () { var _a; return (_a = document.getElementById("deposit-tab")) === null || _a === void 0 ? void 0 : _a.click(); }, variant: "outline", className: "w-full" }, t("balancePanel.button.addFunds") || "Add Funds"))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, t("balancePanel.title.freeOperations") || "Free Operations"),
                    react_1["default"].createElement(lucide_react_1.DownloadCloud, { className: "h-4 w-4 text-muted-foreground" })),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" },
                        isLoading ? "..." : freeOpsRemaining,
                        " / ",
                        freeOpsTotal),
                    react_1["default"].createElement("div", { className: "mt-2" },
                        react_1["default"].createElement(progress_1.Progress, { value: freeOpsPercentage, className: "h-2" })),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-2" }, isLoading || !resetDate
                        ? "..."
                        : t("balancePanel.description.resetsOn").replace("{date}", formatDate(resetDate.toISOString()))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, t("balancePanel.title.operationsCoverage") ||
                        "Operations Coverage"),
                    react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-4 w-4 text-muted-foreground" })),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" }, isLoading ? "..." : Math.floor(balance / 0.005)),
                    react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" }, t("balancePanel.description.operationsWithBalance") ||
                        "Operations with current balance")),
                react_1["default"].createElement(card_1.CardFooter, { className: "p-4" },
                    react_1["default"].createElement(button_1.Button, { onClick: function () { var _a; return (_a = document.getElementById("deposit-tab")) === null || _a === void 0 ? void 0 : _a.click(); }, variant: "outline", className: "w-full" }, t("balancePanel.button.addFunds") || "Add Funds")))),
        react_1["default"].createElement(tabs_1.Tabs, { defaultValue: "transactions" },
            react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-2" },
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "transactions" }, t("balancePanel.tabs.transactions") || "Transactions"),
                react_1["default"].createElement(tabs_1.TabsTrigger, { value: "deposit", id: "deposit-tab" }, t("balancePanel.tabs.deposit") || "Deposit")),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "transactions" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, t("balancePanel.title.transactionHistory") ||
                            "Transaction History"),
                        react_1["default"].createElement(card_1.CardDescription, null, t("balancePanel.description.transactionDescription") ||
                            "Your recent account transactions")),
                    react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "text-center py-4" }, t("balancePanel.status.loading") || "Loading...")) : transactions.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-4 text-muted-foreground" }, t("balancePanel.status.noTransactions") ||
                        "No transactions found")) : (react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableCaption, null, t("balancePanel.table.recentTransactions") ||
                            "Recent transactions"),
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, t("balancePanel.table.date") || "Date"),
                                react_1["default"].createElement(table_1.TableHead, null, t("balancePanel.table.description") || "Description"),
                                react_1["default"].createElement(table_1.TableHead, null, t("balancePanel.table.amount") || "Amount"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, t("balancePanel.table.balance") || "Balance"))),
                        react_1["default"].createElement(table_1.TableBody, null, transactions.map(function (tx) { return (react_1["default"].createElement(table_1.TableRow, { key: tx.id },
                            react_1["default"].createElement(table_1.TableCell, null, formatDate(tx.createdAt)),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("span", { className: tx.status === "pending"
                                        ? "text-yellow-500"
                                        : tx.status === "failed"
                                            ? "text-red-500"
                                            : "" },
                                    tx.description,
                                    tx.status === "pending" &&
                                        " " + (t("balancePanel.table.pending") || "(Pending)"),
                                    tx.status === "failed" &&
                                        " " + (t("balancePanel.table.failed") || "(Failed)"))),
                            react_1["default"].createElement(table_1.TableCell, { className: tx.amount >= 0 ? "text-green-600" : "text-red-600" },
                                tx.amount >= 0 ? "+" : "",
                                tx.amount.toFixed(3)),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                "$",
                                tx.balanceAfter.toFixed(2)))); }))))))),
            react_1["default"].createElement(tabs_1.TabsContent, { value: "deposit" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, t("balancePanel.title.depositFunds") || "Deposit Funds"),
                        react_1["default"].createElement(card_1.CardDescription, null, t("balancePanel.description.depositDescription") ||
                            "Add funds to your account")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "amount" }, t("balancePanel.form.depositAmount") || "Deposit Amount"),
                                react_1["default"].createElement("div", { className: "flex items-center space-x-2" },
                                    react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
                                    react_1["default"].createElement(input_1.Input, { id: "amount", type: "number", min: "5", step: "5", value: depositAmount, onChange: function (e) { return setDepositAmount(e.target.value); }, placeholder: t("balancePanel.form.enterAmount") || "Enter amount", disabled: isProcessing }))),
                            react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-2" }, [5, 10, 20, 50].map(function (amount) { return (react_1["default"].createElement(button_1.Button, { key: amount, variant: "outline", onClick: function () { return setDepositAmount(amount.toString()); }, disabled: isProcessing },
                                "$",
                                amount)); })),
                            react_1["default"].createElement("div", { className: "bg-muted p-3 rounded-md text-sm" },
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, t("balancePanel.form.operationsCoverage")),
                                    " ",
                                    t("balancePanel.description.operationsCoverageInfo").replace("{count}", Math.floor(parseFloat(depositAmount || "0") / 0.005).toString())),
                                react_1["default"].createElement("p", { className: "mt-1 text-xs text-muted-foreground" }, t("balancePanel.description.operationCostInfo") ||
                                    "$0.005 per operation")))),
                    react_1["default"].createElement(card_1.CardFooter, null,
                        react_1["default"].createElement(button_1.Button, { className: "w-full", onClick: handleDeposit, disabled: isProcessing || !isAuthenticated }, isProcessing ? (react_1["default"].createElement(react_1["default"].Fragment, null, t("balancePanel.button.processing") || "Processing...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Upload, { className: "mr-2 h-4 w-4" }),
                            t("balancePanel.button.deposit") || "Deposit")))))))));
}
exports.BalancePanel = BalancePanel;
