"use client";
"use strict";
exports.__esModule = true;
var react_1 = require("react");
var framer_motion_1 = require("framer-motion");
var lucide_react_1 = require("lucide-react");
var stages = [
    { name: 'convert', icon: lucide_react_1.ChevronRight, color: 'text-blue-500', actionText: 'Converting' },
    { name: 'compress', icon: lucide_react_1.FileBadge2Icon, color: 'text-green-500', actionText: 'Compressing' },
    { name: 'split', icon: lucide_react_1.Scissors, color: 'text-orange-500', actionText: 'Splitting' },
    { name: 'protect', icon: lucide_react_1.Lock, color: 'text-purple-500', actionText: 'Protecting' },
    { name: 'sign', icon: lucide_react_1.PenTool, color: 'text-indigo-500', actionText: 'Signing' },
    { name: 'watermark', icon: lucide_react_1.Type, color: 'text-teal-500', actionText: 'Watermarking' },
    { name: 'merge', icon: lucide_react_1.Layers, color: 'text-red-500', actionText: 'Merging' },
    { name: 'ocr', icon: lucide_react_1.Eye, color: 'text-yellow-500', actionText: 'OCR' },
];
var HeroAnimation = function () {
    var _a = react_1.useState(0), currentStageIndex = _a[0], setCurrentStageIndex = _a[1];
    var _b = react_1.useState(false), isAnimating = _b[0], setAnimating = _b[1];
    react_1.useEffect(function () {
        var interval = setInterval(function () {
            if (!isAnimating) {
                setAnimating(true);
                setTimeout(function () {
                    setCurrentStageIndex(function (prev) { return (prev + 1) % stages.length; });
                    setAnimating(false);
                }, 2000); // Animation duration
            }
        }, 3000); // Total cycle time
        return function () { return clearInterval(interval); };
    }, [isAnimating]);
    var currentStage = stages[currentStageIndex];
    var PDFCard = function (_a) {
        var _b = _a.active, active = _b === void 0 ? false : _b, _c = _a.variant, variant = _c === void 0 ? 'default' : _c;
        return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "relative flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 p-" + (variant === 'small' ? 4 : 6) + " rounded-xl", whileHover: { scale: 1.05 }, animate: active ? { scale: [1, 1.02, 1] } : { scale: 1 }, transition: { duration: 1.5, repeat: active ? Infinity : 0 } },
            react_1["default"].createElement(lucide_react_1.FileText, { className: "h-" + (variant === 'small' ? 8 : 12) + " w-" + (variant === 'small' ? 8 : 12) + " text-red-500 " + (active ? 'animate-pulse' : '') }),
            react_1["default"].createElement("div", { className: "mt-2 text-center" },
                react_1["default"].createElement("div", { className: "text-" + (variant === 'small' ? 'base' : 'lg') + " font-semibold" }, "PDF"),
                react_1["default"].createElement("div", { className: "text-xs text-muted-foreground" }, "Document"))));
    };
    var StageEffect = function () {
        switch (currentStage.name) {
            case 'convert':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: -50, opacity: 0 }, animate: { x: 50, opacity: 1 }, transition: { duration: 1.5 }, className: "absolute flex items-center" },
                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-12 w-12 text-blue-500" }),
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "ml-2 text-sm font-medium text-blue-500", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 } }, "DOCX")));
            case 'compress':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center", initial: { scale: 1 }, animate: { scale: 0.7 }, transition: { duration: 1.5 } },
                    react_1["default"].createElement(PDFCard, { variant: "small" })));
            case 'split':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center space-x-4", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } },
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: 0 }, animate: { x: -40 }, transition: { duration: 1.5 } },
                        react_1["default"].createElement(PDFCard, { variant: "small" })),
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: 0 }, animate: { x: 40 }, transition: { duration: 1.5 } },
                        react_1["default"].createElement(PDFCard, { variant: "small" }))));
            case 'protect':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center", initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1.5 } },
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "h-10 w-10 text-purple-500" })));
            case 'sign':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center", initial: { opacity: 0, rotate: -45 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 1.5 } },
                    react_1["default"].createElement(lucide_react_1.PenTool, { className: "h-10 w-10 text-indigo-500" })));
            case 'watermark':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center", initial: { opacity: 0, y: 20 }, animate: { opacity: 0.5, y: 0 }, transition: { duration: 1.5 } },
                    react_1["default"].createElement("span", { className: "text-teal-500 text-lg font-semibold transform -rotate-12" }, "WATERMARK")));
            case 'merge':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center space-x-2", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } },
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 1.5 } },
                        react_1["default"].createElement(PDFCard, { variant: "small" })),
                    react_1["default"].createElement(framer_motion_1.motion.div, { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 }, transition: { duration: 1.5 } },
                        react_1["default"].createElement(PDFCard, { variant: "small" }))));
            case 'ocr':
                return (react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 flex items-center justify-center", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1.5 } },
                    react_1["default"].createElement(lucide_react_1.Eye, { className: "h-10 w-10 text-yellow-500" }),
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute inset-0 bg-yellow-200/20 rounded-xl", animate: { scale: [1, 1.1, 1] }, transition: { duration: 1, repeat: Infinity } })));
            default:
                return null;
        }
    };
    return (react_1["default"].createElement("div", { className: "relative w-full max-w-3xl mx-auto h-72 flex items-center justify-center" },
        react_1["default"].createElement("div", { className: "relative z-10 flex items-center justify-center w-full h-full" },
            react_1["default"].createElement("div", { className: "grid grid-cols-3 items-center w-full px-8" },
                react_1["default"].createElement("div", { className: "flex justify-end" },
                    react_1["default"].createElement(PDFCard, { active: !isAnimating })),
                react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center" },
                    react_1["default"].createElement(framer_motion_1.motion.div, { animate: { rotate: isAnimating ? 360 : 0 }, transition: { duration: 1.5, repeat: isAnimating ? Infinity : 0, ease: "linear" }, className: "bg-primary/10 rounded-full p-3" },
                        react_1["default"].createElement(currentStage.icon, { className: "h-8 w-8 " + currentStage.color })),
                    react_1["default"].createElement(framer_motion_1.motion.div, { className: "mt-2 text-sm font-medium " + currentStage.color, key: currentStage.name, initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } }, currentStage.actionText)),
                react_1["default"].createElement("div", { className: "flex justify-start relative" },
                    react_1["default"].createElement(framer_motion_1.AnimatePresence, { mode: "wait" },
                        isAnimating && (react_1["default"].createElement(framer_motion_1.motion.div, { key: currentStage.name, initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.5 } },
                            react_1["default"].createElement(StageEffect, null))),
                        !isAnimating && react_1["default"].createElement(PDFCard, { active: false }))))),
        react_1["default"].createElement(framer_motion_1.motion.div, { className: "absolute -bottom-12 flex justify-center flex-wrap gap-4 px-4", initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.5 } }, stages.map(function (stage, index) { return (react_1["default"].createElement(framer_motion_1.motion.button, { key: stage.name, className: "flex flex-col items-center", whileHover: { scale: 1.1 }, onClick: function () { return setCurrentStageIndex(index); } },
            react_1["default"].createElement("div", { className: "h-1 w-8 rounded-full mb-1 " + (index === currentStageIndex ? 'bg-primary' : 'bg-muted/50') }),
            react_1["default"].createElement("span", { className: "text-xs " + (index === currentStageIndex ? 'text-primary font-medium' : 'text-muted-foreground') }, stage.name.charAt(0).toUpperCase() + stage.name.slice(1)))); }))));
};
exports["default"] = HeroAnimation;
