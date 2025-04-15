/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
  metadata: {
    title: "ScanPro - Free PDF Converter, Editor, OCR & Unlock PDF",
    template: "%s | ScanPro - PDF Tools",
    description: "Convert JPG to PDF, edit, unlock, compress, merge, split & OCR PDFs with ScanPro. Free, fast online tools for image files & multiple images—no downloads needed.",
    keywords: "PDF converter, PDF editor, OCR online, unlock PDF, compress PDF, merge PDF, split PDF, free PDF tools, online PDF editor, convert JPG to PDF, JPG file to PDF, online JPG to PDF, free JPG to PDF converter, convert JPGs to PDFs, image files, image format, multiple images, convert your images, file format, uploading file, operating system, drag and drop, converting multiple, image quality, files are automatically deleted, ScanPro"
  },
  nav: {
    tools: "Tools",
    company: "Company",
    pricing: "Api Pricing",
    convertPdf: "Convert PDF",
    convertPdfDesc: "Transform PDFs to and from other formats",
    selectLanguage: "Select Language",
    downloadApp: "Download App",
    getApp: "Get our mobile app for on-the-go PDF tools",
    appStores: "Get ScanPro App",
    mobileTools: "PDF tools on the go",
    signIn: "Sign in",
    signUp: "Sign up",
    signOut: "Sign out",
    dashboard: "Dashboard",
    profile: "Profile",
    account: "Account"

  },
  auth: {
    // Login
    email: "Email",
    emailPlaceholder: "name@example.com",
    password: "Password",
    passwordPlaceholder: "Your password",
    confirmPassword: "Confirm Password",
    confirmPasswordPlaceholder: "Confirm your password",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
    signIn: "Sign In",
    signingIn: "Signing in...",
    orContinueWith: "Or continue with",
    dontHaveAccount: "Don't have an account?",
    signUp: "Sign up",
    loginSuccess: "Signed in successfully",
    loginError: "An error occurred. Please try again.",
    invalidCredentials: "Invalid email or password",
    emailRequired: "Email is required",
    passwordRequired: "Password is required",
    invalidEmail: "Please enter a valid email address",
    validatingToken: "Validating your reset link...",
    invalidToken: "This password reset link is invalid or has expired. Please request a new one.",
    requestNewLink: "Request a new reset link",
    resetPasswordError: "Failed to reset password",
    passwordResetSuccess: "Password reset successful",
    passwordResetSuccessMessage: "Your password has been reset successfully. You will be redirected to the login page shortly.",
    passwordResetSuccessSubtext: "If you're not redirected automatically, click the button below.",
    resettingPassword: "Resetting password...",
    resetPassword: "Reset Password",
    backToLogin: "Back to login",
    unknownError: "An error occurred",
    name: "Name",
    namePlaceholder: "Your name",
    createAccount: "Create Account",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    nameRequired: "Name is required",
    passwordLength: "Password must be at least 8 characters",
    passwordStrength: "Password strength",
    passwordWeak: "Weak",
    passwordFair: "Fair",
    passwordGood: "Good",
    passwordStrong: "Strong",
    passwordsDoNotMatch: "Passwords do not match",
    agreeTerms: "I agree to the",
    termsOfService: "terms of service",
    and: "and",
    privacyPolicy: "privacy policy",
    agreeToTerms: "Please agree to the terms of service",
    registrationFailed: "Registration failed",
    accountCreated: "Account created successfully",

    forgotInstructions: "Enter your email and we'll send you instructions to reset your password.",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    resetEmailSent: "Password reset email sent",
    checkYourEmail: "Check your email",
    resetInstructions: "If an account exists with that email, we've sent instructions to reset your password.",
    didntReceiveEmail: "Didn't receive an email?",
    tryAgain: "Try again"
  },

  // Dashboard
  dashboard: {
    title: "Dashboard",
    overview: "Overview",
    apiKeys: "API Keys",
    subscription: "Subscription",
    profile: "Profile",
    totalUsage: "Total Usage",
    operations: "operations this month",
    active: "Active",
    inactive: "Inactive",
    keysAllowed: "keys allowed",
    mostUsed: "Most Used",
    of: "of",
    files: "files",
    usageByOperation: "Usage by Operation",
    apiUsageBreakdown: "Your API usage breakdown for the current month",
    noData: "No data available",
    createApiKey: "Create API Key",
    revokeApiKey: "Revoke API Key",
    confirmRevoke: "Are you sure you want to revoke this API key? This action cannot be undone.",
    keyRevoked: "API key revoked successfully",
    noApiKeys: "No API Keys",
    noApiKeysDesc: "You haven't created any API keys yet.",
    createFirstApiKey: "Create Your First API Key",
    keyName: "Key Name",
    keyNamePlaceholder: "My API Key",
    keyNameDesc: "Give your key a descriptive name to easily identify it later.",
    permissions: "Permissions",
    generateKey: "Generate Key",
    newApiKeyCreated: "New API Key Created",
    copyKeyDesc: "Copy this key now. For security reasons, you won't be able to see it again!",
    copyAndClose: "Copy and Close",
    keyCopied: "API key copied to clipboard",
    lastUsed: "Last used",
    never: "Never"
  },

  // Subscription
  subscription: {
    currentPlan: "Current Plan",
    subscriptionDetails: "Your subscription details and usage limits",
    plan: "Plan",
    free: "Free",
    basic: "Basic",
    pro: "Pro",
    enterprise: "Enterprise",
    renewsOn: "Your subscription renews on",
    cancelSubscription: "Cancel Subscription",
    changePlan: "Change Plan",
    upgrade: "Upgrade",
    downgrade: "Downgrade",
    features: "Features",
    limitations: "Limitations",
    confirm: "Confirm",
    cancel: "Cancel",
    subscriptionCanceled: "Subscription canceled successfully",
    upgradeSuccess: "Subscription upgraded successfully",
    pricingPlans: "Pricing Plans",
    monthly: "month",
    operationsPerMonth: "operations per month",
    requestsPerHour: "requests per hour",
    apiKey: "API key",
    apiKeys: "API keys",
    basicPdf: "Basic PDF operations",
    allPdf: "All PDF operations",
    basicOcr: "Basic OCR",
    advancedOcr: "Advanced OCR",
    prioritySupport: "Priority support",
    customWatermarks: "Custom watermarks",
    noWatermarking: "No watermarking",
    limitedOcr: "Limited OCR",
    noPrioritySupport: "No priority support",
    dedicatedSupport: "Dedicated support",
    customIntegration: "Custom integration help",
    whiteLabel: "White-label options"
  },
  profile: {
    // Personal Information
    personalInfo: 'Personal Information',
    updatePersonalInfo: 'Update your personal information',
    name: 'Name',
    namePlaceholder: 'Enter your full name',
    email: 'Email',
    emailUnchangeable: 'Email cannot be changed',
    memberSince: 'Member Since',
    updateProfile: 'Update Profile',
    updating: 'Updating...',
    updateSuccess: 'Profile updated successfully',
    updateFailed: 'Failed to update profile',
    updateError: 'An error occurred while updating your profile',

    // Password Management
    changePassword: 'Change Password',
    updatePasswordDesc: 'Update your account password',
    currentPassword: 'Current Password',
    currentPasswordPlaceholder: 'Enter your current password',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter a new password',
    confirmPassword: 'Confirm New Password',
    confirmPasswordPlaceholder: 'Confirm your new password',
    changingPassword: 'Changing Password...',
    passwordUpdateSuccess: 'Password updated successfully',
    passwordUpdateFailed: 'Failed to update password',
    passwordUpdateError: 'An error occurred while updating your password',

    // Password Validation
    passwordWeak: 'Weak',
    passwordFair: 'Fair',
    passwordGood: 'Good',
    passwordStrong: 'Strong',
    passwordMismatch: 'New passwords do not match',
    passwordLength: 'Password must be at least 8 characters',
    passwordStrength: 'Password Strength',
    passwordTips: 'For security, choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.'
  },
  // Hero section
  hero: {
    badge: "Powerful PDF Tools",
    title: "All-in-One PDF Converter & Editor",
    description: "Free online PDF tools to convert, compress, merge, split, rotate, watermark and more. No installation required.",
    btConvert: "Start Converting",
    btTools: "Explore All Tools"
  },

  popular: {
    pdfToWord: "PDF to Word",
    pdfToWordDesc: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    pdfToExcel: "PDF to Excel",
    pdfToExcelDesc: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    pdfToPowerPoint: "PDF to PowerPoint",
    pdfToPowerPointDesc: "Transform your PDF presentations into editable PowerPoint slides.",
    pdfToJpg: "PDF to JPG",
    pdfToJpgDesc: "Convert PDF pages to JPG images or extract all images from a PDF.",
    pdfToPng: "PDF to PNG",
    pdfToPngDesc: "Convert PDF pages to transparent PNG images with high quality.",
    pdfToHtml: "PDF to HTML",
    pdfToHtmlDesc: "Transform PDF documents into web-friendly HTML format.",
    wordToPdf: "Word to PDF",
    wordToPdfDesc: "Convert Word documents to PDF with perfect formatting and layout.",
    excelToPdf: "Excel to PDF",
    excelToPdfDesc: "Turn your Excel spreadsheets into perfectly formatted PDF documents.",
    powerPointToPdf: "PowerPoint to PDF",
    powerPointToPdfDesc: "Convert PowerPoint presentations to PDF for easy sharing.",
    jpgToPdf: "JPG to PDF",
    jpgToPdfDesc: "Create PDF files from your JPG images with customizable options.",
    pngToPdf: "PNG to PDF",
    pngToPdfDesc: "Convert PNG images to PDF with transparent background support.",
    htmlToPdf: "HTML to PDF",
    htmlToPdfDesc: "Convert webpages and HTML content to PDF documents.",
    mergePdf: "Merge PDF",
    mergePdfDesc: "Combine PDFs in the order you want with the easiest PDF merger available.",
    splitPdf: "Split PDF",
    splitPdfDesc: "Extract specific pages or split PDF into multiple documents.",
    compressPdf: "Compress PDF",
    compressPdfDesc: "Reduce file size while optimizing for maximal PDF quality.",
    rotatePdf: "Rotate PDF",
    rotatePdfDesc: "Change page orientation by rotating PDF pages as needed.",
    watermark: "Add Watermark",
    watermarkDesc: "Add text or image watermarks to protect and brand your PDF documents.",
    unlockPdf: "Unlock PDF",
    unlockPdfDesc: "Remove password protection and restrictions from PDF files.",
    protectPdf: "Protect PDF",
    protectPdfDesc: "Add password protection to secure your PDF documents.",
    signPdf: "Sign PDF",
    signPdfDesc: "Add digital signatures to your PDF documents securely.",
    ocr: "OCR",
    ocrDesc: "Extract text from scanned documents using Optical Character Recognition.",
    editPdf: "Edit PDF",
    editPdfDesc: "Make changes to text, images and pages in your PDF documents.",
    redactPdf: "Redact PDF",
    redactPdfDesc: "Permanently remove sensitive information from your PDF files.",
    viewAll: "View All PDF Tools"
  },

  // Converter section
  converter: {
    title: "Start Converting",
    description: "Upload your PDF and select the format you want to convert to",
    tabUpload: "Upload & Convert",
    tabApi: "API Integration",
    apiTitle: "Integrate with our API",
    apiDesc: "Use our REST API to convert PDFs programmatically in your application",
    apiDocs: "View API Docs"
  },
  convert: {
    title: {
      pdfToWord: "Convert PDF to Word Online - Free PDF to DOC Converter Tool",
      pdfToExcel: "Convert PDF to Excel Online - Extract PDF Data to XLS",
      pdfToPowerPoint: "Convert PDF to PowerPoint - PDF to PPT Converter",
      pdfToJpg: "Convert PDF to JPG Image - High Quality PDF to JPEG",
      pdfToPng: "Convert PDF to PNG Online - PDF to Transparent PNG",
      pdfToHtml: "Convert PDF to HTML Web Page - PDF to HTML5 Converter",
      wordToPdf: "Convert Word to PDF Online - Free DOC to PDF Converter",
      excelToPdf: "Convert Excel to PDF - XLS to PDF Converter Tool",
      powerPointToPdf: "Convert PowerPoint to PDF Online - PPT to PDF",
      jpgToPdf: "Convert JPG to PDF Online - Image to PDF Creator",
      pngToPdf: "Convert PNG to PDF - Transparent Image to PDF Converter",
      htmlToPdf: "Convert HTML to PDF Online - Web Page to PDF Generator",
      generic: "File Converter Online - Convert Documents, Images & More"
    },
    description: {
      pdfToWord: "Transform PDF documents to editable Word files quickly and easily. Our free PDF to Word converter preserves formatting for DOC/DOCX output.",
      pdfToExcel: "Extract tables and data from PDF files into Excel spreadsheets. Convert PDF to XLS/XLSX with accurate data formatting for analysis.",
      pdfToPowerPoint: "Turn PDF presentations into editable PowerPoint slides. Our PDF to PPT converter maintains slide layouts and design elements.",
      pdfToJpg: "Convert PDF pages to high-quality JPG images. Extract images from PDF or save each page as JPEG for sharing online.",
      pdfToPng: "Convert PDF pages to transparent PNG images. Perfect for graphic designers needing PDF elements with transparent backgrounds.",
      pdfToHtml: "Convert PDF documents to HTML web pages. Create responsive HTML5 websites from PDF files with our advanced converter.",
      wordToPdf: "Convert Word documents to PDF format with perfect formatting. Free DOC/DOCX to PDF converter for professional results.",
      excelToPdf: "Transform Excel spreadsheets to PDF documents. Preserve formulas, charts and tables when converting XLS/XLSX to PDF.",
      powerPointToPdf: "Convert PowerPoint presentations to PDF format. PPT/PPTX to PDF converter maintains slide transitions and notes.",
      jpgToPdf: "Create PDF files from your JPG images. Combine multiple JPEG photos into a single PDF document online.",
      pngToPdf: "Create PDF files from your PNG images. Convert transparent PNG graphics to PDF while preserving transparency.",
      htmlToPdf: "Convert HTML web pages to PDF documents. Save websites as PDF with our online HTML to PDF generator tool.",
      generic: "Select a file to convert between formats. Free online document converter for PDF, Word, Excel, PowerPoint, JPG, PNG and HTML."
    },
    howTo: {
      title: "How to Convert {from} to {to} Online",
      step1: {
        title: "Upload File",
        description: "Upload the {from} file you want to convert from your computer, Google Drive or Dropbox"
      },
      step2: {
        title: "Convert Format",
        description: "Click the Convert button and our system will process your file with advanced conversion technology"
      },
      step3: {
        title: "Download Result",
        description: "Download your converted {to} file instantly or get a shareable link"
      }
    },
    options: {
      title: "Advanced Conversion Options",
      ocr: "Enable OCR (Optical Character Recognition)",
      ocrDescription: "Extract text from scanned documents or images for editable output",
      preserveLayout: "Preserve original layout",
      preserveLayoutDescription: "Maintain the original document's formatting and layout precisely",
      quality: "Output quality",
      qualityDescription: "Set the quality level for the converted file (affects file size)",
      qualityOptions: {
        low: "Low (smaller file size, faster processing)",
        medium: "Medium (balanced quality and size)",
        high: "High (best quality, larger files)"
      },
      pageOptions: "Page options",
      allPages: "All pages",
      selectedPages: "Selected pages",
      pageRangeDescription: "Enter page numbers and/or page ranges separated by commas",
      pageRangeExample: "Example: 1,3,5-12 (converts pages 1, 3, and 5 through 12)"
    },
    moreTools: "Related Document Conversion Tools",
    expertTips: {
      title: "Expert Conversion Tips",
      pdfToWord: {
        tips1: "For best PDF to Word results, ensure your PDF has clear, machine-readable text",
        tips2: "Enable OCR for scanned documents or image-based PDFs to extract editable text",
        tips3: "Complex layouts may require minor adjustments after conversion for perfect formatting"
      },
      pdfToExcel: {
        tips1: "Tables with clear borders convert more accurately from PDF to Excel",
        tips2: "Pre-process scanned PDFs with OCR for better data extraction to XLS/XLSX",
        tips3: "Check spreadsheet formulas after conversion as they may not transfer automatically"
      },
      generic: [
        "Higher quality settings result in larger file sizes but better output",
        "Use OCR for documents with scanned text or images containing text",
        "Always preview your file after conversion to ensure accuracy before downloading"
      ]
    },
    advantages: {
      title: "Benefits of Converting {from} to {to}",
      pdfToWord: [
        "Edit and modify text that was locked in PDF format with our DOC converter",
        "Update content without recreating the entire document from scratch",
        "Extract information for use in other Word documents or templates"
      ],
      pdfToExcel: [
        "Analyze and manipulate data that was in static PDF form using XLS tools",
        "Create charts and perform calculations with extracted spreadsheet data",
        "Easily update financial reports or numerical information in Excel format"
      ],
      wordToPdf: [
        "Create universally readable PDF documents that maintain perfect formatting",
        "Protect content from unwanted modifications with secure PDF output",
        "Ensure consistent document appearance across all devices and platforms"
      ],
      generic: [
        "Transform your document into a more useful and editable format",
        "Access and use content in programs that support the target file type",
        "Share files in formats that others can easily open without special software"
      ]
    }
  },
  features: {
    title: "Advanced PDF Tools & Features | ScanPro",
    description: "Explore ScanPro's comprehensive suite of PDF tools and features for document management, conversion, editing, unlock pdfs and more. Convert your files across various file formats like JPG to PDF and DOCX to PDF online for free.",

    hero: {
      title: "Advanced PDF Tools & Features",
      description: "Discover the comprehensive suite of tools and features that make ScanPro the ultimate solution for all your document management needs, including drag and drop uploading and converting multiple image files to PDF format across any operating system."
    },

    overview: {
      power: {
        title: "Powerful Processing",
        description: "Advanced algorithms ensure high-quality document processing and conversion, including image files to PDF format with exceptional image quality and accuracy."
      },
      security: {
        title: "Bank-Level Security",
        description: "Your documents, including uploaded JPG files to PDF, are protected with 256-bit SSL encryption and files are automatically deleted after processing."
      },
      accessibility: {
        title: "Universal Accessibility",
        description: "Access your documents and our tools from any device or operating system with full cross-platform compatibility, including web browsers."
      }
    },

    allFeatures: {
      title: "All Features"
    },

    learnMore: "Learn More",

    categories: {
      conversion: {
        title: "PDF Conversion",
        description: "Convert PDFs to and from various file formats with high accuracy and formatting retention, including JPG to PDF and Word file to PDF.",
        features: {
          pdfToWord: {
            title: "PDF to Word Conversion",
            description: "Convert PDF files to editable Word documents with preserved formatting, tables, and images using Microsoft Word compatible output."
          },
          pdfToExcel: {
            title: "PDF to Excel Conversion",
            description: "Extract tables from PDFs into editable Excel spreadsheets with accurate data formatting."
          },
          pdfToImage: {
            title: "PDF to Image Conversion",
            description: "Convert PDF pages to high-quality JPG, PNG, or TIFF image formats with customizable resolution."
          },
          officeToPdf: {
            title: "Office to PDF Conversion",
            description: "Convert Word, Excel, PowerPoint files to PDF format with preserved layout and formatting, including DOCX files to PDF and Microsoft Office support."
          }
        }
      },

      editing: {
        title: "PDF Editing & Management",
        description: "Online pdf editor, organize, and optimize your PDF documents with our comprehensive toolset, including options to save as PDF and manage multiple images.",
        features: {
          merge: {
            title: "Merge PDFs",
            description: "Combine multiple PDF files or image files into a single document with customizable page ordering using drag and drop."
          },
          split: {
            title: "Split PDFs",
            description: "Divide large PDFs into smaller documents by page ranges or extract specific pages."
          },
          compress: {
            title: "Compress PDFs",
            description: "Reduce PDF file size while maintaining quality for easier sharing and storage."
          },
          watermark: {
            title: "Add Watermarks",
            description: "Add text or image watermarks to your PDFs with customizable transparency, position, and rotation."
          }
        }
      },

      security: {
        title: "PDF Security & Protection",
        description: "Secure your PDF documents with encryption, password protection, and digital signatures; files are automatically deleted after processing.",
        features: {
          protect: {
            title: "Password Protection",
            description: "Encrypt PDFs by entering the password you choose to control access and prevent unauthorized viewing."
          },
          unlock: {
            title: "PDF Unlocking",
            description: "Use our unlock tool to remove PDF passwords and open the PDF where you have authorized access."
          },
          signature: {
            title: "Digital Signatures",
            description: "Add digital signatures to PDFs for document authentication and verification."
          },
          redaction: {
            title: "PDF Redaction",
            description: "Permanently remove sensitive information from PDF documents."
          }
        }
      },

      ocr: {
        title: "OCR Technology",
        description: "Extract text from scanned documents and image files using our advanced OCR technology, perfect for converting JPGs to PDFs.",
        features: {
          textExtraction: {
            title: "Text Extraction",
            description: "Extract text from scanned PDFs and images with high accuracy and language support."
          },
          searchable: {
            title: "Searchable PDFs",
            description: "Convert scanned documents into searchable PDFs with text recognition."
          },
          multilingual: {
            title: "Multilingual Support",
            description: "OCR support for over 100 languages including non-Latin scripts and special characters."
          },
          batchProcessing: {
            title: "Batch Processing",
            description: "Process multiple documents or image files at once with our efficient batch OCR capabilities."
          }
        }
      },

      api: {
        title: "API & Integration",
        description: "Integrate our PDF processing capabilities into your applications with our robust API, supporting various file formats and online tools.",
        features: {
          restful: {
            title: "RESTful API",
            description: "Simple and powerful RESTful API for PDF processing and document management."
          },
          sdks: {
            title: "SDKs & Libraries",
            description: "Developer-friendly SDKs for various programming languages including JavaScript, Python, and PHP."
          },
          webhooks: {
            title: "Webhooks",
            description: "Real-time event notifications for asynchronous PDF processing workflows."
          },
          customization: {
            title: "API Customization",
            description: "Tailor the API to your specific needs with customizable endpoints and parameters."
          }
        }
      },

      cloud: {
        title: "Cloud Platform",
        description: "Access your documents from anywhere with our secure cloud storage and processing platform, supporting uploading files and saving as PDF.",
        features: {
          storage: {
            title: "Cloud Storage",
            description: "Securely store and access your documents from anywhere with our encrypted cloud storage."
          },
          sync: {
            title: "Cross-Device Sync",
            description: "Seamlessly sync your documents across all your devices and operating systems for access on the go."
          },
          sharing: {
            title: "Document Sharing",
            description: "Easily share documents with secure links and permission controls."
          },
          history: {
            title: "Version History",
            description: "Track document changes with version history and restore previous versions when needed."
          }
        }
      },

      enterprise: {
        title: "Enterprise Features",
        description: "Advanced features designed for business and enterprise requirements, including converting multiple files and custom workflows.",
        features: {
          batch: {
            title: "Batch Processing",
            description: "Process hundreds of documents or image files simultaneously with our efficient batch processing system."
          },
          workflow: {
            title: "Custom Workflows",
            description: "Create automated document processing workflows tailored to your business needs."
          },
          compliance: {
            title: "Compliance & Audit",
            description: "Enhanced security features for GDPR, HIPAA, and other regulatory compliance."
          },
          analytics: {
            title: "Usage Analytics",
            description: "Detailed insights into document processing activities and user operations."
          }
        }
      }
    },

    mobile: {
      title: "ScanPro Mobile App",
      description: "Take ScanPro's powerful PDF tools with you on the go. Our mobile app offers the same robust functionality in a convenient, mobile-friendly interface, including JPG file to PDF conversion.",
      feature1: {
        title: "Scan & Digitize Documents",
        description: "Use your camera to scan physical documents and convert them to high-quality PDFs instantly with our free JPG to PDF converter."
      },
      feature2: {
        title: "Edit PDFs On the Go",
        description: "Edit, annotate, and sign PDF documents from your smartphone or tablet with ease."
      },
      feature3: {
        title: "Cloud Synchronization",
        description: "Seamlessly sync your documents across all your devices with secure cloud storage."
      }
    },

    comparison: {
      title: "Feature Comparison",
      description: "Compare our different plans to find the one that best suits your needs.",
      feature: "Feature",
      free: "Free",
      basic: "Basic",
      pro: "Pro",
      enterprise: "Enterprise",
      features: {
        convert: "PDF Conversion",
        merge: "Merge & Split",
        compress: "Compression",
        ocr: "OCR Basic",
        advancedOcr: "Advanced OCR",
        watermark: "Watermarking",
        protect: "Password Protection",
        api: "API Access",
        batch: "Batch Processing",
        priority: "Priority Support",
        customWorkflow: "Custom Workflows",
        whiteLabel: "White Labeling",
        dedicated: "Dedicated Support"
      }
    },

    testimonials: {
      title: "What Our Users Say",
      quote1: "ScanPro has revolutionized the way our team handles documents. The OCR functionality is incredibly accurate, and the batch processing saves us hours every week.",
      name1: "Sarah Johnson",
      title1: "Operations Manager",
      quote2: "The API integration was seamless. We've integrated ScanPro into our workflow and the difference in efficiency is night and day. Their support team is also top-notch.",
      name2: "David Chen",
      title2: "Tech Lead",
      quote3: "As a small business owner, the affordable pricing and comprehensive toolset make ScanPro an incredible value. I especially love the mobile app which lets me handle documents on the go.",
      name3: "Maria Garcia",
      title3: "Business Owner"
    },

    cta: {
      title: "Ready to Transform Your Document Workflow?",
      description: "Join thousands of satisfied users who have streamlined their document management with ScanPro’s online tools, including our PDF converter for multiple file formats.",
      pricing: "View Pricing",
      explore: "Explore Tools"
    }

  },

  // CTA section
  cta: {
    title: "Ready to Convert?",
    description: "Transform your PDFs into any format you need, completely free.",
    startConverting: "Start Converting",
    exploreTools: "Explore All Tools",
    contactSales: "Contact Sales"
  },

  // PDF Tools Page
  pdfTools: {
    title: "All PDF Tools",
    description: "Everything you need to work with PDFs in one place",
    keywords: "PDF converter, PDF editor, convert from PDF, convert to PDF, organize PDF, PDF security, free PDF tools, online PDF utilities, pdfTools",
    categories: {
      convertFromPdf: "Convert from PDF",
      convertToPdf: "Convert to PDF",
      basicTools: "Basic Tools",
      organizePdf: "Organize PDF",
      pdfSecurity: "PDF Security"
    }
  },

  // Tool Descriptions
  toolDescriptions: {
    pdfToWord: "Easily convert your PDF files into easy to edit DOC and DOCX documents.",
    pdfToPowerpoint: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    pdfToExcel: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    pdfToJpg: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    pdfToPng: "Convert each PDF page into a PNG or extract all images contained in a PDF.",
    pdfToHtml: "Convert webpages in HTML to PDF. Copy and paste the URL of the page.",
    wordToPdf: "Make DOC and DOCX files easy to read by converting them to PDF.",
    powerpointToPdf: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    excelToPdf: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    jpgToPdf: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    pngToPdf: "Convert PNG images to PDF in seconds. Easily adjust orientation and margins.",
    htmlToPdf: "Convert webpages to PDF. Copy and paste the URL to convert it to PDF.",
    mergePdf: "Combine PDFs in the order you want with the easiest PDF merger available.",
    splitPdf: "Split PDF files into multiple documents or extract specific pages from your PDF.",
    compressPdf: "Reduce file size while optimizing for maximal PDF quality.",
    rotatePdf: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    watermark: "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    unlockPdf: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    protectPdf: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    ocr: "Extract text from scanned documents using Optical Character Recognition."
  },
  splitPdf: {
    title: "Split PDF - Separate PDF Pages Online",
    description: "Easily split PDF files into multiple documents, delete pages, or extract specific pages with our free PDF splitter tool online",
    howTo: {
      title: "How to Split PDF Files Online",
      step1: {
        title: "Upload Your PDF",
        description: "File and click to upload the PDF you want to split, delete pages from, or extract pages from using our drag-and-drop feature"
      },
      step2: {
        title: "Select Pages to Split",
        description: "Choose your split method: select pages by range, separate PDF pages individually, or split PDFs into multiple files every N pages"
      },
      step3: {
        title: "Download Split Files",
        description: "Download your split PDF files or separated pages as individual documents instantly"
      }
    },
    options: {
      splitMethod: "Choose Your Split Method",
      byRange: "Split by Page Ranges",
      extractAll: "Extract All Pages as Separate PDFs",
      everyNPages: "Split Every N Pages",
      everyNPagesNumber: "Number of Pages per File",
      everyNPagesHint: "Each output file will contain this many pages",
      pageRanges: "Page Ranges",
      pageRangesHint: "Enter page ranges separated by commas (e.g., 1-5, 8, 11-13) to create multiple PDF files"
    },
    splitting: "Splitting PDF...",
    splitDocument: "Split Document",
    splitSuccess: "PDF Successfully Split!",
    splitSuccessDesc: "Your PDF has been split into {count} separate files",
    results: {
      title: "Split PDF Results",
      part: "Part",
      pages: "Pages",
      pagesCount: "pages"
    },
    faq: {
      title: "Frequently Asked Questions About Splitting PDFs",
      q1: {
        question: "What happens to my PDF files after splitting?",
        answer: "All uploaded and generated files are automatically deleted from our servers after 24 hours for your privacy and security."
      },
      q2: {
        question: "Is there a limit to how many pages I can split?",
        answer: "The free version supports PDFs up to 100 pages. Upgrade to our premium plan for larger files or unlimited splitting."
      },
      q3: {
        question: "Can I delete pages or extract specific pages from a PDF?",
        answer: "Yes, use the 'Split by page ranges' option to delete pages or extract specific sections from your PDF online."
      },
      q4: {
        question: "Can I reorder pages while splitting?",
        answer: "Currently, page order is preserved during splitting. Use our PDF Merger tool with drag-and-drop to reorder pages after splitting."
      }
    },
    useCases: {
      title: "Popular Uses for Our PDF Splitter Tool",
      chapters: {
        title: "Separate PDF Pages by Chapters",
        description: "Split large books or reports into individual chapters for easier sharing and navigation"
      },
      extract: {
        title: "Extract Pages from PDF",
        description: "Select pages like forms or certificates to extract from longer documents with a simple file and click"
      },
      remove: {
        title: "Delete Pages from PDF",
        description: "Remove unwanted pages like ads or blanks by selecting pages to keep and splitting accordingly"
      },
      size: {
        title: "Split PDFs into Multiple Files for Size Reduction",
        description: "Break large PDFs into smaller files for easier emailing or messaging with our online PDF splitter"
      }
    },
    newSection: {
      title: "Why Use Our Online PDF Splitter?",
      description: "Our PDF splitter lets you separate PDF pages, delete pages, and split PDFs into multiple files quickly and securely. Enjoy drag-and-drop simplicity, select pages with precision, and manage your documents online without software downloads.",
      additional: "Whether you need to separate PDF pages for a project, delete pages you don’t want, or split PDFs into multiple files for easier sharing, our online PDF splitter is the perfect tool. With a user-friendly drag-and-drop interface, you can upload your file and click to select pages effortlessly. Our service is fast, secure, and free—ideal for managing PDF documents online without installing software. Split large PDFs, extract specific pages, or reduce file sizes in just a few clicks!"
    },
    seoContent: {

      title: "Master Your PDF Management with Our PDF Splitter",

      p1: "Need a hassle-free way to split PDFs into multiple files or pull out specific pages online? Our PDF splitter tool is built to take the stress out of document management. Whether you’re a student, a busy professional, or just organizing personal files, you can delete pages, pick the ones you want, and break down big PDFs in a snap. Drag your file into the uploader, click to pick your split style—page ranges, single pages, or every few pages—and you’re set. It’s one of the handiest online PDF splitters you’ll find today.",

      p2: "Splitting PDFs doesn’t get simpler than this. Want to grab one page from a huge report? Tired of blank sheets or ads cluttering things up? Our tool lets you pinpoint exactly which pages to keep and turn them into separate files or smaller batches. It’s all online—no downloads needed. With our PDF splitter, you can turn a clunky document into neat, manageable chunks, ready for emailing, storing, or sharing without file size headaches.",

      p3: "Our online PDF splitter shines with its easy layout and robust options. Break a textbook into chapters or slice a lengthy contract into key parts without any fuss. The drag-and-drop feature keeps it smooth—just drop your file in and click to kick things off. You can even preview your PDF to choose pages spot-on before splitting. And the best part? It’s free for files up to 100 pages, so anyone can jump in and get started.",

      p4: "Why pick our PDF splitter? It’s quick, safe, and loaded with flexibility. Pull out pages for a presentation, ditch extras to clean up a document, or split PDFs into multiple files for better order—all from your browser. We’ve tuned it to show up for searches like ‘split PDF online,’ ‘delete pages,’ and ‘separate PDF pages,’ so you’ll find us right when you need us. Give it a try today and see how smooth PDF management can be!"

    },
    relatedTools: "Related Tools",
    popular: {
      viewAll: "View All Tools"
    }
  },
  // Merge PDF Page
  mergePdf: {
    title: "Merge PDF Files Online | Free Web Browser PDF Merging Tool",
    description: "Combine multiple PDF files into a single document quickly and easily with our browser-based merging tool that works on all operating systems",
    intro: "Our online PDF merging tool allows you to combine multiple documents into one merged file with just a few clicks. No installation required - works directly in your web browser on any operating system.",

    // How-to section
    howTo: {
      title: "How to Merge PDF Files in Your Browser",
      step1: {
        title: "Upload Files",
        description: "Upload the PDF files you want to combine. Select multiple files at once from your device or drag & drop them directly into your web browser."
      },
      step2: {
        title: "Arrange Order",
        description: "Drag and drop to rearrange the files in the order you want them to appear in the final merged file. Our merging tool makes organizing multiple PDFs intuitive."
      },
      step3: {
        title: "Download",
        description: "Click the 'Merge PDFs' button and download your combined PDF file directly to your device from any web browser."
      }
    },

    // Benefits section
    benefits: {
      title: "Benefits of Our Online PDF Merger",
      compatibility: {
        title: "Works on All Devices",
        description: "Our web browser-based PDF merging tool functions perfectly on Windows, macOS, Linux, and mobile operating systems without requiring installation."
      },
      privacy: {
        title: "Secure & Private",
        description: "Your documents are processed in your web browser and automatically deleted after merging, ensuring your sensitive information stays private."
      },
      simplicity: {
        title: "User-Friendly Interface",
        description: "The intuitive drag-and-drop interface makes merging multiple PDF files simple, even for first-time users of our online tool."
      },
      quality: {
        title: "High-Quality Output",
        description: "Our merging tool preserves the original formatting, images, and text quality in your merged file, ensuring professional results."
      }
    },

    // Use cases section
    useCases: {
      title: "Common Uses for PDF Merging",
      business: {
        title: "Business Documents",
        description: "Combine financial reports, contracts, and presentations into comprehensive documentation for clients and stakeholders."
      },
      academic: {
        title: "Academic Papers",
        description: "Merge research papers, citations, and appendices into a complete academic submission ready for review."
      },
      personal: {
        title: "Personal Records",
        description: "Combine receipts, warranties, and instruction manuals into organized digital records for easy reference."
      },
      professional: {
        title: "Professional Portfolios",
        description: "Create impressive portfolios by merging multiple work samples into a single, easily shareable document."
      }
    },

    // FAQ section
    faq: {
      title: "Frequently Asked Questions",
      q1: {
        question: "Is there a limit to how many PDFs I can merge with your online tool?",
        answer: "With our free web browser-based merging tool, you can combine up to 20 PDF files at once. For merging multiple larger batches, consider upgrading to our premium plan that allows unlimited merging operations."
      },
      q2: {
        question: "Will my PDF files remain private when using your online merging tool?",
        answer: "Yes, your privacy is our priority. All files uploaded to our browser-based merging tool are processed securely and automatically deleted from our servers after processing. We never access or store your document contents."
      },
      q3: {
        question: "Can I merge password-protected PDFs using your online tool?",
        answer: "For password-protected PDFs, you'll need to unlock them first using our online Unlock PDF tool, and then merge them. Our browser-based merging tool will prompt you if it detects protected documents."
      },
      q4: {
        question: "Does your online PDF merging tool work on all operating systems?",
        answer: "Yes, our web browser-based PDF merging tool works on all major operating systems including Windows, macOS, Linux, iOS, and Android. As long as you have a modern web browser, you can merge PDFs without installing any software."
      },
      q5: {
        question: "How large can the PDF files be for merging?",
        answer: "Our free online merging tool supports files up to 100MB each. The combined size of all files being merged should not exceed 300MB for optimal performance in your web browser."
      },
      q6: {
        question: "Will the merged file maintain all the features of the original PDFs?",
        answer: "Yes, our advanced merging tool preserves text, images, formatting, hyperlinks, and most interactive elements from the original PDFs in your final merged file."
      }
    },

    // Tips section
    tips: {
      title: "Tips for Merging PDFs Effectively",
      tip1: {
        title: "Organize Before Merging",
        description: "Rename your files numerically (e.g., 01_intro.pdf, 02_content.pdf) before uploading to our merging tool for easier organization."
      },
      tip2: {
        title: "Optimize Large Files",
        description: "Use our Compress PDF tool first if you're merging multiple large documents to ensure better performance of the final merged file."
      },
      tip3: {
        title: "Check Preview",
        description: "After arranging your files, use the preview function in our online tool to verify the order before finalizing your merged PDF."
      },
      tip4: {
        title: "Consider Bookmarks",
        description: "For professional documents, consider adding bookmarks to your merged file using our Edit PDF tool for easier navigation."
      }
    },

    // Comparison section
    comparison: {
      title: "Why Choose Our Web Browser Merging Tool",
      point1: {
        title: "No Software Installation",
        description: "Unlike desktop applications, our online PDF merging tool works directly in your web browser without downloading or installing any software."
      },
      point2: {
        title: "Cross-Platform Compatibility",
        description: "Our browser-based tool works on all operating systems, while desktop alternatives often only support specific platforms."
      },
      point3: {
        title: "Free and Accessible",
        description: "Access our PDF merging capabilities at no cost, compared to expensive desktop alternatives or subscription services."
      },
      point4: {
        title: "Regular Updates",
        description: "Our online merging tool is constantly improved without requiring manual updates from users."
      }
    },

    // UI elements and messages
    ui: {
      of: "of",
      files: "files",
      filesToMerge: "Files to Merge",
      dragToReorder: "Drag to Reorder",
      downloadReady: "Download Ready",
      downloadMerged: "Download Merged File",
      mergePdfs: "Merge PDFs",
      processingMerge: "Merging your PDFs...",
      successMessage: "PDFs merged successfully!",
      dragDropHere: "Drag & drop PDFs here",
      or: "or",
      browseFiles: "Browse Files",
      fileLimit: "Combine up to 20 PDF files",
      noPdfsSelected: "No PDFs selected",
      addMoreFiles: "Add More Files",
      rearrangeMessage: "Drag files to rearrange the order in your merged PDF",
      removeFile: "Remove",
      filePreview: "Preview",
      startOver: "Start Over",
      mergingInProgress: "Merging in progress...",
      pleaseWait: "Please wait while we combine your PDF files",
      processingFile: "Processing",
      retry: "Retry Merging"
    },

    // Related tools
    relatedTools: "Explore More PDF Tools",
    viewAllTools: "View All PDF Tools"
  },

  // OCR Page
  ocr: {
    title: "OCR Extract: Text Recognition Made Simple",
    description: "Transform scanned PDFs and image files into editable text using advanced OCR software and machine learning technology",
    howTo: {
      title: "How OCR Extract Works",
      step1: {
        title: "Upload",
        description: "Upload your scanned PDF or image file to the image to text converter."
      },
      step2: {
        title: "Configure OCR Tool",
        description: "Choose the language, page range, and advanced settings for optimal text recognition."
      },
      step3: {
        title: "Extract Text",
        description: "Copy the extracted text or download it as a .txt file with our picture to text converter."
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      questions: {
        accuracy: {
          question: "How accurate is OCR extract technology?",
          answer: "Our OCR software achieves 90-99% accuracy for clear, printed text in high-quality scans. Accuracy may vary with poor image files, handwriting, or complex layouts."
        },
        languages: {
          question: "Which languages does the OCR tool support?",
          answer: "Over 100 languages are supported, including English, French, German, Spanish, Chinese, Japanese, Arabic, Russian, and more."
        },
        recognition: {
          question: "Why isn’t my text being recognized correctly?",
          answer: "Text recognition can be affected by low-quality image files, unusual fonts, handwriting, or incorrect language selection."
        },
        pageLimit: {
          question: "Is there a page limit for processing?",
          answer: "Free users can process up to 50 pages per PDF, while premium users can handle up to 500 pages with our image to text extractor."
        },
        security: {
          question: "Are my files safe during OCR processing?",
          answer: "Yes, our OCR tool uses secure servers, and all uploaded image files are deleted after processing."
        }
      }
    },
    relatedTools: "Related OCR and PDF Tools",
    processing: {
      title: "Processing with OCR Software",
      message: "Text recognition may take a few minutes depending on file size and complexity"
    },
    results: {
      title: "Extracted Text Results",
      copy: "Copy",
      download: "Download .txt"
    },
    languages: {
      english: "English",
      french: "French",
      german: "German",
      spanish: "Spanish",
      chinese: "Chinese",
      japanese: "Japanese",
      arabic: "Arabic",
      russian: "Russian"
    },
    whatIsOcr: {
      title: "What Is OCR Extract?",
      description: "OCR (Optical Character Recognition) is a machine learning-powered technology that converts scanned documents, PDFs, and image files into editable, searchable text.",
      explanation: "The image to text converter analyzes image files, identifies text patterns, and transforms them into a machine-readable format.",
      extractionList: {
        scannedPdfs: "Scanned PDFs where text is an image",
        imageOnlyPdfs: "Image-only PDFs without a text layer",
        embeddedImages: "PDFs with text in embedded images",
        textCopyingIssues: "Documents where copying text directly fails"
      }
    },
    whenToUse: {
      title: "When to Use an Image to Text Extractor",
      idealFor: "Ideal for:",
      idealForList: {
        scannedDocuments: "Scanned documents saved as PDFs",
        oldDocuments: "Old paper records without digital text",
        textSelectionIssues: "PDFs where text can’t be selected or copied",
        textInImages: "Image files with text to extract",
        searchableArchives: "Building searchable archives from scans"
      },
      notNecessaryFor: "Not necessary for:",
      notNecessaryForList: {
        digitalPdfs: "Native digital PDFs with selectable text",
        createdDigitally: "PDFs made from digital sources",
        copyPasteAvailable: "Documents where copy-paste already works",
        formatPreservation: "Files needing layout preservation (try PDF to DOCX instead)"
      }
    },
    limitations: {
      title: "OCR Tool Limitations & Tips",
      description: "Our OCR software is advanced, but some limitations exist:",
      factorsAffecting: "Factors affecting text recognition:",
      factorsList: {
        documentQuality: "Image file quality (resolution, contrast)",
        complexLayouts: "Complex layouts or formatting",
        handwrittenText: "Handwritten text (limited support)",
        specialCharacters: "Special characters or symbols",
        multipleLanguages: "Multiple languages in one file"
      },
      tipsForBest: "Tips for best results:",
      tipsList: {
        highQualityScans: "Use high-quality image files (300 DPI or higher)",
        correctLanguage: "Select the right language for your document",
        enhanceScannedImages: "Enable 'Enhance scanned images' for better accuracy",
        smallerPageRanges: "Process smaller page ranges for large files",
        reviewText: "Review and edit extracted text as needed"
      }
    },
    options: {
      scope: "Pages to Process",
      all: "All Pages",
      custom: "Specific Pages",
      pages: "Page Numbers",
      pagesHint: "E.g. 1,3,5-9",
      enhanceScanned: "Enhance scanned images",
      enhanceScannedHint: "Pre-process image files to boost OCR accuracy (ideal for scans)",
      preserveLayout: "Preserve layout",
      preserveLayoutHint: "Maintain paragraphs and line breaks where possible"
    },
    ocrTool: "OCR Extract Tool",
    ocrToolDesc: "Convert scanned documents and image files to editable text with our picture to text converter",

    // Upload area
    uploadPdf: "Upload Files for OCR Extract",
    dragDrop: "Drag and drop your PDF or image file here, or click to browse",
    selectPdf: "Select File",
    uploading: "Uploading...",
    maxFileSize: "Maximum file size: 50MB",

    // File handling
    invalidFile: "Invalid file type",
    invalidFileDesc: "Please upload a PDF or supported image file",
    fileTooLarge: "File too large",
    fileTooLargeDesc: "Maximum file size is 50MB",
    noFile: "No file selected",
    noFileDesc: "Please select a file for text recognition",
    changeFile: "Change File",

    // Options
    languageLabel: "Document Language",
    selectLanguage: "Select language",
    pageRange: "Page Range",
    allPages: "All Pages",
    specificPages: "Specific Pages",
    pageRangeExample: "e.g., 1-3, 5, 7-9",
    pageRangeInfo: "Enter pages or ranges separated by commas",
    preserveLayout: "Preserve Layout",
    preserveLayoutDesc: "Attempt to retain document structure",

    // Processing
    extractText: "Extract Text",
    extractingText: "Extracting Text...",
    processingPdf: "Processing your file",
    processingInfo: "This may take a few minutes based on file size and complexity",
    analyzing: "Analyzing content",
    preprocessing: "Preprocessing pages",
    recognizing: "Recognizing text",
    extracting: "Extracting text",
    finalizing: "Finalizing results",
    finishing: "Finishing up",

    // Results
    extractionComplete: "Text extraction complete",
    extractionCompleteDesc: "Text has been successfully extracted using our image to text extractor",
    extractionError: "Text extraction failed",
    extractionFailed: "Failed to extract text",
    unknownError: "An unknown error occurred",
    textCopied: "Text copied to clipboard",
    copyFailed: "Failed to copy text",
    textPreview: "Text Preview",
    rawText: "Raw Text",
    extractedText: "Extracted Text",
    previewDesc: "Preview of extracted text with formatting",
    rawTextOutput: "Raw Text Output",
    rawTextDesc: "Plain text without formatting",
    noTextFound: "No text found in the file",
    copyText: "Copy Text",
    downloadText: "Download Text",
    processAnother: "Process Another File",

    // Additional info
    supportedLanguages: "Supports 15+ languages including English, Spanish, French, German, Chinese, Japanese, and more. Choose the correct language for better text recognition."
  },

  // Protect PDF Page
  protectPdf: {
    title: "Password Protect PDF",
    description: "Secure and protect PDF documents with password protection and custom access permissions",
    howTo: {
      title: "How to Protect Your PDF",
      step1: {
        title: "Upload",
        description: "Upload the PDF file you want to protect with a password."
      },
      step2: {
        title: "Set Security Options",
        description: "Create a password and customize permissions for printing, copying, and editing."
      },
      step3: {
        title: "Download",
        description: "Download your password-protected PDF file ready for secure sharing."
      }
    },
    why: {
      title: "Why Protect Your PDFs?",
      confidentiality: {
        title: "Confidentiality",
        description: "Ensure that only authorized individuals with the password can open and view your sensitive documents."
      },
      controlledAccess: {
        title: "Controlled Access",
        description: "Set specific permissions to determine what recipients can do with your document, like printing or editing."
      },
      authorizedDistribution: {
        title: "Authorized Distribution",
        description: "Control who can access your document when sharing contracts, research, or intellectual property."
      },
      documentExpiration: {
        title: "Document Expiration",
        description: "Password protection adds an extra layer of security for time-sensitive documents that shouldn't be accessible indefinitely."
      }
    },
    security: {
      title: "Understanding PDF Security",
      passwords: {
        title: "User Password vs. Owner Password",
        user: "User Password: Required to open the document. Anyone without this password cannot view the content.",
        owner: "Owner Password: Controls permissions. With our tool, we set both passwords to be the same for simplicity."
      },
      encryption: {
        title: "Encryption Levels",
        aes128: "128-bit AES: Provides good security and is compatible with Acrobat Reader 7 and later versions.",
        aes256: "256-bit AES: Offers stronger security but requires Acrobat Reader X (10) or later versions."
      },
      permissions: {
        title: "Permission Controls",
        printing: {
          title: "Printing",
          description: "Controls whether the document can be printed and at what quality level."
        },
        copying: {
          title: "Content Copying",
          description: "Controls whether text and images can be selected and copied to the clipboard."
        },
        editing: {
          title: "Editing",
          description: "Controls document modifications, including annotations, form filling, and content changes."
        }
      }
    },
    form: {
      password: "Password",
      confirmPassword: "Confirm Password",
      encryptionLevel: "Encryption Level",
      permissions: {
        title: "Access Permissions",
        allowAll: "Allow All (Password to Open Only)",
        restricted: "Restricted Access (Custom Permissions)"
      },
      allowedActions: "Allowed Actions:",
      allowPrinting: "Allow Printing",
      allowCopying: "Allow Copying Text and Images",
      allowEditing: "Allow Editing and Annotations"
    },
    bestPractices: {
      title: "Password Protection Best Practices",
      dos: "Do's",
      donts: "Don'ts",
      dosList: [
        "Use strong, unique passwords with a mix of letters, numbers, and special characters",
        "Store passwords securely in a password manager",
        "Share passwords through secure channels separate from the PDF",
        "Use 256-bit encryption for highly sensitive documents"
      ],
      dontsList: [
        "Use simple, easy-to-guess passwords like \"password123\" or \"1234\"",
        "Send the password in the same email as the PDF",
        "Use the same password for all your protected PDFs",
        "Rely solely on password protection for extremely sensitive information"
      ]
    },
    faq: {
      encryptionDifference: {
        question: "What's the difference between the encryption levels?",
        answer: "We offer 128-bit and 256-bit AES encryption. 128-bit is compatible with older PDF readers (Acrobat 7 and later), while 256-bit provides stronger security but requires newer readers (Acrobat X and later)."
      },
      removeProtection: {
        question: "Can I remove the password protection later?",
        answer: "Yes, you can use our Unlock PDF tool to remove password protection from your PDF files, but you'll need to know the current pdf with a password to do so."
      },
      securityStrength: {
        question: "How secure is the password protection?",
        answer: "Our tool uses industry-standard AES encryption. The security depends on password strength and the encryption level you choose. We recommend using strong, choose a strong password with a mix of characters."
      },
      contentQuality: {
        question: "Will password protection affect the PDF content or quality?",
        answer: "No, password protection only adds security settings to your document and doesn't alter the content, layout, or quality of your PDF in any way."
      },
      batchProcessing: {
        question: "Can I protect multiple PDFs at once?",
        answer: "Currently, our tool processes one PDF at a time. For batch processing of multiple files, consider our API or premium solutions."
      }
    },
    protecting: "Protecting...",
    protected: "PDF successfully protected!",
    protectedDesc: "Your PDF file has been encrypted and password-protected."
  },
  watermarkPdf: {
    // Main titles and basic UI elements
    title: "Add Watermark to PDF",
    description: "Add custom text or image watermarks to your PDF documents for protection, branding, or identification.",
    textWatermark: "Text Watermark",
    imageWatermark: "Image Watermark",
    privacyNote: "Your files are processed securely. All uploads are automatically deleted after processing.",

    // Header section
    headerTitle: "Add Watermark to PDF",
    headerDescription: "Add custom text or image watermarks to your PDF documents for branding, copyright protection, and document classification",

    // Error messages
    invalidFileType: "Invalid file type",
    selectPdfFile: "Please select a PDF file",
    fileTooLarge: "File too large",
    maxFileSize: "Maximum file size is 50MB",
    invalidImageType: "Invalid image type",
    supportedFormats: "Supported formats: PNG, JPG, SVG",
    imageTooLarge: "Image too large",
    maxImageSize: "Maximum image size is 5MB",
    noFileSelected: "No file selected",
    noImageSelected: "No watermark image selected",
    selectWatermarkImage: "Please select an image to use as watermark",
    noTextEntered: "No watermark text entered",
    enterWatermarkText: "Please enter text to use as watermark",

    // Success/failure messages
    success: "Watermark added successfully",
    successDesc: "Your PDF has been watermarked and is ready for download",
    failed: "Failed to add watermark",
    unknownError: "An unknown error occurred",
    unknownErrorDesc: "An unknown error occurred. Please try again",

    // Upload and processing UI
    uploadTitle: "Upload PDF to Watermark",
    uploadDesc: "Drag and drop your PDF file here, or click to browse",
    uploading: "Uploading...",
    selectPdf: "Select PDF File",
    maxSize: "Maximum file size: 50MB",
    change: "Change File",
    commonOptions: "Watermark Settings",
    position: "Position",
    center: "Center",
    tile: "Tile",
    custom: "Custom",
    applyToPages: "Apply to Pages",
    all: "All Pages",
    even: "Even Pages",
    odd: "Odd Pages",
    customPages: "Custom Pages",
    pagesFormat: "Enter page numbers separated by commas or ranges with hyphens (e.g., 1,3,5-10)",
    processing: "Processing...",
    addWatermark: "Add Watermark",
    adding: "Adding Watermark",
    pleaseWait: "Please wait while we process your document",
    download: "Download PDF",
    newWatermark: "Add Another Watermark",

    // Text watermark options
    text: {
      text: "Watermark Text",
      placeholder: "e.g., CONFIDENTIAL, DRAFT, etc.",
      color: "Text Color",
      font: "Font",
      selectFont: "Select Font",
      size: "Font Size",
      opacity: "Opacity",
      rotation: "Rotation",
      preview: "Preview"
    },
    positionX: "Position X",
    positionY: "Position Y",
    positions: {
      topLeft: "Top Left",
      topRight: "Top Right",
      bottomLeft: "Bottom Left",
      bottomRight: "Bottom Right",
      center: "Center",
      tile: "Tile",
      custom: "Custom"
    },

    // Image watermark options
    image: {
      title: "Watermark Image",
      upload: "Upload an image to use as watermark",
      select: "Select Image",
      formats: "Supported formats: PNG, JPEG, SVG",
      change: "Change Image",
      scale: "Scale",
      opacity: "Opacity",
      rotation: "Rotation"
    },

    // How to section
    howTo: {
      title: "How to Add a Watermark",
      step1: {
        title: "Upload Your PDF",
        description: "Select and upload the PDF file you want to add a watermark to"
      },
      step2: {
        title: "Customize Watermark",
        description: "Choose between text or image watermark and customize its appearance"
      },
      step3: {
        title: "Download Watermarked PDF",
        description: "Process your file and download the watermarked PDF document"
      }
    },

    // Why watermark section
    why: {
      title: "Why Add Watermarks",
      copyright: {
        title: "Copyright Protection",
        description: "Protect your intellectual property by adding copyright notices and ownership information"
      },
      branding: {
        title: "Branding & Identity",
        description: "Reinforce your brand identity by adding logos or brand text to distributed documents"
      },
      classification: {
        title: "Document Classification",
        description: "Mark documents as Draft, Confidential, or Final to indicate their status"
      },
      tracking: {
        title: "Document Tracking",
        description: "Add unique identifiers to track document distribution and identify leaks"
      }
    },

    // Watermark types section
    types: {
      title: "Watermark Types & Options",
      text: {
        title: "Text Watermark",
        description: "Customize text watermarks with various options:",
        options: {
          text: "Custom text content (multi-line supported)",
          font: "Font family, size, and color",
          rotation: "Rotation angle (0-360 degrees)",
          opacity: "Opacity level (transparent to fully visible)",
          position: "Position (center, tiled, custom placement)"
        }
      },
      image: {
        title: "Image Watermark",
        description: "Add image watermarks with these customizations:",
        options: {
          upload: "Upload your own logo or image",
          scale: "Scale and resize",
          rotation: "Rotation options",
          opacity: "Transparency control",
          position: "Position customization"
        }
      }
    },

    // FAQ section
    faq: {
      title: "Frequently Asked Questions",
      removable: {
        question: "Can watermarks be removed from a PDF?",
        answer: "Our standard watermarks are semi-permanent and difficult to remove without specialized software. However, they are not completely tamper-proof. For more secure, tamper-resistant watermarking, consider our Pro plan which offers advanced security features that embed watermarks more deeply into the document structure."
      },
      printing: {
        question: "Will watermarks appear when the document is printed?",
        answer: "Yes, watermarks will appear when the document is printed. You can control the opacity to make them more subtle for printed documents while still being visible. The text watermarks will always print, while image watermarks will print based on your opacity settings."
      },
      pages: {
        question: "Can I watermark specific pages only?",
        answer: "Yes, our Pro plan allows you to apply watermarks to specific pages rather than the entire document. You can select individual pages, ranges, or even apply different watermarks to different sections of your document."
      },
      formats: {
        question: "What image formats are supported for image watermarks?",
        answer: "We support PNG, JPG/JPEG, and SVG formats for image watermarks. PNG is recommended for logos and images that require transparency. For best results, use high-resolution images with transparent backgrounds."
      },
      multiple: {
        question: "Can I add multiple watermarks to a single document?",
        answer: "Pro users can add multiple watermarks to a single document, such as combining a logo in the corner with a 'Confidential' text watermark diagonally across the page. Free users are limited to one watermark per document."
      },
      q1: {
        question: "Is my PDF file secure?",
        answer: "Yes, all uploads are processed securely on our servers and automatically deleted after processing. We don't store or share your files."
      },
      q2: {
        question: "What types of watermarks can I add?",
        answer: "You can add text watermarks with customizable fonts, colors, and opacity, or image watermarks using PNG, JPG, or SVG files."
      },
      q3: {
        question: "Can I remove a watermark after adding it?",
        answer: "Once a watermark is added and the file is downloaded, it becomes a permanent part of the PDF. There's no automatic way to remove it."
      },
      q4: {
        question: "Is there a file size limit?",
        answer: "Yes, the maximum file size for PDF uploads is 50MB. For image watermarks, the maximum size is 5MB."
      }
    },

    // Best practices section
    bestPractices: {
      title: "Watermarking Best Practices",
      dos: "Do's",
      donts: "Don'ts",
      dosList: [
        "Use semi-transparent watermarks to avoid obscuring content",
        "Consider diagonal watermarks for better coverage",
        "Test your watermark on a sample page before processing large documents",
        "Use contrasting colors for better visibility",
        "Include copyright symbol © for legal protection"
      ],
      dontsList: [
        "Don't use watermarks that are too dark or opaque",
        "Don't place watermarks over important text or elements",
        "Don't use extremely small text that becomes illegible",
        "Don't rely solely on watermarks for document security",
        "Don't use low-resolution images that appear pixelated"
      ]
    },

    // Related tools section
    relatedTools: {
      title: "Related Tools",
      protect: "Protect PDF",
      sign: "Sign PDF",
      edit: "Edit PDF",
      ocr: "OCR PDF",
      viewAll: "View All Tools"
    }
  },

  // Compress PDF
  compressPdf: {
    title: "Compress PDF Files",
    description: "compress PDF file sizes effortlessly while preserving document quality",
    quality: {
      high: "High Quality",
      highDesc: "Minimal compression, best visual quality",
      balanced: "Balanced",
      balancedDesc: "Good compression with minimal visual loss",
      maximum: "Maximum Compression",
      maximumDesc: "Highest compression ratio, may reduce visual quality"
    },
    processing: {
      title: "Processing Options",
      processAllTogether: "Process all files simultaneously",
      processSequentially: "Process files one by one"
    },
    status: {
      uploading: "Uploading...",
      compressing: "Compressing...",
      completed: "Completed",
      failed: "Failed"
    },
    results: {
      title: "Compression Results Summary",
      totalOriginal: "Total Original",
      totalCompressed: "Total Compressed",
      spaceSaved: "Space Saved",
      averageReduction: "Average Reduction",
      downloadAll: "Download All Compressed Files as ZIP"
    },
    of: "of",
    files: "files",
    filesToCompress: "Files to Compress",
    compressAll: "Compress Files",
    qualityPlaceholder: "Select compression quality",
    reduction: "reduction",
    zipDownloadSuccess: "All compressed files downloaded successfully",
    overallProgress: "Overall Progress",
    reducedBy: "was reduced by",
    success: "Compression successful",
    error: {
      noFiles: "Please select PDF files to compress",
      noCompressed: "No compressed files available for download",
      downloadZip: "Failed to download ZIP archive",
      generic: "Failed to compress PDF file",
      unknown: "An unknown error occurred",
      failed: "Failed to compress your file"
    },
    howTo: {
      title: "How to Compress PDF Files",
      step1: {
        title: "Upload PDF",
        description: "Upload the large PDF files you want to compress. Our free PDF compressor supports files up to 100MB and works on Windows, Linux, and other operating system."
      },
      step2: {
        title: "Choose Quality",
        description: "Select your preferred compression level to reduce file size without losing quality. Choose the best mode based on how much you want to compress a PDF."
      },
      step3: {
        title: "Download",
        description: "Download your compressed PDF file. Get a smaller file size that’s perfect for online sharing or email attachments."
      }
    },
    why: {
      title: "Why Compress PDFs?",
      uploadSpeed: {
        title: "Lightning-Fast Uploads",
        description: "Compressed PDF files upload faster, especially large PDF files, helping you share documents online without delays."
      },
      emailFriendly: {
        title: "Email Friendly",
        description: "Reduce file size so your PDFs fit within email size limits. Our PDF compress tool ensures easy sharing high quality."
      },
      storage: {
        title: "Storage Efficient",
        description: "Save storage on your device or cloud by using our PDF compressor to shrink large PDFs into smaller, space-efficient files."
      },
      quality: {
        title: "Maintained Quality",
        description: "Compress PDFs without compromising quality. Our smart modes retain high visual clarity while lowering file size."
      }
    },
    faq: {
      title: "Frequently Asked Questions",
      howMuch: {
        question: "How much can PDF files be compressed?",
        answer: "Most large PDF files can be compressed by 20-80%, depending on content. Our PDF compressor is optimized for different use cases, helping you reduce file size effectively — especially for image quality PDFs."
      },
      quality: {
        question: "Will compression affect the quality of my PDF?",
        answer: "Our tool gives you the choice: compress a PDF using lossless mode for no visual difference or choose high compression for maximum file size reduction. You can get a free PDF compressed without losing essential quality."
      },
      secure: {
        question: "Is my PDF data secure when compressing?",
        answer: "Yes, your data is safe. All PDF files are processed securely online and automatically deleted after 24 hours. Whether you use Windows or Linux, your file is encrypted and never shared."
      },
      fileLimits: {
        question: "What are the file size limits?",
        answer: "Free users can compress PDF files up to 10MB. Premium plans support up to 500MB per file. Whether you’re compressing one PDF or multiple, our tool handles large PDF files with ease."
      },
      batch: {
        question: "Can I compress multiple PDFs at once?",
        answer: "Yes, you can compress PDFs in batches. Upload multiple files and let our PDF online pdf compressor reduce each file’s size efficiently in a single session — great for both individuals and teams."
      }
    },
    modes: {
      title: "Compression Modes",
      moderate: {
        title: "Moderate Compression",
        description: "A balanced mode that compresses PDF files without losing quality. Perfect for online PDF sharing or archiving while preserving good visuals."
      },
      high: {
        title: "High Compression",
        description: "Reduce file size aggressively with noticeable compression. Ideal for shrinking large PDF files quickly — best when smaller size is more important than high resolution."
      },
      lossless: {
        title: "Lossless Compression",
        description: "Compress PDFs by cleaning up unnecessary data, reducing file size without affecting the look — the best option when quality matters most."
      }
    },
    bestPractices: {
      title: "Best Practices for PDF Compression",
      dos: "Do's",
      donts: "Don'ts",
      dosList: [
        "Compress images before creating PDFs for best results",
        "Choose the appropriate compression level for your needs",
        "Keep original files as backups before compression",
        "Use lossless compression for important documents",
        "Remove unnecessary pages to further reduce file size"
      ],
      dontsList: [
        "Don't overcompress documents needed for printing",
        "Don't compress legal or archival documents if every detail matters",
        "Don't compress already heavily compressed PDFs repeatedly",
        "Don't expect huge reductions for PDFs with mostly text",
        "Don't compress if file size isn't an issue"
      ]
    },
    relatedTools: {
      title: "Related Tools",
      merge: "Merge PDF",
      split: "Split PDF",
      pdfToWord: "PDF to Word",
      pdfToJpg: "PDF to JPG",
      viewAll: "View All Tools"
    }
  },
  // Unlock PDF
  unlockPdf: {
    title: "Unlock PDF Files Easily with Our PDF Unlocker",
    description: "Remove PDF passwords and unprotect PDF files quickly with our online PDF unlock tool. Unlock PDFs to create an unsecured PDF file on any operating system.",
    metaDescription: "Unlock PDF files effortlessly with our PDF unlocker. Remove the PDF permissions password, unprotect online PDFs, and download your unlocked file securely.",
    keywords: "unlock PDF file, how to unlock PDF file, unlocking PDF, unlocking PDF files, unlock to PDF, unlock PDF files, unsecured PDF file, PDF unlocker, unlocked file, PDF document unlock, SmallPDF unlock, unlock PDFs, protect PDF tool, permissions password, downloading your file, password from PDF, online PDF, remove PDF passwords, SmallPDF unlock PDF, remove the PDF, click save, password click, unlock PDF tool",

    // Benefits Section
    benefits: {
      title: "Why Use Our Unlock PDF Tool for Unlocking PDF Files",
      list: [
        {
          title: "Fast PDF Unlocker",
          description: "Use our unlock PDF tool to quickly remove the PDF password and create an unsecured PDF file, ready for downloading your file instantly."
        },
        {
          title: "Easy Unlocking PDF Files",
          description: "With a simple enter password box, unlock PDF files online by entering the permissions password or document open password save and you’re done."
        },
        {
          title: "Unlock PDFs on Any Platform",
          description: "Our online PDF unlocker works on any operating system, making unlocking PDF files seamless whether you use SmallPDF unlock or our unlock PDF tool."
        },
        {
          title: "Secure PDF Document Unlock",
          description: "Safely remove password from PDF files with our tool, ensuring your unlocked file stays private after unlocking PDF."
        }
      ]
    },

    // Use Cases Section
    useCases: {
      title: "How to Unlock PDF File: Top Use Cases",
      list: [
        {
          title: "Unlock PDF File with Permissions Password",
          description: "Use our PDF unlocker to remove the permissions password and unlock to PDF for full access when you know the password click."
        },
        {
          title: "Online PDF for Business",
          description: "Unlock PDF files online to remove PDF passwords from business documents, simplifying sharing and editing with a quick click save."
        },
        {
          title: "Unlocking PDF Study Materials",
          description: "Unprotect online PDF study resources with our unlock PDF tool to create an unsecured PDF file for seamless learning."
        },
        {
          title: "Personal PDF Document Unlock",
          description: "Learn how to unlock PDF file from your personal collection by downloading your file after using our SmallPDF unlock PDF alternative."
        }
      ]
    },

    // How-To Section
    howTo: {
      title: "How to Unlock PDF File in 3 Steps",
      upload: {
        title: "Step 1: Upload Your Online PDF",
        description: "Start unlocking PDF by uploading the PDF file you want to unprotect with our unlock PDF tool."
      },
      enterPassword: {
        title: "Step 2: Enter Permissions Password",
        description: "Use the enter password box to input the password from PDF, such as the document open password or permissions password."
      },
      download: {
        title: "Step 3: Download Unlocked File",
        description: "Finish unlocking PDF files by downloading your file as an unsecured PDF file after we remove the PDF password."
      }
    },

    // Features Section
    features: {
      title: "Key Features of Our PDF Unlocker",
      list: [
        {
          title: "Supports All Online PDFs",
          description: "Unlock PDF files with permissions passwords or document open passwords effortlessly."
        },
        {
          title: "Quick Unlocking PDF Process",
          description: "Remove PDF passwords in seconds with our fast unlock PDF tool, ideal for downloading your file."
        },
        {
          title: "Cross-Platform PDF Document Unlock",
          description: "Use our PDF unlocker on any operating system for seamless unlocking PDF files."
        },
        {
          title: "Secure SmallPDF Unlock Alternative",
          description: "Unprotect PDF files with encrypted processing, offering a safe alternative to SmallPDF unlock PDF."
        }
      ]
    },

    // FAQ Section
    faq: {
      passwordRequired: {
        question: "Do I need the password click to unlock PDF files?",
        answer: "Yes, you must enter the password from PDF—like the document open password or permissions password—in the enter password box to unlock PDFs. Our tool doesn’t bypass passwords."
      },
      security: {
        question: "Is unlocking PDF files with this tool secure?",
        answer: "Yes, our unlock PDF tool processes online PDFs on encrypted servers. We don’t store your files or passwords after downloading your file."
      },
      restrictions: {
        question: "Can I unlock to PDF with no password click?",
        answer: "Yes, if there’s no document open password but a permissions password exists, upload it to remove the PDF restrictions."
      },
      quality: {
        question: "Does unlocking PDF affect quality?",
        answer: "No, our PDF unlocker only removes password from PDF settings—your unlocked file retains its original quality."
      },
      compatibility: {
        question: "Does this work for SmallPDF unlock PDF users?",
        answer: "Yes, our unlock PDF tool works on any operating system and serves as a great alternative to SmallPDF unlock, unlocking PDF files online."
      }
    },

    // Status Messages
    passwordProtected: "Password Protected",
    notPasswordProtected: "Not Password Protected",
    unlocking: "Unlocking PDF...",
    unlockSuccess: "PDF Successfully Unlocked!",
    unlockSuccessDesc: "Your PDF document unlock is complete! Download your unlocked file now."
  },

  // File Uploader
  fileUploader: {
    dropHere: "Drop your file here",
    dropHereaDesc: "Drop your PDF file here or click to browse",
    dragAndDrop: "Drag & drop your file",
    browse: "Browse Files",
    dropHereDesc: "Drop your file here or click to browse.",
    maxSize: "Maximum size is 100MB.",
    remove: "Remove",
    inputFormat: "Input Format",
    outputFormat: "Output Format",
    ocr: "Enable OCR",
    ocrDesc: "Extract text from scanned documents using Optical Character Recognition",
    quality: "Quality",
    low: "Low",
    high: "High",
    password: "Password",
    categories: {
      documents: "Documents",
      spreadsheets: "Spreadsheets",
      presentations: "Presentations",
      images: "Images"
    },
    converting: "Converting",
    successful: "Conversion Successful",
    successDesc: "Your file has been successfully converted and is now ready for download.",
    download: "Download Converted File",
    filesSecurity: "Files are automatically deleted after 24 hours for privacy and security."
  },

  // Common UI elements
  ui: {
    upload: "Upload",
    download: "Download",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    processing: "Processing...",
    success: "Success!",
    error: "Error",
    copy: "Copy",
    remove: "Remove",
    browse: "Browse",
    dragDrop: "Drag & Drop",
    or: "or",
    close: "Close",
    apply: "Apply",
    loading: "Loading...",
    preview: "Preview",
    reupload: "Upload Another File",
    continue: "Continue",
    skip: "Skip",
    retry: "Retry",
    addMore: "Add More",
    clear: "Clear",
    clearAll: "Clear All",
    done: "Done",
    extract: "extract",
    new: "New!",
    phone: "Phone",
    address: "Address",
    filesSecurity: "Files are automatically deleted after 24 hours for privacy and security."
  },

  contact: {
    title: "Contact Us",
    description: "Have questions or feedback? We'd love to hear from you.",
    form: {
      title: "Send Us a Message",
      description: "Fill out the form below and we'll get back to you as soon as possible.",
      name: "Your Name",
      email: "Email Address",
      subject: "Subject",
      message: "Message",
      submit: "Send Message"
    },
    success: "Message Sent Successfully",
    successDesc: "Thank you for reaching out. We'll get back to you as soon as possible.",
    error: "Failed to Send Message",
    errorDesc: "There was an error sending your message. Please try again later.",
    validation: {
      name: "Name is required",
      email: "Please enter a valid email address",
      subject: "Subject is required",
      message: "Message is required"
    },
    supportHours: {
      title: "Support Hours",
      description: "When we're available to help",
      weekdays: "Monday - Friday",
      weekdayHours: "9:00 AM - 6:00 PM EST",
      saturday: "Saturday",
      saturdayHours: "10:00 AM - 4:00 PM EST",
      sunday: "Sunday",
      closed: "Closed"
    },
    faq: {
      title: "Frequently Asked Questions",
      responseTime: {
        question: "How long does it take to get a response?",
        answer: "We aim to respond to all inquiries within 24-48 business hours. During peak times, it may take up to 72 hours."
      },
      technicalSupport: {
        question: "Can I get support for a technical issue?",
        answer: "Yes, our technical support team is available to help you with any issues you're experiencing with our PDF tools."
      },
      phoneSupport: {
        question: "Do you offer phone support?",
        answer: "We provide phone support during our listed support hours. For immediate assistance, email is often the fastest way to get help."
      },
      security: {
        question: "Is my personal information secure?",
        answer: "We take your privacy seriously. All communication is encrypted, and we never share your personal information with third parties."
      }
    }
  },
  // About Page
  about: {
    hero: {
      title: "Empowering Digital Document Management",
      description: "ScanPro was born from a simple idea: making document management seamless, efficient, and accessible to everyone. We believe in transforming how people interact with digital documents."
    },
    story: {
      title: "Our Story",
      paragraph1: "Founded in 2022, ScanPro emerged from the frustration of dealing with complex and unintuitive PDF tools. Our founders, tech enthusiasts and document management experts, saw an opportunity to create a solution that was both powerful and user-friendly.",
      paragraph2: "What started as a small project quickly grew into a comprehensive platform serving thousands of users worldwide, from students and professionals to large enterprises."
    },
    missionValues: {
      title: "Our Mission and Values",
      mission: {
        title: "Mission",
        description: "To simplify digital document management by providing intuitive, powerful, and accessible PDF tools that enhance productivity and creativity."
      },
      customerFirst: {
        title: "Customer First",
        description: "We prioritize user experience and continuously improve our tools based on real user feedback. Your needs drive our innovation."
      },
      privacy: {
        title: "Privacy & Security",
        description: "We are committed to protecting your data with state-of-the-art security measures and absolute respect for your privacy."
      }
    },
    coreValues: {
      title: "Our Core Values",
      innovation: {
        title: "Innovation",
        description: "We continuously push the boundaries of what's possible in document management."
      },
      collaboration: {
        title: "Collaboration",
        description: "We believe in the power of teamwork, both within our company and with our users."
      },
      accessibility: {
        title: "Accessibility",
        description: "Our tools are designed to be simple, intuitive, and available to everyone."
      }
    },
    team: {
      title: "Meet Our Team",
      description: "ScanPro is powered by a small, dedicated team focused on creating the best possible PDF tools for our users.",
      member1: {
        name: "Cakra",
        role: "App Development Lead",
        bio: "Oversees the development of our applications, implementing robust backend solutions and ensuring our tools work smoothly and efficiently."
      },
      member2: {
        name: "Abdi",
        role: "Frontend Web Developer",
        bio: "Creates the user interfaces that make our tools intuitive and accessible, focusing on delivering exceptional user experiences across all our web platforms."
      },
      member3: {
        name: "Anggi",
        role: "Marketing Specialist",
        bio: "Leads our marketing efforts to connect our tools with the people who need them, building awareness and driving the growth of our platform."
      }
    }
  },

  // Terms and Privacy Pages
  legal: {
    termsTitle: "Terms of Service",
    privacyTitle: "Privacy Policy",
    lastUpdated: "Last Updated",
    introduction: {
      title: "Introduction",
      description: "Please read these terms carefully before using our service."
    },
    dataUse: {
      title: "How We Use Your Data",
      description: "We process your files only to provide the service you requested. All files are automatically deleted after 24 hours."
    },
    cookies: {
      title: "Cookies and Tracking",
      description: "We use cookies to improve your experience and analyze website traffic."
    },
    rights: {
      title: "Your Rights",
      description: "You have the right to access, correct, or delete your personal information."
    }
  },

  // Error Pages
  error: {
    notFound: "Page Not Found",
    notFoundDesc: "Sorry, we couldn't find the page you're looking for.",
    serverError: "Server Error",
    serverErrorDesc: "Sorry, something went wrong on our server. Please try again later.",
    goHome: "Go Home",
    tryAgain: "Try Again"
  },
  universalCompressor: {
    title: "Universal File Compressor",
    description: "Compress PDF, images, and Office documents while maintaining quality",
    dropHereDesc: "Drag and drop files here (PDF, JPG, PNG, DOCX, PPTX, XLSX)",
    filesToCompress: "Files to Compress",
    compressAll: "Compress All Files",
    results: {
      title: "Compression Results",
      downloadAll: "Download All Compressed Files"
    },
    fileTypes: {
      pdf: "PDF Document",
      image: "Image",
      office: "Office Document",
      unknown: "Unknown File"
    },
    howTo: {
      title: "How to Compress Files",
      step1: {
        title: "Upload Files",
        description: "Upload the files you want to compress"
      },
      step2: {
        title: "Choose Quality",
        description: "Select your preferred compression level"
      },
      step3: {
        title: "Download",
        description: "Click compress and download your compressed files"
      }
    },
    faq: {
      compressionRate: {
        question: "How much can files be compressed?",
        answer: "Compression rates vary by file type and content. PDFs typically compress by 20-70%, images by 30-80%, and Office documents by 10-50%."
      },
      quality: {
        question: "Will compression affect the quality of my files?",
        answer: "Our compression algorithms balance size reduction with quality preservation. The 'High' quality setting will maintain nearly identical visual quality."
      },
      sizeLimit: {
        question: "Is there a file size limit?",
        answer: "Yes, you can compress files up to 100MB each."
      }
    }
  },
  repairPdf: {
    title: "Repair PDF Files",
    description: "Fix corrupted PDF files, recover content, and optimize document structure",

    howTo: {
      title: "How to Repair Your PDF",
      step1: {
        title: "Upload Your PDF",
        description: "Select the PDF file you want to repair from your device"
      },
      step2: {
        title: "Choose Repair Mode",
        description: "Select the appropriate repair method based on your file's issues"
      },
      step3: {
        title: "Download Repaired PDF",
        description: "Download your repaired PDF file with fixed structure and content"
      }
    },

    why: {
      title: "Why Repair PDFs",
      corruptedFiles: {
        title: "Fix Corrupted Files",
        description: "Recover content and structure from damaged PDF files that won't open properly"
      },
      missingContent: {
        title: "Recover Missing Content",
        description: "Restore missing images, text or pages from partially corrupted documents"
      },
      documentStructure: {
        title: "Fix Document Structure",
        description: "Repair broken internal structure, page references, and links"
      },
      fileSize: {
        title: "Optimize File Size",
        description: "Clean up unnecessary data and optimize file size without quality loss"
      }
    },

    modes: {
      title: "Available Repair Modes",
      standard: {
        title: "Standard Repair",
        description: "Fix common PDF issues, including broken cross-references, malformed objects, and stream errors. Best for mildly corrupted PDFs that still open but display errors."
      },
      advanced: {
        title: "Advanced Recovery",
        description: "Deep repair for severely damaged PDFs with serious structural issues. Recovers as much content as possible from files that won't open at all."
      },
      optimization: {
        title: "Optimization",
        description: "Restructure and optimize the PDF file without losing content. Removes redundant data, fixes minor issues, and improves overall file structure."
      }
    },

    faq: {
      title: "Frequently Asked Questions",
      whatCanRepair: {
        question: "What types of PDF issues can be fixed?",
        answer: "Our repair tool can fix a wide range of problems including corrupted file structures, broken page references, damaged content streams, missing cross-reference tables, and invalid objects. It can often recover content from PDFs that won't open or display correctly in standard PDF viewers."
      },
      completelyDamaged: {
        question: "Can you repair completely damaged PDFs?",
        answer: "While our advanced repair mode can recover content from severely damaged PDFs, a 100% recovery isn't always possible if the file is completely corrupted. However, even in extreme cases, we can often recover partial content, especially text and basic elements."
      },
      contentQuality: {
        question: "Will repairing affect content quality?",
        answer: "No, our repair process maintains the quality of recoverable content. Unlike some tools that simply extract and recreate PDFs (which can lose formatting), we attempt to preserve the original structure while fixing only the corrupted parts."
      },
      passwordProtected: {
        question: "Can you repair password-protected PDFs?",
        answer: "Yes, you can repair password-protected PDFs if you have the password. You'll need to enter the password during the repair process. We do not, however, attempt to bypass or remove encryption from protected documents without proper authorization."
      },
      dataSecurity: {
        question: "Is my PDF data secure during the repair process?",
        answer: "Yes, we take data security seriously. Your files are processed securely on our servers, not shared with third parties, and are automatically deleted after processing. We use encryption for all file transfers, and the entire repair process happens in a secure environment."
      }
    },

    bestPractices: {
      title: "Best Practices for PDF Recovery",
      dos: "Do's",
      donts: "Don'ts",
      dosList: [
        "Keep backups of original files before repair attempts",
        "Try the Standard repair mode first before using Advanced recovery",
        "Check the PDF with multiple viewers if possible",
        "Note which pages or elements are problematic before repair",
        "Use the Optimization mode for large but functional PDFs"
      ],
      dontsList: [
        "Don't repeatedly save corrupted PDFs as this can worsen the damage",
        "Don't use repair as a substitute for proper PDF creation",
        "Don't expect 100% recovery from severely damaged files",
        "Don't open repaired files in older PDF viewers that might re-corrupt them",
        "Don't skip checking the repaired file for content accuracy"
      ]
    },

    relatedTools: {
      title: "Related Tools",
      compress: "Compress PDF",
      unlock: "Unlock PDF",
      protect: "Protect PDF",
      edit: "Edit PDF",
      viewAll: "View All Tools"
    },

    form: {
      title: "PDF Repair Tool",
      description: "Fix corrupted PDFs, recover content, and optimize document structure",
      upload: "Upload PDF for Repair",
      dragDrop: "Drag and drop your PDF file here, or click to browse",
      selectFile: "Select PDF File",
      maxFileSize: "Maximum file size: 100MB",
      change: "Change File",
      repairModes: "Repair Mode",
      standardRepair: "Standard Repair",
      standardDesc: "Fix common issues such as broken links and structural problems",
      advancedRecovery: "Advanced Recovery",
      advancedDesc: "Deep recovery for severely damaged or corrupted PDF files",
      optimization: "Optimization",
      optimizationDesc: "Clean and optimize PDF structure without losing content",
      advancedOptions: "Advanced Options",
      showOptions: "Show Options",
      hideOptions: "Hide Options",
      preserveFormFields: "Preserve Form Fields",
      preserveFormFieldsDesc: "Maintain interactive form fields when possible",
      preserveAnnotations: "Preserve Annotations",
      preserveAnnotationsDesc: "Keep comments, highlights and other annotations",
      preserveBookmarks: "Preserve Bookmarks",
      preserveBookmarksDesc: "Maintain document outline and bookmarks",
      optimizeImages: "Optimize Images",
      optimizeImagesDesc: "Recompress images to reduce file size",
      password: "PDF Password",
      passwordDesc: "This PDF is password protected. Enter the password to repair it.",
      repair: "Repair PDF",
      repairing: "Repairing PDF...",
      security: "Your files are processed securely. All uploads are automatically deleted after processing.",
      analyzing: "Analyzing PDF structure",
      rebuilding: "Rebuilding document structure",
      recovering: "Recovering content",
      fixing: "Fixing cross-references",
      optimizing: "Optimizing file",
      finishing: "Finishing up"
    },

    results: {
      success: "PDF Repaired Successfully",
      successMessage: "Your PDF has been repaired and is ready for download.",
      issues: "Repair Issues Detected",
      issuesMessage: "We encountered issues while repairing your PDF. Some content may not be recoverable.",
      details: "Repair Details",
      fixed: "Fixed Issues",
      warnings: "Warnings",
      fileSize: "File Size",
      original: "Original",
      new: "New",
      reduction: "reduction",
      download: "Download Repaired PDF",
      repairAnother: "Repair Another PDF"
    }
  },
  faq: {
    categories: {
      general: "General",
      conversion: "Conversion",
      security: "Security",
      account: "Account",
      api: "Api",
    },
    general: {
      question1: "What is ScanPro?",
      answer1: "ScanPro is a comprehensive online platform for PDF management and conversion. Our tools help you convert, edit, merge, split, compress, and secure your PDF documents through an intuitive web interface or API.",
      question2: "Do I need to create an account to use ScanPro?",
      answer2: "No, you can use our basic PDF tools without registering. However, creating a free account gives you benefits like saved history, higher file size limits, and access to additional features.",
      question3: "Is my data secure on ScanPro?",
      answer3: "Yes, all files are processed securely on our servers with encryption. We don't share your files with third parties, and files are automatically deleted from our servers after processing (within 24 hours). For more details, please see our Privacy Policy.",
      question4: "What devices and browsers does ScanPro support?",
      answer4: "ScanPro works on all modern browsers including Chrome, Firefox, Safari, and Edge. Our platform is fully responsive and works on desktop, tablet, and mobile devices."
    },
    conversion: {
      question1: "What file types can I convert to and from?",
      answer1: "ScanPro supports converting PDFs to many formats including Word (DOCX), Excel (XLSX), PowerPoint (PPTX), images (JPG, PNG), HTML, and plain text. You can also convert these formats back to PDF.",
      question2: "How accurate are your PDF conversions?",
      answer2: "Our conversion engine uses advanced algorithms to maintain formatting, including fonts, images, tables, and layout. However, very complex documents may have minor formatting differences. For best results, we recommend using our 'PDF to Word' or 'PDF to Excel' tools for documents with complex formatting.",
      question3: "Is there a file size limit for conversions?",
      answer3: "Free users can convert files up to 10MB. Basic subscribers can convert files up to 50MB, Pro subscribers up to 100MB, and Enterprise users up to 500MB. If you need to process larger files, please contact us for custom solutions.",
      question4: "Why did my PDF conversion fail?",
      answer4: "Conversions may fail if the file is corrupted, password-protected, or contains complex elements our system can't process. Try using our 'Repair PDF' tool first, then retry the conversion. If you're still having issues, try our 'Advanced' conversion mode or contact support."
    },
    security: {
      question1: "How do I password protect my PDF?",
      answer1: "Use our 'Protect PDF' tool. Upload your PDF, set a password, choose permission restrictions (if desired), and click 'Protect PDF'. You can control whether users can print, edit, or copy content from your PDF.",
      question2: "Can I remove a password from my PDF?",
      answer2: "Yes, use our 'Unlock PDF' tool. You'll need to provide the current password to remove protection. Note that we only help remove password protection from documents you own or have authorization to modify.",
      question3: "What encryption level do you use for PDF protection?",
      answer3: "We use industry-standard 256-bit AES encryption for PDF protection, which offers strong security for your documents. We also support 128-bit encryption if you need compatibility with older PDF readers."
    },
    account: {
      question1: "How do I upgrade my subscription?",
      answer1: "Log in to your account, go to Dashboard, and select the 'Subscription' tab. Choose the plan that meets your needs and follow the payment instructions. Your new features will be activated immediately after payment.",
      question2: "Can I cancel my subscription?",
      answer2: "Yes, you can cancel your subscription at any time from your Dashboard under the 'Subscription' tab. You'll continue to have access to premium features until the end of your current billing period.",
      question3: "How do I reset my password?",
      answer3: "On the login page, click 'Forgot password?' and enter your email address. We'll send you a password reset link that will be valid for 1 hour. If you don't receive the email, check your spam folder or contact support."
    },
    api: {
      question1: "How do I get an API key?",
      answer1: "Register for an account, then go to Dashboard > API Keys to create your first API key. Free accounts get 1 API key, Basic subscribers get 3, Pro subscribers get 10, and Enterprise users get 50+ keys.",
      question2: "What are the API rate limits?",
      answer2: "Rate limits depend on your subscription tier: Free (10 requests/hour), Basic (100 requests/hour), Pro (1,000 requests/hour), Enterprise (5,000+ requests/hour). Monthly operation limits also apply to each tier.",
      question3: "How do I integrate the API with my application?",
      answer3: "Our API uses standard REST endpoints with JSON responses. You can find comprehensive documentation, code samples, and SDKs in our Developer section. We provide examples for various programming languages including JavaScript, Python, PHP, and Java."
    },
    title: "Frequently Asked Questions"
  },
  footer: {
    description: "Advanced PDF tools for professionals. Convert, edit, protect and optimize your documents with our powerful web-based platform and API.",
    contactUs: "Contact Us",
    address: "123 Document Street, PDF City, 94103, United States",
    subscribe: "Subscribe to Our Newsletter",
    subscribeText: "Get the latest news, updates and tips delivered directly to your inbox.",
    emailPlaceholder: "Your email address",
    subscribeButton: "Subscribe",
    pdfTools: "PDF Tools",
    pdfManagement: "PDF Management",
    company: "Company",
    support: "Support",
    aboutUs: "About Us",
    careers: "Careers",
    blog: "Blog",
    helpCenter: "Help Center",
    apiDocs: "API Documentation",
    faqs: "FAQs",
    tutorials: "Tutorials",
    systemStatus: "System Status",
    allRightsReserved: "All rights reserved.",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    cookiePolicy: "Cookie Policy",
    security: "Security",
    sitemap: "Sitemap",
    validEmail: "Please enter a valid email address",
    subscribeSuccess: "Thanks for subscribing to our newsletter!",
    viewAllTools: "View All PDF Tools",
    repairPdf: "Repair PDF",
    socialFacebook: "Facebook",
    socialTwitter: "Twitter",
    socialInstagram: "Instagram",
    socialLinkedin: "LinkedIn",
    socialGithub: "GitHub",
    socialYoutube: "YouTube"
  },
  security: {
    title: "Security & Privacy at ScanPro",
    description: "We take the security and privacy of your documents seriously. Learn how we protect your data.",
    measures: {
      title: "How We Protect Your Data"
    },
    sections: {
      encryption: {
        title: "End-to-End Encryption",
        description: "All files are encrypted during transfer with TLS 1.3 and at rest with AES-256 encryption. Your documents never travel unprotected."
      },
      temporaryStorage: {
        title: "Temporary Storage",
        description: "Files are automatically deleted within 24 hours of processing. We don't keep your documents longer than necessary."
      },
      access: {
        title: "Access Controls",
        description: "Robust authentication and authorization systems ensure only you can access your documents and account information."
      },
      infrastructure: {
        title: "Secure Infrastructure",
        description: "Our systems run on enterprise-grade cloud providers with ISO 27001 certification and regular security audits."
      },
      compliance: {
        title: "Compliance",
        description: "Our operations follow GDPR, CCPA, and other regional privacy regulations to ensure your data rights are protected."
      },
      monitoring: {
        title: "Continuous Monitoring",
        description: "Automated and manual security reviews, vulnerability scans, and intrusion detection protect against emerging threats."
      }
    },
    tabs: {
      security: "Security",
      privacy: "Privacy",
      compliance: "Compliance"
    },
    tabContent: {
      security: {
        title: "Our Security Approach",
        description: "Comprehensive security measures to protect your files and data",
        encryption: {
          title: "Strong Encryption",
          description: "We use TLS 1.3 for data in transit and AES-256 for data at rest. All file transfers are encrypted end-to-end."
        },
        auth: {
          title: "Secure Authentication",
          description: "Multi-factor authentication, secure password storage using bcrypt, and regular account monitoring for suspicious activities."
        },
        hosting: {
          title: "Secure Hosting",
          description: "Our infrastructure is hosted on enterprise-grade cloud providers with ISO 27001 certification. We implement network segmentation, firewalls, and intrusion detection systems."
        },
        updates: {
          title: "Regular Updates",
          description: "We maintain regular security patches and updates, conduct vulnerability assessments, and perform penetration testing to identify and address potential issues."
        }
      },
      privacy: {
        title: "Privacy Practices",
        description: "How we handle your personal data and documents",
        viewPolicy: "View Full Privacy Policy"
      },
      compliance: {
        title: "Compliance & Certifications",
        description: "Standards and regulations we adhere to",
        approach: {
          title: "Our Compliance Approach",
          description: "ScanPro is designed with privacy and security by design principles. We regularly review and update our practices to comply with evolving regulations."
        },
        gdpr: {
          title: "GDPR Compliance"
        },
        hipaa: {
          title: "HIPAA Considerations"
        }
      }
    },
    retention: {
      title: "Data Retention Policy",
      description: "We follow strict data minimization practices. Here's how long we keep different types of data:",
      documents: {
        title: "Uploaded Documents",
        description: "Files are automatically deleted from our servers within 24 hours of processing. We don't keep copies of your documents unless you explicitly opt into storage features available for paid plans."
      },
      account: {
        title: "Account Information",
        description: "Basic account information is kept as long as you maintain an active account. You can delete your account at any time, which will remove your personal information from our systems."
      },
      usage: {
        title: "Usage Data",
        description: "Anonymous usage statistics are retained for up to 36 months to help us improve our services. This data cannot be used to identify you personally."
      }
    },
    contact: {
      title: "Have Security Questions?",
      description: "Our security team is ready to answer your questions about how we protect your data and privacy.",
      button: "Contact Security Team"
    },
    policy: {
      button: "Privacy Policy"
    },
    faq: {
      dataCollection: {
        question: "What personal data does ScanPro collect?",
        answer: "We collect minimal information needed to provide our services. For registered users, this includes email, name, and usage statistics. We also collect anonymous usage data to improve our services. We don't analyze, scan, or mine the content of your documents."
      },
      documentStorage: {
        question: "How long do you store my documents?",
        answer: "Documents are automatically deleted from our servers after processing, typically within 24 hours. For paid subscribers, document storage options are available, but these are opt-in features only."
      },
      thirdParty: {
        question: "Do you share my data with third parties?",
        answer: "We do not sell or rent your personal data. We only share data with third parties when necessary to provide our services (such as payment processors for subscriptions) or when required by law. All third-party providers are carefully vetted and bound by data protection agreements."
      },
      security: {
        question: "How do you secure my data?",
        answer: "We use industry-standard security measures including TLS encryption for data transfer, AES-256 encryption for stored data, secure infrastructure providers, access controls, and regular security audits. Our systems are designed with security as a priority."
      },
      rights: {
        question: "What are my rights regarding my data?",
        answer: "Depending on your region, you have rights including: access to your data, correction of inaccurate data, deletion of your data, restriction of processing, data portability, and objection to processing. To exercise these rights, contact our support team."
      },
      breach: {
        question: "What happens in case of a data breach?",
        answer: "We have protocols to detect, respond to, and notify affected users of any data breach in accordance with applicable laws. We conduct regular security assessments to minimize the risk of breaches and maintain a detailed incident response plan."
      }
    }
  },
  developer: {
    title: "Developer API Documentation",
    description: "Integrate ScanPro's powerful PDF tools into your applications with our RESTful API",
    tabs: {
      overview: "Overview",
      authentication: "Authentication",
      endpoints: "Endpoints",
      examples: "Examples",
      pricing: "Pricing"
    },
    examples: {
      title: "Code Examples",
      subtitle: "Learn how to integrate our API with these ready-to-use examples",
      pdfToWord: "PDF to Word Conversion",
      mergePdfs: "Merge PDFs",
      protectPdf: "Protect PDF"
    },
    endpoints: {
      title: "API Endpoints",
      subtitle: "Complete reference for all available API endpoints",
      categories: {
        all: "All",
        conversion: "Conversion",
        manipulation: "Manipulation",
        security: "Security",
        ocr: "OCR"
      },
      parameters: "Parameters",
      paramName: "Name",
      type: "Type",
      required: "Required",
      description: "Description",
      responses: "Responses"
    },
    pricing: {
      title: "API Pricing",
      subtitle: "Choose the right plan for your API integration needs",
      monthly: "Monthly billing",
      yearly: "Annual billing",
      discount: "Save 20%",
      forever: "forever",
      includes: "What's included:",
      getStarted: "Get Started",
      subscribe: "Subscribe",
      freePlan: {
        description: "For occasional use and testing",
        feature1: "100 operations per month",
        feature2: "10 requests per hour",
        feature3: "1 API key",
        feature4: "Basic PDF operations"
      },
      basicPlan: {
        description: "For startups and small projects",
        feature1: "1,000 operations per month",
        feature2: "100 requests per hour",
        feature3: "3 API keys",
        feature4: "All PDF operations",
        feature5: "Basic OCR"
      },
      proPlan: {
        description: "For businesses and power users",
        feature1: "10,000 operations per month",
        feature2: "1,000 requests per hour",
        feature3: "10 API keys",
        feature4: "Advanced OCR",
        feature5: "Priority support",
        feature6: "Custom watermarks"
      },
      enterprisePlan: {
        description: "For high-volume integrations",
        feature1: "100,000+ operations per month",
        feature2: "5,000+ requests per hour",
        feature3: "50+ API keys",
        feature4: "Dedicated support",
        feature5: "Custom integration help",
        feature6: "White-label options"
      },
      customPricing: {
        title: "Need a custom solution?",
        description: "For high-volume API usage or specialized integration requirements, we offer custom pricing with dedicated support.",
        contactSales: "Contact Sales",
        enterprisePlus: "Enterprise+",
        dedicated: "Dedicated infrastructure",
        sla: "Custom SLAs",
        account: "Dedicated account manager",
        custom: "Custom pricing"
      }
    },
    authentication: {
      loginRequired: "Login Required",
      loginMessage: "Sign in to your account to access your API keys.",
      signIn: "Sign In",
      yourApiKey: "Your API Key",
      noApiKeys: "You don't have any API keys yet.",
      managementKeys: "Manage API Keys",
      createApiKey: "Create API Key",
      title: "API Authentication",
      subtitle: "Secure your API requests with API keys",
      apiKeys: {
        title: "API Keys",
        description: "All requests to the ScanPro API require authentication using an API key. Your API key carries many privileges, so be sure to keep it secure!"
      },
      howTo: {
        title: "How to Authenticate",
        description: "You can authenticate your API requests in one of two ways:"
      },
      header: {
        title: "1. Using the HTTP Header (Recommended)",
        description: "Include your API key in the x-api-key header of your HTTP request:"
      },
      query: {
        title: "2. Using a Query Parameter",
        description: "Alternatively, you can include your API key as a query parameter:"
      },
      security: {
        title: "Security Best Practices",
        item1: "Never share your API key publicly",
        item2: "Don't store API keys in client-side code",
        item3: "Set appropriate permissions for your API keys",
        item4: "Rotate your API keys periodically"
      },
      limits: {
        title: "Rate Limits & Quotas",
        description: "API requests are subject to rate limits based on your subscription tier:",
        plan: "Plan",
        operations: "Operations",
        rate: "Rate Limit",
        keys: "API Keys"
      },
      errors: {
        title: "Rate Limit Errors",
        description: "When you exceed your rate limit, the API will return a 429 Too Many Requests response with the following headers:"
      }
    },
    api: {
      question1: "How do I get an API key?",
      answer1: "Register for an account, then go to Dashboard > API Keys to create your first API key. Free accounts get 1 API key, Basic subscribers get 3, Pro subscribers get 10, and Enterprise users get 50+ keys.",
      question2: "What are the API rate limits?",
      answer2: "Rate limits depend on your subscription tier: Free (10 requests/hour), Basic (100 requests_hour), Pro (1,000 requests/hour), Enterprise (5,000+ requests/hour). Monthly operation limits also apply to each tier.",
      question3: "How do I integrate the API with my application?",
      answer3: "Our API uses standard REST endpoints with JSON responses. You can find comprehensive documentation, code samples, and SDKs in our Developer section. We provide examples for various programming languages including JavaScript, Python, PHP, and Java."
    },
    overview: {
      title: "API Overview",
      subtitle: "Everything you need to know about our API",
      intro: "The ScanPro API allows you to integrate our PDF processing capabilities directly into your applications. With a simple RESTful interface, you can convert, compress, merge, split, and perform other operations on PDFs programmatically.",
      features: {
        title: "Key Features",
        restful: "RESTful API with JSON responses",
        authentication: "Simple authentication with API keys",
        operations: "Comprehensive PDF operations including conversion, compression, merging, and more",
        scalable: "Scalable pricing tiers to match your needs",
        secure: "Secure file handling with encrypted transfers and automatic file deletion"
      },
      gettingStarted: "Getting Started",
      startSteps: "To get started with the ScanPro API:",
      step1: "Sign up for an account",
      step2: "Generate an API key from your dashboard",
      step3: "Make your first API request using the examples provided",
      getStarted: "Get Started"
    },
    tools: {
      conversion: {
        title: "PDF Conversion",
        description: "Convert PDFs to various formats (DOCX, XLSX, JPG) and vice versa."
      },
      manipulation: {
        title: "PDF Manipulation",
        description: "Merge multiple PDFs, split PDFs into separate files, or compress PDFs to reduce file size."
      },
      security: {
        title: "PDF Security",
        description: "Add password protection, unlock protected PDFs, and add watermarks for document security."
      },
      viewEndpoints: "View Endpoints"
    },

  },
  pricing: {
    // Metadata
    description: "Choose the right plan for your PDF needs. ScanPro offers flexible pricing options from free to enterprise, with the features you need.",

    // Page content
    title: "Simple, transparent pricing",
    subtitle: "Choose the plan that's right for you. All plans include our core PDF tools.",
    monthly: "Monthly",
    yearly: "Yearly",
    saveUp: "Save up to 20%",
    subscribe: "Subscribe",
    feature: "Feature",
    featureCompare: "Feature Comparison",

    // Features
    features: {
      operations: "Monthly operations",
      amount: {
        free: "100 operations",
        basic: "1,000 operations",
        pro: "10,000 operations",
        enterprise: "100,000 operations"
      },
      apiAccess: "API Access",
      apiKeys: {
        free: "1 API key",
        basic: "3 API keys",
        pro: "10 API keys",
        enterprise: "50 API keys"
      },
      rateLimits: "Rate limit",
      rateLimit: {
        free: "100 requests/hour",
        basic: "1000 requests/hour",
        pro: "2000 requests/hour",
        enterprise: "5000 requests/hour"
      },
      fileSizes: "Max file size",
      fileSize: {
        free: "25 MB",
        basic: "50 MB",
        pro: "100 MB",
        enterprise: "200 MB"
      },
      ocr: "OCR (Text recognition)",
      watermarking: "Watermarking",
      advancedProtection: "Advanced PDF protection",
      bulkProcessing: "Bulk processing",
      supports: "Support",
      support: {
        free: "Email support",
        priority: "Priority support",
        dedicated: "Dedicated support"
      },
      whiteLabel: "White-label options",
      serviceLevel: "Service Level Agreement"
    },

    // Plan descriptions
    planDescriptions: {
      free: "For occasional PDF needs",
      basic: "For individuals and small teams",
      pro: "For professionals and businesses",
      enterprise: "For large organizations"
    },

    // FAQ section
    faq: {
      title: "Frequently Asked Questions",
      q1: {
        title: "What are PDF operations?",
        content: "PDF operations include converting PDFs to other formats (Word, Excel, etc.), compressing PDFs, merging PDFs, splitting PDFs, adding watermarks, extracting text, and any other action performed on a PDF file through our service."
      },
      q2: {
        title: "Can I upgrade or downgrade my plan?",
        content: "Yes, you can upgrade or downgrade your plan at any time. When upgrading, the new plan takes effect immediately. When downgrading, the new plan will take effect at the end of your current billing cycle."
      },
      q3: {
        title: "Do you offer refunds?",
        content: "We offer a 7-day money-back guarantee on all paid plans. If you're not satisfied with our service, you can request a refund within 7 days of your initial purchase."
      },
      q4: {
        title: "What happens if I exceed my monthly operation limit?",
        content: "If you reach your monthly operation limit, you will not be able to perform additional operations until your limit resets at the beginning of your next billing cycle. You can upgrade your plan at any time to increase your limit."
      },
      q5: {
        title: "Is my data secure?",
        content: "Yes, we take data security seriously. All file uploads and processing are done over secure HTTPS connections. We do not store your files longer than necessary for processing, and all files are automatically deleted after processing is complete."
      }
    },

    // CTA section
    cta: {
      title: "Ready to get started?",
      subtitle: "Choose the plan that's right for you and start transforming your PDFs today.",
      startBasic: "Start with Basic",
      explorePdfTools: "Explore PDF Tools"
    },

    // Login dialog
    loginRequired: "Sign in required",
    loginRequiredDesc: "You need to sign in to your account before subscribing. Would you like to sign in now?",

    // Plan buttons
    getStarted: "Get Started",
    currentPlan: "Current Plan"
  },
  notFound: {
    title: "Page Not Found",
    description: "The page you're looking for doesn't exist or has been moved.",
    back: "Go Back",
    home: "Return to Home"
  },
  signPdf: {
    title: "Sign PDF: Add Digital Signatures to Documents",
    description: "Easily add digital signatures, text annotations, stamps, and drawings to your PDF documents",
    howTo: {
      title: "How to Sign PDF Documents",
      step1: {
        title: "Upload Your PDF",
        description: "Upload the PDF document you want to sign or annotate"
      },
      step2: {
        title: "Add Your Signature",
        description: "Create, upload, or draw your signature and place it on the document"
      },
      step3: {
        title: "Save & Download",
        description: "Save your changes and download the signed PDF document"
      }
    },
    tools: {
      signature: "Signature",
      text: "Text",
      stamp: "Stamp",
      draw: "Draw",
      image: "Image"
    },
    options: {
      draw: "Draw Signature",
      upload: "Upload Signature",
      type: "Type Signature",
      clear: "Clear",
      save: "Save Signature",
      color: "Color",
      fontSize: "Font Size",
      cancel: "Cancel",
      apply: "Apply",
      position: "Position"
    },
    stamps: {
      approved: "Approved",
      rejected: "Rejected",
      draft: "Draft",
      final: "Final",
      confidential: "Confidential"
    },
    messages: {
      noFile: "No file selected",
      uploadFirst: "Please upload a PDF file to sign",
      processing: "Processing your PDF...",
      signed: "PDF successfully signed!",
      downloadReady: "Your signed PDF is ready to download",
      error: "Error signing PDF",
      errorDesc: "There was an error processing your request. Please try again."
    },
    faq: {
      title: "Frequently Asked Questions",
      legality: {
        question: "Are digital signatures legally binding?",
        answer: "Digital signatures created with our tool are visually similar to handwritten signatures. For legally binding electronic signatures that comply with regulations like eIDAS or ESIGN Act, you may need a qualified electronic signature service. Our tool is suitable for internal documents, drafts, or when visual signatures are sufficient."
      },
      security: {
        question: "How secure are the signatures?",
        answer: "Our signatures are visual overlays on the PDF document. They provide a visual representation of consent but do not include cryptographic security features found in advanced digital signature solutions. Your documents are processed securely, and we don't store your signed PDFs."
      },
      formats: {
        question: "What signature formats are supported?",
        answer: "You can create signatures by drawing with your mouse/touchpad, uploading an image file (PNG, JPG with transparent background recommended), or typing your name in various font styles."
      },
      multipleSignatures: {
        question: "Can I add multiple signatures to a document?",
        answer: "Yes, you can add multiple signatures, text annotations, stamps, and drawings to your document. This is useful for documents that require signatures from multiple parties or need annotations in different locations."
      }
    },
    benefits: {
      title: "Benefits of Digital Signatures",
      paperless: {
        title: "Go Paperless",
        description: "Eliminate the need to print, sign, scan, and email documents"
      },
      time: {
        title: "Save Time",
        description: "Sign documents instantly from anywhere without physical handling"
      },
      professional: {
        title: "Professional Appearance",
        description: "Create clean, professional-looking signed documents"
      },
      workflow: {
        title: "Streamlined Workflow",
        description: "Speed up document approvals and business processes"
      }
    },
    useCases: {
      title: "Common Use Cases",
      contracts: {
        title: "Contracts & Agreements",
        description: "Add your signature to business contracts and agreements"
      },
      forms: {
        title: "Forms & Applications",
        description: "Fill out and sign forms without printing"
      },
      approvals: {
        title: "Document Approvals",
        description: "Mark documents as approved with official stamps and signatures"
      },
      feedback: {
        title: "Feedback & Revisions",
        description: "Add comments and annotations to documents during review"
      }
    },
    draw: "Draw",
    addText: "Add Text",
    addImage: "Add Image",
    download: "Download Signed PDF",
    processing: "Processing...",
    clearAll: "Clear All",
    uploadSignature: "Upload Signature",
    drawSignature: "Draw Signature",
    signatureOptions: "Signature Options",
    annotationTools: "Annotation Tools",
    pages: "Pages",
    uploadTitle: "Upload PDF to Sign",
    uploadDesc: "Drag and drop your PDF file here, or click to browse"
  },
  ocrPdf: {
    title: 'OCR PDF',
    description: 'Convert non-selectable PDF files into selectable and searchable PDF with high accuracy using OCR text technology',
    step1Title: 'Upload Your PDF',
    step1Description: 'Upload the scanned PDF or image-based document you want to make searchable with OCR text',
    step2Title: 'OCR Processing',
    step2Description: 'Our advanced OCR technology recognizes and extracts scanned text from your PDF',
    step3Title: 'Download Searchable PDF',
    step3Description: 'Get your enhanced PDF with selectable, copyable, and searchable text files',
    howItWorksTitle: 'How OCR Technology Works',
    howItWorksDescription: 'Optical Character Recognition (OCR) is a technology that converts different types of documents, such as scanned PDF files or images, into editable and searchable data. Apply OCR to your scanned PDF to edit in Adobe Acrobat.',
    feature1Title: 'Scanned Documents to Text',
    feature1Description: 'OCR converts scanned documents and images into machine-readable text, making them searchable and editable in Adobe Acrobat.',
    feature2Title: 'Multi-language Support',
    feature2Description: 'Our OCR engine recognizes text in multiple languages with high accuracy, even in complex documents.',
    benefitsTitle: 'Why Use OCR for Your PDFs?',
    benefit1Title: 'Searchability',
    benefit1Description: 'Find information quickly by searching for OCR text within your documents',
    benefit2Title: 'Copy & Paste',
    benefit2Description: 'Copy text directly from PDF documents instead of retyping content',
    benefit3Title: 'Archiving',
    benefit3Description: 'Create searchable archives from scanned documents and older text files',
    benefit4Title: 'Analytics',
    benefit4Description: 'Analyze document content with text extraction and data processing',
    faqTitle: 'Frequently Asked Questions',
    faq1Question: 'Is my data secure during OCR processing?',
    faq1Answer: 'Yes, we take data security seriously. All file uploads and processing occur on secure servers. Your files are automatically deleted after 24 hours, and we don\'t use your documents for any purpose other than providing the OCR service.',
    relatedToolsTitle: 'Related PDF Tools',
    tool1Href: '/compress-pdf',
    tool1Title: 'Compress PDF',
    tool1IconColor: 'text-green-500',
    tool1BgColor: 'bg-green-100 dark:bg-green-900/30',
    tool2Href: '/pdf-to-word',
    tool2Title: 'PDF to Word',
    tool2IconColor: 'text-blue-500',
    tool2BgColor: 'bg-blue-100 dark:bg-blue-900/30',
    tool3Href: '/merge-pdf',
    tool3Title: 'Merge PDF',
    tool3IconColor: 'text-red-500',
    tool3BgColor: 'bg-red-100 dark:bg-red-900/30',
    tool4Href: '/pdf-tools',
    tool4Title: 'All PDF Tools',
    tool4IconColor: 'text-purple-500',
    tool4BgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  rotatePdf: {
    // Page title and description
    title: "Rotate PDF Pages",
    description: "Easily rotate PDF pages clockwise, counterclockwise, or upside down with our online tool. Fix incorrectly scanned documents using precise pdf editing tools and buttons to rotate selected pages or a page range.",

    // How To section
    howTo: {
      title: "How to Rotate PDF Pages",
      step1: {
        title: "Upload PDF",
        description: "Select the PDF by dragging and dropping it or clicking to upload the file you want to rotate."
      },
      step2: {
        title: "Choose Rotation",
        description: "Click on the page thumbnails to select pages or a page range, then use the rotation tool to specify angles (90°, 180°, or 270°)."
      },
      step3: {
        title: "Download",
        description: "Process and download your rotated PDF document with all selected pages correctly oriented."
      }
    },

    // Why use this tool section
    why: {
      title: "Why Rotate PDF Pages",
      fixScanned: {
        title: "Fix Scanned Documents",
        description: "Correct the orientation of incorrectly scanned pages to make them readable using page thumbnails and the rotation tool."
      },
      presentation: {
        title: "Improve Presentations",
        description: "Rotate PDF pages or a single page to optimize viewing on screens or during presentations."
      },
      mixedOrientation: {
        title: "Fix Mixed Orientations",
        description: "Standardize documents with mixed portrait and landscape pages by rotating selected pages or a page range."
      },
      printing: {
        title: "Optimize for Printing",
        description: "Ensure all pages are correctly oriented before printing by using buttons to rotate a page range, saving paper."
      }
    },

    // Features section
    features: {
      title: "Rotation Features",
      individual: {
        title: "Individual Page Rotation",
        description: "Click on the page thumbnails to select and rotate a single page within your document."
      },
      batch: {
        title: "Batch Page Selection",
        description: "Rotate multiple pages at once by selecting a page range with options for odd, even, or all pages."
      },
      preview: {
        title: "Live Preview",
        description: "See how your rotated pages will look before processing with page thumbnails of selected pages."
      },
      precision: {
        title: "Precise Control",
        description: "Choose exact rotation angles of 90°, 180°, or 270° for each page using the rotation tool."
      }
    },

    // Form and UI elements
    form: {
      uploadTitle: "Upload PDF to Rotate",
      uploadDesc: "Drag and drop your PDF file here or click on the button to select the PDF and open the PDF for editing.",
      rotateAll: "Rotate All Pages",
      rotateEven: "Rotate Even Pages",
      rotateOdd: "Rotate Odd Pages",
      rotateSelected: "Rotate Selected Pages",
      selectPages: "Select Pages",
      rotateDirection: "Rotation Direction",
      clockwise90: "90° Clockwise",
      clockwise180: "180° (Upside Down)",
      counterClockwise90: "90° Counterclockwise",
      apply: "Apply Rotation",
      reset: "Reset All",
      processing: "Processing PDF...",
      success: "PDF rotated successfully!",
      error: "An error occurred while rotating the PDF",
      showSelector: "Select Pages",
      hideSelector: "Hide Page Selector"
    },

    // FAQ section
    faq: {
      title: "Frequently Asked Questions",
      permanent: {
        question: "Is the rotation permanent?",
        answer: "Yes, the rotation is permanently applied to the PDF. However, you can always open the PDF again and use buttons to rotate it back if needed."
      },
      quality: {
        question: "Does rotation affect PDF quality?",
        answer: "No, our online tool preserves the original quality of your PDF. Since we're only changing the orientation of selected pages and not recompressing the content, there's no loss in image or text quality."
      },
      size: {
        question: "Will rotation change my file size?",
        answer: "Rotating pages typically has minimal impact on file size. The file size might change slightly due to updated metadata, but the content of your page range remains unchanged."
      },
      limitations: {
        question: "Are there any limitations on rotation?",
        answer: "You can rotate files up to 100MB with our free plan. For larger files, consider upgrading to our premium plans. Additionally, the rotation tool provides standard angles (90°, 180°, 270°) for selected pages rather than arbitrary angles."
      },
      secured: {
        question: "Are my files secure during rotation?",
        answer: "Yes, all files are processed securely on our servers and automatically deleted after processing. We don’t retain or share your documents with any third parties when you select the PDF to rotate."
      }
    },

    // Best practices section
    bestPractices: {
      title: "Best Practices for PDF Rotation",
      dosList: [
        "Preview the document with page thumbnails before downloading the final version",
        "Use 180° rotation for upside-down pages with the rotation tool",
        "Rotate all pages at once if the entire document or a page range has the same orientation issue",
        "Save the original file before rotation as a backup",
        "Check all selected pages after rotation to ensure correct orientation"
      ],
      dontsList: [
        "Don't rotate password-protected PDFs without unlocking them first",
        "Don't mix 90° and 270° rotations in the same document if consistency is important",
        "Don't assume all pages need the same rotation - check each page thumbnail",
        "Don't rotate form fields if you need to keep them functional",
        "Don't rotate if the PDF is already correctly oriented"
      ],
      dos: "Do's",
      donts: "Don'ts"
    },

    // Related tools section
    relatedTools: {
      title: "Related Tools",
      compress: "Compress PDF",
      merge: "Merge PDF",
      split: "Split PDF",
      edit: "Edit PDF",
      viewAll: "View All Tools"
    },

    // Messages
    messages: {
      selectAll: "Select all",
      downloading: "Preparing download...",
      rotationApplied: "Rotation applied to {count} pages",
      dragDrop: "Drag and drop to reorder pages",
      pageOf: "Page {current} of {total}",
      selectPageInfo: "Click on the page thumbnails to select pages for rotation"
    }
  },
  pageNumber: {
    title: "Add Page Numbers to PDF",
    shortDescription: "Easily add page numbers to your PDF documents",
    description: "Add custom page numbers to a PDF with various number formats, positions, and styles using our online tool",

    uploadTitle: "Upload Your PDF",
    uploadDesc: "Upload a PDF file to add page numbers or headers. Your file will be processed securely, compatible with any operating system.",

    messages: {
      noFile: "Please upload a PDF file first",
      success: "Page numbers added successfully!",
      error: "Error adding page numbers",
      processing: "Processing your PDF..."
    },
    ui: {
      browse: "Browse Files",
      filesSecurity: "Your files are secure and never stored permanently",
      error: "Invalid file type. Please upload a PDF.",
      cancel: "Cancel",
      addPageNumbers: "Add Page Numbers",
      processingProgress: "Processing... ({progress}%)",
      successTitle: "Page Numbers Added Successfully",
      successDesc: "Your PDF has been processed and is ready to download",
      readyMessage: "Your PDF is ready!",
      readyDesc: "Your PDF file has been processed and page numbers have been added according to your settings.",
      download: "Download PDF",
      processAnother: "Process Another PDF",
      settingsTitle: "Page Number Settings",
      numberFormat: "Number Format",
      position: "Position",
      topLeft: "Top Left",
      topCenter: "Top Center",
      topRight: "Top Right",
      bottomLeft: "Bottom Left",
      bottomCenter: "Bottom Center",
      bottomRight: "Bottom Right",
      fontFamily: "Font Family",
      fontSize: "Font Size",
      color: "Color",
      startFrom: "Start From",
      prefix: "Prefix",
      suffix: "Suffix",
      horizontalMargin: "Horizontal Margin (px)",
      pagesToNumber: "Pages to Number",
      pagesHint: "Leave blank for all pages",
      pagesExample: "Use commas for individual pages and hyphens for ranges (e.g., 1,3,5-10)",
      skipFirstPage: "Skip first page (e.g., for cover pages)",
      preview: "Preview:",
      pagePreview: "Page preview"
    },
    howTo: {
      title: "How to Add Page Numbers",
      step1: {
        title: "Upload Your PDF",
        description: "Select the PDF file you want to number pages for"
      },
      step2: {
        title: "Customize Page Numbers",
        description: "Choose number formats, page range, position, font, and other settings to edit PDF"
      },
      step3: {
        title: "Download Your PDF",
        description: "Process and download your PDF with page numbers added using our online tool"
      }
    },

    benefits: {
      title: "Benefits of Adding Page Numbers",
      navigation: {
        title: "Improved Navigation",
        description: "Make it easier to navigate through your documents with clearly visible page numbers across any page range"
      },
      professional: {
        title: "Professional Documents",
        description: "Give your legal documents or business PDFs a professional look with properly formatted numbers"
      },
      organization: {
        title: "Better Organization",
        description: "Keep track of pages in large documents and reference specific pages easily with added numbers"
      },
      customization: {
        title: "Full Customization",
        description: "Customize the appearance and position of page numbers or add headers to match your document’s style and support other operating system."
      }
    },

    useCases: {
      title: "Common Use Cases",
      books: {
        title: "Books and E-books",
        description: "Easily add proper page numbering to your books, e-books, or reports for better readability and referencing"
      },
      academic: {
        title: "Academic Papers",
        description: "Number pages in theses, dissertations, and research papers according to academic standards with flexible format options"
      },
      business: {
        title: "Business Documents",
        description: "Add professional page numbers to proposals, reports, and business plans without needing Adobe Acrobat Pro"
      },
      legal: {
        title: "Legal Documents",
        description: "Apply consistent page numbering to legal documents like contracts and agreements for proper referencing"
      }
    },

    faq: {
      title: "Frequently Asked Questions",
      formats: {
        question: "What number formats are available?",
        answer: "Our online tool supports multiple number formats: numeric (1, 2, 3), Roman numerals (I, II, III), and alphabetic (A, B, C). Choose the format that fits your needs."
      },
      customize: {
        question: "Can I customize how page numbers appear?",
        answer: "Yes, you can fully customize your page numbers by adding prefixes (like 'Page '), suffixes (like ' of 10'), choosing fonts, sizes, colors, and positioning them anywhere on the page."
      },
      skipPages: {
        question: "Can I skip certain pages when adding page numbers?",
        answer: "Absolutely! You can specify a page range to number pages selectively or skip the first page (like a cover) with ease."
      },
      startNumber: {
        question: "Can I start page numbering from a specific number?",
        answer: "Yes, set the starting number for your sequence—ideal for documents continuing from others or with unique numbering needs."
      },
      security: {
        question: "Is my PDF secure when I upload it?",
        answer: "Yes, all processing is secure. Files are encrypted during transfer, processed, and deleted automatically—no permanent storage or access beyond adding numbers."
      }
    },

    relatedTools: {
      title: "Related Tools",
      // Optionally add references to tools like "Acrobat online" or "Adobe Acrobat Pro" alternatives here
    }
  },

pdfChat: {
  title: "Ask Anything PDF Chat",
  description: "Upload a PDF and ask questions about its contents",
  seo: {
    title: "Ask Anything PDF Chat - Interactive PDF Document Analysis",
    description: "Upload a PDF document and ask natural language questions to quickly get answers, summaries, and insights from any PDF file.",
    keywords: "pdf chat, ask pdf questions, pdf analysis, document ai, pdf assistant, document analysis"
  },
  whatYouCanAsk: {
    title: "What You Can Ask",
    summary: {
      title: "Get Summaries",
      description: "Ask for summaries of specific sections or the entire document."
    },
    find: {
      title: "Find Information",
      description: "Ask where specific information appears in the document."
    },
    extract: {
      title: "Extract Key Points",
      description: "Ask for lists of key points, dates, names, or other important information."
    },
    explain: {
      title: "Get Explanations",
      description: "Ask for explanations of complex concepts mentioned in the document."
    }
  },
  faq: {
    title: "Frequently Asked Questions",
    q1: {
      question: "What types of PDFs can I use?",
      answer: "You can use any PDF file that contains text content. The system works best with digital PDFs, but can also process scanned documents with readable text."
    },
    q2: {
      question: "Is my PDF data secure?",
      answer: "Yes, your PDF is processed securely. We don't permanently store the content of your documents, and all processing is done in a secure environment."
    },
    q3: {
      question: "Are there size limitations?",
      answer: "Yes, currently the maximum file size is 50MB. For very large documents, you may want to split them into smaller parts for better processing."
    },
    q4: {
      question: "Will the AI understand tables and charts?",
      answer: "The AI can extract and interpret text from tables, but understanding complex charts or diagrams may be limited. It works best with textual content."
    }
  },
  seoContent: {
    title: "Enhance Your Document Analysis",
    p1: "Our \"Ask Anything\" feature leverages advanced AI to help you quickly extract insights from PDF documents. Whether you're analyzing research papers, legal contracts, technical manuals, or any text-heavy document, this tool helps you find the information you need without spending hours reading through pages of content.",
    p2: "The AI assistant can understand the context of your questions and provide relevant information from the document. It can identify key sections, summarize content, explain complex terms, and even find specific details like dates, amounts, or clauses that might be buried deep within the text.",
    p3: "This feature is particularly useful for professionals who need to quickly analyze documents, students researching academic papers, or anyone who wants to save time by getting straight to the important information in their PDFs.",
    p4: "Try it now by uploading your PDF and asking a question!"
  },

  uploading: "Uploading PDF...",
  processing: "Processing PDF...",
  thinking: "Thinking...",
  send: "Send",
  uploadPrompt: "Upload your PDF document",
  askPrompt: "Ask a question about the document...",
  newPdf: "New PDF",
  dropHereDesc: "Drop your PDF file here or click to browse. I'll analyze it so you can ask questions about the content.",
  securityNote: "Your files are processed securely and not stored permanently.",
  poweredBy: "Powered by OpenAI",
  howItWorks: {
    title: "How It Works",
    step1: {
      title: "Upload Your PDF",
      description: "Simply drag and drop your PDF file into the upload area or click to browse your files."
    },
    step2: {
      title: "AI Processes the Content",
      description: "Our AI quickly analyzes the entire document to understand its content and structure."
    },
    step3: {
      title: "Ask Questions",
      description: "Ask anything about the document and get accurate answers drawing from the PDF content."
    }
  },
},
}

