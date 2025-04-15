/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
    metadata: {
        title: "ScanPro - 免费PDF转换器、编辑器、OCR和解锁PDF",
        template: "%s | ScanPro - PDF工具",
        description: "使用ScanPro转换、编辑、解锁、压缩、合并、拆分和OCR PDF。免费、快速的在线PDF工具—无需下载。",
        keywords: "PDF转换器, PDF编辑器, 在线OCR, 解锁PDF, 压缩PDF, 合并PDF, 拆分PDF, 免费PDF工具, 在线PDF编辑器, ScanPro"
    },
    nav: {
        tools: "工具",
        company: "公司",
        pricing: "API价格",
        convertPdf: "转换PDF",
        convertPdfDesc: "将PDF转换为其他格式或从其他格式转换为PDF",
        selectLanguage: "选择语言",
        downloadApp: "下载应用",
        getApp: "获取我们的移动应用，随时随地使用PDF工具",
        appStores: "获取ScanPro应用",
        mobileTools: "移动PDF工具",
        signIn: "登录",
        signUp: "注册",
        signOut: "退出",
        dashboard: "仪表板",
        profile: "个人资料",
        account: "账户"
    },
    auth: {
        email: "电子邮件",
        emailPlaceholder: "name@example.com",
        password: "密码",
        passwordPlaceholder: "您的密码",
        confirmPassword: "确认密码",
        confirmPasswordPlaceholder: "确认您的密码",
        forgotPassword: "忘记密码？",
        rememberMe: "记住我",
        signIn: "登录",
        signingIn: "正在登录...",
        orContinueWith: "或使用以下方式继续",
        dontHaveAccount: "没有账户？",
        signUp: "注册",
        loginSuccess: "登录成功",
        loginError: "发生错误。请重试。",
        invalidCredentials: "电子邮件或密码无效",
        emailRequired: "电子邮件为必填项",
        passwordRequired: "密码为必填项",
        invalidEmail: "请输入有效的电子邮件地址",
        name: "姓名",
        namePlaceholder: "您的姓名",
        createAccount: "创建账户",
        creatingAccount: "正在创建账户...",
        alreadyHaveAccount: "已有账户？",
        nameRequired: "姓名为必填项",
        passwordLength: "密码必须至少8个字符",
        passwordStrength: "密码强度",
        passwordWeak: "弱",
        passwordFair: "一般",
        passwordGood: "好",
        passwordStrong: "强",
        passwordsDoNotMatch: "密码不匹配",
        agreeTerms: "我同意",
        termsOfService: "服务条款",
        and: "和",
        privacyPolicy: "隐私政策",
        agreeToTerms: "请同意服务条款",
        registrationFailed: "注册失败",
        accountCreated: "账户创建成功",
        unknownError: "发生错误",
        forgotInstructions: "输入您的电子邮件，我们将向您发送重置密码的说明。",
        sendResetLink: "发送重置链接",
        sending: "发送中...",
        resetEmailSent: "密码重置邮件已发送",
        resetPasswordError: "发送重置邮件失败",
        checkYourEmail: "检查您的电子邮件",
        resetInstructions: "如果该电子邮件存在账户，我们已发送重置密码的说明。",
        didntReceiveEmail: "没有收到邮件？",
        tryAgain: "重试",
        backToLogin: "返回登录",
        validatingToken: "正在验证您的重置链接...",
        invalidToken: "此密码重置链接无效或已过期。请请求一个新的。",
        requestNewLink: "请求新的重置链接",
        passwordResetSuccess: "密码重置成功",
        passwordResetSuccessMessage: "您的密码已成功重置。您将很快被重定向到登录页面。",
        passwordResetSuccessSubtext: "如果您没有被自动重定向，请点击下面的按钮。",
        resettingPassword: "正在重置密码...",
        resetPassword: "重置密码"
    },
    dashboard: {
        title: "仪表板",
        overview: "概览",
        apiKeys: "API密钥",
        subscription: "订阅",
        profile: "个人资料",
        totalUsage: "总使用量",
        operations: "本月操作",
        active: "活跃",
        inactive: "不活跃",
        keysAllowed: "允许的密钥",
        mostUsed: "最常用",
        of: "中的",
        files: "文件",
        usageByOperation: "按操作使用量",
        apiUsageBreakdown: "您本月API使用量的明细",
        noData: "无可用数据",
        createApiKey: "创建API密钥",
        revokeApiKey: "撤销API密钥",
        confirmRevoke: "您确定要撤销此API密钥吗？此操作无法撤销。",
        keyRevoked: "API密钥已成功撤销",
        noApiKeys: "无API密钥",
        noApiKeysDesc: "您尚未创建任何API密钥。",
        createFirstApiKey: "创建您的第一个API密钥",
        keyName: "密钥名称",
        keyNamePlaceholder: "我的API密钥",
        keyNameDesc: "为您的密钥取一个描述性名称，以便以后轻松识别。",
        permissions: "权限",
        generateKey: "生成密钥",
        newApiKeyCreated: "新API密钥已创建",
        copyKeyDesc: "现在复制此密钥。出于安全原因，您将无法再次查看它！",
        copyAndClose: "复制并关闭",
        keyCopied: "API密钥已复制到剪贴板",
        lastUsed: "最后使用",
        never: "从未"
    },
    subscription: {
        currentPlan: "当前计划",
        subscriptionDetails: "您的订阅详情和使用限制",
        plan: "计划",
        free: "免费",
        basic: "基础",
        pro: "专业",
        enterprise: "企业",
        renewsOn: "您的订阅将于以下日期续订",
        cancelSubscription: "取消订阅",
        changePlan: "更改计划",
        upgrade: "升级",
        downgrade: "降级",
        features: "功能",
        limitations: "限制",
        confirm: "确认",
        cancel: "取消",
        subscriptionCanceled: "订阅已成功取消",
        upgradeSuccess: "订阅已成功升级",
        pricingPlans: "定价计划",
        monthly: "月",
        operationsPerMonth: "每月操作",
        requestsPerHour: "每小时请求",
        apiKey: "API密钥",
        apiKeys: "API密钥",
        basicPdf: "基础PDF操作",
        allPdf: "所有PDF操作",
        basicOcr: "基础OCR",
        advancedOcr: "高级OCR",
        prioritySupport: "优先支持",
        customWatermarks: "自定义水印",
        noWatermarking: "无水印",
        limitedOcr: "有限OCR",
        noPrioritySupport: "无优先支持",
        dedicatedSupport: "专属支持",
        customIntegration: "自定义集成帮助",
        whiteLabel: "白标选项"
    },
    profile: {
        // Personal Information
        personalInfo: "个人信息",
        updatePersonalInfo: "更新您的个人信息",
        name: "姓名",
        namePlaceholder: "输入您的全名",
        email: "电子邮件",
        emailUnchangeable: "电子邮件无法更改",
        memberSince: "会员自",
        updateProfile: "更新个人资料",
        updating: "更新中...",
        updateSuccess: "个人资料更新成功",
        updateFailed: "更新个人资料失败",
        updateError: "更新您的个人资料时发生错误",

        // Password Management
        changePassword: "更改密码",
        updatePasswordDesc: "更新您的账户密码",
        currentPassword: "当前密码",
        currentPasswordPlaceholder: "输入您的当前密码",
        newPassword: "新密码",
        newPasswordPlaceholder: "输入新密码",
        confirmPassword: "确认新密码",
        confirmPasswordPlaceholder: "确认您的新密码",
        changingPassword: "正在更改密码...",
        passwordUpdateSuccess: "密码更新成功",
        passwordUpdateFailed: "更新密码失败",
        passwordUpdateError: "更新您的密码时发生错误",

        // Password Validation
        passwordWeak: "弱",
        passwordFair: "一般",
        passwordGood: "好",
        passwordStrong: "强",
        passwordMismatch: "新密码不匹配",
        passwordLength: "密码必须至少有8个字符",
        passwordStrength: "密码强度",
        passwordTips: "为了安全起见，请选择一个至少8个字符的强密码，包括大写字母、小写字母、数字和符号。"
    },

    // 英雄部分
    hero: {
        badge: "强大的PDF工具",
        title: "多功能PDF转换器与编辑器",
        description: "免费在线PDF工具，支持转换、压缩、合并、拆分、旋转、添加水印等，无需安装。",
        btConvert: "开始转换",
        btTools: "探索所有工具"
    },

    popular: {
        pdfToWord: "PDF转Word",
        pdfToWordDesc: "轻松将您的PDF文件转换为易于编辑的DOC和DOCX文档。",
        pdfToExcel: "PDF转Excel",
        pdfToExcelDesc: "几秒钟内将PDF中的数据直接提取到Excel电子表格中。",
        pdfToPowerPoint: "PDF转PowerPoint",
        pdfToPowerPointDesc: "将您的PDF演示文稿转换为可编辑的PowerPoint幻灯片。",
        pdfToJpg: "PDF转JPG",
        pdfToJpgDesc: "将PDF页面转换为JPG图片或提取PDF中的所有图片。",
        pdfToPng: "PDF转PNG",
        pdfToPngDesc: "将PDF页面转换为高质量透明PNG图片。",
        pdfToHtml: "PDF转HTML",
        pdfToHtmlDesc: "将PDF文档转换为适合网页的HTML格式。",
        wordToPdf: "Word转PDF",
        wordToPdfDesc: "将Word文档转换为格式和布局完美的PDF。",
        excelToPdf: "Excel转PDF",
        excelToPdfDesc: "将您的Excel电子表格转换为格式完美的PDF文档。",
        powerPointToPdf: "PowerPoint转PDF",
        powerPointToPdfDesc: "将PowerPoint演示文稿转换为PDF，便于分享。",
        jpgToPdf: "JPG转PDF",
        jpgToPdfDesc: "使用可自定义选项从JPG图片创建PDF文件。",
        pngToPdf: "PNG转PDF",
        pngToPdfDesc: "将PNG图片转换为支持透明背景的PDF。",
        htmlToPdf: "HTML转PDF",
        htmlToPdfDesc: "将网页和HTML内容转换为PDF文档。",
        mergePdf: "合并PDF",
        mergePdfDesc: "使用最简单的PDF合并工具按您想要的顺序合并PDF。",
        splitPdf: "拆分PDF",
        splitPdfDesc: "提取特定页面或将PDF拆分为多个文档。",
        compressPdf: "压缩PDF",
        compressPdfDesc: "减小文件大小，同时优化PDF的最大质量。",
        rotatePdf: "旋转PDF",
        rotatePdfDesc: "根据需要旋转PDF页面以更改页面方向。",
        watermark: "添加水印",
        watermarkDesc: "为您的PDF文档添加文本或图片水印，以保护和标记。",
        unlockPdf: "解锁PDF",
        unlockPdfDesc: "移除PDF文件的密码保护和限制。",
        protectPdf: "保护PDF",
        protectPdfDesc: "添加密码保护以确保您的PDF文档安全。",
        signPdf: "签署PDF",
        signPdfDesc: "安全地将数字签名添加到您的PDF文档中。",
        ocr: "OCR",
        ocrDesc: "使用光学字符识别从扫描文档中提取文本。",
        editPdf: "编辑PDF",
        editPdfDesc: "对PDF文档中的文本、图片和页面进行更改。",
        redactPdf: "编辑PDF",
        redactPdfDesc: "永久删除PDF文件中的敏感信息。",
        viewAll: "查看所有PDF工具"
    },

    // 转换器部分
    converter: {
        title: "开始转换",
        description: "上传您的PDF并选择要转换的格式",
        tabUpload: "上传与转换",
        tabApi: "API集成",
        apiTitle: "与我们的API集成",
        apiDesc: "使用我们的REST API在您的应用程序中以编程方式转换PDF",
        apiDocs: "查看API文档"
    },

    // 转换页面
    convert: {
        title: {
            pdfToWord: "在线将PDF转换为Word - 免费PDF转DOC工具",
            pdfToExcel: "在线将PDF转换为Excel - 提取PDF数据到XLS",
            pdfToPowerPoint: "将PDF转换为PowerPoint - PDF转PPT转换器",
            pdfToJpg: "将PDF转换为JPG图片 - 高质量PDF转JPEG",
            pdfToPng: "在线将PDF转换为PNG - PDF转透明PNG",
            pdfToHtml: "将PDF转换为HTML网页 - PDF转HTML5转换器",
            wordToPdf: "在线将Word转换为PDF - 免费DOC转PDF转换器",
            excelToPdf: "将Excel转换为PDF - XLS转PDF工具",
            powerPointToPdf: "在线将PowerPoint转换为PDF - PPT转PDF",
            jpgToPdf: "在线将JPG转换为PDF - 图片转PDF生成器",
            pngToPdf: "将PNG转换为PDF - 透明图片转PDF转换器",
            htmlToPdf: "在线将HTML转换为PDF - 网页转PDF生成工具",
            generic: "在线文件转换器 - 转换文档、图片等"
        },
        description: {
            pdfToWord: "快速轻松地将PDF文档转换为可编辑的Word文件。我们的免费PDF转Word转换器保留DOC/DOCX输出的格式。",
            pdfToExcel: "从PDF文件中提取表格和数据到Excel电子表格。将PDF转换为XLS/XLSX，保持准确的数据格式以进行分析。",
            pdfToPowerPoint: "将PDF演示文稿转换为可编辑的PowerPoint幻灯片。我们的PDF转PPT转换器保留幻灯片布局和设计元素。",
            pdfToJpg: "将PDF页面转换为高质量的JPG图像。从PDF中提取图像或将每页保存为JPEG以便在线分享。",
            pdfToPng: "将PDF页面转换为透明的PNG图像。非常适合需要透明背景PDF元素的平面设计师。",
            pdfToHtml: "将PDF文档转换为HTML网页。使用我们的高级转换器从PDF文件创建响应式HTML5网站。",
            wordToPdf: "将Word文档转换为完美格式的PDF格式。免费DOC/DOCX转PDF转换器，获得专业效果。",
            excelToPdf: "将Excel电子表格转换为PDF文档。在将XLS/XLSX转换为PDF时保留公式、图表和表格。",
            powerPointToPdf: "将PowerPoint演示文稿转换为PDF格式。PPT/PPTX转PDF转换器保留幻灯片过渡和备注。",
            jpgToPdf: "从您的JPG图像创建PDF文件。在线将多张JPEG照片合并为一个PDF文档。",
            pngToPdf: "从您的PNG图像创建PDF文件。在保留透明度的同时将透明PNG图形转换为PDF。",
            htmlToPdf: "将HTML网页转换为PDF文档。使用我们的在线HTML转PDF生成器工具将网站保存为PDF。",
            generic: "选择要转换格式的文件。免费的在线文档转换器，支持PDF、Word、Excel、PowerPoint、JPG、PNG和HTML。"
        },
        howTo: {
            title: "如何在线将{from}转换为{to}",
            step1: {
                title: "上传文件",
                description: "从您的计算机、Google Drive或Dropbox上传要转换的{from}文件"
            },
            step2: {
                title: "转换格式",
                description: "点击转换按钮，我们的系统将使用先进的转换技术处理您的文件"
            },
            step3: {
                title: "下载结果",
                description: "立即下载转换后的{to}文件或获取可共享链接"
            }
        },
        options: {
            title: "高级转换选项",
            ocr: "启用OCR（光学字符识别）",
            ocrDescription: "从扫描的文档或图像中提取文本以获得可编辑输出",
            preserveLayout: "保留原始布局",
            preserveLayoutDescription: "精确保持原始文档的格式和布局",
            quality: "输出质量",
            qualityDescription: "设置转换文件的质量级别（影响文件大小）",
            qualityOptions: {
                low: "低（文件较小，处理更快）",
                medium: "中（质量与大小平衡）",
                high: "高（最佳质量，文件较大）"
            },
            pageOptions: "页面选项",
            allPages: "所有页面",
            selectedPages: "选定页面",
            pageRangeDescription: "输入用逗号分隔的页码和/或页面范围",
            pageRangeExample: "示例：1,3,5-12（转换第1、3页和第5至12页）"
        },
        moreTools: "相关文档转换工具",
        expertTips: {
            title: "专家转换技巧",
            pdfToWord: [
                "为了获得最佳的PDF转Word效果，请确保您的PDF具有清晰、机器可读的文本",
                "对扫描的文档或基于图像的PDF启用OCR以提取可编辑文本",
                "复杂布局在转换后可能需要微调以获得完美格式"
            ],
            pdfToExcel: [
                "边框清晰的表格从PDF到Excel的转换更准确",
                "使用OCR预处理扫描的PDF以更好地提取数据到XLS/XLSX",
                "转换后检查电子表格公式，因为它们可能不会自动转移"
            ],
            generic: [
                "更高的质量设置会导致更大的文件大小但更好的输出",
                "对包含扫描文本或文本的图像文档使用OCR",
                "转换后始终预览文件以确保准确性再下载"
            ]
        },
        advantages: {
            title: "将{from}转换为{to}的优势",
            pdfToWord: [
                "使用我们的DOC转换器编辑和修改PDF格式中锁定的文本",
                "无需从头重新创建整个文档即可更新内容",
                "提取信息以用于其他Word文档或模板"
            ],
            pdfToExcel: [
                "使用XLS工具分析和操作静态PDF形式的数据",
                "使用提取的电子表格数据创建图表和执行计算",
                "轻松更新Excel格式的财务报告或数字信息"
            ],
            wordToPdf: [
                "创建保持完美格式的普遍可读PDF文档",
                "通过安全的PDF输出保护内容免受不必要的修改",
                "确保所有设备和平台上文档外观一致"
            ],
            generic: [
                "将文档转换为更有用和可编辑的格式",
                "在支持目标文件类型的程序中访问和使用内容",
                "以他人无需特殊软件即可轻松打开的格式共享文件"
            ]
        }
    },

    // 功能部分
    features: {
        title: "高级PDF工具与功能 | ScanPro",
        description: "探索ScanPro为文档管理、转换、编辑等提供的全面PDF工具和功能套件。",

        hero: {
            title: "高级PDF工具与功能",
            description: "发现使ScanPro成为您所有文档管理需求的终极解决方案的全面工具和功能套件。"
        },

        overview: {
            power: {
                title: "强大处理能力",
                description: "高级算法确保高质量文档处理和转换，精度卓越。"
            },
            security: {
                title: "银行级安全",
                description: "您的文档受256位SSL加密保护，并在处理后自动删除。"
            },
            accessibility: {
                title: "通用访问性",
                description: "通过完全跨平台兼容性，从任何设备访问您的文档和我们的工具。"
            }
        },

        allFeatures: {
            title: "所有功能"
        },

        learnMore: "了解更多",

        categories: {
            conversion: {
                title: "PDF转换",
                description: "以高精度和格式保留将PDF转换为各种格式。",
                features: {
                    pdfToWord: {
                        title: "PDF转Word",
                        description: "将PDF文件转换为可编辑的Word文档，保留格式、表格和图像。"
                    },
                    pdfToExcel: {
                        title: "PDF转Excel",
                        description: "从PDF中提取表格到可编辑的Excel电子表格，数据格式精确。"
                    },
                    pdfToImage: {
                        title: "PDF转图像",
                        description: "将PDF页面转换为高质量JPG、PNG或TIFF图像，可自定义分辨率。"
                    },
                    officeToPdf: {
                        title: "Office转PDF",
                        description: "将Word、Excel、PowerPoint文件转换为PDF格式，保留布局和格式。"
                    }
                }
            },

            editing: {
                title: "PDF编辑与管理",
                description: "使用我们全面的工具集编辑、组织和优化您的PDF文档。",
                features: {
                    merge: {
                        title: "合并PDF",
                        description: "将多个PDF文件合并为一个文档，可自定义页面顺序。"
                    },
                    split: {
                        title: "拆分PDF",
                        description: "将大型PDF按页面范围拆分为较小的文档，或提取特定页面。"
                    },
                    compress: {
                        title: "压缩PDF",
                        description: "在保持质量的同时减小PDF文件大小，便于分享和存储。"
                    },
                    watermark: {
                        title: "添加水印",
                        description: "为您的PDF添加文本或图像水印，可自定义透明度、位置和旋转。"
                    }
                }
            },

            security: {
                title: "PDF安全与保护",
                description: "使用加密、密码保护和数字签名保护您的PDF文档。",
                features: {
                    protect: {
                        title: "密码保护",
                        description: "使用密码保护加密PDF以控制访问并防止未经授权的查看。"
                    },
                    unlock: {
                        title: "解锁PDF",
                        description: "从您有授权访问的PDF中移除密码保护。"
                    },
                    signature: {
                        title: "数字签名",
                        description: "为文档认证和验证向PDF添加数字签名。"
                    },
                    redaction: {
                        title: "PDF编辑",
                        description: "从PDF文档中永久删除敏感信息。"
                    }
                }
            },

            ocr: {
                title: "OCR技术",
                description: "使用我们先进的OCR技术从扫描文档和图像中提取文本。",
                features: {
                    textExtraction: {
                        title: "文本提取",
                        description: "从扫描的PDF和图像中以高精度和语言支持提取文本。"
                    },
                    searchable: {
                        title: "可搜索PDF",
                        description: "将扫描文档转换为带有文本识别的可搜索PDF。"
                    },
                    multilingual: {
                        title: "多语言支持",
                        description: "支持超过100种语言的OCR，包括非拉丁文脚本和特殊字符。"
                    },
                    batchProcessing: {
                        title: "批量处理",
                        description: "使用我们高效的批量OCR功能一次处理多个文档。"
                    }
                }
            },

            api: {
                title: "API与集成",
                description: "使用我们强大的API将PDF处理功能集成到您的应用程序中。",
                features: {
                    restful: {
                        title: "RESTful API",
                        description: "用于PDF处理和文档管理的简单而强大的RESTful API。"
                    },
                    sdks: {
                        title: "SDK与库",
                        description: "为多种编程语言（包括JavaScript、Python和PHP）提供的开发者友好SDK。"
                    },
                    webhooks: {
                        title: "Webhooks",
                        description: "异步PDF处理工作流程的实时事件通知。"
                    },
                    customization: {
                        title: "API定制",
                        description: "通过可定制的端点和参数调整API以满足您的特定需求。"
                    }
                }
            },

            cloud: {
                title: "云平台",
                description: "通过我们安全的云存储和处理平台随时随地访问您的文档。",
                features: {
                    storage: {
                        title: "云存储",
                        description: "通过我们加密的云存储随时随地安全存储和访问您的文档。"
                    },
                    sync: {
                        title: "跨设备同步",
                        description: "在您的所有设备上无缝同步您的文档，以便随时随地访问。"
                    },
                    sharing: {
                        title: "文档共享",
                        description: "通过安全链接和权限控制轻松共享文档。"
                    },
                    history: {
                        title: "版本历史",
                        description: "通过版本历史跟踪文档更改，并在需要时恢复到以前的版本。"
                    }
                }
            },

            enterprise: {
                title: "企业功能",
                description: "为商业和企业需求设计的高级功能。",
                features: {
                    batch: {
                        title: "批量处理",
                        description: "通过我们高效的批量处理系统同时处理数百个文档。"
                    },
                    workflow: {
                        title: "自定义工作流程",
                        description: "创建适合您业务需求的自动化文档处理工作流程。"
                    },
                    compliance: {
                        title: "合规性与审计",
                        description: "为GDPR、HIPAA和其他法规合规性增强的安全功能。"
                    },
                    analytics: {
                        title: "使用分析",
                        description: "关于文档处理活动和用户操作的详细洞察。"
                    }
                }
            }
        },

        mobile: {
            title: "ScanPro移动应用",
            description: "随身携带ScanPro的强大PDF工具。我们的移动应用程序在便捷的移动友好界面中提供相同的强大功能。",
            feature1: {
                title: "扫描与数字化文档",
                description: "使用您的相机扫描物理文档并立即将其转换为高质量PDF。"
            },
            feature2: {
                title: "随时随地编辑PDF",
                description: "从您的智能手机或平板电脑上轻松编辑、注释和签署PDF文档。"
            },
            feature3: {
                title: "云同步",
                description: "通过安全的云存储在您的所有设备上无缝同步您的文档。"
            }
        },

        comparison: {
            title: "功能比较",
            description: "比较我们的不同计划，找到最适合您需求的计划。",
            feature: "功能",
            free: "免费",
            basic: "基础",
            pro: "专业",
            enterprise: "企业",
            features: {
                convert: "PDF转换",
                merge: "合并与拆分",
                compress: "压缩",
                ocr: "基础OCR",
                advancedOcr: "高级OCR",
                watermark: "水印",
                protect: "密码保护",
                api: "API访问",
                batch: "批量处理",
                priority: "优先支持",
                customWorkflow: "自定义工作流程",
                whiteLabel: "白标",
                dedicated: "专属支持"
            }
        },

        testimonials: {
            title: "我们的用户怎么说",
            quote1: "ScanPro彻底改变了我们团队处理文档的方式。OCR功能非常精确，批量处理每周为我们节省数小时。",
            name1: "莎拉·约翰逊",
            title1: "运营经理",
            quote2: "API集成非常顺畅。我们将ScanPro集成到我们的工作流程中，效率差异显著。他们的支持团队也是一流的。",
            name2: "大卫·陈",
            title2: "技术负责人",
            quote3: "作为一个小企业主，实惠的价格和全面的工具套件使ScanPro具有惊人的价值。我特别喜欢移动应用程序，它让我可以随时随地处理文档。",
            name3: "玛丽亚·加西亚",
            title3: "企业主"
        }
    },

    // 行动号召部分
    cta: {
        title: "准备好转换了吗？",
        description: "将您的PDF转换为您需要的任何格式，完全免费。",
        startConverting: "开始转换",
        exploreTools: "探索所有工具"
    },

    // PDF工具页面
    pdfTools: {
        title: "所有PDF工具",
        description: "在一个地方处理PDF所需的一切",
        categories: {
            convertFromPdf: "从PDF转换",
            convertToPdf: "转换为PDF",
            basicTools: "基本工具",
            organizePdf: "组织PDF",
            pdfSecurity: "PDF安全"
        }
    },

    // 工具描述
    toolDescriptions: {
        pdfToWord: "轻松将您的PDF文件转换为易于编辑的DOC和DOCX文档。",
        pdfToPowerpoint: "将您的PDF文件转换为易于编辑的PPT和PPTX幻灯片。",
        pdfToExcel: "几秒钟内将PDF中的数据直接提取到Excel电子表格中。",
        pdfToJpg: "将每个PDF页面转换为JPG或提取PDF中包含的所有图片。",
        pdfToPng: "将每个PDF页面转换为PNG或提取PDF中包含的所有图片。",
        pdfToHtml: "将HTML网页转换为PDF。复制并粘贴页面URL。",
        wordToPdf: "通过转换为PDF使DOC和DOCX文件易于阅读。",
        powerpointToPdf: "通过转换为PDF使PPT和PPTX幻灯片易于查看。",
        excelToPdf: "通过转换为PDF使EXCEL电子表格易于阅读。",
        jpgToPdf: "在几秒钟内将JPG图片转换为PDF。轻松调整方向和边距。",
        pngToPdf: "在几秒钟内将PNG图片转换为PDF。轻松调整方向和边距。",
        htmlToPdf: "将网页转换为PDF。复制并粘贴URL以转换为PDF。",
        mergePdf: "使用最简单的PDF合并工具按您想要的顺序合并PDF。",
        splitPdf: "将PDF文件拆分为多个文档或从您的PDF中提取特定页面。",
        compressPdf: "减小文件大小，同时优化PDF的最大质量。",
        rotatePdf: "根据需要旋转您的PDF。甚至可以一次旋转多个PDF！",
        watermark: "在几秒钟内在您的PDF上添加图片或文本水印。选择字体、透明度和位置。",
        unlockPdf: "移除PDF密码安全，让您自由使用PDF。",
        protectPdf: "使用密码保护PDF文件。加密PDF文档以防止未经授权的访问。",
        ocr: "使用光学字符识别从扫描文档中提取文本。"
    },
    splitPdf: {
        title: "分割 PDF - 在线分离 PDF 页面",
        description: "使用我们免费的在线 PDF 分割工具，轻松将 PDF 文件分割成多个文档，删除页面，或提取特定页面",
        howTo: {
            title: "如何在线分割 PDF 文件",
            step1: {
                title: "上传您的 PDF",
                description: "文件并点击上传您想要分割、删除页面或提取页面的 PDF，使用我们的拖放功能"
            },
            step2: {
                title: "选择要分割的页面",
                description: "选择您的分割方法：按范围选择页面，单独分离 PDF 页面，或每 N 页将 PDF 分割成多个文件"
            },
            step3: {
                title: "下载分割后的文件",
                description: "立即下载您的分割 PDF 文件或分离的页面作为单独的文档"
            }
        },
        options: {
            splitMethod: "选择您的分割方法",
            byRange: "按页面范围分割",
            extractAll: "将所有页面提取为单独的 PDF",
            everyNPages: "每 N 页分割",
            everyNPagesNumber: "每个文件的页面数",
            everyNPagesHint: "每个输出文件将包含此数量的页面",
            pageRanges: "页面范围",
            pageRangesHint: "输入以逗号分隔的页面范围（例如，1-5, 8, 11-13）以创建多个 PDF 文件"
        },
        splitting: "正在分割 PDF...",
        splitDocument: "分割文档",
        splitSuccess: "PDF 成功分割！",
        splitSuccessDesc: "您的 PDF 已被分割成 {count} 个单独的文件",
        results: {
            title: "PDF 分割结果",
            part: "部分",
            pages: "页面",
            pagesCount: "页"
        },
        faq: {
            title: "关于分割 PDF 的常见问题",
            q1: {
                question: "分割后我的 PDF 文件会怎么样？",
                answer: "为了您的隐私和安全，所有上传和生成的文件将在 24 小时后从我们的服务器自动删除。"
            },
            q2: {
                question: "我可以分割的页面数量有限制吗？",
                answer: "免费版本支持高达 100 页的 PDF。升级到我们的高级计划以处理更大的文件或无限分割。"
            },
            q3: {
                question: "我可以删除页面或从 PDF 中提取特定页面吗？",
                answer: "是的，使用‘按页面范围分割’选项可以删除页面或在线从您的 PDF 中提取特定部分。"
            },
            q4: {
                question: "我可以在分割时重新排序页面吗？",
                answer: "目前，分割时页面顺序会保持不变。使用我们的带拖放功能的 PDF 合并工具在分割后重新排序页面。"
            }
        },
        useCases: {
            title: "我们 PDF 分割工具的常见用途",
            chapters: {
                title: "按章节分离 PDF 页面",
                description: "将大本书籍或报告分割成单独的章节，以便于分享和导航"
            },
            extract: {
                title: "从 PDF 中提取页面",
                description: "选择表单或证书等页面，通过简单的文件和点击从较长的文档中提取"
            },
            remove: {
                title: "从 PDF 中删除页面",
                description: "通过选择要保留的页面并相应分割，移除广告或空白页等不需要的页面"
            },
            size: {
                title: "将 PDF 分割成多个文件以减小大小",
                description: "使用我们的在线 PDF 分割工具将大型 PDF 分解成较小的文件，便于通过电子邮件或消息发送"
            }
        },
        newSection: {
            title: "为什么使用我们的在线 PDF 分割工具？",
            description: "我们的 PDF 分割工具让您可以快速安全地分离 PDF 页面、删除页面并将 PDF 分割成多个文件。享受拖放的简单性，精确选择页面，无需下载软件即可在线管理您的文档。",
            additional: "无论您需要为项目分离 PDF 页面、删除不需要的页面，还是将 PDF 分割成多个文件以便于分享，我们的在线 PDF 分割工具都是完美的选择。凭借用户友好的拖放界面，您可以轻松上传文件并点击选择页面。我们的服务快速、安全且免费——非常适合无需安装软件即可在线管理 PDF 文档。分割大型 PDF、提取特定页面或在几次点击中减小文件大小！"
        },
        seoContent: {
            title: "使用我们的 PDF 分割工具掌握您的 PDF 管理",
            p1: "需要一种无忧的方式在线将 PDF 分割成多个文件或提取特定页面吗？我们的 PDF 分割工具旨在减轻文档管理的压力。无论您是学生、忙碌的专业人士还是只是整理个人文件，您都可以删除页面、挑选所需的页面并迅速分割大型 PDF。将您的文件拖到上传器中，点击选择您的分割方式——页面范围、单页或每几页——就完成了。这是您今天能找到的最实用的在线 PDF 分割工具之一。",
            p2: "分割 PDF 再简单不过了。想从一份庞大的报告中提取一页？厌倦了空白页或广告让一切变得混乱？我们的工具让您可以精确指定要保留的页面，并将其转换为单独的文件或较小的批次。全程在线——无需下载。使用我们的 PDF 分割工具，您可以将繁琐的文档变成整洁、可管理的部分，随时准备通过电子邮件发送、存储或分享，无需担心文件大小问题。",
            p3: "我们的在线 PDF 分割工具以其简洁的布局和强大的选项脱颖而出。无需麻烦即可将教科书分割成章节或将冗长的合同裁剪成关键部分。拖放功能使其流畅——只需放下您的文件并点击开始。您甚至可以在分割前预览您的 PDF，以精准选择页面。最棒的是？它对高达 100 页的文件免费，任何人都可以立即开始使用。",
            p4: "为什么选择我们的 PDF 分割工具？它快速、安全且充满灵活性。为演示提取页面，丢弃多余部分以清理文档，或将 PDF 分割成多个文件以更好地组织——这一切都可以在您的浏览器中完成。我们已优化它以出现在‘在线分割 PDF’、‘删除页面’和‘分离 PDF 页面’等搜索中，因此您在需要时就能找到我们。今天试试看，体验 PDF 管理可以多么顺畅！"
        },
        relatedTools: "相关工具",
        popular: {
            viewAll: "查看所有工具"
        }
    },
    // 合并PDF页面
    mergePdf: {
        title: "在线合并PDF文件 | 免费网页浏览器PDF合并工具",
        description: "使用我们基于浏览器的合并工具，快速轻松地将多个PDF文件合并成一个文档，适用于所有操作系统",
        intro: "我们的在线PDF合并工具让您只需几次点击即可将多个文档合并成一个文件。无需安装 - 可在任何操作系统的网页浏览器中直接使用。",

        // How-to section
        howTo: {
            title: "如何在浏览器中合并PDF文件",
            step1: {
                title: "上传文件",
                description: "上传您想要合并的PDF文件。从您的设备上一次选择多个文件，或直接将其拖放到网页浏览器中。"
            },
            step2: {
                title: "排列顺序",
                description: "拖放以重新排列文件顺序，使其按照您希望在最终合并文件中显示的顺序排列。我们的合并工具使多个PDF的组织更加直观。"
            },
            step3: {
                title: "下载",
                description: "点击“合并PDF”按钮，从任何网页浏览器直接将合并后的PDF文件下载到您的设备上。"
            }
        },

        // Benefits section
        benefits: {
            title: "我们在线PDF合并工具的优势",
            compatibility: {
                title: "适用于所有设备",
                description: "我们基于网页浏览器的PDF合并工具在Windows、macOS、Linux和移动操作系统上无需安装即可完美运行。"
            },
            privacy: {
                title: "安全与隐私",
                description: "您的文档在网页浏览器中处理，并在合并后自动删除，确保您的敏感信息保持隐私。"
            },
            simplicity: {
                title: "用户友好界面",
                description: "直观的拖放界面使合并多个PDF文件变得简单，即使是首次使用我们在线工具的用户也能轻松上手。"
            },
            quality: {
                title: "高质量输出",
                description: "我们的合并工具保留合并文件中原始格式、图片和文本质量，确保专业的结果。"
            }
        },

        // Use cases section
        useCases: {
            title: "PDF合并的常见用途",
            business: {
                title: "商业文档",
                description: "将财务报告、合同和演示文稿合并成客户和利益相关者的全面文档。"
            },
            academic: {
                title: "学术论文",
                description: "将研究论文、引文和附录合并成一个完整的学术提交文件，准备好供审查。"
            },
            personal: {
                title: "个人记录",
                description: "将收据、保修单和说明手册合并成有组织的数字记录，便于参考。"
            },
            professional: {
                title: "专业作品集",
                description: "通过将多个工作样本合并成一个易于分享的文档，创建令人印象深刻的作品集。"
            }
        },

        // FAQ section
        faq: {
            title: "常见问题解答",
            q1: {
                question: "使用你们的在线工具合并PDF文件有数量限制吗？",
                answer: "使用我们免费的基于网页浏览器的合并工具，您可以一次合并最多20个PDF文件。对于需要合并多个较大批量的文件，考虑升级到我们的高级计划，支持无限合并操作。"
            },
            q2: {
                question: "使用你们的在线合并工具时，我的PDF文件会保持隐私吗？",
                answer: "是的，您的隐私是我们的首要任务。上传到我们基于浏览器的合并工具的所有文件都将被安全处理，并在处理后从我们的服务器自动删除。我们从不访问或存储您的文档内容。"
            },
            q3: {
                question: "我可以使用你们的在线工具合并受密码保护的PDF吗？",
                answer: "对于受密码保护的PDF，您需要先使用我们的在线解锁PDF工具解锁它们，然后再进行合并。如果检测到受保护的文档，我们基于浏览器的合并工具会提示您。"
            },
            q4: {
                question: "你们的在线PDF合并工具适用于所有操作系统吗？",
                answer: "是的，我们基于网页浏览器的PDF合并工具适用于所有主要操作系统，包括Windows、macOS、Linux、iOS和Android。只要您有现代网页浏览器，就可以无需安装任何软件即可合并PDF。"
            },
            q5: {
                question: "可以合并多大的PDF文件？",
                answer: "我们的免费在线合并工具支持每个文件高达100MB。所有被合并文件的总大小不应超过300MB，以确保在您的网页浏览器中获得最佳性能。"
            },
            q6: {
                question: "合并后的文件会保留原始PDF的所有功能吗？",
                answer: "是的，我们先进的合并工具会在最终合并文件中保留原始PDF的文本、图片、格式、超链接和大多数交互元素。"
            }
        },

        // Tips section
        tips: {
            title: "有效合并PDF的技巧",
            tip1: {
                title: "合并前组织",
                description: "在上传到我们的合并工具之前，按数字顺序重命名文件（例如01_intro.pdf、02_content.pdf），以便更轻松地组织。"
            },
            tip2: {
                title: "优化大文件",
                description: "如果您要合并多个大文档，请先使用我们的压缩PDF工具，以确保最终合并文件的更好性能。"
            },
            tip3: {
                title: "检查预览",
                description: "在排列文件后，使用我们在线工具中的预览功能，在最终确定合并PDF之前验证顺序。"
            },
            tip4: {
                title: "考虑书签",
                description: "对于专业文档，考虑使用我们的编辑PDF工具为合并文件添加书签，以方便导航。"
            }
        },

        // Comparison section
        comparison: {
            title: "为什么选择我们的网页浏览器合并工具",
            point1: {
                title: "无需安装软件",
                description: "与桌面应用程序不同，我们的在线PDF合并工具直接在您的网页浏览器中运行，无需下载或安装任何软件。"
            },
            point2: {
                title: "跨平台兼容性",
                description: "我们基于浏览器的工具适用于所有操作系统，而桌面替代方案通常仅支持特定平台。"
            },
            point3: {
                title: "免费且易于访问",
                description: "与昂贵的桌面替代品或订阅服务相比，您可以免费访问我们的PDF合并功能。"
            },
            point4: {
                title: "定期更新",
                description: "我们的在线合并工具不断改进，无需用户手动更新。"
            }
        },

        // UI elements and messages
        ui: {
            of: "的",
            files: "文件",
            filesToMerge: "待合并文件",
            dragToReorder: "拖动以重新排序",
            downloadReady: "下载准备就绪",
            downloadMerged: "下载合并文件",
            mergePdfs: "合并PDF",
            processingMerge: "正在合并您的PDF...",
            successMessage: "PDF合并成功！",
            dragDropHere: "将PDF拖放到此处",
            or: "或",
            browseFiles: "浏览文件",
            fileLimit: "最多合并20个PDF文件",
            noPdfsSelected: "未选择PDF",
            addMoreFiles: "添加更多文件",
            rearrangeMessage: "拖动文件以重新排列合并PDF中的顺序",
            removeFile: "移除",
            filePreview: "预览",
            startOver: "重新开始",
            mergingInProgress: "合并进行中...",
            pleaseWait: "请稍候，我们正在合并您的PDF文件",
            processingFile: "处理中",
            retry: "重试合并"
        },
    },

    // OCR页面
    ocr: {
        title: "OCR提取：简易文本识别",
        description: "使用先进的OCR软件和机器学习，将扫描的PDF和图像文件转换为可编辑的文本",
        howTo: {
            title: "OCR提取如何工作",
            step1: { title: "上传", description: "将您的扫描PDF或图像文件上传到图像转文本工具。" },
            step2: { title: "配置OCR工具", description: "选择语言、页面范围和高级设置，以实现最佳文本识别。" },
            step3: { title: "提取文本", description: "复制提取的文本，或使用我们的图像转文本工具将其下载为.txt文件。" }
        },
        faq: {
            title: "常见问题",
            questions: {
                accuracy: { question: "OCR提取技术的准确性如何？", answer: "我们的OCR软件对清晰打印文本在高质量扫描文档中可达到90-99%的准确性。图像文件质量差或使用不寻常字体时，准确性可能会降低。" },
                languages: { question: "支持哪些语言？", answer: "我们支持超过100种语言，包括英语、法语、德语、西班牙语、汉语、日语、阿拉伯语、俄语等。" },
                recognition: { question: "为什么我的文本无法被正确识别？", answer: "文本识别可能受多种因素影响：文档质量、分辨率、对比度、复杂布局、手写或选择错误的语言。" },
                pageLimit: { question: "处理页面数量有限制吗？", answer: "免费用户每份PDF限制为50页。高级用户可处理高达500页的PDF。" },
                security: { question: "OCR处理期间我的数据安全吗？", answer: "是的，您的安全是我们的首要任务。所有上传的文件都在安全服务器上处理，并在处理后自动删除。" }
            }
        },
        relatedTools: "相关的OCR和PDF工具",
        processing: { title: "使用OCR软件处理", message: "文本识别可能需要几分钟，具体取决于文件大小和复杂性" },
        results: { title: "提取文本结果", copy: "复制", download: "下载 .txt" },
        languages: { english: "英语", french: "法语", german: "德语", spanish: "西班牙语", chinese: "汉语", japanese: "日语", arabic: "阿拉伯语", russian: "俄语" },
        whatIsOcr: {
            title: "什么是OCR提取？",
            description: "光学字符识别（OCR）是一种由机器学习支持的技术，可将扫描的文档、PDF和图像文件转换为可编辑和可搜索的文本。",
            explanation: "图像转文本工具分析文档图像的结构，识别字符和文本元素，然后将其转换为机器可读格式。",
            extractionList: { scannedPdfs: "文本以图像形式存在的扫描PDF", imageOnlyPdfs: "无文本层的仅图像PDF", embeddedImages: "包含嵌入文本图像的PDF", textCopyingIssues: "无法直接复制文本的文档" }
        },
        whenToUse: {
            title: "何时使用图像转文本提取工具",
            idealFor: "适用于：",
            idealForList: { scannedDocuments: "保存为PDF的扫描文档", oldDocuments: "没有数字文本层的旧文档", textSelectionIssues: "无法选择/复制文本的PDF", textInImages: "需要提取文本的图像文件", searchableArchives: "从扫描文档创建可搜索档案" },
            notNecessaryFor: "不适用于：",
            notNecessaryForList: { digitalPdfs: "文本可选择的原生数字PDF", createdDigitally: "直接从数字文档创建的PDF", copyPasteAvailable: "已经可以复制粘贴文本的文档", formatPreservation: "需要保留格式的文件（请使用我们的PDF转DOCX转换工具）" }
        },
        limitations: {
            title: "OCR工具的局限性与建议",
            description: "尽管我们的OCR软件功能强大，但仍有一些需要注意的局限性：",
            factorsAffecting: "影响文本识别准确性的因素：",
            factorsList: { documentQuality: "文档质量（分辨率、对比度）", complexLayouts: "复杂布局和格式", handwrittenText: "手写文本（识别有限）", specialCharacters: "特殊字符和符号", multipleLanguages: "一个文档中的多种语言" },
            tipsForBest: "获得最佳结果的建议：",
            tipsList: { highQualityScans: "使用高质量扫描（300 DPI或更高）", correctLanguage: "为您的文档选择正确的语言", enhanceScannedImages: "启用“增强扫描图像”以提高准确性", smallerPageRanges: "为大文档处理smaller页面范围", reviewText: "之后审查并更正提取的文本" }
        },
        options: { scope: "要提取的页面", all: "所有页面", custom: "特定页面", pages: "页面编号", pagesHint: "例如：1,3,5-9", enhanceScanned: "增强扫描图像", enhanceScannedHint: "预处理图像以提高OCR准确性（推荐用于扫描文档）", preserveLayout: "保留布局", preserveLayoutHint: "尝试保留原始布局，包括段落和换行" },
        ocrTool: "OCR提取工具",
        ocrToolDesc: "使用我们的图像转文本工具将扫描文档和图像文件转换为可编辑文本",
        uploadPdf: "上传文件以进行OCR提取",
        dragDrop: "将您的PDF或图像文件拖放到此处，或点击浏览",
        selectPdf: "选择文件",
        uploading: "上传中...",
        maxFileSize: "最大文件大小：50MB",
        invalidFile: "无效文件类型",
        invalidFileDesc: "请选择PDF或支持的图像文件",
        fileTooLarge: "文件太大",
        fileTooLargeDesc: "最大文件大小为50MB",
        noFile: "未选择文件",
        noFileDesc: "请选择一个文件进行文本识别",
        changeFile: "更改文件",
        languageLabel: "文档语言",
        selectLanguage: "选择语言",
        pageRange: "页面范围",
        allPages: "所有页面",
        specificPages: "特定页面",
        pageRangeExample: "例如：1-3, 5, 7-9",
        pageRangeInfo: "输入单独页面或用逗号分隔的范围",
        preserveLayout: "保留布局",
        preserveLayoutDesc: "尝试保留文档结构和格式",
        extractText: "提取文本",
        extractingText: "提取文本中...",
        processingPdf: "处理您的文件",
        processingInfo: "这可能需要几分钟，具体取决于文件大小和复杂性",
        analyzing: "分析内容",
        preprocessing: "预处理页面",
        recognizing: "识别文本",
        extracting: "提取内容",
        finalizing: "完成结果",
        finishing: "结束",
        extractionComplete: "文本提取完成",
        extractionCompleteDesc: "您的文本已通过我们的图像转文本提取工具成功提取",
        extractionError: "文本提取失败",
        extractionFailed: "无法提取文本",
        unknownError: "发生未知错误",
        textCopied: "文本已复制到剪贴板",
        copyFailed: "复制文本失败",
        textPreview: "文本预览",
        rawText: "原始文本",
        extractedText: "提取的文本",
        previewDesc: "带格式的提取文本预览",
        rawTextOutput: "原始文本输出",
        rawTextDesc: "无格式的纯文本",
        noTextFound: "文件中未找到文本",
        copyText: "复制文本",
        downloadText: "下载文本",
        processAnother: "处理另一个文件",
        supportedLanguages: "支持超过15种语言，包括英语、西班牙语、法语、德语、汉语、日语等。选择合适的语言以获得更高准确性。"
    },

    // 保护PDF页面
    protectPdf: {
        title: "密码保护PDF",
        description: "通过密码保护和自定义访问权限保护您的PDF文档",
        howTo: {
            title: "如何保护您的PDF",
            step1: {
                title: "上传",
                description: "上传您想用密码保护的PDF文件。"
            },
            step2: {
                title: "设置安全选项",
                description: "创建密码并为打印、复制和编辑自定义权限。"
            },
            step3: {
                title: "下载",
                description: "下载您受密码保护的PDF文件，准备好安全分享。"
            }
        },
        why: {
            title: "为什么要保护您的PDF？",
            confidentiality: {
                title: "保密性",
                description: "确保只有拥有密码的授权人员才能打开和查看您的敏感文档。"
            },
            controlledAccess: {
                title: "受控访问",
                description: "设置特定权限以决定接收者可以对您的文档做什么，例如打印或编辑。"
            },
            authorizedDistribution: {
                title: "授权分发",
                description: "在分享合同、研究或知识产权时控制谁可以访问您的文档。"
            },
            documentExpiration: {
                title: "文档过期",
                description: "密码保护为不应无限期访问的时效性文档增加额外的安全层。"
            }
        },
        security: {
            title: "了解PDF安全",
            passwords: {
                title: "用户密码与所有者密码",
                user: "用户密码：打开文档所需。没有此密码，任何人无法查看内容。",
                owner: "所有者密码：控制权限。使用我们的工具，我们将两个密码设置为相同以简化操作。"
            },
            encryption: {
                title: "加密级别",
                aes128: "128位AES：提供良好的安全性，兼容Acrobat Reader 7及更高版本。",
                aes256: "256位AES：提供更强的安全性，但需要Acrobat Reader X（10）及更高版本。"
            },
            permissions: {
                title: "权限控制",
                printing: {
                    title: "打印",
                    description: "控制文档是否可以打印以及打印的质量级别。"
                },
                copying: {
                    title: "内容复制",
                    description: "控制是否可以选择文本和图片并复制到剪贴板。"
                },
                editing: {
                    title: "编辑",
                    description: "控制文档修改，包括注释、表单填写和内容更改。"
                }
            }
        },
        form: {
            password: "密码",
            confirmPassword: "确认密码",
            encryptionLevel: "加密级别",
            permissions: {
                title: "访问权限",
                allowAll: "全部允许（仅需打开密码）",
                restricted: "受限访问（自定义权限）"
            },
            allowedActions: "允许的操作：",
            allowPrinting: "允许打印",
            allowCopying: "允许复制文本和图片",
            allowEditing: "允许编辑和注释"
        },
        bestPractices: {
            title: "密码保护最佳实践",
            dos: "应该做",
            donts: "不要做",
            dosList: [
                "使用包含字母、数字和特殊字符的强大、独特密码",
                "在密码管理器中安全存储密码",
                "通过与PDF分开的的安全渠道分享密码",
                "对高度敏感的文档使用256位加密"
            ],
            dontsList: [
                "使用简单、易猜的密码，如“password123”或“1234”",
                "在发送PDF的同一封邮件中包含密码",
                "对所有受保护的PDF使用相同的密码",
                "仅依靠密码保护来保护极其敏感的信息"
            ]
        },
        faq: {
            encryptionDifference: {
                question: "加密级别有什么区别？",
                answer: "我们提供128位和256位AES加密。128位兼容较旧的PDF阅读器（Acrobat 7及以上），而256位提供更强的安全性，但需要较新的阅读器（Acrobat X及以上）。"
            },
            removeProtection: {
                question: "我可以稍后移除密码保护吗？",
                answer: "是的，您可以使用我们的解锁PDF工具从PDF文件中移除密码保护，但您需要知道当前的密码才能这样做。"
            },
            securityStrength: {
                question: "密码保护有多安全？",
                answer: "我们的工具使用行业标准的AES加密。安全性取决于您密码的强度和您选择的加密级别。我们建议使用包含多种字符的强大、独特密码。"
            },
            contentQuality: {
                question: "密码保护会影响PDF内容或质量吗？",
                answer: "不会，密码保护仅为您的文档增加安全性，不会以任何方式改变PDF的内容、布局或质量。"
            },
            batchProcessing: {
                question: "我可以一次保护多个PDF吗？",
                answer: "目前，我们的工具一次处理一个PDF。对于多个文件的批量处理，请考虑我们的API或高级解决方案。"
            }
        },
        protecting: "保护中...",
        protected: "PDF已成功保护！",
        protectedDesc: "您的PDF文件已加密并受密码保护。"
    },

    watermarkPdf: {
        title: "给PDF添加水印",
        description: "为保护、品牌推广或标识，将自定义文本或图片水印添加到您的PDF文档中。",
        textWatermark: "文本水印",
        imageWatermark: "图片水印",
        privacyNote: "您的文件将安全处理。所有上传文件在处理后会自动删除。",
        headerTitle: "给PDF添加水印",
        headerDescription: "为品牌推广、版权保护和文档分类，将自定义文本或图片水印添加到您的PDF文档中。",
        invalidFileType: "无效文件类型",
        selectPdfFile: "请选择一个PDF文件",
        fileTooLarge: "文件太大",
        maxFileSize: "最大文件大小为50MB",
        invalidImageType: "无效图片类型",
        supportedFormats: "支持的格式：PNG、JPG、SVG",
        imageTooLarge: "图片太大",
        maxImageSize: "最大图片大小为5MB",
        noFileSelected: "未选择文件",
        noImageSelected: "未选择水印图片",
        selectWatermarkImage: "请选择用作水印的图片",
        noTextEntered: "未输入水印文本",
        enterWatermarkText: "请输入用作水印的文本",
        success: "水印添加成功",
        successDesc: "您的PDF已添加水印并准备下载",
        failed: "添加水印失败",
        unknownError: "发生未知错误",
        unknownErrorDesc: "发生未知错误。请重试",
        uploadTitle: "上传PDF以添加水印",
        uploadDesc: "将您的PDF文件拖放到此处，或点击浏览",
        uploading: "上传中...",
        selectPdf: "选择PDF文件",
        maxSize: "最大文件大小：50MB",
        change: "更改文件",
        commonOptions: "水印设置",
        position: "位置",
        center: "居中",
        tile: "平铺",
        custom: "自定义",
        applyToPages: "应用于页面",
        all: "所有页面",
        even: "偶数页",
        odd: "奇数页",
        customPages: "自定义页面",
        pagesFormat: "输入以逗号分隔的页面编号或以连字符表示的范围（例如：1,3,5-10）",
        processing: "处理中...",
        addWatermark: "添加水印",
        adding: "正在添加水印",
        pleaseWait: "请等待我们处理您的文档",
        download: "下载PDF",
        newWatermark: "添加另一个水印",
        text: {
            text: "水印文本",
            placeholder: "例如：机密、草稿等",
            color: "文本颜色",
            font: "字体",
            selectFont: "选择字体",
            size: "字体大小",
            opacity: "透明度",
            rotation: "旋转",
            preview: "预览"
        },
        image: {
            title: "水印图片",
            upload: "上传用作水印的图片",
            select: "选择图片",
            formats: "支持的格式：PNG、JPEG、SVG",
            change: "更改图片",
            scale: "缩放",
            opacity: "透明度",
            rotation: "旋转"
        },
        positionX: "位置 X",
        positionY: "位置 Y",
        positions: {
            topLeft: "左上",
            topRight: "右上",
            bottomLeft: "左下",
            bottomRight: "右下",
            center: "居中",
            tile: "平铺",
            custom: "自定义"
        },
        howTo: {
            title: "如何添加水印",
            step1: { title: "上传您的PDF", description: "选择并上传您想添加水印的PDF文件" },
            step2: { title: "自定义水印", description: "在文本或图片水印之间选择并自定义其外观" },
            step3: { title: "下载添加水印的PDF", description: "处理您的文件并下载添加水印的PDF文档" }
        },
        why: {
            title: "为什么添加水印",
            copyright: { title: "版权保护", description: "通过添加版权声明和所有权信息保护您的知识产权" },
            branding: { title: "品牌推广与身份", description: "通过在分发文档中添加标志或品牌文本来增强您的品牌形象" },
            classification: { title: "文档分类", description: "将文档标记为草稿、机密或最终版以表明其状态" },
            tracking: { title: "文档追踪", description: "添加唯一标识符以追踪文档分发并识别泄漏" }
        },
        types: {
            title: "水印类型和选项",
            text: {
                title: "文本水印",
                description: "使用各种选项自定义文本水印：",
                options: {
                    text: "自定义文本内容（支持多行）",
                    font: "字体家族、大小和颜色",
                    rotation: "旋转角度（0-360度）",
                    opacity: "透明度级别（从透明到完全可见）",
                    position: "位置（居中、平铺、自定义放置）"
                }
            },
            image: {
                title: "图片水印",
                description: "使用这些自定义选项添加图片水印：",
                options: {
                    upload: "上传您自己的标志或图片",
                    scale: "缩放和调整大小",
                    rotation: "旋转选项",
                    opacity: "透明度控制",
                    position: "位置自定义"
                }
            }
        },
        faq: {
            title: "常见问题",
            removable: { question: "可以从PDF中移除水印吗？", answer: "我们的标准水印是半永久性的，难以在没有专业软件的情况下移除。但它们并非完全防篡改。考虑我们的Pro计划以获得更安全的水印。" },
            printing: { question: "打印文档时水印会显示吗？", answer: "是的，打印时水印会显示。您可以控制透明度使其更不显眼。" },
            pages: { question: "我可以只给特定页面添加水印吗？", answer: "是的，我们的Pro计划允许您将水印应用于特定页面。" },
            formats: { question: "图片水印支持哪些格式？", answer: "我们支持PNG、JPG/JPEG和SVG。建议使用PNG以支持透明背景的标志。" },
            multiple: { question: "我可以在一个文档中添加多个水印吗？", answer: "Pro用户可以为单个文档添加多个水印；免费用户限制为一个。" },
            q1: { question: "我的PDF文件安全吗？", answer: "是的，所有上传文件都安全处理，并在处理后自动删除。" },
            q2: { question: "我可以添加哪些类型的水印？", answer: "可自定义字体的文本水印或使用PNG、JPG或SVG的图片水印。" },
            q3: { question: "添加水印后可以移除吗？", answer: "一旦添加并下载，水印将成为PDF的永久部分。" },
            q4: { question: "有文件大小限制吗？", answer: "是的，PDF上传的最大大小为50MB，图片水印为5MB。" }
        },
        bestPractices: {
            title: "水印最佳实践",
            dos: "应做",
            donts: "不应做",
            dosList: [
                "使用半透明水印以避免遮挡内容",
                "考虑使用对角水印以获得更好的覆盖",
                "在处理大文档前测试水印样本页面",
                "使用对比色以提高可见性",
                "加入版权符号©以获得法律保护"
            ],
            dontsList: [
                "不要使用太深或不透明的水印",
                "不要将水印放置在重要文本或元素上",
                "不要使用太小而难以辨认的文本",
                "不要仅依靠水印来保护文档安全",
                "不要使用低分辨率而显得像素化的图片"
            ]
        },
        relatedTools: {
            title: "相关工具",
            protect: "保护PDF",
            sign: "签署PDF",
            edit: "编辑PDF",
            ocr: "OCR PDF",
            viewAll: "查看所有工具"
        }
    },
    compressPdf: {
        title: "压缩PDF文件",
        description: "轻松减小PDF文件大小，同时保持文档质量",
        quality: {
            high: "高质量",
            highDesc: "最小压缩，最佳视觉质量",
            balanced: "平衡",
            balancedDesc: "良好压缩，视觉损失最小",
            maximum: "最大压缩",
            maximumDesc: "更高压缩率，可能降低视觉质量"
        },
        processing: {
            title: "处理选项",
            processAllTogether: "同时处理所有文件",
            processSequentially: "逐个处理文件"
        },
        status: {
            uploading: "上传中...",
            compressing: "压缩中...",
            completed: "完成",
            failed: "失败"
        },
        results: {
            title: "压缩结果摘要",
            totalOriginal: "原始总计",
            totalCompressed: "压缩后总计",
            spaceSaved: "节省空间",
            averageReduction: "平均减少",
            downloadAll: "下载所有压缩文件为ZIP"
        },
        of: "的",
        files: "文件",
        filesToCompress: "要压缩的文件",
        compressAll: "压缩文件",
        qualityPlaceholder: "选择压缩质量",
        reduction: "减少",
        zipDownloadSuccess: "所有压缩文件已成功下载",
        overallProgress: "整体进度",
        reducedBy: "减少了",
        success: "压缩成功",
        error: {
            noFiles: "请选择要压缩的PDF文件",
            noCompressed: "没有可下载的压缩文件",
            downloadZip: "下载ZIP文件时出错",
            generic: "压缩PDF文件时出错",
            unknown: "发生未知错误",
            failed: "压缩文件失败"
        },
        howTo: {
            title: "如何压缩PDF文件",
            step1: {
                title: "上传PDF",
                description: "上传您想要压缩的大PDF文件。我们的免费PDF压缩器支持高达100MB的文件，可在Windows、Linux和其他平台上运行。"
            },
            step2: {
                title: "选择质量",
                description: "选择您喜欢的压缩级别以减小文件大小而不损失质量。根据您想要压缩PDF的程度选择最佳模式。"
            },
            step3: {
                title: "下载",
                description: "下载您压缩后的PDF文件。获得更小的文件大小，非常适合在线共享或电子邮件附件。"
            }
        },
        why: {
            title: "为什么要压缩PDF？",
            uploadSpeed: {
                title: "闪电般快速上传",
                description: "压缩后的PDF文件上传更快，尤其是大PDF文件，帮助您在线共享文档而无需等待。"
            },
            emailFriendly: {
                title: "电子邮件友好",
                description: "减小文件大小使您的PDF符合电子邮件大小限制。我们的PDF压缩工具确保轻松共享而不损失质量。"
            },
            storage: {
                title: "存储高效",
                description: "通过使用我们的PDF压缩器将大PDF压缩为更小、更节省空间的文件，节省设备或云存储空间。"
            },
            quality: {
                title: "保持质量",
                description: "压缩PDF而不影响质量。我们的智能模式在减小文件大小的同时保持高视觉清晰度。"
            }
        },
        faq: {
            title: "常见问题",
            howMuch: {
                question: "PDF文件可以压缩多少？",
                answer: "大多数大型PDF文件可以压缩20-80％，具体取决于内容。我们的PDF压缩器针对不同用例进行了优化，帮助您有效减小文件大小——特别是对于图像繁多的PDF。"
            },
            quality: {
                question: "压缩会影响我的PDF质量吗？",
                answer: "我们的工具给您选择：使用无损模式压缩PDF以保持视觉无差异，或选择高压缩以最大程度减小文件大小。您可以免费获得压缩后的PDF而不损失基本质量。"
            },
            secure: {
                question: "压缩时我的PDF数据安全吗？",
                answer: "是的，您的数据是安全的。所有PDF文件均在线安全处理，并在24小时后自动删除。无论您使用Windows还是Linux，您的文件都会被加密且永不共享。"
            },
            fileLimits: {
                question: "文件大小限制是多少？",
                answer: "免费用户可压缩最大10MB的PDF文件。高级计划支持每个文件高达500MB。无论您压缩一个PDF还是多个，我们的工具都能轻松处理大型PDF文件。"
            },
            batch: {
                question: "我可以一次压缩多个PDF吗？",
                answer: "是的，您可以批量压缩PDF。上传多个文件，让我们的PDF压缩器在单个会话中高效减小每个文件的大小——对个人和团队都非常适合。"
            }
        },
        modes: {
            title: "压缩模式",
            moderate: {
                title: "中等压缩",
                description: "一种平衡模式，可在不损失质量的情况下压缩PDF文件。非常适合在线PDF共享或存档，同时保持良好的视觉效果。"
            },
            high: {
                title: "高压缩",
                description: "以明显压缩的方式大幅减小文件大小。快速缩小大型PDF文件的理想选择——当较小尺寸比高分辨率更重要时最佳。"
            },
            lossless: {
                title: "无损压缩",
                description: "通过清理不必要的数据来压缩PDF，减小文件大小而不影响外观——当质量最重要时的最佳选择。"
            }
        },
        bestPractices: {
            title: "PDF压缩最佳实践",
            dos: "该做的",
            donts: "不该做的",
            dosList: [
                "为获得最佳效果，在创建PDF前先压缩图像",
                "根据需求选择合适的压缩级别",
                "压缩前保留原始文件作为备份",
                "重要文档使用无损压缩",
                "删除不必要的页面以进一步减小文件大小"
            ],
            dontsList: [
                "不要过度压缩需要打印的文档",
                "如果每个细节都很重要，不要压缩法律或存档文档",
                "不要反复压缩已经高度压缩的PDF",
                "不要对主要是文本的PDF期望大幅减小",
                "如果文件大小不是问题，不要压缩"
            ]
        },
        relatedTools: {
            title: "相关工具",
            merge: "合并PDF",
            split: "拆分PDF",
            pdfToWord: "PDF转Word",
            pdfToJpg: "PDF转JPG",
            viewAll: "查看所有工具"
        }
    },

    // 解锁PDF
    unlockPdf: {
        title: "使用我们的PDF解锁器轻松解锁PDF文件",
        description: "使用我们的在线PDF解锁工具快速移除PDF密码并解除PDF文件的保护。在任何操作系统上解锁PDF以创建不安全的PDF文件。",
        metaDescription: "使用我们的PDF解锁器轻松解锁PDF文件。移除PDF权限密码，解除在线PDF的保护，并安全下载您的解锁文件。",
        keywords: "解锁PDF文件, 如何解锁PDF文件, PDF解锁, 解锁PDF文件, 解锁到PDF, 解锁PDF文件, 不安全的PDF文件, PDF解锁器, 解锁文件, PDF文档解锁, SmallPDF解锁, 解锁PDFs, PDF保护工具, 权限密码, 下载您的文件, PDF中的密码, 在线PDF, 移除PDF密码, SmallPDF解锁PDF, 移除PDF, 点击保存, 点击密码, PDF解锁工具",

        // Benefits Section
        benefits: {
            title: "为什么使用我们的PDF解锁工具来解锁PDF文件",
            list: [
                {
                    title: "快速PDF解锁器",
                    description: "使用我们的PDF解锁工具快速移除PDF密码并创建不安全的PDF文件，随时准备下载您的文件。"
                },
                {
                    title: "轻松解锁PDF文件",
                    description: "通过简单的密码输入框，输入权限密码或文档打开密码即可在线解锁PDF文件—点击保存即可完成。"
                },
                {
                    title: "在任何平台上解锁PDFs",
                    description: "我们的在线PDF解锁器适用于任何操作系统，无论您使用SmallPDF解锁还是我们的PDF解锁工具，都能无缝解锁PDF文件。"
                },
                {
                    title: "安全的PDF文档解锁",
                    description: "使用我们的工具安全移除PDF文件中的密码，确保解锁PDF后您的解锁文件保持隐私。"
                }
            ]
        },

        // Use Cases Section
        useCases: {
            title: "如何解锁PDF文件：顶级使用场景",
            list: [
                {
                    title: "使用权限密码解锁PDF文件",
                    description: "使用我们的PDF解锁器移除权限密码，并在您知道点击密码时解锁到PDF以获得完全访问权限。"
                },
                {
                    title: "商务在线PDF",
                    description: "在线解锁PDF文件以移除商务文档中的PDF密码，通过快速点击保存简化共享和编辑。"
                },
                {
                    title: "解锁PDF学习材料",
                    description: "使用我们的PDF解锁工具解除在线PDF学习资源的保护，创建不安全的PDF文件以实现无缝学习。"
                },
                {
                    title: "个人PDF文档解锁",
                    description: "了解如何使用我们的SmallPDF解锁PDF替代方案从您的个人收藏中解锁PDF文件并下载您的文件。"
                }
            ]
        },

        // How-To Section
        howTo: {
            title: "如何在3个步骤中解锁PDF文件",
            upload: {
                title: "步骤1：上传您的在线PDF",
                description: "通过上传您想解除保护的PDF文件，使用我们的PDF解锁工具开始解锁PDF。"
            },
            enterPassword: {
                title: "步骤2：输入权限密码",
                description: "使用密码输入框输入PDF中的密码，例如文档打开密码或权限密码。"
            },
            download: {
                title: "步骤3：下载解锁文件",
                description: "在我们移除PDF密码后，将您的文件下载为不安全的PDF文件，完成PDF文件的解锁。"
            }
        },

        // Features Section
        features: {
            title: "我们PDF解锁器的主要功能",
            list: [
                {
                    title: "支持所有在线PDF",
                    description: "轻松解锁带有权限密码或文档打开密码的PDF文件。"
                },
                {
                    title: "快速PDF解锁过程",
                    description: "使用我们快速的PDF解锁工具在几秒钟内移除PDF密码，非常适合下载您的文件。"
                },
                {
                    title: "跨平台PDF文档解锁",
                    description: "在任何操作系统上使用我们的PDF解锁器无缝解锁PDF文件。"
                },
                {
                    title: "安全的SmallPDF解锁替代方案",
                    description: "通过加密处理解除PDF文件的保护，提供SmallPDF解锁PDF的安全替代方案。"
                }
            ]
        },

        // FAQ Section
        faq: {
            passwordRequired: {
                question: "解锁PDF文件需要点击密码吗？",
                answer: "是的，您必须在密码输入框中输入PDF中的密码—如文档打开密码或权限密码—以解锁PDFs。我们的工具不会绕过密码。"
            },
            security: {
                question: "使用此工具解锁PDF文件安全吗？",
                answer: "是的，我们的PDF解锁工具在加密服务器上处理在线PDF。下载您的文件后，我们不会存储您的文件或密码。"
            },
            restrictions: {
                question: "可以在没有点击密码的情况下解锁到PDF吗？",
                answer: "是的，如果没有文档打开密码但存在权限密码，请上传以移除PDF限制。"
            },
            quality: {
                question: "解锁PDF会影响质量吗？",
                answer: "不会，我们的PDF解锁器仅从PDF设置中移除密码—您的解锁文件保持原始质量。"
            },
            compatibility: {
                question: "这对SmallPDF解锁PDF用户有效吗？",
                answer: "是的，我们的PDF解锁工具适用于任何操作系统，是SmallPDF解锁的绝佳替代方案，可以在线解锁PDF文件。"
            }
        },

        // Status Messages
        passwordProtected: "受密码保护",
        notPasswordProtected: "未受密码保护",
        unlocking: "正在解锁PDF...",
        unlockSuccess: "PDF解锁成功！",
        unlockSuccessDesc: "您的PDF文档解锁已完成！现在下载您的解锁文件。"
    },

    // 文件上传器
    fileUploader: {
        dropHere: "将文件拖放到这里",
        dropHereaDesc: "将您的PDF文件拖放到这里或点击浏览",
        dragAndDrop: "拖放您的文件",
        browse: "浏览文件",
        dropHereDesc: "将文件拖放到这里或点击浏览。",
        maxSize: "最大大小为100MB。",
        remove: "移除",
        inputFormat: "输入格式",
        outputFormat: "输出格式",
        ocr: "启用OCR",
        ocrDesc: "使用光学字符识别从扫描文档中提取文本",
        quality: "质量",
        low: "低",
        high: "高",
        password: "密码",
        categories: {
            documents: "文档",
            spreadsheets: "电子表格",
            presentations: "演示文稿",
            images: "图片"
        },
        converting: "转换中",
        successful: "转换成功",
        successDesc: "您的文件已成功转换，现在可以下载。",
        download: "下载转换后的文件",
        filesSecurity: "文件在24小时后自动删除，以确保隐私和安全。"
    },

    // 常用UI元素
    ui: {
        upload: "上传",
        download: "下载",
        cancel: "取消",
        confirm: "确认",
        save: "保存",
        next: "下一步",
        previous: "上一步",
        finish: "完成",
        processing: "处理中...",
        success: "成功！",
        error: "错误",
        copy: "复制",
        remove: "移除",
        browse: "浏览",
        dragDrop: "拖放",
        or: "或",
        close: "关闭",
        apply: "应用",
        loading: "加载中...",
        preview: "预览",
        reupload: "上传另一个文件",
        continue: "继续",
        skip: "跳过",
        retry: "重试",
        addMore: "添加更多",
        clear: "清除",
        clearAll: "全部清除",
        done: "完成",
        extract: "提取",
        new: "新！",
        phone: "电话",
        address: "地址",
        filesSecurity: "文件在24小时后自动删除，以确保隐私和安全。"
    },

    contact: {
        title: "联系我们",
        description: "有问题或反馈？我们很乐意听到您的意见。",
        form: {
            title: "给我们发送消息",
            description: "填写下面的表格，我们将尽快回复您。",
            name: "您的姓名",
            email: "电子邮件地址",
            subject: "主题",
            message: "消息",
            submit: "发送消息"
        },
        success: "消息发送成功",
        successDesc: "感谢您联系我们。我们将尽快回复您。",
        error: "消息发送失败",
        errorDesc: "发送您的消息时出错。请稍后再试。",
        validation: {
            name: "姓名必填",
            email: "请输入有效的电子邮件地址",
            subject: "主题必填",
            message: "消息必填"
        },
        supportHours: {
            title: "支持时间",
            description: "我们何时可以提供帮助",
            weekdays: "周一至周五",
            weekdayHours: "上午9:00 - 下午6:00（美国东部时间）",
            saturday: "周六",
            saturdayHours: "上午10:00 - 下午4:00（美国东部时间）",
            sunday: "周日",
            closed: "关闭"
        },
        faq: {
            title: "常见问题",
            responseTime: {
                question: "回复需要多长时间？",
                answer: "我们旨在在24-48个工作小时内回复所有询问。在高峰期，可能需要最多72小时。"
            },
            technicalSupport: {
                question: "我可以获得技术支持吗？",
                answer: "是的，我们的技术支持团队可以帮助您解决使用PDF工具时遇到的任何问题。"
            },
            phoneSupport: {
                question: "你们提供电话支持吗？",
                answer: "我们在列出的支持时间内提供电话支持。如需即时帮助，电子邮件通常是最快的方式。"
            },
            security: {
                question: "我的个人信息安全吗？",
                answer: "我们非常重视您的隐私。所有通信都经过加密，我们从不与第三方分享您的个人信息。"
            }
        }
    },
    // 关于页面
    about: {
        hero: {
            title: "赋能数字文档管理",
            description: "ScanPro源于一个简单的想法：让文档管理变得无缝、高效且人人可及。我们相信可以改变人们与数字文档互动的方式。"
        },
        story: {
            title: "我们的故事",
            paragraph1: "ScanPro成立于2022年，起源于处理复杂且不直观的PDF工具所带来的挫折感。我们的创始人——技术爱好者和文档管理专家——看到了创造一个既强大又用户友好的解决方案的机会。",
            paragraph2: "最初作为一个小项目起步，很快就发展成为一个综合平台，为全球数千名用户提供服务，从学生和专业人士到大型企业。"
        },
        missionValues: {
            title: "我们的使命与价值观",
            mission: {
                title: "使命",
                description: "通过提供直观、强大且易于获取的PDF工具，简化数字文档管理，提升生产力和创造力。"
            },
            customerFirst: {
                title: "客户至上",
                description: "我们优先考虑用户体验，并根据真实用户反馈不断改进我们的工具。您的需求推动我们的创新。"
            },
            privacy: {
                title: "隐私与安全",
                description: "我们致力于通过最先进的安全措施和对您隐私的绝对尊重来保护您的数据。"
            }
        },
        coreValues: {
            title: "我们的核心价值观",
            innovation: {
                title: "创新",
                description: "我们不断推动文档管理中可能性的边界。"
            },
            collaboration: {
                title: "协作",
                description: "我们相信公司内部以及与用户之间的团队合作力量。"
            },
            accessibility: {
                title: "可访问性",
                description: "我们的工具设计得简单、直观且对所有人开放。"
            }
        },
        team: {
            title: "认识我们的团队",
            description: "ScanPro由一个专注为用户打造最佳PDF工具的小型且敬业团队驱动。",
            member1: {
                name: "查克拉",
                role: "应用开发负责人",
                bio: "负责监督我们应用的开发，实施稳健的后端解决方案，确保我们的工具运行顺畅高效。"
            },
            member2: {
                name: "阿布迪",
                role: "前端网页开发者",
                bio: "创建使我们的工具直观且易于访问的用户界面，专注于在所有网页平台上提供卓越的用户体验。"
            },
            member3: {
                name: "安吉",
                role: "营销专家",
                bio: "领导我们的营销工作，将工具与需要它们的人连接起来，提升知名度并推动平台增长。"
            }
        }
    },
    // 条款和隐私页面
    legal: {
        termsTitle: "服务条款",
        privacyTitle: "隐私政策",
        lastUpdated: "最后更新",
        introduction: {
            title: "引言",
            description: "请在使用我们的服务前仔细阅读这些条款。"
        },
        dataUse: {
            title: "我们如何使用您的数据",
            description: "我们仅处理您的文件以提供您请求的服务。所有文件在24小时后自动删除。"
        },
        cookies: {
            title: "Cookie和追踪",
            description: "我们使用Cookie来改善您的体验并分析网站流量。"
        },
        rights: {
            title: "您的权利",
            description: "您有权访问、更正或删除您的个人信息。"
        }
    },

    // 错误页面
    error: {
        notFound: "页面未找到",
        notFoundDesc: "抱歉，我们找不到您要找的页面。",
        serverError: "服务器错误",
        serverErrorDesc: "抱歉，我们的服务器出现了问题。请稍后再试。",
        goHome: "返回首页",
        tryAgain: "再次尝试"
    },
    universalCompressor: {
        title: "通用文件压缩器",
        description: "压缩PDF、图片和Office文档，同时保持质量",
        dropHereDesc: "将文件拖放到此处（PDF、JPG、PNG、DOCX、PPTX、XLSX）",
        filesToCompress: "要压缩的文件",
        compressAll: "压缩所有文件",
        results: {
            title: "压缩结果",
            downloadAll: "下载所有压缩文件"
        },
        fileTypes: {
            pdf: "PDF文档",
            image: "图片",
            office: "Office文档",
            unknown: "未知文件"
        },
        howTo: {
            title: "如何压缩文件",
            step1: {
                title: "上传文件",
                description: "上传您想压缩的文件"
            },
            step2: {
                title: "选择质量",
                description: "选择您偏好的压缩级别"
            },
            step3: {
                title: "下载",
                description: "点击压缩并下载您的压缩文件"
            }
        },
        faq: {
            compressionRate: {
                question: "文件可以压缩多少？",
                answer: "压缩率因文件类型和内容而异。PDF通常压缩20-70%，图片压缩30-80%，Office文档压缩10-50%。"
            },
            quality: {
                question: "压缩会影响文件质量吗？",
                answer: "我们的压缩算法在减少文件大小和保持质量之间取得平衡。'高质量'设置将保持几乎相同的视觉质量。"
            },
            sizeLimit: {
                question: "有文件大小限制吗？",
                answer: "是的，您可以压缩每个文件高达100MB。"
            }
        }
    },
    repairPdf: {
        title: "修复PDF文件",
        description: "修复损坏的PDF文件，恢复内容并优化文档结构",
        howTo: {
            title: "如何修复您的PDF",
            step1: {
                title: "上传您的PDF",
                description: "从您的设备中选择要修复的PDF文件"
            },
            step2: {
                title: "选择修复模式",
                description: "根据文件问题选择合适的修复方法"
            },
            step3: {
                title: "下载修复后的PDF",
                description: "下载修复后的PDF文件，结构和内容已修正"
            }
        },
        why: {
            title: "为什么要修复PDF",
            corruptedFiles: {
                title: "修复损坏文件",
                description: "从无法正常打开的损坏PDF文件中恢复内容和结构"
            },
            missingContent: {
                title: "恢复缺失内容",
                description: "从部分损坏的文档中恢复缺失的图片、文本或页面"
            },
            documentStructure: {
                title: "修复文档结构",
                description: "修复损坏的内部结构、页面引用和链接"
            },
            fileSize: {
                title: "优化文件大小",
                description: "清理不必要的数据并在不损失质量的情况下优化文件大小"
            }
        },
        modes: {
            title: "可用修复模式",
            standard: {
                title: "标准修复",
                description: "修复常见的PDF问题，包括损坏的交叉引用、格式错误的物体和流错误。适用于仍可打开但显示错误的轻度损坏PDF。"
            },
            advanced: {
                title: "高级恢复",
                description: "针对严重损坏且存在重大结构问题的PDF进行深度修复。从完全无法打开的文件中尽可能恢复内容。"
            },
            optimization: {
                title: "优化",
                description: "在不丢失内容的情况下重新构建和优化PDF文件。删除冗余数据，修复小问题并改善整体文件结构。"
            }
        },
        faq: {
            title: "常见问题解答",
            whatCanRepair: {
                question: "可以修复哪些类型的PDF问题？",
                answer: "我们的修复工具可以解决多种问题，包括损坏的文件结构、断开的页面引用、损坏的内容流、缺失的交叉引用表和无效物体。它通常可以从无法打开或在标准PDF查看器中无法正确显示的PDF中恢复内容。"
            },
            completelyDamaged: {
                question: "可以修复完全损坏的PDF吗？",
                answer: "虽然我们的高级修复模式可以从严重损坏的PDF中恢复内容，但如果文件完全损坏，100%恢复并不总是可能的。然而，即使在极端情况下，我们通常也能恢复部分内容，尤其是文本和基本元素。"
            },
            contentQuality: {
                question: "修复会影响内容质量吗？",
                answer: "不会，我们的修复过程会保持可恢复内容的质量。与一些仅提取并重新创建PDF（可能丢失格式）的工具不同，我们尝试在修复损坏部分的同时保留原始结构。"
            },
            passwordProtected: {
                question: "可以修复受密码保护的PDF吗？",
                answer: "可以，如果您有密码，您可以修复受密码保护的PDF。您需要在修复过程中输入密码。然而，我们不会尝试在没有适当授权的情况下绕过或移除受保护文档的加密。"
            },
            dataSecurity: {
                question: "修复过程中我的PDF数据安全吗？",
                answer: "是的，我们非常重视数据安全。您的文件在我们的服务器上安全处理，不会与第三方共享，并在处理后自动删除。我们对所有文件传输使用加密，整个修复过程在安全环境中进行。"
            }
        },
        bestPractices: {
            title: "PDF恢复的最佳实践",
            dos: "应做",
            donts: "不应做",
            dosList: [
                "在尝试修复前保留原始文件的备份",
                "在使用高级恢复之前先尝试标准修复模式",
                "如果可能，使用多个查看器检查PDF",
                "在修复前记录哪些页面或元素有问题",
                "对大型但功能正常的PDF使用优化模式"
            ],
            dontsList: [
                "不要反复保存损坏的PDF，这可能会加剧损坏",
                "不要将修复作为正确创建PDF的替代品",
                "不要期望从严重损坏的文件中100%恢复",
                "不要在可能再次损坏文件的旧PDF查看器中打开修复后的文件",
                "不要跳过检查修复后文件内容的准确性"
            ]
        },
        relatedTools: {
            title: "相关工具",
            compress: "压缩PDF",
            unlock: "解锁PDF",
            protect: "保护PDF",
            edit: "编辑PDF",
            viewAll: "查看所有工具"
        },
        form: {
            title: "PDF修复工具",
            description: "修复损坏的PDF，恢复内容并优化文档结构",
            upload: "上传PDF进行修复",
            dragDrop: "将您的PDF文件拖放到此处，或点击浏览",
            selectFile: "选择PDF文件",
            maxFileSize: "最大文件大小：100MB",
            change: "更改文件",
            repairModes: "修复模式",
            standardRepair: "标准修复",
            standardDesc: "修复常见问题，如断开链接和结构问题",
            advancedRecovery: "高级恢复",
            advancedDesc: "针对严重损坏或腐败的PDF文件进行深度恢复",
            optimization: "优化",
            optimizationDesc: "在不丢失内容的情况下清理和优化PDF结构",
            advancedOptions: "高级选项",
            showOptions: "显示选项",
            hideOptions: "隐藏选项",
            preserveFormFields: "保留表单字段",
            preserveFormFieldsDesc: "尽可能保留交互式表单字段",
            preserveAnnotations: "保留注释",
            preserveAnnotationsDesc: "保留评论、高亮和其他注释",
            preserveBookmarks: "保留书签",
            preserveBookmarksDesc: "保留文档大纲和书签",
            optimizeImages: "优化图片",
            optimizeImagesDesc: "重新压缩图片以减小文件大小",
            password: "PDF密码",
            passwordDesc: "此PDF受密码保护。输入密码以修复它。",
            repair: "修复PDF",
            repairing: "正在修复PDF...",
            security: "您的文件将安全处理。所有上传文件在处理后自动删除。",
            analyzing: "分析PDF结构",
            rebuilding: "重建文档结构",
            recovering: "恢复内容",
            fixing: "修复交叉引用",
            optimizing: "优化文件",
            finishing: "完成"
        },
        results: {
            success: "PDF修复成功",
            successMessage: "您的PDF已修复并可供下载。",
            issues: "检测到修复问题",
            issuesMessage: "我们在修复您的PDF时遇到了问题。某些内容可能无法恢复。",
            details: "修复详情",
            fixed: "已修复的问题",
            warnings: "警告",
            fileSize: "文件大小",
            original: "原始",
            new: "新",
            reduction: "减少",
            download: "下载修复后的PDF",
            repairAnother: "修复另一个PDF"
        }
    },
    faq: {
        categories: {
            general: "常规",
            conversion: "转换",
            security: "安全",
            account: "账户",
            api: "API"
        },
        general: {
            question1: "ScanPro是什么？",
            answer1: "ScanPro是一个用于PDF管理和转换的全面在线平台。我们的工具通过直观的网页界面或API，帮助您转换、编辑、合并、分割、压缩和保护您的PDF文档。",
            question2: "我需要创建账户才能使用ScanPro吗？",
            answer2: "不需要，您可以不注册就使用我们的基本PDF工具。但是，创建一个免费账户可以享受保存历史记录、更高的文件大小限制和访问附加功能等好处。",
            question3: "我的数据在ScanPro上安全吗？",
            answer3: "是的，所有文件都在我们的服务器上通过加密安全处理。我们不会与第三方共享您的文件，文件在处理后（24小时内）会从我们的服务器自动删除。详情请查看我们的隐私政策。",
            question4: "ScanPro支持哪些设备和浏览器？",
            answer4: "ScanPro可在所有现代浏览器上运行，包括Chrome、Firefox、Safari和Edge。我们的平台完全响应式，适用于桌面、平板和移动设备。"
        },
        conversion: {
            question1: "我可以将哪些文件类型进行转换？",
            answer1: "ScanPro支持将PDF转换为多种格式，包括Word（DOCX）、Excel（XLSX）、PowerPoint（PPTX）、图片（JPG、PNG）、HTML和纯文本。您还可以将这些格式转换回PDF。",
            question2: "你们的PDF转换有多准确？",
            answer2: "我们的转换引擎使用高级算法来保持格式，包括字体、图片、表格和布局。然而，非常复杂的文档可能会有轻微的格式差异。为获得最佳效果，我们建议对格式复杂的文档使用'PDF转Word'或'PDF转Excel'工具。",
            question3: "转换有文件大小限制吗？",
            answer3: "免费用户可转换高达10MB的文件。基础订阅者可达50MB，专业订阅者100MB，企业用户500MB。如果您需要处理更大的文件，请联系我们获取定制解决方案。",
            question4: "为什么我的PDF转换失败了？",
            answer4: "如果文件损坏、受密码保护或包含我们系统无法处理的复杂元素，转换可能会失败。请先尝试使用'修复PDF'工具，然后重试转换。如果问题仍未解决，请尝试'高级'转换模式或联系支持团队。"
        },
        security: {
            question1: "如何为我的PDF设置密码保护？",
            answer1: "使用我们的'保护PDF'工具。上传您的PDF，设置密码，选择权限限制（如果需要），然后点击'保护PDF'。您可以控制用户是否可以打印、编辑或复制您的PDF内容。",
            question2: "我可以从PDF中移除密码吗？",
            answer2: "是的，使用我们的'解锁PDF'工具。您需要提供当前密码以移除保护。请注意，我们仅帮助移除您拥有或有权修改的文档的密码保护。",
            question3: "你们为PDF保护使用什么级别的加密？",
            answer3: "我们使用行业标准的256位AES加密为PDF提供保护，为您的文档提供强大的安全性。如果需要与较旧的PDF阅读器兼容，我们也支持128位加密。"
        },
        account: {
            question1: "如何升级我的订阅？",
            answer1: "登录您的账户，进入仪表板，选择'订阅'选项卡。选择符合您需求的计划并按照支付说明操作。付款后，您的新功能将立即激活。",
            question2: "我可以取消我的订阅吗？",
            answer2: "是的，您可以随时通过仪表板的'订阅'选项卡取消订阅。您将继续享有高级功能，直到当前计费周期结束。",
            question3: "如何重置我的密码？",
            answer3: "在登录页面点击'忘记密码？'并输入您的电子邮件地址。我们将发送一个1小时有效的密码重置链接。如果未收到邮件，请检查垃圾邮件文件夹或联系支持团队。"
        },
        api: {
            question1: "如何获取API密钥？",
            answer1: "注册一个账户，然后前往仪表板 > API密钥以创建您的第一个API密钥。免费账户获得1个密钥，基础订阅者3个，专业订阅者10个，企业用户50个以上。",
            question2: "API的速率限制是什么？",
            answer2: "速率限制取决于您的订阅级别：免费（10请求/小时），基础（100请求/小时），专业（1,000请求/小时），企业（5,000+请求/小时）。每个级别还适用月度操作限制。",
            question3: "如何将API集成到我的应用程序中？",
            answer3: "我们的API使用带有JSON响应的标准REST端点。您可以在我们的开发者部分找到全面的文档、代码示例和SDK。我们为多种编程语言提供示例，包括JavaScript、Python、PHP和Java。"
        },
        title: "常见问题解答"
    },
    footer: {
        description: "面向专业人士的高级PDF工具。使用我们强大的基于Web的平台和API转换、编辑、保护和优化您的文档。",
        contactUs: "联系我们",
        address: "美国PDF市文档街123号，94103",
        subscribe: "订阅我们的新闻通讯",
        subscribeText: "直接获取最新新闻、更新和技巧到您的收件箱。",
        emailPlaceholder: "您的电子邮件地址",
        subscribeButton: "订阅",
        pdfTools: "PDF工具",
        pdfManagement: "PDF管理",
        company: "公司",
        support: "支持",
        aboutUs: "关于我们",
        careers: "职业",
        blog: "博客",
        helpCenter: "帮助中心",
        apiDocs: "API文档",
        faqs: "常见问题",
        tutorials: "教程",
        systemStatus: "系统状态",
        allRightsReserved: "保留所有权利。",
        termsOfService: "服务条款",
        privacyPolicy: "隐私政策",
        cookiePolicy: "Cookie政策",
        security: "安全",
        sitemap: "网站地图",
        validEmail: "请输入有效的电子邮件地址",
        subscribeSuccess: "感谢您订阅我们的新闻通讯！",
        viewAllTools: "查看所有PDF工具",
        repairPdf: "修复PDF",
        socialFacebook: "脸书",
        socialTwitter: "推特",
        socialInstagram: "Instagram",
        socialLinkedin: "领英",
        socialGithub: "GitHub",
        socialYoutube: "YouTube"
    },
    security: {
        title: "ScanPro的安全与隐私",
        description: "我们高度重视您文档的安全性和隐私性。了解我们如何保护您的数据。",
        measures: {
            title: "我们如何保护您的数据"
        },
        sections: {
            encryption: {
                title: "端到端加密",
                description: "所有文件在传输时使用TLS 1.3加密，存储时使用AES-256加密。您的文档永远不会在无保护状态下传输。"
            },
            temporaryStorage: {
                title: "临时存储",
                description: "文件在处理后24小时内自动删除。我们不会不必要地保留您的文档。"
            },
            access: {
                title: "访问控制",
                description: "强大的身份验证和授权系统确保只有您能访问您的文档和账户信息。"
            },
            infrastructure: {
                title: "安全基础设施",
                description: "我们的系统运行在通过ISO 27001认证的企业级云服务上，并定期进行安全审计。"
            },
            compliance: {
                title: "合规性",
                description: "我们的运营遵循GDPR、CCPA和其他地区隐私法规，确保您的数据权利受到保护。"
            },
            monitoring: {
                title: "持续监控",
                description: "自动和手动安全审查、漏洞扫描和入侵检测可防范新出现的威胁。"
            }
        },
        tabs: {
            security: "安全",
            privacy: "隐私",
            compliance: "合规"
        },
        tabContent: {
            security: {
                title: "我们的安全方法",
                description: "保护您文件和数据的全面安全措施",
                encryption: {
                    title: "强加密",
                    description: "传输中的数据使用TLS 1.3，存储数据使用AES-256。所有文件传输都经过端到端加密。"
                },
                auth: {
                    title: "安全认证",
                    description: "多因素认证、使用bcrypt的安全密码存储以及定期账户监控可疑活动。"
                },
                hosting: {
                    title: "安全托管",
                    description: "我们的基础设施托管在通过ISO 27001认证的企业级云服务上。我们实施网络分段、防火墙和入侵检测系统。"
                },
                updates: {
                    title: "定期更新",
                    description: "我们保持定期安全补丁和更新，进行漏洞评估和渗透测试以识别和解决潜在问题。"
                }
            },
            privacy: {
                title: "隐私实践",
                description: "我们如何处理您的个人数据和文档",
                viewPolicy: "查看完整隐私政策"
            },
            compliance: {
                title: "合规与认证",
                description: "我们遵循的标准和法规",
                approach: {
                    title: "我们的合规方法",
                    description: "ScanPro采用隐私和安全设计原则开发。我们会定期审查和更新实践以符合不断发展的法规。"
                },
                gdpr: {
                    title: "GDPR合规性"
                },
                hipaa: {
                    title: "HIPAA注意事项"
                }
            }
        },
        retention: {
            title: "数据保留政策",
            description: "我们遵循严格的数据最小化实践。以下是我们保留不同类型数据的时间：",
            documents: {
                title: "上传的文档",
                description: "文件在处理后24小时内从我们的服务器自动删除。除非您明确选择付费计划提供的存储功能，否则我们不会保留您文档的副本。"
            },
            account: {
                title: "账户信息",
                description: "基本账户信息在您保持活跃账户期间保留。您可以随时删除账户，这将从我们的系统中移除您的个人信息。"
            },
            usage: {
                title: "使用数据",
                description: "匿名使用统计数据最多保留36个月以帮助我们改进服务。这些数据无法用于个人身份识别。"
            }
        },
        contact: {
            title: "有安全问题？",
            description: "我们的安全团队随时准备回答您关于我们如何保护您的数据和隐私的问题。",
            button: "联系安全团队"
        },
        policy: {
            button: "隐私政策"
        },
        faq: {
            dataCollection: {
                question: "ScanPro收集哪些个人数据？",
                answer: "我们仅收集提供服务所需的最少信息。对于注册用户，这包括电子邮件、姓名和使用统计。我们还收集匿名使用数据以改进服务。我们不会分析、扫描或挖掘您文档的内容。"
            },
            documentStorage: {
                question: "你们存储我的文档多久？",
                answer: "文档通常在处理后24小时内从我们的服务器自动删除。付费订阅用户可使用文档存储选项，但这些仅是可选功能。"
            },
            thirdParty: {
                question: "你们会与第三方共享我的数据吗？",
                answer: "我们不出售或出租您的个人数据。仅在必要时（如订阅的支付处理器）或法律要求时才会与第三方共享数据。所有第三方提供商都经过严格审查并受数据保护协议约束。"
            },
            security: {
                question: "你们如何保护我的数据？",
                answer: "我们使用行业标准安全措施，包括数据传输TLS加密、存储数据AES-256加密、安全基础设施提供商、访问控制和定期安全审计。我们的系统以安全为优先设计。"
            },
            rights: {
                question: "我对我的数据有哪些权利？",
                answer: "根据您所在地区，您拥有包括：数据访问权、更正不准确数据、删除数据、限制处理、数据可携带权和反对处理等权利。要行使这些权利，请联系我们的支持团队。"
            },
            breach: {
                question: "发生数据泄露会怎样？",
                answer: "我们按照适用法律制定协议来检测、响应和通知受影响的用户任何数据泄露。我们定期进行安全评估以最小化泄露风险，并维护详细的事件响应计划。"
            }
        }
    },

    developer: {
        title: "开发者 API 文档",
        description: "使用我们的 RESTful API 将 ScanPro 的强大 PDF 工具集成到您的应用程序中",
        tabs: {
            overview: "概览",
            authentication: "认证",
            endpoints: "端点",
            examples: "示例",
            pricing: "定价"
        },
        examples: {
            title: "代码示例",
            subtitle: "通过这些即用示例学习如何集成我们的 API",
            pdfToWord: "PDF 转 Word",
            mergePdfs: "合并 PDF",
            protectPdf: "保护 PDF"
        },
        endpoints: {
            title: "API 端点",
            subtitle: "所有可用 API 端点的完整参考",
            categories: {
                all: "全部",
                conversion: "转换",
                manipulation: "操作",
                security: "安全",
                ocr: "OCR"
            },
            parameters: "参数",
            paramName: "名称",
            type: "类型",
            required: "必需",
            description: "描述",
            responses: "响应"
        },
        pricing: {
            title: "API 定价",
            subtitle: "为您的 API 集成需求选择合适的计划",
            monthly: "按月计费",
            yearly: "按年计费",
            discount: "节省 20%",
            forever: "永久",
            includes: "包含内容：",
            getStarted: "开始使用",
            subscribe: "订阅",
            freePlan: {
                description: "适用于偶尔使用和测试",
                feature1: "每月 100 次操作",
                feature2: "每小时 10 次请求",
                feature3: "1 个 API 密钥",
                feature4: "基本 PDF 操作"
            },
            basicPlan: {
                description: "适用于初创公司和小型项目",
                feature1: "每月 1,000 次操作",
                feature2: "每小时 100 次请求",
                feature3: "3 个 API 密钥",
                feature4: "所有 PDF 操作",
                feature5: "基本 OCR"
            },
            proPlan: {
                description: "适用于企业和高级用户",
                feature1: "每月 10,000 次操作",
                feature2: "每小时 1,000 次请求",
                feature3: "10 个 API 密钥",
                feature4: "高级 OCR",
                feature5: "优先支持",
                feature6: "自定义水印"
            },
            enterprisePlan: {
                description: "适用于高容量集成",
                feature1: "每月 100,000 次以上操作",
                feature2: "每小时 5,000 次以上请求",
                feature3: "50 个以上 API 密钥",
                feature4: "专用支持",
                feature5: "自定义集成帮助",
                feature6: "白标选项"
            },
            customPricing: {
                title: "需要自定义解决方案？",
                description: "对于高容量 API 使用或特殊集成需求，我们提供带有专用支持的自定义定价。",
                contactSales: "联系销售",
                enterprisePlus: "企业+",
                dedicated: "专用基础设施",
                sla: "自定义 SLA",
                account: "专用账户经理",
                custom: "自定义定价"
            }
        },
        authentication: {
            loginRequired: "需要登录",
            loginMessage: "登录您的账户以访问您的 API 密钥。",
            signIn: "登录",
            yourApiKey: "您的 API 密钥",
            noApiKeys: "您还没有 API 密钥。",
            managementKeys: "管理 API 密钥",
            createApiKey: "创建 API 密钥",
            title: "API 认证",
            subtitle: "使用 API 密钥保护您的 API 请求",
            apiKeys: {
                title: "API 密钥",
                description: "对 ScanPro API 的所有请求都需要使用 API 密钥进行认证。您的 API 密钥具有许多权限，请务必妥善保管！"
            },
            howTo: {
                title: "如何认证",
                description: "您可以通过以下两种方式之一认证您的 API 请求："
            },
            header: {
                title: "1. 使用 HTTP 头（推荐）",
                description: "将您的 API 密钥包含在 HTTP 请求的 x-api-key 头中："
            },
            query: {
                title: "2. 使用查询参数",
                description: "或者，您可以将 API 密钥作为查询参数包含："
            },
            security: {
                title: "安全最佳实践",
                item1: "切勿公开分享您的 API 密钥",
                item2: "不要将 API 密钥存储在客户端代码中",
                item3: "为您的 API 密钥设置适当的权限",
                item4: "定期轮换您的 API 密钥"
            },
            limits: {
                title: "速率限制和配额",
                description: "API 请求受限于您的订阅等级的速率限制：",
                plan: "计划",
                operations: "操作",
                rate: "速率限制",
                keys: "API 密钥"
            },
            errors: {
                title: "速率限制错误",
                description: "当您超过速率限制时，API 将返回带有以下头的 429 过多请求响应："
            }
        },
        api: {
            question1: "如何获取 API 密钥？",
            answer1: "注册一个账户，然后前往仪表板 > API 密钥以创建您的第一个 API 密钥。免费账户获得 1 个密钥，基本订阅者获得 3 个，专业订阅者获得 10 个，企业用户获得 50 个以上密钥。",
            question2: "API 的速率限制是什么？",
            answer2: "速率限制取决于您的订阅等级：免费（10 请求/小时），基本（100 请求/小时），专业（1,000 请求/小时），企业（5,000+ 请求/小时）。每月操作限制也适用于每个等级。",
            question3: "如何将 API 集成到我的应用程序中？",
            answer3: "我们的 API 使用带 JSON 响应的标准 REST 端点。您可以在我们的开发者部分找到全面的文档、代码示例和 SDK。我们为 JavaScript、Python、PHP 和 Java 等多种编程语言提供示例。"
        },
        overview: {
            title: "API 概览",
            subtitle: "关于我们 API 您需要知道的一切",
            intro: "ScanPro API 允许您将我们的 PDF 处理功能直接集成到您的应用程序中。通过简单的 RESTful 接口，您可以以编程方式转换、压缩、合并、拆分 PDF 并执行其他操作。",
            features: {
                title: "主要功能",
                restful: "带 JSON 响应的 RESTful API",
                authentication: "使用 API 密钥的简单认证",
                operations: "包括转换、压缩、合并等的全面 PDF 操作",
                scalable: "满足您需求的 scalable 定价等级",
                secure: "通过加密传输和自动文件删除实现安全文件处理"
            },
            gettingStarted: "开始使用",
            startSteps: "要开始使用 ScanPro API：",
            step1: "注册一个账户",
            step2: "从您的仪表板生成 API 密钥",
            step3: "使用提供的示例进行您的第一次 API 请求",
            getStarted: "开始使用"
        },
        tools: {
            conversion: {
                title: "PDF 转换",
                description: "将 PDF 转换为各种格式（DOCX、XLSX、JPG）或反之。"
            },
            manipulation: {
                title: "PDF 操作",
                description: "合并多个 PDF，将 PDF 拆分为单独文件，或压缩 PDF 以减小文件大小。"
            },
            security: {
                title: "PDF 安全",
                description: "添加密码保护，解锁受保护的 PDF，并为文档安全添加水印。"
            },
            viewEndpoints: "查看端点"
        }
    },
    pricing: {
        description: "选择适合您PDF需求的计划。ScanPro提供从免费到企业的灵活定价选项，包含您所需的功能。",

        // Page content
        title: "简单透明的定价",
        subtitle: "选择适合您的计划。所有计划都包含我们的核心PDF工具。",
        monthly: "月度",
        yearly: "年度",
        saveUp: "节省高达20%",
        subscribe: "订阅",
        feature: "功能",
        featureCompare: "功能比较",

        // Features
        features: {
            operations: "月度操作",
            amount: {
                free: "100次操作",
                basic: "1,000次操作",
                pro: "10,000次操作",
                enterprise: "100,000次操作"
            },
            apiAccess: "API访问",
            apiKeys: {
                free: "1个API密钥",
                basic: "3个API密钥",
                pro: "10个API密钥",
                enterprise: "50个API密钥"
            },
            rateLimits: "速率限制",
            rateLimit: {
                free: "100请求/小时",
                basic: "1000请求/小时",
                pro: "1000请求/小时",
                enterprise: "5000请求/小时"
            },
            fileSizes: "最大文件大小",
            fileSize: {
                free: "25 MB",
                basic: "50 MB",
                pro: "100 MB",
                enterprise: "200 MB"
            },
            ocr: "OCR（文本识别）",
            watermarking: "水印",
            advancedProtection: "高级PDF保护",
            bulkProcessing: "批量处理",
            supports: "支持",
            support: {
                free: "电子邮件支持",
                priority: "优先支持",
                dedicated: "专属支持"
            },
            whiteLabel: "白标选项",
            serviceLevel: "服务水平协议"
        },

        // Plan descriptions
        planDescriptions: {
            free: "适用于偶尔需要的PDF",
            basic: "适用于个人和小团队",
            pro: "适用于专业人士和企业",
            enterprise: "适用于大型组织"
        },

        // FAQ section
        faq: {
            title: "常见问题",
            q1: {
                title: "什么是PDF操作？",
                content: "PDF操作包括将PDF转换为其他格式（Word、Excel等）、压缩PDF、合并PDF、拆分PDF、添加水印、提取文本以及通过我们服务对PDF文件执行的任何其他操作。"
            },
            q2: {
                title: "我可以升级或降级我的计划吗？",
                content: "是的，您可以随时升级或降级您的计划。升级时，新计划立即生效。降级时，新计划将在当前计费周期结束时生效。"
            },
            q3: {
                title: "你们提供退款吗？",
                content: "我们为所有付费计划提供7天退款保证。如果您对我们的服务不满意，可以在初次购买后的7天内请求退款。"
            },
            q4: {
                title: "如果我超过月度操作限制会怎样？",
                content: "如果您达到月度操作限制，在下个计费周期开始时限制重置之前，您将无法执行额外的操作。您可以随时升级计划以增加限制。"
            },
            q5: {
                title: "我的数据安全吗？",
                content: "是的，我们非常重视数据安全。所有文件上传和处理都通过安全的HTTPS连接进行。我们不会将您的文件存储超过处理所需时间，处理完成后所有文件将自动删除。"
            }
        },

        // CTA section
        cta: {
            title: "准备好开始了吗？",
            subtitle: "选择适合您的计划，今天开始转换您的PDF。",
            startBasic: "从基础版开始",
            explorePdfTools: "探索PDF工具"
        },

        // Login dialog
        loginRequired: "需要登录",
        loginRequiredDesc: "您需要在订阅前登录您的账户。现在要登录吗？",

        // Plan buttons
        getStarted: "开始",
        currentPlan: "当前计划"
    },
    signPdf: {
        title: "签署PDF：为文档添加数字签名",
        description: "轻松为您的PDF文档添加数字签名、文本注释、印章和绘图",
        howTo: {
            title: "如何签署PDF文档",
            step1: {
                title: "上传您的PDF",
                description: "上传您想要签署或注释的PDF文档"
            },
            step2: {
                title: "添加您的签名",
                description: "创建、上传或绘制您的签名并将其放置在文档上"
            },
            step3: {
                title: "保存并下载",
                description: "保存您的更改并下载已签署的PDF文档"
            }
        },
        tools: {
            signature: "签名",
            text: "文本",
            stamp: "印章",
            draw: "绘制",
            image: "图像"
        },
        options: {
            draw: "绘制签名",
            upload: "上传签名",
            type: "输入签名",
            clear: "清除",
            save: "保存签名",
            color: "颜色",
            fontSize: "字体大小",
            cancel: "取消",
            apply: "应用",
            position: "位置"
        },
        stamps: {
            approved: "已批准",
            rejected: "已拒绝",
            draft: "草稿",
            final: "最终版",
            confidential: "机密"
        },
        messages: {
            noFile: "未选择文件",
            uploadFirst: "请先上传要签署的PDF文件",
            processing: "正在处理您的PDF...",
            signed: "PDF已成功签署！",
            downloadReady: "您的已签署PDF已准备好下载",
            error: "签署PDF时出错",
            errorDesc: "处理您的请求时出现错误。请重试。"
        },
        faq: {
            title: "常见问题解答",
            legality: {
                question: "数字签名具有法律约束力吗？",
                answer: "使用我们工具创建的数字签名在视觉上类似于手写签名。对于符合eIDAS或ESIGN法案等法规的具有法律约束力的电子签名，您可能需要合格的电子签名服务。我们的工具适用于内部文档、草稿或视觉签名足够的情况。"
            },
            security: {
                question: "签名的安全性如何？",
                answer: "我们的签名是PDF文档上的视觉叠加层。它们提供了同意的视觉表示，但不包括高级数字签名解决方案中常见的加密安全功能。您的文档会得到安全处理，我们不会存储您已签署的PDF。"
            },
            formats: {
                question: "支持哪些签名格式？",
                answer: "您可以通过鼠标/触摸板绘制、上传图像文件（推荐PNG、JPG透明背景）或以各种字体样式输入您的姓名来创建签名。"
            },
            multipleSignatures: {
                question: "我可以在一个文档中添加多个签名吗？",
                answer: "是的，您可以在文档中添加多个签名、文本注释、印章和绘图。这对于需要多方签名或在不同位置需要注释的文档非常有用。"
            }
        },
        benefits: {
            title: "数字签名的优势",
            paperless: {
                title: "无纸化",
                description: "消除打印、签署、扫描和通过电子邮件发送文档的需要"
            },
            time: {
                title: "节省时间",
                description: "无需物理处理即可随时随地即时签署文档"
            },
            professional: {
                title: "专业外观",
                description: "创建干净、专业外观的已签署文档"
            },
            workflow: {
                title: "简化工作流程",
                description: "加快文档批准和业务流程"
            }
        },
        useCases: {
            title: "常见使用场景",
            contracts: {
                title: "合同和协议",
                description: "为商业合同和协议添加您的签名"
            },
            forms: {
                title: "表格和申请",
                description: "无需打印即可填写和签署表格"
            },
            approvals: {
                title: "文档批准",
                description: "使用官方印章和签名将文档标记为已批准"
            },
            feedback: {
                title: "反馈和修订",
                description: "在审查期间为文档添加评论和注释"
            }
        },
        draw: "绘制",
        addText: "添加文本",
        addImage: "添加图像",
        download: "下载已签署的PDF",
        processing: "处理中...",
        clearAll: "全部清除",
        uploadSignature: "上传签名",
        drawSignature: "绘制签名",
        signatureOptions: "签名选项",
        annotationTools: "注释工具",
        pages: "页面",
        uploadTitle: "上传PDF以签名",
        uploadDesc: "将您的PDF文件拖放到此处，或点击浏览"
    },
    ocrPdf: {
        title: 'OCR PDF',
        description: '使用OCR文本技术将不可选择的PDF文件转换为高精度的可选择和可搜索的PDF',
        step1Title: '上传您的PDF',
        step1Description: '上传您希望通过OCR文本使其可搜索的扫描PDF或基于图像的文档',
        step2Title: 'OCR处理',
        step2Description: '我们的先进OCR技术识别并提取您的PDF中的扫描文本',
        step3Title: '下载可搜索的PDF',
        step3Description: '获取带有可选择、可复制和可搜索文本文件的增强PDF',
        howItWorksTitle: 'OCR技术的工作原理',
        howItWorksDescription: '光学字符识别（OCR）是一种将各种文档（如扫描的PDF文件或图像）转换为可编辑和可搜索数据的技术。将OCR应用于您的扫描PDF，以便在Adobe Acrobat中编辑。',
        feature1Title: '将扫描文档转换为文本',
        feature1Description: 'OCR将扫描文档和图像转换为机器可读文本，使其在Adobe Acrobat中可搜索和可编辑。',
        feature2Title: '多语言支持',
        feature2Description: '我们的OCR引擎能够在复杂文档中识别多种语言的文本，并具有高精度。',
        benefitsTitle: '为什么要为您的PDF使用OCR？',
        benefit1Title: '可搜索性',
        benefit1Description: '通过搜索文档中的OCR文本快速找到信息',
        benefit2Title: '复制和粘贴',
        benefit2Description: '直接从PDF文档中复制文本，而不是重新输入内容',
        benefit3Title: '归档',
        benefit3Description: '从扫描文档和旧文本文件创建可搜索的存档',
        benefit4Title: '分析',
        benefit4Description: '通过文本提取和数据处理分析文档内容',
        faqTitle: '常见问题',
        faq1Question: '在OCR处理期间我的数据安全吗？',
        faq1Answer: '是的，我们非常重视数据安全。所有文件上传和处理都在安全服务器上进行。您的文件将在24小时后自动删除，我们不会将您的文档用于除提供OCR服务之外的任何其他用途。',
        relatedToolsTitle: '相关PDF工具',
        tool1Href: '/compress-pdf',
        tool1Title: '压缩PDF',
        tool1IconColor: 'text-green-500',
        tool1BgColor: 'bg-green-100 dark:bg-green-900/30',
        tool2Href: '/pdf-to-word',
        tool2Title: 'PDF转Word',
        tool2IconColor: 'text-blue-500',
        tool2BgColor: 'bg-blue-100 dark:bg-blue-900/30',
        tool3Href: '/merge-pdf',
        tool3Title: '合并PDF',
        tool3IconColor: 'text-red-500',
        tool3BgColor: 'bg-red-100 dark:bg-red-900/30',
        tool4Href: '/pdf-tools',
        tool4Title: '所有PDF工具',
        tool4IconColor: 'text-purple-500',
        tool4BgColor: 'bg-purple-100 dark:bg-purple-900/30'
    },
    rotatePdf: {
        title: "旋转PDF页面",
        description: "使用我们的在线工具轻松将PDF页面顺时针、逆时针或上下颠倒旋转。使用精确的PDF编辑工具和按钮修复扫描错误的文档，旋转所选页面或页面范围。",
        howTo: {
            title: "如何旋转PDF页面",
            step1: {
                title: "上传PDF",
                description: "通过拖放或点击上传要旋转的文件来选择PDF。"
            },
            step2: {
                title: "选择旋转",
                description: "点击页面缩略图选择页面或页面范围，然后使用旋转工具指定角度（90°、180°或270°）。"
            },
            step3: {
                title: "下载",
                description: "处理并下载旋转后的PDF文档，所有选定的页面都已正确定向。"
            }
        },
        why: {
            title: "为什么旋转PDF页面",
            fixScanned: {
                title: "修复扫描文档",
                description: "使用页面缩略图和旋转工具修复扫描错误的页面方向，使其可读。"
            },
            presentation: {
                title: "改善演示文稿",
                description: "旋转PDF页面或单个页面，以优化屏幕显示或演示文稿中的显示。"
            },
            mixedOrientation: {
                title: "修复混合方向",
                description: "通过旋转所选页面或页面范围，标准化包含混合纵向和横向页面的文档。"
            },
            printing: {
                title: "优化打印",
                description: "使用按钮旋转页面范围，确保在打印前所有页面都已正确定向，节省纸张。"
            }
        },
        features: {
            title: "旋转功能",
            individual: {
                title: "单页旋转",
                description: "点击页面缩略图选择并旋转文档中的单个页面。"
            },
            batch: {
                title: "批量页面选择",
                description: "选择页面范围并使用奇数、偶数或所有页面的选项，一次旋转多个页面。"
            },
            preview: {
                title: "实时预览",
                description: "在处理之前，使用所选页面的缩略图查看旋转后的页面外观。"
            },
            precision: {
                title: "精确控制",
                description: "使用旋转工具为每个页面选择精确的旋转角度（90°、180°或270°）。"
            }
        },
        form: {
            uploadTitle: "上传PDF以旋转",
            uploadDesc: "将您的PDF文件拖放到此处，或点击按钮选择PDF并打开进行编辑。",
            rotateAll: "旋转所有页面",
            rotateEven: "旋转偶数页面",
            rotateOdd: "旋转奇数页面",
            rotateSelected: "旋转所选页面",
            selectPages: "选择页面",
            rotateDirection: "旋转方向",
            clockwise90: "顺时针90°",
            clockwise180: "180°（上下颠倒）",
            counterClockwise90: "逆时针90°",
            apply: "应用旋转",
            reset: "重置所有",
            processing: "处理PDF中...",
            success: "PDF旋转成功！",
            error: "旋转PDF时出错",
            showSelector: "选择页面",
            hideSelector: "隐藏页面选择器"
        },
        faq: {
            title: "常见问题",
            permanent: {
                question: "旋转是永久的吗？",
                answer: "是的，旋转将永久应用于PDF。但是，您可以随时重新打开PDF并使用按钮将其旋转回原位。"
            },
            quality: {
                question: "旋转会影响PDF质量吗？",
                answer: "不会，我们的在线工具保留了您的PDF的原始质量。由于我们只更改了所选页面的方向而没有重新压缩内容，因此图像或文本质量不会受到影响。"
            },
            size: {
                question: "旋转会改变我的文件大小吗？",
                answer: "旋转页面通常对文件大小影响很小。由于更新的元数据，文件大小可能会略有变化，但您的页面范围内容保持不变。"
            },
            limitations: {
                question: "旋转有限制吗？",
                answer: "您可以使用我们的免费计划旋转大小为100MB的文件。对于更大的文件，请考虑升级到我们的高级计划。此外，旋转工具为所选页面提供标准角度（90°、180°、270°），而不是任意角度。"
            },
            secured: {
                question: "旋转过程中我的文件安全吗？",
                answer: "是的，所有文件都在我们的服务器上安全处理，并在处理后自动删除。选择要旋转的PDF时，我们不会与第三方共享或保留您的文档。"
            }
        },
        bestPractices: {
            title: "PDF旋转的最佳实践",
            dosList: [
                "在下载最终版本之前，使用页面缩略图预览文档",
                "使用旋转工具将倒置页面旋转180°",
                "如果整个文档或页面范围存在相同的方向问题，请一次旋转所有页面",
                "在旋转之前将原始文件另存为备份",
                "旋转后检查所有选定页面，确保方向正确"
            ],
            dontsList: [
                "不要在未解锁的情况下旋转受密码保护的PDF",
                "如果一致性很重要，不要在同一文档中混合使用90°和270°旋转",
                "不要假设所有页面都需要相同的旋转 - 检查每个页面缩略图",
                "如果需要保持表单字段的功能，请勿旋转表单字段",
                "如果PDF已经正确定向，请勿旋转"
            ],
            dos: "建议",
            donts: "不建议"
        },
        relatedTools: {
            title: "相关工具",
            compress: "压缩PDF",
            merge: "合并PDF",
            split: "拆分PDF",
            edit: "编辑PDF",
            viewAll: "查看所有工具"
        },
        messages: {
            selectAll: "全选",
            downloading: "准备下载中...",
            rotationApplied: "已将旋转应用于{count}页",
            dragDrop: "拖放以重新排列页面",
            pageOf: "第{current}页，共{total}页",
            selectPageInfo: "点击页面缩略图选择要旋转的页面"
        }
    },
    pageNumber: {
        title: "为PDF添加页面编号",
        shortDescription: "轻松为您的PDF文档添加可定制的页面编号",
        description: "使用我们的在线工具，以多种数字格式、位置和样式为PDF添加自定义页面编号",

        uploadTitle: "上传您的PDF",
        uploadDesc: "上传PDF文件以添加页面编号或页眉。您的文件将安全处理，与任何操作系统兼容。",

        messages: {
            noFile: "请先上传PDF文件",
            success: "页面编号添加成功！",
            error: "添加页面编号时出错",
            processing: "正在处理您的PDF..."
        },
        ui: {
            browse: "浏览文件",
            filesSecurity: "您的文件安全且不会被永久存储",
            error: "文件类型无效。请上传PDF。",
            cancel: "取消",
            addPageNumbers: "添加页码",
            processingProgress: "处理中... ({progress}%)",
            successTitle: "页码添加成功",
            successDesc: "您的PDF已处理完成，可以下载",
            readyMessage: "您的PDF已准备就绪！",
            readyDesc: "您的PDF文件已处理完成，并根据您的设置添加了页码。",
            download: "下载PDF",
            processAnother: "处理另一个PDF",
            settingsTitle: "页码设置",
            numberFormat: "数字格式",
            position: "位置",
            topLeft: "左上",
            topCenter: "上中",
            topRight: "右上",
            bottomLeft: "左下",
            bottomCenter: "下中",
            bottomRight: "右下",
            fontFamily: "字体",
            fontSize: "字体大小",
            color: "颜色",
            startFrom: "起始页码",
            prefix: "前缀",
            suffix: "后缀",
            horizontalMargin: "水平边距 (px)",
            pagesToNumber: "需要编号的页面",
            pagesHint: "留空为所有页面",
            pagesExample: "使用逗号分隔单个页面，使用连字符表示范围 (例如: 1,3,5-10)",
            skipFirstPage: "跳过第一页 (例如: 封面)",
            preview: "预览:",
            pagePreview: "页面预览"
        },
        howTo: {
            title: "如何添加页面编号",
            step1: {
                title: "上传您的PDF",
                description: "选择您想为页面编号的PDF文件"
            },
            step2: {
                title: "自定义页面编号",
                description: "选择数字格式、页面范围、位置、字体和其他设置以编辑PDF"
            },
            step3: {
                title: "下载您的PDF",
                description: "使用我们的在线工具处理并下载添加了页面编号的PDF"
            }
        },

        benefits: {
            title: "添加页面编号的好处",
            navigation: {
                title: "改进导航",
                description: "通过任何页面范围内清晰可见的页面编号，使文档导航更轻松"
            },
            professional: {
                title: "专业文档",
                description: "为您的法律或商业文档赋予正确格式化的编号，展现专业外观"
            },
            organization: {
                title: "更好的组织",
                description: "跟踪大文档中的页面，并通过添加的编号轻松引用特定页面"
            },
            customization: {
                title: "完全自定义",
                description: "自定义页面编号的外观和位置，或添加页眉以匹配您的文档风格"
            }
        },

        useCases: {
            title: "常见使用场景",
            books: {
                title: "书籍和电子书",
                description: "轻松为您的书籍、电子书或报告添加适当的页面编号，以提高可读性和引用"
            },
            academic: {
                title: "学术论文",
                description: "根据学术标准为论文、学位论文和研究论文添加页面编号，提供灵活的格式选项"
            },
            business: {
                title: "商业文档",
                description: "为提案、报告和商业计划添加专业页面编号，无需Adobe Acrobat Pro"
            },
            legal: {
                title: "法律文档",
                description: "为合同和法律文件应用一致的页面编号，确保适当引用"
            }
        },

        faq: {
            title: "常见问题",
            formats: {
                question: "有哪些数字格式可用？",
                answer: "我们的在线工具支持多种格式：数字（1、2、3）、罗马数字（I、II、III）和字母（A、B、C）。选择适合您需求的格式。"
            },
            customize: {
                question: "我可以自定义页面编号的外观吗？",
                answer: "是的，您可以完全自定义页面编号，添加前缀（例如“第”）、后缀（例如“/10”），选择字体、大小、颜色，并将其放置在页面上的任何位置。"
            },
            skipPages: {
                question: "添加页面编号时可以跳过某些页面吗？",
                answer: "当然可以！您可以指定页面范围以选择性编号，或轻松跳过第一页（例如封面）。"
            },
            startNumber: {
                question: "我可以从特定数字开始页面编号吗？",
                answer: "是的，您可以设置序列的起始编号，非常适合从其他文档继续或有独特编号需求的文档。"
            },
            security: {
                question: "我上传的PDF安全吗？",
                answer: "是的，所有处理都是安全的。您的文件在传输中加密，处理后自动删除—没有永久存储或除添加编号外的访问。"
            }
        },

        relatedTools: {
            title: "相关工具"
        }
    }

}