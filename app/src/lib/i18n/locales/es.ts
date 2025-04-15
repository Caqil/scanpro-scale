import { Description } from "@radix-ui/react-alert-dialog";

/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
  metadata: {
    title: "ScanPro - Convertidor PDF gratuito, editor, OCR y desbloquear PDF",
    template: "%s | ScanPro - Herramientas PDF",
    description: "Convierte, edita, desbloquea, comprime, une, divide y aplica OCR a PDF con ScanPro. Herramientas PDF gratuitas y rápidas en línea—sin necesidad de descargas.",
    keywords: "convertidor PDF, editor PDF, OCR en línea, desbloquear PDF, comprimir PDF, unir PDF, dividir PDF, herramientas PDF gratuitas, editor PDF en línea, ScanPro"
  },
  nav: {
    tools: "Herramientas",
    company: "Compañía",
    pricing: "Precios de la API",
    convertPdf: "Convertir PDF",
    convertPdfDesc: "Transformar PDFs hacia y desde otros formatos",
    selectLanguage: "Seleccionar idioma",
    downloadApp: "Descargar aplicación",
    getApp: "Obtén nuestra aplicación móvil para herramientas PDF en movimiento",
    appStores: "Obtener la aplicación ScanPro",
    mobileTools: "Herramientas PDF en movimiento",
    signIn: "Iniciar sesión",
    signUp: "Registrarse",
    signOut: "Cerrar sesión",
    dashboard: "Tablero",
    profile: "Perfil",
    account: "Cuenta"
  },
  auth: {
    email: "Correo electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    password: "Contraseña",
    passwordPlaceholder: "Tu contraseña",
    confirmPassword: "Confirmar contraseña",
    confirmPasswordPlaceholder: "Confirma tu contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    rememberMe: "Recordarme",
    signIn: "Iniciar sesión",
    signingIn: "Iniciando sesión...",
    orContinueWith: "O continuar con",
    dontHaveAccount: "¿No tienes una cuenta?",
    signUp: "Registrarse",
    loginSuccess: "Sesión iniciada con éxito",
    loginError: "Ocurrió un error. Por favor intenta de nuevo.",
    invalidCredentials: "Correo electrónico o contraseña inválidos",
    emailRequired: "El correo electrónico es obligatorio",
    passwordRequired: "La contraseña es obligatoria",
    invalidEmail: "Por favor ingresa una dirección de correo electrónico válida",
    name: "Nombre",
    namePlaceholder: "Tu nombre",
    createAccount: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    nameRequired: "El nombre es obligatorio",
    passwordLength: "La contraseña debe tener al menos 8 caracteres",
    passwordStrength: "Fuerza de la contraseña",
    passwordWeak: "Débil",
    passwordFair: "Regular",
    passwordGood: "Buena",
    passwordStrong: "Fuerte",
    passwordsDoNotMatch: "Las contraseñas no coinciden",
    agreeTerms: "Acepto los",
    termsOfService: "términos de servicio",
    and: "y",
    privacyPolicy: "política de privacidad",
    agreeToTerms: "Por favor acepta los términos de servicio",
    registrationFailed: "Registro fallido",
    accountCreated: "Cuenta creada con éxito",
    unknownError: "Ocurrió un error",
    forgotInstructions: "Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.",
    sendResetLink: "Enviar enlace de restablecimiento",
    sending: "Enviando...",
    resetEmailSent: "Correo de restablecimiento de contraseña enviado",
    resetPasswordError: "Error al enviar el correo de restablecimiento",
    checkYourEmail: "Revisa tu correo",
    resetInstructions: "Si existe una cuenta con ese correo, hemos enviado instrucciones para restablecer tu contraseña.",
    didntReceiveEmail: "¿No recibiste un correo?",
    tryAgain: "Intentar de nuevo",
    backToLogin: "Volver al inicio de sesión",
    validatingToken: "Validando su enlace de restablecimiento...",
    invalidToken: "Este enlace de restablecimiento de contraseña no es válido o ha expirado. Por favor, solicite uno nuevo.",
    requestNewLink: "Solicitar un nuevo enlace de restablecimiento",
    passwordResetSuccess: "Contraseña restablecida con éxito",
    passwordResetSuccessMessage: "Su contraseña ha sido restablecida con éxito. Será redirigido a la página de inicio de sesión en breve.",
    passwordResetSuccessSubtext: "Si no es redirigido automáticamente, haga clic en el botón de abajo.",
    resettingPassword: "Restableciendo contraseña...",
    resetPassword: "Restablecer contraseña",
  },
  dashboard: {
    title: "Tablero",
    overview: "Resumen",
    apiKeys: "Claves API",
    subscription: "Suscripción",
    profile: "Perfil",
    totalUsage: "Uso total",
    operations: "operaciones este mes",
    active: "Activo",
    inactive: "Inactivo",
    keysAllowed: "claves permitidas",
    mostUsed: "Más usado",
    of: "de",
    files: "archivos",
    usageByOperation: "Uso por operación",
    apiUsageBreakdown: "Desglose del uso de tu API para el mes actual",
    noData: "No hay datos disponibles",
    createApiKey: "Crear clave API",
    revokeApiKey: "Revocar clave API",
    confirmRevoke: "¿Estás seguro de que quieres revocar esta clave API? Esta acción no se puede deshacer.",
    keyRevoked: "Clave API revocada con éxito",
    noApiKeys: "Sin claves API",
    noApiKeysDesc: "Aún no has creado ninguna clave API.",
    createFirstApiKey: "Crea tu primera clave API",
    keyName: "Nombre de la clave",
    keyNamePlaceholder: "Mi clave API",
    keyNameDesc: "Dale a tu clave un nombre descriptivo para identificarla fácilmente más tarde.",
    permissions: "Permisos",
    generateKey: "Generar clave",
    newApiKeyCreated: "Nueva clave API creada",
    copyKeyDesc: "Copia esta clave ahora. Por razones de seguridad, no podrás verla de nuevo.",
    copyAndClose: "Copiar y cerrar",
    keyCopied: "Clave API copiada al portapapeles",
    lastUsed: "Último uso",
    never: "Nunca"
  },
  subscription: {
    currentPlan: "Plan actual",
    subscriptionDetails: "Detalles de tu suscripción y límites de uso",
    plan: "Plan",
    free: "Gratis",
    basic: "Básico",
    pro: "Pro",
    enterprise: "Empresarial",
    renewsOn: "Tu suscripción se renueva el",
    cancelSubscription: "Cancelar suscripción",
    changePlan: "Cambiar plan",
    upgrade: "Actualizar",
    downgrade: "Reducir",
    features: "Características",
    limitations: "Limitaciones",
    confirm: "Confirmar",
    cancel: "Cancelar",
    subscriptionCanceled: "Suscripción cancelada con éxito",
    upgradeSuccess: "Suscripción actualizada con éxito",
    pricingPlans: "Planes de precios",
    monthly: "mes",
    operationsPerMonth: "operaciones por mes",
    requestsPerHour: "solicitudes por hora",
    apiKey: "Clave API",
    apiKeys: "Claves API",
    basicPdf: "Operaciones PDF básicas",
    allPdf: "Todas las operaciones PDF",
    basicOcr: "OCR básico",
    advancedOcr: "OCR avanzado",
    prioritySupport: "Soporte prioritario",
    customWatermarks: "Marcas de agua personalizadas",
    noWatermarking: "Sin marcas de agua",
    limitedOcr: "OCR limitado",
    noPrioritySupport: "Sin soporte prioritario",
    dedicatedSupport: "Soporte dedicado",
    customIntegration: "Ayuda con integración personalizada",
    whiteLabel: "Opciones de marca blanca"
  },
  profile: {
    // Personal Information
    personalInfo: "Información personal",
    updatePersonalInfo: "Actualiza tu información personal",
    name: "Nombre",
    namePlaceholder: "Ingresa tu nombre completo",
    email: "Correo electrónico",
    emailUnchangeable: "El correo electrónico no se puede cambiar",
    memberSince: "Miembro desde",
    updateProfile: "Actualizar perfil",
    updating: "Actualizando...",
    updateSuccess: "Perfil actualizado con éxito",
    updateFailed: "No se pudo actualizar el perfil",
    updateError: "Ocurrió un error al actualizar tu perfil",

    // Password Management
    changePassword: "Cambiar contraseña",
    updatePasswordDesc: "Actualiza la contraseña de tu cuenta",
    currentPassword: "Contraseña actual",
    currentPasswordPlaceholder: "Ingresa tu contraseña actual",
    newPassword: "Nueva contraseña",
    newPasswordPlaceholder: "Ingresa una nueva contraseña",
    confirmPassword: "Confirmar nueva contraseña",
    confirmPasswordPlaceholder: "Confirma tu nueva contraseña",
    changingPassword: "Cambiando contraseña...",
    passwordUpdateSuccess: "Contraseña actualizada con éxito",
    passwordUpdateFailed: "No se pudo actualizar la contraseña",
    passwordUpdateError: "Ocurrió un error al actualizar tu contraseña",

    // Password Validation
    passwordWeak: "Débil",
    passwordFair: "Regular",
    passwordGood: "Bueno",
    passwordStrong: "Fuerte",
    passwordMismatch: "Las nuevas contraseñas no coinciden",
    passwordLength: "La contraseña debe tener al menos 8 caracteres",
    passwordStrength: "Fuerza de la contraseña",
    passwordTips: "Por seguridad, elige una contraseña fuerte con al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y símbolos."
  },

  // Sección Hero
  hero: {
    badge: "Herramientas PDF Potentes",
    title: "Convertidor y Editor de PDF Todo en Uno",
    description: "Herramientas PDF gratuitas en línea para convertir, comprimir, combinar, dividir, rotar, agregar marcas de agua y más. No requiere instalación.",
    btConvert: "Comenzar a Convertir",
    btTools: "Explorar Todas las Herramientas"
  },

  popular: {
    pdfToWord: "PDF a Word",
    pdfToWordDesc: "Convierte fácilmente tus archivos PDF en documentos DOC y DOCX editables.",
    pdfToExcel: "PDF a Excel",
    pdfToExcelDesc: "Extrae datos directamente de PDF a hojas de cálculo de Excel en pocos segundos.",
    pdfToPowerPoint: "PDF a PowerPoint",
    pdfToPowerPointDesc: "Transforma tus presentaciones en PDF a diapositivas de PowerPoint editables.",
    pdfToJpg: "PDF a JPG",
    pdfToJpgDesc: "Convierte páginas de PDF a imágenes JPG o extrae todas las imágenes de un PDF.",
    pdfToPng: "PDF a PNG",
    pdfToPngDesc: "Convierte páginas de PDF a imágenes PNG transparentes de alta calidad.",
    pdfToHtml: "PDF a HTML",
    pdfToHtmlDesc: "Transforma documentos PDF en formato HTML compatible con la web.",
    wordToPdf: "Word a PDF",
    wordToPdfDesc: "Convierte documentos de Word a PDF con formato y diseño perfectos.",
    excelToPdf: "Excel a PDF",
    excelToPdfDesc: "Convierte tus hojas de cálculo de Excel en documentos PDF perfectamente formateados.",
    powerPointToPdf: "PowerPoint a PDF",
    powerPointToPdfDesc: "Convierte presentaciones de PowerPoint a PDF para compartir fácilmente.",
    jpgToPdf: "JPG a PDF",
    jpgToPdfDesc: "Crea archivos PDF a partir de tus imágenes JPG con opciones personalizables.",
    pngToPdf: "PNG a PDF",
    pngToPdfDesc: "Convierte imágenes PNG a PDF con soporte para fondo transparente.",
    htmlToPdf: "HTML a PDF",
    htmlToPdfDesc: "Convierte páginas web y contenido HTML en documentos PDF.",
    mergePdf: "Combinar PDF",
    mergePdfDesc: "Combina PDFs en el orden que desees con el fusionador de PDF más fácil disponible.",
    splitPdf: "Dividir PDF",
    splitPdfDesc: "Extrae páginas específicas o divide un PDF en varios documentos.",
    compressPdf: "Comprimir PDF",
    compressPdfDesc: "Reduce el tamaño del archivo mientras optimizas la máxima calidad del PDF.",
    rotatePdf: "Rotar PDF",
    rotatePdfDesc: "Cambia la orientación de las páginas rotando las páginas del PDF según sea necesario.",
    watermark: "Agregar marca de agua",
    watermarkDesc: "Agrega marcas de agua de texto o imagen para proteger y marcar tus documentos PDF.",
    unlockPdf: "Desbloquear PDF",
    unlockPdfDesc: "Elimina la protección por contraseña y las restricciones de los archivos PDF.",
    protectPdf: "Proteger PDF",
    protectPdfDesc: "Agrega protección con contraseña para asegurar tus documentos PDF.",
    signPdf: "Firmar PDF",
    signPdfDesc: "Agrega firmas digitales a tus documentos PDF de forma segura.",
    ocr: "OCR",
    ocrDesc: "Extrae texto de documentos escaneados usando Reconocimiento Óptico de Caracteres.",
    editPdf: "Editar PDF",
    editPdfDesc: "Realiza cambios en texto, imágenes y páginas de tus documentos PDF.",
    redactPdf: "Redactar PDF",
    redactPdfDesc: "Elimina permanentemente información sensible de tus archivos PDF.",
    viewAll: "Ver todas las herramientas de PDF"
  },

  // Sección de convertidor
  converter: {
    title: "Comenzar a Convertir",
    description: "Sube tu PDF y selecciona el formato al que deseas convertir",
    tabUpload: "Subir y Convertir",
    tabApi: "Integración API",
    apiTitle: "Integra con nuestra API",
    apiDesc: "Usa nuestra API REST para convertir PDFs programáticamente en tu aplicación",
    apiDocs: "Ver Documentos de la API"
  },

  // Página de conversión
  convert: {
    title: {
      pdfToWord: "Convertir PDF a Word en línea - Herramienta gratuita de PDF a DOC",
      pdfToExcel: "Convertir PDF a Excel en línea - Extraer datos de PDF a XLS",
      pdfToPowerPoint: "Convertir PDF a PowerPoint - Conversor de PDF a PPT",
      pdfToJpg: "Convertir PDF a imagen JPG - PDF a JPEG de alta calidad",
      pdfToPng: "Convertir PDF a PNG en línea - PDF a PNG transparente",
      pdfToHtml: "Convertir PDF a página web HTML - Conversor de PDF a HTML5",
      wordToPdf: "Convertir Word a PDF en línea - Conversor gratuito de DOC a PDF",
      excelToPdf: "Convertir Excel a PDF - Herramienta de conversión de XLS a PDF",
      powerPointToPdf: "Convertir PowerPoint a PDF en línea - PPT a PDF",
      jpgToPdf: "Convertir JPG a PDF en línea - Creador de PDF a partir de imágenes",
      pngToPdf: "Convertir PNG a PDF - Conversor de imágenes transparentes a PDF",
      htmlToPdf: "Convertir HTML a PDF en línea - Generador de PDF a partir de páginas web",
      generic: "Conversor de archivos en línea - Convertir documentos, imágenes y más"
    },
    description: {
      pdfToWord: "Transforme documentos PDF en archivos Word editables rápida y fácilmente. Nuestro conversor gratuito de PDF a Word preserva el formato para salida DOC/DOCX.",
      pdfToExcel: "Extraiga tablas y datos de archivos PDF a hojas de cálculo Excel. Convierta PDF a XLS/XLSX con formato de datos preciso para análisis.",
      pdfToPowerPoint: "Convierta presentaciones PDF en diapositivas PowerPoint editables. Nuestro conversor de PDF a PPT mantiene diseños de diapositivas y elementos de diseño.",
      pdfToJpg: "Convierta páginas PDF a imágenes JPG de alta calidad. Extraiga imágenes de PDF o guarde cada página como JPEG para compartir en línea.",
      pdfToPng: "Convierta páginas PDF a imágenes PNG transparentes. Perfecto para diseñadores gráficos que necesitan elementos PDF con fondos transparentes.",
      pdfToHtml: "Convierta documentos PDF a páginas web HTML. Cree sitios web HTML5 responsivos a partir de archivos PDF con nuestro conversor avanzado.",
      wordToPdf: "Convierta documentos Word a formato PDF con formato perfecto. Conversor gratuito de DOC/DOCX a PDF para resultados profesionales.",
      excelToPdf: "Transforme hojas de cálculo Excel a documentos PDF. Preserve fórmulas, gráficos y tablas al convertir XLS/XLSX a PDF.",
      powerPointToPdf: "Convierta presentaciones PowerPoint a formato PDF. El conversor de PPT/PPTX a PDF mantiene transiciones de diapositivas y notas.",
      jpgToPdf: "Cree archivos PDF a partir de sus imágenes JPG. Combine múltiples fotos JPEG en un solo documento PDF en línea.",
      pngToPdf: "Cree archivos PDF a partir de sus imágenes PNG. Convierta gráficos PNG transparentes a PDF preservando la transparencia.",
      htmlToPdf: "Convierta páginas web HTML a documentos PDF. Guarde sitios web como PDF con nuestra herramienta generadora de HTML a PDF en línea.",
      generic: "Seleccione un archivo para convertir entre formatos. Conversor de documentos en línea gratuito para PDF, Word, Excel, PowerPoint, JPG, PNG y HTML."
    },
    howTo: {
      title: "Cómo convertir {from} a {to} en línea",
      step1: {
        title: "Subir archivo",
        description: "Suba el archivo {from} que desea convertir desde su computadora, Google Drive o Dropbox"
      },
      step2: {
        title: "Convertir formato",
        description: "Haga clic en el botón Convertir y nuestro sistema procesará su archivo con tecnología de conversión avanzada"
      },
      step3: {
        title: "Descargar resultado",
        description: "Descargue su archivo {to} convertido al instante u obtenga un enlace compartible"
      }
    },
    options: {
      title: "Opciones avanzadas de conversión",
      ocr: "Habilitar OCR (Reconocimiento Óptico de Caracteres)",
      ocrDescription: "Extraer texto de documentos escaneados o imágenes para salida editable",
      preserveLayout: "Preservar diseño original",
      preserveLayoutDescription: "Mantener el formato y diseño original del documento con precisión",
      quality: "Calidad de salida",
      qualityDescription: "Establecer el nivel de calidad para el archivo convertido (afecta el tamaño del archivo)",
      qualityOptions: {
        low: "Baja (tamaño de archivo más pequeño, procesamiento más rápido)",
        medium: "Media (equilibrio entre calidad y tamaño)",
        high: "Alta (mejor calidad, archivos más grandes)"
      },
      pageOptions: "Opciones de página",
      allPages: "Todas las páginas",
      selectedPages: "Páginas seleccionadas",
      pageRangeDescription: "Ingrese números de página y/o rangos de página separados por comas",
      pageRangeExample: "Ejemplo: 1,3,5-12 (convierte las páginas 1, 3 y de la 5 a la 12)"
    },
    moreTools: "Herramientas relacionadas de conversión de documentos",
    expertTips: {
      title: "Consejos expertos de conversión",
      pdfToWord: [
        "Para mejores resultados de PDF a Word, asegúrese de que su PDF tenga texto claro y legible por máquina",
        "Habilite OCR para documentos escaneados o PDF basados en imágenes para extraer texto editable",
        "Los diseños complejos pueden requerir ajustes menores después de la conversión para un formato perfecto"
      ],
      pdfToExcel: [
        "Las tablas con bordes claros se convierten con mayor precisión de PDF a Excel",
        "Pre-procese PDF escaneados con OCR para una mejor extracción de datos a XLS/XLSX",
        "Verifique fórmulas de hoja de cálculo después de la conversión ya que pueden no transferirse automáticamente"
      ],
      generic: [
        "Configuraciones de mayor calidad resultan en archivos más grandes pero mejor salida",
        "Use OCR para documentos con texto escaneado o imágenes que contengan texto",
        "Siempre previsualice su archivo después de la conversión para asegurar precisión antes de descargar"
      ]
    },
    advantages: {
      title: "Beneficios de convertir {from} a {to}",
      pdfToWord: [
        "Edite y modifique texto que estaba bloqueado en formato PDF con nuestro conversor DOC",
        "Actualice contenido sin recrear todo el documento desde cero",
        "Extraiga información para usar en otros documentos Word o plantillas"
      ],
      pdfToExcel: [
        "Analice y manipule datos que estaban en forma estática de PDF usando herramientas XLS",
        "Cree gráficos y realice cálculos con datos de hoja de cálculo extraídos",
        "Actualice fácilmente informes financieros o información numérica en formato Excel"
      ],
      wordToPdf: [
        "Cree documentos PDF universalmente legibles que mantengan el formato perfecto",
        "Proteja contenido de modificaciones no deseadas con salida PDF segura",
        "Asegure apariencia consistente del documento en todos los dispositivos y plataformas"
      ],
      generic: [
        "Transforme su documento a un formato más útil y editable",
        "Acceda y use contenido en programas que soporten el tipo de archivo objetivo",
        "Comparta archivos en formatos que otros puedan abrir fácilmente sin software especial"
      ]
    }
  },
  features: {
    title: "Herramientas y Funciones Avanzadas de PDF | ScanPro",
    description: "Explora la suite completa de herramientas y funciones de PDF de ScanPro para la gestión, conversión, edición de documentos y más.",

    hero: {
      title: "Herramientas y Funciones Avanzadas de PDF",
      description: "Descubre la suite completa de herramientas y funciones que hacen de ScanPro la solución definitiva para todas tus necesidades de gestión documental."
    },

    overview: {
      power: {
        title: "Procesamiento Potente",
        description: "Algoritmos avanzados aseguran un procesamiento y conversión de documentos de alta calidad con precisión excepcional."
      },
      security: {
        title: "Seguridad de Nivel Bancario",
        description: "Tus documentos están protegidos con encriptación SSL de 256 bits y se eliminan automáticamente tras el procesamiento."
      },
      accessibility: {
        title: "Accesibilidad Universal",
        description: "Accede a tus documentos y nuestras herramientas desde cualquier dispositivo con compatibilidad total entre plataformas."
      }
    },

    allFeatures: {
      title: "Todas las Funciones"
    },

    learnMore: "Aprende Más",

    categories: {
      conversion: {
        title: "Conversión de PDF",
        description: "Convierte PDFs desde y hacia varios formatos con alta precisión y retención de formato.",
        features: {
          pdfToWord: {
            title: "Conversión de PDF a Word",
            description: "Convierte archivos PDF a documentos Word editables con formato, tablas e imágenes preservados."
          },
          pdfToExcel: {
            title: "Conversión de PDF a Excel",
            description: "Extrae tablas de PDFs a hojas de cálculo Excel editables con formato de datos preciso."
          },
          pdfToImage: {
            title: "Conversión de PDF a Imagen",
            description: "Convierte páginas PDF a imágenes JPG, PNG o TIFF de alta calidad con resolución personalizable."
          },
          officeToPdf: {
            title: "Conversión de Office a PDF",
            description: "Convierte archivos Word, Excel y PowerPoint a formato PDF con diseño y formato preservados."
          }
        }
      },

      editing: {
        title: "Edición y Gestión de PDF",
        description: "Edita, organiza y optimiza tus documentos PDF con nuestro conjunto completo de herramientas.",
        features: {
          merge: {
            title: "Combinar PDFs",
            description: "Combina múltiples archivos PDF en un solo documento con orden de páginas personalizable."
          },
          split: {
            title: "Dividir PDFs",
            description: "Divide PDFs grandes en documentos más pequeños por rangos de páginas o extrae páginas específicas."
          },
          compress: {
            title: "Comprimir PDFs",
            description: "Reduce el tamaño de archivos PDF manteniendo la calidad para facilitar el uso compartido y almacenamiento."
          },
          watermark: {
            title: "Agregar Marcas de Agua",
            description: "Agrega marcas de agua de texto o imagen a tus PDFs con transparencia, posición y rotación personalizables."
          }
        }
      },

      security: {
        title: "Seguridad y Protección de PDF",
        description: "Protege tus documentos PDF con encriptación, protección por contraseña y firmas digitales.",
        features: {
          protect: {
            title: "Protección con Contraseña",
            description: "Encripta PDFs con protección por contraseña para controlar el acceso y evitar vistas no autorizadas."
          },
          unlock: {
            title: "Desbloqueo de PDF",
            description: "Elimina la protección por contraseña de PDFs donde tengas acceso autorizado."
          },
          signature: {
            title: "Firmas Digitales",
            description: "Agrega firmas digitales a PDFs para autenticación y verificación de documentos."
          },
          redaction: {
            title: "Redacción de PDF",
            description: "Elimina permanentemente información sensible de documentos PDF."
          }
        }
      },

      ocr: {
        title: "Tecnología OCR",
        description: "Extrae texto de documentos escaneados e imágenes usando nuestra avanzada tecnología OCR.",
        features: {
          textExtraction: {
            title: "Extracción de Texto",
            description: "Extrae texto de PDFs escaneados e imágenes con alta precisión y soporte multilingüe."
          },
          searchable: {
            title: "PDFs Buscables",
            description: "Convierte documentos escaneados en PDFs buscables con reconocimiento de texto."
          },
          multilingual: {
            title: "Soporte Multilingüe",
            description: "Soporte OCR para más de 100 idiomas, incluyendo escrituras no latinas y caracteres especiales."
          },
          batchProcessing: {
            title: "Procesamiento por Lotes",
            description: "Procesa múltiples documentos a la vez con nuestras eficientes capacidades de OCR por lotes."
          }
        }
      },

      api: {
        title: "API e Integración",
        description: "Integra nuestras capacidades de procesamiento de PDF en tus aplicaciones con nuestro robusto API.",
        features: {
          restful: {
            title: "API RESTful",
            description: "API RESTful simple y potente para procesamiento de PDF y gestión documental."
          },
          sdks: {
            title: "SDKs y Bibliotecas",
            description: "SDKs amigables para desarrolladores en varios lenguajes de programación, incluyendo JavaScript, Python y PHP."
          },
          webhooks: {
            title: "Webhooks",
            description: "Notificaciones de eventos en tiempo real para flujos de trabajo de procesamiento de PDF asíncronos."
          },
          customization: {
            title: "Personalización de API",
            description: "Adapta el API a tus necesidades específicas con puntos finales y parámetros personalizables."
          }
        }
      },

      cloud: {
        title: "Plataforma en la Nube",
        description: "Accede a tus documentos desde cualquier lugar con nuestra plataforma segura de almacenamiento y procesamiento en la nube.",
        features: {
          storage: {
            title: "Almacenamiento en la Nube",
            description: "Almacena y accede de forma segura a tus documentos desde cualquier lugar con nuestro almacenamiento en la nube encriptado."
          },
          sync: {
            title: "Sincronización entre Dispositivos",
            description: "Sincroniza tus documentos sin problemas en todos tus dispositivos para acceso en movimiento."
          },
          sharing: {
            title: "Compartición de Documentos",
            description: "Comparte documentos fácilmente con enlaces seguros y controles de permisos."
          },
          history: {
            title: "Historial de Versiones",
            description: "Rastrea cambios en documentos con historial de versiones y restaura versiones anteriores cuando sea necesario."
          }
        }
      },

      enterprise: {
        title: "Funciones Empresariales",
        description: "Funciones avanzadas diseñadas para requisitos de negocios y empresas.",
        features: {
          batch: {
            title: "Procesamiento por Lotes",
            description: "Procesa cientos de documentos simultáneamente con nuestro eficiente sistema de procesamiento por lotes."
          },
          workflow: {
            title: "Flujos de Trabajo Personalizados",
            description: "Crea flujos de trabajo automatizados de procesamiento de documentos adaptados a tus necesidades empresariales."
          },
          compliance: {
            title: "Cumplimiento y Auditoría",
            description: "Funciones de seguridad mejoradas para cumplimiento de GDPR, HIPAA y otras regulaciones."
          },
          analytics: {
            title: "Análisis de Uso",
            description: "Perspectivas detalladas sobre actividades de procesamiento de documentos y operaciones de usuarios."
          }
        }
      }
    },

    mobile: {
      title: "Aplicación Móvil ScanPro",
      description: "Lleva las potentes herramientas de PDF de ScanPro contigo en movimiento. Nuestra aplicación móvil ofrece la misma funcionalidad robusta en una interfaz amigable para móviles.",
      feature1: {
        title: "Escanear y Digitalizar Documentos",
        description: "Usa tu cámara para escanear documentos físicos y convertirlos en PDFs de alta calidad al instante."
      },
      feature2: {
        title: "Editar PDFs en Movimiento",
        description: "Edita, anota y firma documentos PDF desde tu smartphone o tableta con facilidad."
      },
      feature3: {
        title: "Sincronización en la Nube",
        description: "Sincroniza tus documentos sin problemas en todos tus dispositivos con almacenamiento seguro en la nube."
      }
    },

    comparison: {
      title: "Comparación de Funciones",
      description: "Compara nuestros diferentes planes para encontrar el que mejor se adapte a tus necesidades.",
      feature: "Función",
      free: "Gratis",
      basic: "Básico",
      pro: "Pro",
      enterprise: "Empresarial",
      features: {
        convert: "Conversión de PDF",
        merge: "Combinar y Dividir",
        compress: "Compresión",
        ocr: "OCR Básico",
        advancedOcr: "OCR Avanzado",
        watermark: "Marcas de Agua",
        protect: "Protección con Contraseña",
        api: "Acceso a API",
        batch: "Procesamiento por Lotes",
        priority: "Soporte Prioritario",
        customWorkflow: "Flujos de Trabajo Personalizados",
        whiteLabel: "Etiqueta Blanca",
        dedicated: "Soporte Dedicado"
      }
    },

    testimonials: {
      title: "Qué Dicen Nuestros Usuarios",
      quote1: "ScanPro ha revolucionado la forma en que nuestro equipo maneja documentos. La funcionalidad OCR es increíblemente precisa y el procesamiento por lotes nos ahorra horas cada semana.",
      name1: "Sarah Johnson",
      title1: "Gerente de Operaciones",
      quote2: "La integración del API fue impecable. Hemos integrado ScanPro en nuestro flujo de trabajo y la diferencia en eficiencia es notable. Su equipo de soporte también es de primera.",
      name2: "David Chen",
      title2: "Líder Técnico",
      quote3: "Como pequeña empresaria, los precios asequibles y el conjunto completo de herramientas hacen de ScanPro un valor increíble. Me encanta especialmente la aplicación móvil que me permite manejar documentos en movimiento.",
      name3: "María García",
      title3: "Propietaria de Negocio"
    }
  },

  // Sección de llamada a la acción (CTA)
  cta: {
    title: "¿Listo para Convertir?",
    description: "Transforma tus PDFs a cualquier formato que necesites, completamente gratis.",
    startConverting: "Comenzar a Convertir",
    exploreTools: "Explorar Todas las Herramientas"
  },

  // Página de herramientas PDF
  pdfTools: {
    title: "Todas las Herramientas PDF",
    description: "Todo lo que necesitas para trabajar con PDFs en un solo lugar",
    categories: {
      convertFromPdf: "Convertir desde PDF",
      convertToPdf: "Convertir a PDF",
      basicTools: "Herramientas Básicas",
      organizePdf: "Organizar PDF",
      pdfSecurity: "Seguridad PDF"
    }
  },

  // Descripciones de herramientas
  toolDescriptions: {
    pdfToWord: "Convierte fácilmente tus archivos PDF en documentos DOC y DOCX editables.",
    pdfToPowerpoint: "Transforma tus archivos PDF en presentaciones PPT y PPTX editables.",
    pdfToExcel: "Extrae datos directamente de PDFs a hojas de cálculo de Excel en pocos segundos.",
    pdfToJpg: "Convierte cada página PDF en JPG o extrae todas las imágenes contenidas en un PDF.",
    pdfToPng: "Convierte cada página PDF en PNG o extrae todas las imágenes contenidas en un PDF.",
    pdfToHtml: "Convierte páginas web en HTML a PDF. Copia y pega la URL de la página.",
    wordToPdf: "Haz que los archivos DOC y DOCX sean fáciles de leer al convertirlos a PDF.",
    powerpointToPdf: "Haz que las presentaciones PPT y PPTX sean fáciles de ver al convertirlas a PDF.",
    excelToPdf: "Haz que las hojas de cálculo EXCEL sean fáciles de leer al convertirlas a PDF.",
    jpgToPdf: "Convierte imágenes JPG a PDF en segundos. Ajusta fácilmente la orientación y los márgenes.",
    pngToPdf: "Convierte imágenes PNG a PDF en segundos. Ajusta fácilmente la orientación y los márgenes.",
    htmlToPdf: "Convierte páginas web a PDF. Copia y pega la URL para convertirla a PDF.",
    mergePdf: "Combina PDFs en el orden que desees con el combinador de PDF más fácil disponible.",
    splitPdf: "Divide archivos PDF en varios documentos o extrae páginas específicas de tu PDF.",
    compressPdf: "Reduce el tamaño del archivo mientras optimizas para la máxima calidad PDF.",
    rotatePdf: "Rota tus PDFs como los necesites. ¡Incluso puedes rotar varios PDFs a la vez!",
    watermark: "Estampa una imagen o texto sobre tu PDF en segundos. Elige la tipografía, transparencia y posición.",
    unlockPdf: "Elimina la seguridad por contraseña del PDF, dándote la libertad de usar tus PDFs como quieras.",
    protectPdf: "Protege archivos PDF con una contraseña. Cifra documentos PDF para prevenir acceso no autorizado.",
    ocr: "Extrae texto de documentos escaneados usando Reconocimiento Óptico de Caracteres."
  },
  splitPdf: {
    title: "Dividir PDF - Separar páginas de PDF en línea",
    description: "Divide fácilmente archivos PDF en múltiples documentos, elimina páginas o extrae páginas específicas con nuestra herramienta gratuita de división de PDF en línea",
    howTo: {
      title: "Cómo dividir archivos PDF en línea",
      step1: {
        title: "Sube tu PDF",
        description: "Archivo y haz clic para subir el PDF que deseas dividir, eliminar páginas o extraer páginas usando nuestra función de arrastrar y soltar"
      },
      step2: {
        title: "Selecciona las páginas para dividir",
        description: "Elige tu método de división: selecciona páginas por rango, separa páginas de PDF individualmente o divide PDFs en múltiples archivos cada N páginas"
      },
      step3: {
        title: "Descarga los archivos divididos",
        description: "Descarga tus archivos PDF divididos o páginas separadas como documentos individuales al instante"
      }
    },
    options: {
      splitMethod: "Elige tu método de división",
      byRange: "Dividir por rangos de páginas",
      extractAll: "Extraer todas las páginas como PDFs separados",
      everyNPages: "Dividir cada N páginas",
      everyNPagesNumber: "Número de páginas por archivo",
      everyNPagesHint: "Cada archivo de salida contendrá esta cantidad de páginas",
      pageRanges: "Rangos de páginas",
      pageRangesHint: "Ingresa rangos de páginas separados por comas (por ejemplo, 1-5, 8, 11-13) para crear múltiples archivos PDF"
    },
    splitting: "Dividiendo PDF...",
    splitDocument: "Dividir documento",
    splitSuccess: "¡PDF dividido con éxito!",
    splitSuccessDesc: "Tu PDF ha sido dividido en {count} archivos separados",
    results: {
      title: "Resultados de la división de PDF",
      part: "Parte",
      pages: "Páginas",
      pagesCount: "páginas"
    },
    faq: {
      title: "Preguntas frecuentes sobre la división de PDFs",
      q1: {
        question: "¿Qué pasa con mis archivos PDF después de dividirlos?",
        answer: "Todos los archivos subidos y generados se eliminan automáticamente de nuestros servidores después de 24 horas para tu privacidad y seguridad."
      },
      q2: {
        question: "¿Hay un límite en cuántas páginas puedo dividir?",
        answer: "La versión gratuita admite PDFs de hasta 100 páginas. Actualiza a nuestro plan premium para archivos más grandes o división ilimitada."
      },
      q3: {
        question: "¿Puedo eliminar páginas o extraer páginas específicas de un PDF?",
        answer: "Sí, usa la opción 'Dividir por rangos de páginas' para eliminar páginas o extraer secciones específicas de tu PDF en línea."
      },
      q4: {
        question: "¿Puedo reordenar las páginas mientras divido?",
        answer: "Actualmente, el orden de las páginas se mantiene durante la división. Usa nuestra herramienta de fusión de PDF con arrastrar y soltar para reordenar las páginas después de dividir."
      }
    },
    useCases: {
      title: "Usos populares de nuestra herramienta de división de PDF",
      chapters: {
        title: "Separar páginas de PDF por capítulos",
        description: "Divide libros o informes grandes en capítulos individuales para facilitar el compartir y la navegación"
      },
      extract: {
        title: "Extraer páginas de PDF",
        description: "Selecciona páginas como formularios o certificados para extraerlos de documentos más largos con un simple archivo y clic"
      },
      remove: {
        title: "Eliminar páginas de PDF",
        description: "Elimina páginas no deseadas como anuncios o espacios en blanco seleccionando las páginas que deseas conservar y dividiendo en consecuencia"
      },
      size: {
        title: "Dividir PDFs en múltiples archivos para reducir el tamaño",
        description: "Divide PDFs grandes en archivos más pequeños para facilitar el envío por correo electrónico o mensajería con nuestro divisor de PDF en línea"
      }
    },
    newSection: {
      title: "¿Por qué usar nuestro divisor de PDF en línea?",
      description: "Nuestro divisor de PDF te permite separar páginas de PDF, eliminar páginas y dividir PDFs en múltiples archivos de manera rápida y segura. Disfruta de la simplicidad de arrastrar y soltar, selecciona páginas con precisión y gestiona tus documentos en línea sin descargas de software.",
      additional: "Ya sea que necesites separar páginas de PDF para un proyecto, eliminar páginas que no deseas o dividir PDFs en múltiples archivos para compartir más fácilmente, nuestro divisor de PDF en línea es la herramienta perfecta. Con una interfaz de usuario amigable de arrastrar y soltar, puedes subir tu archivo y hacer clic para seleccionar páginas sin esfuerzo. Nuestro servicio es rápido, seguro y gratuito, ideal para gestionar documentos PDF en línea sin instalar software. ¡Divide PDFs grandes, extrae páginas específicas o reduce tamaños de archivo con solo unos clics!"
    },
    seoContent: {
      title: "Domina la gestión de tus PDFs con nuestro divisor de PDF",
      p1: "¿Necesitas una forma sin complicaciones de dividir PDFs en múltiples archivos o extraer páginas específicas en línea? Nuestra herramienta de división de PDF está diseñada para aliviar el estrés de la gestión de documentos. Ya seas estudiante, profesional ocupado o simplemente estés organizando archivos personales, puedes eliminar páginas, elegir las que deseas y dividir PDFs grandes en un instante. Arrastra tu archivo al cargador, haz clic para elegir tu estilo de división —rangos de páginas, páginas individuales o cada pocas páginas— y listo. Es uno de los divisores de PDF en línea más útiles que encontrarás hoy.",
      p2: "Dividir PDFs no se vuelve más simple que esto. ¿Quieres tomar una página de un informe enorme? ¿Cansado de hojas en blanco o anuncios que lo desordenan todo? Nuestra herramienta te permite señalar exactamente qué páginas conservar y convertirlas en archivos separados o lotes más pequeños. Todo en línea, sin necesidad de descargas. Con nuestro divisor de PDF, puedes transformar un documento complicado en partes ordenadas y manejables, listas para enviar por correo, almacenar o compartir sin problemas de tamaño de archivo.",
      p3: "Nuestro divisor de PDF en línea destaca por su diseño sencillo y opciones robustas. Divide un libro de texto en capítulos o corta un contrato largo en partes clave sin complicaciones. La función de arrastrar y soltar lo hace fluido: solo suelta tu archivo y haz clic para empezar. Incluso puedes previsualizar tu PDF para elegir páginas con precisión antes de dividir. ¿Y lo mejor? Es gratis para archivos de hasta 100 páginas, por lo que cualquiera puede empezar de inmediato.",
      p4: "¿Por qué elegir nuestro divisor de PDF? Es rápido, seguro y lleno de flexibilidad. Extrae páginas para una presentación, elimina extras para limpiar un documento o divide PDFs en múltiples archivos para un mejor orden, todo desde tu navegador. Lo hemos optimizado para aparecer en búsquedas como 'dividir PDF en línea', 'eliminar páginas' y 'separar páginas de PDF', para que nos encuentres justo cuando nos necesites. ¡Pruébalo hoy y descubre lo fácil que puede ser la gestión de PDFs!"
    },
    relatedTools: "Herramientas relacionadas",
    popular: {
      viewAll: "Ver todas las herramientas"
    }
  },
  // Página de combinación de PDF
  mergePdf: {
    title: "Fusionar archivos PDF en línea | Herramienta gratuita de fusión de PDF en el navegador web",
    description: "Combine varios archivos PDF en un solo documento de manera rápida y sencilla con nuestra herramienta de fusión basada en el navegador que funciona en todos los sistemas operativos",
    intro: "Nuestra herramienta de fusión de PDF en línea le permite combinar varios documentos en un solo archivo fusionado con solo unos pocos clics. No se requiere instalación - funciona directamente en su navegador web en cualquier sistema operativo.",

    // How-to section
    howTo: {
      title: "Cómo fusionar archivos PDF en su navegador",
      step1: {
        title: "Subir archivos",
        description: "Suba los archivos PDF que desea combinar. Seleccione varios archivos a la vez desde su dispositivo o arrástrelos y suéltelos directamente en su navegador web."
      },
      step2: {
        title: "Ordenar",
        description: "Arrastre y suelte para reorganizar los archivos en el orden en que desea que aparezcan en el archivo fusionado final. Nuestra herramienta de fusión hace que organizar varios PDFs sea intuitivo."
      },
      step3: {
        title: "Descargar",
        description: "Haga clic en el botón 'Fusionar PDFs' y descargue su archivo PDF combinado directamente a su dispositivo desde cualquier navegador web."
      }
    },

    // Benefits section
    benefits: {
      title: "Beneficios de nuestra herramienta de fusión de PDF en línea",
      compatibility: {
        title: "Funciona en todos los dispositivos",
        description: "Nuestra herramienta de fusión de PDF basada en el navegador web funciona perfectamente en Windows, macOS, Linux y sistemas operativos móviles sin necesidad de instalación."
      },
      privacy: {
        title: "Segura y privada",
        description: "Sus documentos se procesan en su navegador web y se eliminan automáticamente después de la fusión, asegurando que su información sensible permanezca privada."
      },
      simplicity: {
        title: "Interfaz fácil de usar",
        description: "La interfaz intuitiva de arrastrar y soltar hace que fusionar varios archivos PDF sea simple, incluso para los usuarios primerizos de nuestra herramienta en línea."
      },
      quality: {
        title: "Salida de alta calidad",
        description: "Nuestra herramienta de fusión preserva el formato original, las imágenes y la calidad del texto en su archivo fusionado, garantizando resultados profesionales."
      }
    },

    // Use cases section
    useCases: {
      title: "Usos comunes para la fusión de PDF",
      business: {
        title: "Documentos comerciales",
        description: "Combine informes financieros, contratos y presentaciones en una documentación completa para clientes y partes interesadas."
      },
      academic: {
        title: "Trabajos académicos",
        description: "Fusiona artículos de investigación, citas y apéndices en una presentación académica completa lista para revisión."
      },
      personal: {
        title: "Registros personales",
        description: "Combine recibos, garantías y manuales de instrucciones en registros digitales organizados para una referencia fácil."
      },
      professional: {
        title: "Portafolios profesionales",
        description: "Cree portafolios impresionantes fusionando múltiples muestras de trabajo en un solo documento fácilmente compartible."
      }
    },

    // FAQ section
    faq: {
      title: "Preguntas frecuentes",
      q1: {
        question: "¿Hay un límite en cuántos PDFs puedo fusionar con su herramienta en línea?",
        answer: "Con nuestra herramienta de fusión gratuita basada en el navegador web, puede combinar hasta 20 archivos PDF a la vez. Para fusionar múltiples lotes más grandes, considere actualizar a nuestro plan premium que permite operaciones de fusión ilimitadas."
      },
      q2: {
        question: "¿Mis archivos PDF permanecerán privados al usar su herramienta de fusión en línea?",
        answer: "Sí, su privacidad es nuestra prioridad. Todos los archivos subidos a nuestra herramienta de fusión basada en el navegador se procesan de forma segura y se eliminan automáticamente de nuestros servidores después del procesamiento. Nunca accedemos ni almacenamos el contenido de sus documentos."
      },
      q3: {
        question: "¿Puedo fusionar PDFs protegidos con contraseña usando su herramienta en línea?",
        answer: "Para PDFs protegidos con contraseña, primero deberá desbloquearlos usando nuestra herramienta en línea de Desbloqueo de PDF y luego fusionarlos. Nuestra herramienta de fusión basada en el navegador le avisará si detecta documentos protegidos."
      },
      q4: {
        question: "¿Funciona su herramienta de fusión de PDF en línea en todos los sistemas operativos?",
        answer: "Sí, nuestra herramienta de fusión de PDF basada en el navegador web funciona en todos los sistemas operativos principales, incluidos Windows, macOS, Linux, iOS y Android. Siempre que tenga un navegador web moderno, puede fusionar PDFs sin instalar ningún software."
      },
      q5: {
        question: "¿Qué tan grandes pueden ser los archivos PDF para fusionar?",
        answer: "Nuestra herramienta de fusión en línea gratuita admite archivos de hasta 100 MB cada uno. El tamaño combinado de todos los archivos que se están fusionando no debe exceder los 300 MB para un rendimiento óptimo en su navegador web."
      },
      q6: {
        question: "¿El archivo fusionado mantendrá todas las características de los PDFs originales?",
        answer: "Sí, nuestra herramienta de fusión avanzada preserva el texto, las imágenes, el formato, los hipervínculos y la mayoría de los elementos interactivos de los PDFs originales en su archivo fusionado final."
      }
    },

    // Tips section
    tips: {
      title: "Consejos para fusionar PDFs de manera efectiva",
      tip1: {
        title: "Organizar antes de fusionar",
        description: "Renombre sus archivos numéricamente (por ejemplo, 01_intro.pdf, 02_content.pdf) antes de subirlos a nuestra herramienta de fusión para una organización más fácil."
      },
      tip2: {
        title: "Optimizar archivos grandes",
        description: "Use primero nuestra herramienta de Compresión de PDF si está fusionando varios documentos grandes para asegurar un mejor rendimiento del archivo fusionado final."
      },
      tip3: {
        title: "Revisar vista previa",
        description: "Después de organizar sus archivos, use la función de vista previa en nuestra herramienta en línea para verificar el orden antes de finalizar su PDF fusionado."
      },
      tip4: {
        title: "Considere marcadores",
        description: "Para documentos profesionales, considere agregar marcadores a su archivo fusionado usando nuestra herramienta de Edición de PDF para una navegación más fácil."
      }
    },

    // Comparison section
    comparison: {
      title: "Por qué elegir nuestra herramienta de fusión en el navegador web",
      point1: {
        title: "Sin instalación de software",
        description: "A diferencia de las aplicaciones de escritorio, nuestra herramienta de fusión de PDF en línea funciona directamente en su navegador web sin necesidad de descargar o instalar software."
      },
      point2: {
        title: "Compatibilidad multiplataforma",
        description: "Nuestra herramienta basada en el navegador funciona en todos los sistemas operativos, mientras que las alternativas de escritorio a menudo solo admiten plataformas específicas."
      },
      point3: {
        title: "Gratuita y accesible",
        description: "Acceda a nuestras capacidades de fusión de PDF sin costo, en comparación con alternativas de escritorio costosas o servicios de suscripción."
      },
      point4: {
        title: "Actualizaciones regulares",
        description: "Nuestra herramienta de fusión en línea se mejora constantemente sin requerir actualizaciones manuales por parte de los usuarios."
      }
    },

    // UI elements and messages
    ui: {
      of: "de",
      files: "archivos",
      filesToMerge: "Archivos para fusionar",
      dragToReorder: "Arrastrar para reordenar",
      downloadReady: "Listo para descargar",
      downloadMerged: "Descargar archivo fusionado",
      mergePdfs: "Fusionar PDFs",
      processingMerge: "Fusionando sus PDFs...",
      successMessage: "¡PDFs fusionados con éxito!",
      dragDropHere: "Arrastra y suelta PDFs aquí",
      or: "o",
      browseFiles: "Explorar archivos",
      fileLimit: "Combina hasta 20 archivos PDF",
      noPdfsSelected: "No se han seleccionado PDFs",
      addMoreFiles: "Agregar más archivos",
      rearrangeMessage: "Arrastra los archivos para reorganizar el orden en tu PDF fusionado",
      removeFile: "Eliminar",
      filePreview: "Vista previa",
      startOver: "Comenzar de nuevo",
      mergingInProgress: "Fusión en progreso...",
      pleaseWait: "Por favor, espera mientras combinamos tus archivos PDF",
      processingFile: "Procesando",
      retry: "Reintentar fusión"
    },
  },

  // Página OCR
  ocr: {
    title: "Extracción OCR: Reconocimiento de Texto Simplificado",
    description: "Convierte PDFs escaneados y archivos de imagen en texto editable usando software OCR avanzado y aprendizaje automático",
    howTo: {
      title: "Cómo Funciona la Extracción OCR",
      step1: { title: "Subir", description: "Sube tu PDF escaneado o archivo de imagen al convertidor de imagen a texto." },
      step2: { title: "Configurar la Herramienta OCR", description: "Selecciona el idioma, el rango de páginas y opciones avanzadas para un reconocimiento de texto óptimo." },
      step3: { title: "Extraer Texto", description: "Copia el texto extraído o descárgalo como archivo .txt con nuestro convertidor de imagen a texto." }
    },
    faq: {
      title: "Preguntas Frecuentes",
      questions: {
        accuracy: { question: "¿Qué tan precisa es la tecnología de extracción OCR?", answer: "Nuestro software OCR logra una precisión del 90-99% para texto impreso claro en documentos bien escaneados. La precisión puede disminuir con archivos de imagen de baja calidad o fuentes inusuales." },
        languages: { question: "¿Qué idiomas son compatibles?", answer: "Soportamos más de 100 idiomas, incluyendo inglés, francés, alemán, español, chino, japonés, árabe, ruso y muchos más." },
        recognition: { question: "¿Por qué no se reconoce mi texto correctamente?", answer: "Varios factores pueden afectar el reconocimiento: calidad del documento, resolución, contraste, diseños complejos, escritura a mano o selección de idioma incorrecta." },
        pageLimit: { question: "¿Hay un límite de páginas que puedo procesar?", answer: "Para usuarios gratuitos, el límite es de 50 páginas por PDF. Los usuarios premium pueden procesar PDFs de hasta 500 páginas." },
        security: { question: "¿Están mis datos seguros durante el procesamiento OCR?", answer: "Sí, tu seguridad es nuestra prioridad. Todos los archivos subidos se procesan en servidores seguros y se eliminan automáticamente tras el procesamiento." }
      }
    },
    relatedTools: "Herramientas Relacionadas de OCR y PDF",
    processing: { title: "Procesamiento con Software OCR", message: "El reconocimiento de texto puede tomar unos minutos dependiendo del tamaño y la complejidad del archivo" },
    results: { title: "Resultados del Texto Extraído", copy: "Copiar", download: "Descargar .txt" },
    languages: { english: "Inglés", french: "Francés", german: "Alemán", spanish: "Español", chinese: "Chino", japanese: "Japonés", arabic: "Árabe", russian: "Ruso" },
    whatIsOcr: {
      title: "¿Qué es la Extracción OCR?",
      description: "El Reconocimiento Óptico de Caracteres (OCR) es una tecnología impulsada por aprendizaje automático que convierte documentos escaneados, PDFs y archivos de imagen en texto editable y buscable.",
      explanation: "El convertidor de imagen a texto analiza la estructura de la imagen del documento, identifica caracteres y elementos de texto, y los convierte en un formato legible por máquina.",
      extractionList: { scannedPdfs: "PDFs escaneados donde el texto existe como imagen", imageOnlyPdfs: "PDFs solo de imagen sin capa de texto", embeddedImages: "PDFs con imágenes incrustadas con texto", textCopyingIssues: "Documentos donde copiar texto directamente no funciona" }
    },
    whenToUse: {
      title: "Cuándo Usar un Extractor de Imagen a Texto",
      idealFor: "Ideal para:",
      idealForList: { scannedDocuments: "Documentos escaneados guardados como PDFs", oldDocuments: "Documentos antiguos sin capa de texto digital", textSelectionIssues: "PDFs donde la selección/copia de texto no funciona", textInImages: "Archivos de imagen con texto a extraer", searchableArchives: "Crear archivos buscables a partir de documentos escaneados" },
      notNecessaryFor: "No necesario para:",
      notNecessaryForList: { digitalPdfs: "PDFs digitales nativos con texto seleccionable", createdDigitally: "PDFs creados directamente desde documentos digitales", copyPasteAvailable: "Documentos donde ya puedes copiar y pegar texto", formatPreservation: "Archivos que necesitan preservar el formato (usa nuestra conversión de PDF a DOCX en su lugar)" }
    },
    limitations: {
      title: "Limitaciones y Consejos de la Herramienta OCR",
      description: "Aunque nuestro software OCR es potente, hay algunas limitaciones a tener en cuenta:",
      factorsAffecting: "Factores que afectan la precisión del reconocimiento de texto:",
      factorsList: { documentQuality: "Calidad del documento (resolución, contraste)", complexLayouts: "Diseños y formatos complejos", handwrittenText: "Texto manuscrito (reconocimiento limitado)", specialCharacters: "Caracteres especiales y símbolos", multipleLanguages: "Múltiples idiomas en un documento" },
      tipsForBest: "Consejos para mejores resultados:",
      tipsList: { highQualityScans: "Usa escaneos de alta calidad (300 DPI o más)", correctLanguage: "Selecciona el idioma correcto para tu documento", enhanceScannedImages: "Habilita 'Mejorar imágenes escaneadas' para mayor precisión", smallerPageRanges: "Procesa rangos de páginas más pequeños para documentos grandes", reviewText: "Revisa y corrige el texto extraído después" }
    },
    options: { scope: "Páginas a Extraer", all: "Todas las Páginas", custom: "Páginas Específicas", pages: "Números de Página", pagesHint: "Ej. 1,3,5-9", enhanceScanned: "Mejorar imágenes escaneadas", enhanceScannedHint: "Preprocesar imágenes para mejorar la precisión OCR (recomendado para documentos escaneados)", preserveLayout: "Preservar diseño", preserveLayoutHint: "Intenta mantener el diseño original con párrafos y saltos de línea" },
    ocrTool: "Herramienta de Extracción OCR",
    ocrToolDesc: "Convierte documentos escaneados y archivos de imagen en texto editable con nuestro convertidor de imagen a texto",
    uploadPdf: "Subir Archivos para Extracción OCR",
    dragDrop: "Arrastra y suelta tu archivo PDF o de imagen aquí, o haz clic para buscar",
    selectPdf: "Seleccionar Archivo",
    uploading: "Subiendo...",
    maxFileSize: "Tamaño máximo del archivo: 50MB",
    invalidFile: "Tipo de archivo inválido",
    invalidFileDesc: "Por favor, selecciona un archivo PDF o de imagen soportado",
    fileTooLarge: "Archivo demasiado grande",
    fileTooLargeDesc: "El tamaño máximo del archivo es 50MB",
    noFile: "No se seleccionó ningún archivo",
    noFileDesc: "Por favor, selecciona un archivo para reconocimiento de texto",
    changeFile: "Cambiar Archivo",
    languageLabel: "Idioma del Documento",
    selectLanguage: "Seleccionar idioma",
    pageRange: "Rango de Páginas",
    allPages: "Todas las Páginas",
    specificPages: "Páginas Específicas",
    pageRangeExample: "ej., 1-3, 5, 7-9",
    pageRangeInfo: "Ingresa páginas individuales o rangos separados por comas",
    preserveLayout: "Preservar Diseño",
    preserveLayoutDesc: "Intenta mantener la estructura y formato del documento",
    extractText: "Extraer Texto",
    extractingText: "Extrayendo Texto...",
    processingPdf: "Procesando tu archivo",
    processingInfo: "Esto puede tomar unos minutos dependiendo del tamaño y la complejidad del archivo",
    analyzing: "Analizando contenido",
    preprocessing: "Preprocesando páginas",
    recognizing: "Reconociendo texto",
    extracting: "Extrayendo contenido",
    finalizing: "Finalizando resultados",
    finishing: "Terminando",
    extractionComplete: "Extracción de texto completada",
    extractionCompleteDesc: "Tu texto ha sido extraído exitosamente con nuestro extractor de imagen a texto",
    extractionError: "Fallo en la extracción de texto",
    extractionFailed: "No se pudo extraer el texto",
    unknownError: "Ocurrió un error desconocido",
    textCopied: "Texto copiado al portapapeles",
    copyFailed: "No se pudo copiar el texto",
    textPreview: "Vista Previa del Texto",
    rawText: "Texto Crudo",
    extractedText: "Texto Extraído",
    previewDesc: "Vista previa del texto extraído con formato",
    rawTextOutput: "Salida de Texto Crudo",
    rawTextDesc: "Texto plano sin formato",
    noTextFound: "No se encontró texto en el archivo",
    copyText: "Copiar Texto",
    downloadText: "Descargar Texto",
    processAnother: "Procesar Otro Archivo",
    supportedLanguages: "Soporta más de 15 idiomas incluyendo inglés, español, francés, alemán, chino, japonés y más. Selecciona el idioma adecuado para mayor precisión."
  },

  // Página de protección de PDF
  protectPdf: {
    title: "Proteger PDF con Contraseña",
    description: "Asegura tus documentos PDF con protección por contraseña y permisos de acceso personalizados",
    howTo: {
      title: "Cómo Proteger Tu PDF",
      step1: {
        title: "Subir",
        description: "Sube el archivo PDF que deseas proteger con una contraseña."
      },
      step2: {
        title: "Establecer Opciones de Seguridad",
        description: "Crea una contraseña y personaliza permisos para imprimir, copiar y editar."
      },
      step3: {
        title: "Descargar",
        description: "Descarga tu archivo PDF protegido con contraseña listo para compartir de forma segura."
      }
    },
    why: {
      title: "¿Por Qué Proteger Tus PDFs?",
      confidentiality: {
        title: "Confidencialidad",
        description: "Asegura que solo las personas autorizadas con la contraseña puedan abrir y ver tus documentos sensibles."
      },
      controlledAccess: {
        title: "Acceso Controlado",
        description: "Establece permisos específicos para determinar qué pueden hacer los destinatarios con tu documento, como imprimir o editar."
      },
      authorizedDistribution: {
        title: "Distribución Autorizada",
        description: "Controla quién puede acceder a tu documento al compartir contratos, investigaciones o propiedad intelectual."
      },
      documentExpiration: {
        title: "Expiración del Documento",
        description: "La protección con contraseña agrega una capa adicional de seguridad para documentos con tiempo limitado que no deberían estar accesibles indefinidamente."
      }
    },
    security: {
      title: "Entendiendo la Seguridad PDF",
      passwords: {
        title: "Contraseña de Usuario vs. Contraseña de Propietario",
        user: "Contraseña de Usuario: Requerida para abrir el documento. Nadie sin esta contraseña puede ver el contenido.",
        owner: "Contraseña de Propietario: Controla los permisos. Con nuestra herramienta, configuramos ambas contraseñas como la misma por simplicidad."
      },
      encryption: {
        title: "Niveles de Cifrado",
        aes128: "AES de 128 bits: Proporciona buena seguridad y es compatible con Acrobat Reader 7 y versiones posteriores.",
        aes256: "AES de 256 bits: Ofrece mayor seguridad pero requiere Acrobat Reader X (10) o versiones posteriores."
      },
      permissions: {
        title: "Controles de Permisos",
        printing: {
          title: "Impresión",
          description: "Controla si el documento puede imprimirse y a qué nivel de calidad."
        },
        copying: {
          title: "Copia de Contenido",
          description: "Controla si el texto y las imágenes pueden seleccionarse y copiarse al portapapeles."
        },
        editing: {
          title: "Edición",
          description: "Controla las modificaciones del documento, incluidas anotaciones, llenado de formularios y cambios de contenido."
        }
      }
    },
    form: {
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      encryptionLevel: "Nivel de Cifrado",
      permissions: {
        title: "Permisos de Acceso",
        allowAll: "Permitir Todo (Solo Contraseña para Abrir)",
        restricted: "Acceso Restringido (Permisos Personalizados)"
      },
      allowedActions: "Acciones Permitidas:",
      allowPrinting: "Permitir Impresión",
      allowCopying: "Permitir Copiar Texto e Imágenes",
      allowEditing: "Permitir Edición y Anotaciones"
    },
    bestPractices: {
      title: "Mejores Prácticas de Protección con Contraseña",
      dos: "Hacer",
      donts: "No Hacer",
      dosList: [
        "Usa contraseñas fuertes y únicas con una mezcla de letras, números y caracteres especiales",
        "Guarda las contraseñas de forma segura en un administrador de contraseñas",
        "Comparte contraseñas a través de canales seguros separados del PDF",
        "Usa cifrado de 256 bits para documentos altamente sensibles"
      ],
      dontsList: [
        "Usar contraseñas simples y fáciles de adivinar como \"contraseña123\" o \"1234\"",
        "Enviar la contraseña en el mismo correo que el PDF",
        "Usar la misma contraseña para todos tus PDFs protegidos",
        "Depender únicamente de la protección con contraseña para información extremadamente sensible"
      ]
    },
    faq: {
      encryptionDifference: {
        question: "¿Cuál es la diferencia entre los niveles de cifrado?",
        answer: "Ofrecemos cifrado AES de 128 bits y 256 bits. El de 128 bits es compatible con lectores PDF antiguos (Acrobat 7 y posteriores), mientras que el de 256 bits proporciona mayor seguridad pero requiere lectores más nuevos (Acrobat X y posteriores)."
      },
      removeProtection: {
        question: "¿Puedo eliminar la protección con contraseña más tarde?",
        answer: "Sí, puedes usar nuestra herramienta Desbloquear PDF para eliminar la protección con contraseña de tus archivos PDF, pero necesitarás conocer la contraseña actual para hacerlo."
      },
      securityStrength: {
        question: "¿Qué tan segura es la protección con contraseña?",
        answer: "Nuestra herramienta usa cifrado AES estándar de la industria. La seguridad depende de la fuerza de tu contraseña y del nivel de cifrado que elijas. Recomendamos usar contraseñas fuertes y únicas con una mezcla de caracteres."
      },
      contentQuality: {
        question: "¿La protección con contraseña afectará el contenido o la calidad del PDF?",
        answer: "No, la protección con contraseña solo agrega seguridad a tu documento y no altera el contenido, diseño o calidad de tu PDF de ninguna manera."
      },
      batchProcessing: {
        question: "¿Puedo proteger múltiples PDFs a la vez?",
        answer: "Actualmente, nuestra herramienta procesa un PDF a la vez. Para el procesamiento por lotes de múltiples archivos, considera nuestra API o soluciones premium."
      }
    },
    protecting: "Protegiendo...",
    protected: "¡PDF protegido con éxito!",
    protectedDesc: "Tu archivo PDF ha sido cifrado y protegido con contraseña."
  },
  watermarkPdf: {
    title: "Agregar marca de agua a PDF",
    description: "Agregue marcas de agua de texto o imagen personalizadas a sus documentos PDF para protección, marca o identificación.",
    textWatermark: "Marca de agua de texto",
    imageWatermark: "Marca de agua de imagen",
    privacyNote: "Sus archivos se procesan de forma segura. Todas las subidas se eliminan automáticamente después del procesamiento.",
    headerTitle: "Agregar marca de agua a PDF",
    headerDescription: "Agregue marcas de agua de texto o imagen personalizadas a sus documentos PDF para marca, protección de derechos de autor y clasificación de documentos.",
    invalidFileType: "Tipo de archivo no válido",
    selectPdfFile: "Por favor, seleccione un archivo PDF",
    fileTooLarge: "Archivo demasiado grande",
    maxFileSize: "El tamaño máximo del archivo es 50 MB",
    invalidImageType: "Tipo de imagen no válido",
    supportedFormats: "Formatos compatibles: PNG, JPG, SVG",
    imageTooLarge: "Imagen demasiado grande",
    maxImageSize: "El tamaño máximo de la imagen es 5 MB",
    noFileSelected: "No se seleccionó ningún archivo",
    noImageSelected: "No se seleccionó ninguna imagen de marca de agua",
    selectWatermarkImage: "Por favor, seleccione una imagen para usar como marca de agua",
    noTextEntered: "No se ingresó texto de marca de agua",
    enterWatermarkText: "Por favor, ingrese texto para usar como marca de agua",
    success: "Marca de agua añadida con éxito",
    successDesc: "Su PDF ha sido marcado con agua y está listo para descargar",
    failed: "No se pudo agregar la marca de agua",
    unknownError: "Ocurrió un error desconocido",
    unknownErrorDesc: "Ocurrió un error desconocido. Por favor, intenta de nuevo",
    uploadTitle: "Subir PDF para agregar marca de agua",
    uploadDesc: "Arrastre y suelte su archivo PDF aquí, o haga clic para buscar",
    uploading: "Subiendo...",
    selectPdf: "Seleccionar archivo PDF",
    maxSize: "Tamaño máximo del archivo: 50 MB",
    change: "Cambiar archivo",
    commonOptions: "Configuraciones de marca de agua",
    position: "Posición",
    center: "Centro",
    tile: "Mosaico",
    custom: "Personalizado",
    applyToPages: "Aplicar a páginas",
    all: "Todas las páginas",
    even: "Páginas pares",
    odd: "Páginas impares",
    customPages: "Páginas personalizadas",
    pagesFormat: "Ingrese números de página separados por comas o rangos con guiones (por ejemplo, 1,3,5-10)",
    processing: "Procesando...",
    addWatermark: "Agregar marca de agua",
    adding: "Agregando marca de agua",
    pleaseWait: "Por favor, espere mientras procesamos su documento",
    download: "Descargar PDF",
    newWatermark: "Agregar otra marca de agua",
    text: {
      text: "Texto de marca de agua",
      placeholder: "por ejemplo, CONFIDENCIAL, BORRADOR, etc.",
      color: "Color del texto",
      font: "Fuente",
      selectFont: "Seleccionar fuente",
      size: "Tamaño de fuente",
      opacity: "Opacidad",
      rotation: "Rotación",
      preview: "Vista previa"
    },
    image: {
      title: "Imagen de marca de agua",
      upload: "Subir una imagen para usar como marca de agua",
      select: "Seleccionar imagen",
      formats: "Formatos compatibles: PNG, JPEG, SVG",
      change: "Cambiar imagen",
      scale: "Escala",
      opacity: "Opacidad",
      rotation: "Rotación"
    },
    positionX: "Posición X",
    positionY: "Posición Y",
    positions: {
      topLeft: "Superior izquierda",
      topRight: "Superior derecha",
      bottomLeft: "Inferior izquierda",
      bottomRight: "Inferior derecha",
      center: "Centro",
      tile: "Mosaico",
      custom: "Personalizado"
    },
    howTo: {
      title: "Cómo agregar una marca de agua",
      step1: { title: "Subir tu PDF", description: "Seleccione y suba el archivo PDF al que desea agregar una marca de agua" },
      step2: { title: "Personalizar marca de agua", description: "Elija entre marca de agua de texto o imagen y personalice su apariencia" },
      step3: { title: "Descargar PDF con marca de agua", description: "Procesa tu archivo y descarga el documento PDF con marca de agua" }
    },
    why: {
      title: "Por qué agregar marcas de agua",
      copyright: { title: "Protección de derechos de autor", description: "Proteja su propiedad intelectual agregando avisos de derechos de autor e información de propiedad" },
      branding: { title: "Marca e identidad", description: "Refuerce su identidad de marca agregando logotipos o texto de marca a documentos distribuidos" },
      classification: { title: "Clasificación de documentos", description: "Marque documentos como Borrador, Confidencial o Final para indicar su estado" },
      tracking: { title: "Seguimiento de documentos", description: "Agregue identificadores únicos para rastrear la distribución de documentos e identificar filtraciones" }
    },
    types: {
      title: "Tipos y opciones de marcas de agua",
      text: {
        title: "Marca de agua de texto",
        description: "Personalice marcas de agua de texto con varias opciones:",
        options: {
          text: "Contenido de texto personalizado (compatible con varias líneas)",
          font: "Familia de fuente, tamaño y color",
          rotation: "Ángulo de rotación (0-360 grados)",
          opacity: "Nivel de opacidad (transparente a completamente visible)",
          position: "Posición (centrado, en mosaico, colocación personalizada)"
        }
      },
      image: {
        title: "Marca de agua de imagen",
        description: "Agregue marcas de agua de imagen con estas personalizaciones:",
        options: {
          upload: "Suba su propio logotipo o imagen",
          scale: "Escalar y redimensionar",
          rotation: "Opciones de rotación",
          opacity: "Control de transparencia",
          position: "Personalización de posición"
        }
      }
    },
    faq: {
      title: "Preguntas frecuentes",
      removable: { question: "¿Se pueden quitar las marcas de agua de un PDF?", answer: "Nuestras marcas de agua estándar son semipermanentes y difíciles de quitar sin software especializado. Sin embargo, no son completamente a prueba de manipulaciones. Considere nuestro plan Pro para marcas de agua más seguras." },
      printing: { question: "¿Aparecerán las marcas de agua al imprimir el documento?", answer: "Sí, las marcas de agua aparecerán al imprimir. Puede controlar la opacidad para que sean más sutiles." },
      pages: { question: "¿Puedo poner marcas de agua solo en páginas específicas?", answer: "Sí, nuestro plan Pro permite aplicar marcas de agua a páginas específicas." },
      formats: { question: "¿Qué formatos de imagen se admiten para marcas de agua?", answer: "Admitimos PNG, JPG/JPEG y SVG. Se recomienda PNG para logotipos con transparencia." },
      multiple: { question: "¿Puedo agregar varias marcas de agua a un solo documento?", answer: "Los usuarios Pro pueden agregar varias marcas de agua; los usuarios gratuitos están limitados a una." },
      q1: { question: "¿Es seguro mi archivo PDF?", answer: "Sí, todos los archivos se procesan de forma segura y se eliminan después del procesamiento." },
      q2: { question: "¿Qué tipos de marcas de agua puedo agregar?", answer: "Marcas de agua de texto o imagen con PNG, JPG o SVG." },
      q3: { question: "¿Puedo quitar una marca de agua después de agregarla?", answer: "Una vez agregada y descargada, la marca de agua es permanente." },
      q4: { question: "¿Hay un límite de tamaño de archivo?", answer: "Sí, el tamaño máximo para PDFs es 50 MB y para imágenes 5 MB." }
    },
    bestPractices: {
      title: "Mejores prácticas para marcas de agua",
      dos: "Hacer",
      donts: "No hacer",
      dosList: [
        "Use marcas de agua semitransparentes para no ocultar contenido",
        "Considere marcas de agua diagonales para mayor cobertura",
        "Pruebe su marca de agua en una página de muestra",
        "Use colores contrastantes para mejor visibilidad",
        "Incluya el símbolo de copyright © para protección legal"
      ],
      dontsList: [
        "No use marcas de agua demasiado oscuras o opacas",
        "No coloque marcas de agua sobre texto importante",
        "No use texto demasiado pequeño que sea ilegible",
        "No confíe solo en marcas de agua para seguridad",
        "No use imágenes de baja resolución que se vean pixeladas"
      ]
    },
    relatedTools: {
      title: "Herramientas relacionadas",
      protect: "Proteger PDF",
      sign: "Firmar PDF",
      edit: "Editar PDF",
      ocr: "OCR PDF",
      viewAll: "Ver todas las herramientas"
    }
  },
  compressPdf: {
    title: "Comprimir archivos PDF",
    description: "Reduce el tamaño de archivos PDF sin esfuerzo mientras mantienes la calidad del documento",
    quality: {
      high: "Alta calidad",
      highDesc: "Compresión mínima, mejor calidad visual",
      balanced: "Equilibrado",
      balancedDesc: "Buena compresión con pérdida visual mínima",
      maximum: "Compresión máxima",
      maximumDesc: "Mayor índice de compresión, puede reducir la calidad visual"
    },
    processing: {
      title: "Opciones de procesamiento",
      processAllTogether: "Procesar todos los archivos simultáneamente",
      processSequentially: "Procesar archivos uno por uno"
    },
    status: {
      uploading: "Subiendo...",
      compressing: "Comprimiendo...",
      completed: "Completado",
      failed: "Fallido"
    },
    results: {
      title: "Resumen de resultados de compresión",
      totalOriginal: "Total original",
      totalCompressed: "Total comprimido",
      spaceSaved: "Espacio ahorrado",
      averageReduction: "Reducción promedio",
      downloadAll: "Descargar todos los archivos comprimidos como ZIP"
    },
    of: "de",
    files: "archivos",
    filesToCompress: "Archivos para comprimir",
    compressAll: "Comprimir archivos",
    qualityPlaceholder: "Seleccionar calidad de compresión",
    reduction: "reducción",
    zipDownloadSuccess: "Todos los archivos comprimidos se descargaron correctamente",
    overallProgress: "Progreso general",
    reducedBy: "se redujo en",
    success: "Compresión exitosa",
    error: {
      noFiles: "Por favor seleccione archivos PDF para comprimir",
      noCompressed: "No hay archivos comprimidos disponibles para descargar",
      downloadZip: "Error al descargar el archivo ZIP",
      generic: "Error al comprimir el archivo PDF",
      unknown: "Ocurrió un error desconocido",
      failed: "Error al comprimir tu archivo"
    },
    howTo: {
      title: "Cómo comprimir archivos PDF",
      step1: {
        title: "Subir PDF",
        description: "Sube los archivos PDF grandes que deseas comprimir. Nuestro compresor de PDF gratuito admite archivos de hasta 100 MB y funciona en Windows, Linux y otras plataformas."
      },
      step2: {
        title: "Elegir calidad",
        description: "Selecciona tu nivel de compresión preferido para reducir el tamaño del archivo sin perder calidad. Elige el mejor modo según cuánto deseas comprimir un PDF."
      },
      step3: {
        title: "Descargar",
        description: "Descarga tu archivo PDF comprimido. Obtén un tamaño de archivo más pequeño perfecto para compartir en línea o adjuntar en correos electrónicos."
      }
    },
    why: {
      title: "¿Por qué comprimir PDF?",
      uploadSpeed: {
        title: "Subidas ultrarrápidas",
        description: "Los archivos PDF comprimidos se suben más rápido, especialmente los archivos PDF grandes, lo que te ayuda a compartir documentos en línea sin demoras."
      },
      emailFriendly: {
        title: "Amigable con el correo electrónico",
        description: "Reduce el tamaño del archivo para que tus PDFs encajen en los límites de tamaño del correo electrónico. Nuestra herramienta de compresión de PDF garantiza un intercambio fácil sin perder calidad."
      },
      storage: {
        title: "Eficiencia de almacenamiento",
        description: "Ahorra espacio de almacenamiento en tu dispositivo o en la nube usando nuestro compresor de PDF para reducir archivos PDF grandes a archivos más pequeños y eficientes en espacio."
      },
      quality: {
        title: "Calidad mantenida",
        description: "Comprime PDFs sin comprometer la calidad. Nuestros modos inteligentes mantienen una alta claridad visual mientras reducen el tamaño del archivo."
      }
    },
    faq: {
      title: "Preguntas frecuentes",
      howMuch: {
        question: "¿Cuánto se pueden comprimir los archivos PDF?",
        answer: "La mayoría de los archivos PDF grandes se pueden comprimir entre un 20% y un 80%, dependiendo del contenido. Nuestro compresor de PDF está optimizado para diferentes casos de uso, ayudándote a reducir el tamaño del archivo de manera efectiva, especialmente para PDFs con muchas imágenes."
      },
      quality: {
        question: "¿La compresión afectará la calidad de mi PDF?",
        answer: "Nuestra herramienta te da la opción: comprimir un PDF usando el modo sin pérdida para que no haya diferencia visual o elegir alta compresión para la máxima reducción del tamaño del archivo. Puedes obtener un PDF comprimido gratis sin perder calidad esencial."
      },
      secure: {
        question: "¿Mis datos PDF están seguros al comprimir?",
        answer: "Sí, tus datos están seguros. Todos los archivos PDF se procesan en línea de forma segura y se eliminan automáticamente después de 24 horas. Ya sea que uses Windows o Linux, tu archivo está encriptado y nunca se comparte."
      },
      fileLimits: {
        question: "¿Cuáles son los límites de tamaño de archivo?",
        answer: "Los usuarios gratuitos pueden comprimir archivos PDF de hasta 10 MB. Los planes premium admiten hasta 500 MB por archivo. Ya sea que comprimas un PDF o varios, nuestra herramienta maneja archivos PDF grandes con facilidad."
      },
      batch: {
        question: "¿Puedo comprimir varios PDFs a la vez?",
        answer: "Sí, puedes comprimir PDFs en lotes. Sube varios archivos y deja que nuestro compresor de PDF reduzca el tamaño de cada archivo de manera eficiente en una sola sesión, ideal tanto para individuos como para equipos."
      }
    },
    modes: {
      title: "Modos de compresión",
      moderate: {
        title: "Compresión moderada",
        description: "Un modo equilibrado que comprime archivos PDF sin perder calidad. Perfecto para compartir PDFs en línea o archivarlos manteniendo una buena calidad visual."
      },
      high: {
        title: "Compresión alta",
        description: "Reduce el tamaño del archivo de manera agresiva con una compresión notable. Ideal para reducir rápidamente archivos PDF grandes, mejor cuando el tamaño más pequeño es más importante que la alta resolución."
      },
      lossless: {
        title: "Compresión sin pérdida",
        description: "Comprime PDFs eliminando datos innecesarios, reduciendo el tamaño del archivo sin afectar la apariencia, la mejor opción cuando la calidad es lo más importante."
      }
    },
    bestPractices: {
      title: "Mejores prácticas para la compresión de PDF",
      dos: "Qué hacer",
      donts: "Qué no hacer",
      dosList: [
        "Comprime imágenes antes de crear PDFs para obtener los mejores resultados",
        "Elige el nivel de compresión adecuado para tus necesidades",
        "Guarda archivos originales como copias de seguridad antes de comprimir",
        "Usa compresión sin pérdida para documentos importantes",
        "Elimina páginas innecesarias para reducir aún más el tamaño del archivo"
      ],
      dontsList: [
        "No sobrecomprimas documentos necesarios para imprimir",
        "No comprimas documentos legales o de archivo si cada detalle es importante",
        "No comprimas PDFs ya muy comprimidos repetidamente",
        "No esperes grandes reducciones para PDFs con principalmente texto",
        "No comprimas si el tamaño del archivo no es un problema"
      ]
    },
    relatedTools: {
      title: "Herramientas relacionadas",
      merge: "Combinar PDF",
      split: "Dividir PDF",
      pdfToWord: "PDF a Word",
      pdfToJpg: "PDF a JPG",
      viewAll: "Ver todas las herramientas"
    }
  },

  // Desbloquear PDF
  unlockPdf: {
    title: "Desbloquear archivos PDF fácilmente con nuestro desbloqueador de PDF",
    description: "Elimine contraseñas de PDF y desproteja archivos PDF rápidamente con nuestra herramienta de desbloqueo de PDF en línea. Desbloquee PDFs para crear un archivo PDF desprotegido en cualquier sistema operativo.",
    metaDescription: "Desbloquee archivos PDF sin esfuerzo con nuestro desbloqueador de PDF. Elimine la contraseña de permisos de PDF, desproteja PDFs en línea y descargue su archivo desbloqueado de forma segura.",
    keywords: "desbloquear archivo PDF, cómo desbloquear un archivo PDF, desbloquear PDF, desbloquear archivos PDF, desbloquear a PDF, desbloquear archivos PDF, archivo PDF desprotegido, desbloqueador de PDF, archivo desbloqueado, desbloquear documento PDF, desbloquear SmallPDF, desbloquear PDFs, herramienta de proteger PDF, contraseña de permisos, descargar su archivo, contraseña de PDF, PDF en línea, eliminar contraseñas de PDF, desbloquear PDF con SmallPDF, eliminar el PDF, hacer clic en guardar, clic de contraseña, herramienta de desbloquear PDF",

    // Benefits Section
    benefits: {
      title: "Por qué usar nuestra herramienta de desbloquear PDF para desbloquear archivos PDF",
      list: [
        {
          title: "Desbloqueador de PDF rápido",
          description: "Use nuestra herramienta de desbloquear PDF para eliminar rápidamente la contraseña del PDF y crear un archivo PDF desprotegido, listo para descargar su archivo al instante."
        },
        {
          title: "Desbloquear archivos PDF fácilmente",
          description: "Con un simple cuadro de ingresar contraseña, desbloquee archivos PDF en línea ingresando la contraseña de permisos o la contraseña de apertura del documento — haga clic en guardar y listo."
        },
        {
          title: "Desbloquear PDFs en cualquier plataforma",
          description: "Nuestro desbloqueador de PDF en línea funciona en cualquier sistema operativo, haciendo que desbloquear archivos PDF sea sencillo tanto si usa desbloquear SmallPDF como nuestra herramienta de desbloquear PDF."
        },
        {
          title: "Desbloquear documento PDF de forma segura",
          description: "Elimine contraseñas de archivos PDF de forma segura con nuestra herramienta, garantizando que su archivo desbloqueado permanezca privado después de desbloquear PDF."
        }
      ]
    },

    // Use Cases Section
    useCases: {
      title: "Cómo desbloquear un archivo PDF: Principales casos de uso",
      list: [
        {
          title: "Desbloquear archivo PDF con contraseña de permisos",
          description: "Use nuestro desbloqueador de PDF para eliminar la contraseña de permisos y desbloquear a PDF para acceso completo cuando conozca la contraseña."
        },
        {
          title: "PDF en línea para negocios",
          description: "Desbloquee archivos PDF en línea para eliminar contraseñas de PDF de documentos comerciales, simplificando el compartir y editar con un rápido clic en guardar."
        },
        {
          title: "Desbloquear materiales de estudio en PDF",
          description: "Desproteja recursos de estudio en PDF en línea con nuestra herramienta de desbloquear PDF para crear un archivo PDF desprotegido para un aprendizaje sin problemas."
        },
        {
          title: "Desbloquear documento PDF personal",
          description: "Aprenda cómo desbloquear un archivo PDF de su colección personal descargando su archivo después de usar nuestra alternativa a desbloquear PDF con SmallPDF."
        }
      ]
    },

    // How-To Section
    howTo: {
      title: "Cómo desbloquear un archivo PDF en 3 pasos",
      upload: {
        title: "Paso 1: Suba su PDF en línea",
        description: "Comience a desbloquear PDF subiendo el archivo PDF que desea desproteger con nuestra herramienta de desbloquear PDF."
      },
      enterPassword: {
        title: "Paso 2: Ingrese la contraseña de permisos",
        description: "Use el cuadro de ingresar contraseña para introducir la contraseña del PDF, como la contraseña de apertura del documento o la contraseña de permisos."
      },
      download: {
        title: "Paso 3: Descargue el archivo desbloqueado",
        description: "Termine de desbloquear archivos PDF descargando su archivo como un archivo PDF desprotegido después de que eliminemos la contraseña del PDF."
      }
    },

    // Features Section
    features: {
      title: "Características clave de nuestro desbloqueador de PDF",
      list: [
        {
          title: "Admite todos los PDFs en línea",
          description: "Desbloquee archivos PDF con contraseñas de permisos o contraseñas de apertura de documento sin esfuerzo."
        },
        {
          title: "Proceso rápido de desbloquear PDF",
          description: "Elimine contraseñas de PDF en segundos con nuestra rápida herramienta de desbloquear PDF, ideal para descargar su archivo."
        },
        {
          title: "Desbloquear documentos PDF multiplataforma",
          description: "Use nuestro desbloqueador de PDF en cualquier sistema operativo para desbloquear archivos PDF sin problemas."
        },
        {
          title: "Alternativa segura a desbloquear SmallPDF",
          description: "Desproteja archivos PDF con procesamiento cifrado, ofreciendo una alternativa segura a desbloquear PDF con SmallPDF."
        }
      ]
    },

    // FAQ Section
    faq: {
      passwordRequired: {
        question: "¿Necesito hacer clic en la contraseña para desbloquear archivos PDF?",
        answer: "Sí, debe ingresar la contraseña del PDF — como la contraseña de apertura del documento o la contraseña de permisos — en el cuadro de ingresar contraseña para desbloquear PDFs. Nuestra herramienta no omite contraseñas."
      },
      security: {
        question: "¿Es seguro desbloquear archivos PDF con esta herramienta?",
        answer: "Sí, nuestra herramienta de desbloquear PDF procesa PDFs en línea en servidores cifrados. No almacenamos sus archivos o contraseñas después de descargar su archivo."
      },
      restrictions: {
        question: "¿Puedo desbloquear a PDF sin hacer clic en la contraseña?",
        answer: "Sí, si no hay contraseña de apertura del documento pero existe una contraseña de permisos, súbala para eliminar las restricciones del PDF."
      },
      quality: {
        question: "¿Desbloquear PDF afecta la calidad?",
        answer: "No, nuestro desbloqueador de PDF solo elimina la contraseña de la configuración del PDF — su archivo desbloqueado conserva su calidad original."
      },
      compatibility: {
        question: "¿Funciona esto para usuarios de desbloquear PDF con SmallPDF?",
        answer: "Sí, nuestra herramienta de desbloquear PDF funciona en cualquier sistema operativo y sirve como una gran alternativa a desbloquear SmallPDF, desbloqueando archivos PDF en línea."
      }
    },

    // Status Messages
    passwordProtected: "Protegido con contraseña",
    notPasswordProtected: "No protegido con contraseña",
    unlocking: "Desbloqueando PDF...",
    unlockSuccess: "¡PDF desbloqueado con éxito!",
    unlockSuccessDesc: "¡Se ha completado el desbloqueo de su documento PDF! Descargue su archivo desbloqueado ahora."
  },

  // Cargador de archivos
  fileUploader: {
    dropHere: "Suelta tu archivo aquí",
    dropHereaDesc: "Suelta tu archivo PDF aquí o haz clic para buscar",
    dragAndDrop: "Arrastra y suelta tu archivo",
    browse: "Buscar Archivos",
    dropHereDesc: "Suelta tu archivo aquí o haz clic para buscar.",
    maxSize: "El tamaño máximo es 100MB.",
    remove: "Eliminar",
    inputFormat: "Formato de Entrada",
    outputFormat: "Formato de Salida",
    ocr: "Habilitar OCR",
    ocrDesc: "Extrae texto de documentos escaneados usando Reconocimiento Óptico de Caracteres",
    quality: "Calidad",
    low: "Baja",
    high: "Alta",
    password: "Contraseña",
    categories: {
      documents: "Documentos",
      spreadsheets: "Hojas de Cálculo",
      presentations: "Presentaciones",
      images: "Imágenes"
    },
    converting: "Convirtiendo",
    successful: "Conversión Exitosa",
    successDesc: "Tu archivo ha sido convertido con éxito y está listo para descargar.",
    download: "Descargar Archivo Convertido",
    filesSecurity: "Los archivos se eliminan automáticamente después de 24 horas por privacidad y seguridad."
  },

  // Elementos comunes de UI
  ui: {
    upload: "Subir",
    download: "Descargar",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    processing: "Procesando...",
    success: "¡Éxito!",
    error: "Error",
    copy: "Copiar",
    remove: "Eliminar",
    browse: "Buscar",
    dragDrop: "Arrastrar y Soltar",
    or: "o",
    close: "Cerrar",
    apply: "Aplicar",
    loading: "Cargando...",
    preview: "Vista Previa",
    reupload: "Subir Otro Archivo",
    continue: "Continuar",
    skip: "Omitir",
    retry: "Reintentar",
    addMore: "Agregar Más",
    clear: "Limpiar",
    clearAll: "Limpiar Todo",
    done: "Hecho",
    extract: "extracto",
    new: "¡Nuevo!",
    phone: "Teléfono",
    address: "Dirección",
    filesSecurity: "Los archivos se eliminan automáticamente después de 24 horas por privacidad y seguridad."
  },
  contact: {
    title: "Contáctenos",
    description: "¿Tiene preguntas o comentarios? Nos encantaría saber de usted.",
    form: {
      title: "Envíenos un Mensaje",
      description: "Complete el formulario a continuación y nos pondremos en contacto con usted lo antes posible.",
      name: "Su Nombre",
      email: "Dirección de Correo Electrónico",
      subject: "Asunto",
      message: "Mensaje",
      submit: "Enviar Mensaje"
    },
    success: "¡Mensaje Enviado Exitosamente!",
    successDesc: "Gracias por contactarnos. Nos pondremos en contacto con usted lo antes posible.",
    error: "Error al Enviar el Mensaje",
    errorDesc: "Hubo un error al enviar su mensaje. Por favor intente de nuevo más tarde.",
    validation: {
      name: "El nombre es requerido",
      email: "Por favor ingrese una dirección de correo electrónico válida",
      subject: "El asunto es requerido",
      message: "El mensaje es requerido"
    },
    supportHours: {
      title: "Horario de Soporte",
      description: "Cuándo estamos disponibles para ayudar",
      weekdays: "Lunes - Viernes",
      weekdayHours: "9:00 AM - 6:00 PM EST",
      saturday: "Sábado",
      saturdayHours: "10:00 AM - 4:00 PM EST",
      sunday: "Domingo",
      closed: "Cerrado"
    },
    faq: {
      title: "Preguntas Frecuentes",
      responseTime: {
        question: "¿Cuánto tiempo tarda en recibir una respuesta?",
        answer: "Tratamos de responder a todas las consultas dentro de 24-48 horas hábiles. Durante períodos de alta demanda, puede tomar hasta 72 horas."
      },
      technicalSupport: {
        question: "¿Puedo obtener soporte para un problema técnico?",
        answer: "Sí, nuestro equipo de soporte técnico está disponible para ayudarle con cualquier problema que experimente con nuestras herramientas PDF."
      },
      phoneSupport: {
        question: "¿Ofrecen soporte telefónico?",
        answer: "Proporcionamos soporte telefónico durante nuestro horario de atención indicado. Para asistencia inmediata, el correo electrónico suele ser la forma más rápida de obtener ayuda."
      },
      security: {
        question: "¿Está segura mi información personal?",
        answer: "Tomamos su privacidad muy en serio. Toda la comunicación está encriptada y nunca compartimos su información personal con terceros."
      }
    }
  },
  about: {
    hero: {
      title: "Potenciando la gestión de documentos digitales",
      description: "ScanPro nació de una idea simple: hacer que la gestión de documentos sea fluida, eficiente y accesible para todos. Creemos en transformar la forma en que las personas interactúan con los documentos digitales."
    },
    story: {
      title: "Nuestra historia",
      paragraph1: "Fundada en 2022, ScanPro surgió de la frustración de lidiar con herramientas PDF complejas y poco intuitivas. Nuestros fundadores, entusiastas de la tecnología y expertos en gestión documental, vieron una oportunidad para crear una solución que fuera tanto poderosa como fácil de usar.",
      paragraph2: "Lo que comenzó como un pequeño proyecto creció rápidamente hasta convertirse en una plataforma integral que sirve a miles de usuarios en todo el mundo, desde estudiantes y profesionales hasta grandes empresas."
    },
    missionValues: {
      title: "Nuestra misión y valores",
      mission: {
        title: "Misión",
        description: "Simplificar la gestión de documentos digitales proporcionando herramientas PDF intuitivas, poderosas y accesibles que mejoren la productividad y la creatividad."
      },
      customerFirst: {
        title: "El cliente primero",
        description: "Priorizamos la experiencia del usuario y mejoramos continuamente nuestras herramientas basándonos en retroalimentación real de los usuarios. Tus necesidades impulsan nuestra innovación."
      },
      privacy: {
        title: "Privacidad y seguridad",
        description: "Estamos comprometidos a proteger tus datos con medidas de seguridad de última generación y un respeto absoluto por tu privacidad."
      }
    },
    coreValues: {
      title: "Nuestros valores fundamentales",
      innovation: {
        title: "Innovación",
        description: "Empujamos continuamente los límites de lo posible en la gestión documental."
      },
      collaboration: {
        title: "Colaboración",
        description: "Creemos en el poder del trabajo en equipo, tanto dentro de nuestra empresa como con nuestros usuarios."
      },
      accessibility: {
        title: "Accesibilidad",
        description: "Nuestras herramientas están diseñadas para ser simples, intuitivas y disponibles para todos."
      }
    },
    team: {
      title: "Conoce a nuestro equipo",
      description: "ScanPro está impulsado por un equipo pequeño y dedicado enfocado en crear las mejores herramientas PDF posibles para nuestros usuarios.",
      member1: {
        name: "Cakra",
        role: "Líder de desarrollo de aplicaciones",
        bio: "Supervisa el desarrollo de nuestras aplicaciones, implementando soluciones backend robustas y asegurando que nuestras herramientas funcionen de manera fluida y eficiente."
      },
      member2: {
        name: "Abdi",
        role: "Desarrollador web frontend",
        bio: "Crea las interfaces de usuario que hacen que nuestras herramientas sean intuitivas y accesibles, enfocándose en ofrecer experiencias excepcionales en todas nuestras plataformas web."
      },
      member3: {
        name: "Anggi",
        role: "Especialista en marketing",
        bio: "Dirige nuestros esfuerzos de marketing para conectar nuestras herramientas con las personas que las necesitan, generando conciencia e impulsando el crecimiento de nuestra plataforma."
      }
    }
  },
  // Páginas de Términos y Privacidad
  legal: {
    termsTitle: "Términos de Servicio",
    privacyTitle: "Política de Privacidad",
    lastUpdated: "Última Actualización",
    introduction: {
      title: "Introducción",
      description: "Por favor lee estos términos cuidadosamente antes de usar nuestro servicio."
    },
    dataUse: {
      title: "Cómo Usamos Tus Datos",
      description: "Procesamos tus archivos solo para proporcionar el servicio que solicitaste. Todos los archivos se eliminan automáticamente después de 24 horas."
    },
    cookies: {
      title: "Cookies y Seguimiento",
      description: "Usamos cookies para mejorar tu experiencia y analizar el tráfico del sitio web."
    },
    rights: {
      title: "Tus Derechos",
      description: "Tienes el derecho de acceder, corregir o eliminar tu información personal."
    }
  },

  // Páginas de Error
  error: {
    notFound: "Página No Encontrada",
    notFoundDesc: "Lo sentimos, no pudimos encontrar la página que estás buscando.",
    serverError: "Error del Servidor",
    serverErrorDesc: "Lo sentimos, algo salió mal en nuestro servidor. Por favor intenta de nuevo más tarde.",
    goHome: "Ir a Inicio",
    tryAgain: "Intentar de Nuevo"
  },
  universalCompressor: {
    title: "Compresor de Archivos Universal",
    description: "Comprime PDF, imágenes y documentos de Office manteniendo la calidad",
    dropHereDesc: "Arrastra y suelta archivos aquí (PDF, JPG, PNG, DOCX, PPTX, XLSX)",
    filesToCompress: "Archivos a comprimir",
    compressAll: "Comprimir todos los archivos",
    results: {
      title: "Resultados de compresión",
      downloadAll: "Descargar todos los archivos comprimidos"
    },
    fileTypes: {
      pdf: "Documento PDF",
      image: "Imagen",
      office: "Documento de Office",
      unknown: "Archivo desconocido"
    },
    howTo: {
      title: "Cómo comprimir archivos",
      step1: {
        title: "Subir archivos",
        description: "Sube los archivos que deseas comprimir"
      },
      step2: {
        title: "Elegir calidad",
        description: "Selecciona tu nivel de compresión preferido"
      },
      step3: {
        title: "Descargar",
        description: "Haz clic en comprimir y descarga tus archivos comprimidos"
      }
    },
    faq: {
      compressionRate: {
        question: "¿Cuánto se pueden comprimir los archivos?",
        answer: "Las tasas de compresión varían según el tipo de archivo y el contenido. Los PDF suelen comprimirse entre un 20-70 %, las imágenes entre un 30-80 % y los documentos de Office entre un 10-50 %."
      },
      quality: {
        question: "¿Afectará la compresión la calidad de mis archivos?",
        answer: "Nuestros algoritmos de compresión equilibran la reducción de tamaño con la preservación de la calidad. La configuración de 'Alta calidad' mantendrá una calidad visual casi idéntica."
      },
      sizeLimit: {
        question: "¿Hay un límite de tamaño de archivo?",
        answer: "Sí, puedes comprimir archivos de hasta 100 MB cada uno."
      }
    }
  },
  repairPdf: {
    title: "Reparar archivos PDF",
    description: "Reparar archivos PDF dañados, recuperar contenido y optimizar la estructura del documento",
    howTo: {
      title: "Cómo reparar tu PDF",
      step1: {
        title: "Subir tu PDF",
        description: "Selecciona el archivo PDF que deseas reparar desde tu dispositivo"
      },
      step2: {
        title: "Elegir modo de reparación",
        description: "Selecciona el método de reparación adecuado según los problemas de tu archivo"
      },
      step3: {
        title: "Descargar PDF reparado",
        description: "Descarga tu archivo PDF reparado con estructura y contenido corregidos"
      }
    },
    why: {
      title: "Por qué reparar PDFs",
      corruptedFiles: {
        title: "Reparar archivos dañados",
        description: "Recuperar contenido y estructura de archivos PDF dañados que no se abren correctamente"
      },
      missingContent: {
        title: "Recuperar contenido faltante",
        description: "Restaurar imágenes, texto o páginas faltantes de documentos parcialmente dañados"
      },
      documentStructure: {
        title: "Reparar estructura del documento",
        description: "Reparar la estructura interna rota, referencias de páginas y enlaces"
      },
      fileSize: {
        title: "Optimizar tamaño del archivo",
        description: "Limpiar datos innecesarios y optimizar el tamaño del archivo sin pérdida de calidad"
      }
    },
    modes: {
      title: "Modos de reparación disponibles",
      standard: {
        title: "Reparación estándar",
        description: "Corrige problemas comunes de PDF, incluyendo referencias cruzadas rotas, objetos malformados y errores de flujo. Ideal para PDFs ligeramente dañados que aún se abren pero muestran errores."
      },
      advanced: {
        title: "Recuperación avanzada",
        description: "Reparación profunda para PDFs gravemente dañados con problemas estructurales serios. Recupera tanto contenido como sea posible de archivos que no se abren en absoluto."
      },
      optimization: {
        title: "Optimización",
        description: "Reestructura y optimiza el archivo PDF sin perder contenido. Elimina datos redundantes, corrige problemas menores y mejora la estructura general del archivo."
      }
    },
    faq: {
      title: "Preguntas frecuentes",
      whatCanRepair: {
        question: "¿Qué tipos de problemas de PDF se pueden reparar?",
        answer: "Nuestra herramienta de reparación puede solucionar una amplia gama de problemas, incluyendo estructuras de archivo corruptas, referencias de páginas rotas, flujos de contenido dañados, tablas de referencias cruzadas faltantes y objetos no válidos. A menudo puede recuperar contenido de PDFs que no se abren o se muestran correctamente en visores de PDF estándar."
      },
      completelyDamaged: {
        question: "¿Pueden repararse PDFs completamente dañados?",
        answer: "Aunque nuestro modo de reparación avanzada puede recuperar contenido de PDFs gravemente dañados, una recuperación del 100% no siempre es posible si el archivo está completamente corrupto. Sin embargo, incluso en casos extremos, a menudo podemos recuperar contenido parcial, especialmente texto y elementos básicos."
      },
      contentQuality: {
        question: "¿Afectará la reparación a la calidad del contenido?",
        answer: "No, nuestro proceso de reparación mantiene la calidad del contenido recuperable. A diferencia de algunas herramientas que simplemente extraen y recrean PDFs (lo que puede perder formato), intentamos preservar la estructura original mientras reparamos solo las partes dañadas."
      },
      passwordProtected: {
        question: "¿Pueden repararse PDFs protegidos con contraseña?",
        answer: "Sí, puedes reparar PDFs protegidos con contraseña si tienes la contraseña. Deberás ingresar la contraseña durante el proceso de reparación. Sin embargo, no intentamos eludir ni eliminar el cifrado de documentos protegidos sin autorización adecuada."
      },
      dataSecurity: {
        question: "¿Están seguros mis datos de PDF durante el proceso de reparación?",
        answer: "Sí, tomamos la seguridad de los datos muy en serio. Tus archivos se procesan de forma segura en nuestros servidores, no se comparten con terceros y se eliminan automáticamente después del procesamiento. Usamos cifrado para todas las transferencias de archivos, y todo el proceso de reparación ocurre en un entorno seguro."
      }
    },
    bestPractices: {
      title: "Mejores prácticas para la recuperación de PDF",
      dos: "Haz",
      donts: "No hagas",
      dosList: [
        "Guarda copias de seguridad de los archivos originales antes de intentar repararlos",
        "Prueba primero el modo de reparación estándar antes de usar la recuperación avanzada",
        "Verifica el PDF con múltiples visores si es posible",
        "Anota qué páginas o elementos son problemáticos antes de la reparación",
        "Usa el modo de optimización para PDFs grandes pero funcionales"
      ],
      dontsList: [
        "No guardes repetidamente PDFs corruptos, ya que esto puede empeorar el daño",
        "No uses la reparación como sustituto de una creación adecuada de PDF",
        "No esperes una recuperación del 100% de archivos gravemente dañados",
        "No abras archivos reparados en visores de PDF antiguos que podrían volver a corromperlos",
        "No omitas verificar la precisión del contenido en el archivo reparado"
      ]
    },
    relatedTools: {
      title: "Herramientas relacionadas",
      compress: "Comprimir PDF",
      unlock: "Desbloquear PDF",
      protect: "Proteger PDF",
      edit: "Editar PDF",
      viewAll: "Ver todas las herramientas"
    },
    form: {
      title: "Herramienta de reparación de PDF",
      description: "Reparar PDFs dañados, recuperar contenido y optimizar la estructura del documento",
      upload: "Subir PDF para reparar",
      dragDrop: "Arrastra y suelta tu archivo PDF aquí, o haz clic para buscar",
      selectFile: "Seleccionar archivo PDF",
      maxFileSize: "Tamaño máximo del archivo: 100 MB",
      change: "Cambiar archivo",
      repairModes: "Modo de reparación",
      standardRepair: "Reparación estándar",
      standardDesc: "Corrige problemas comunes como enlaces rotos y problemas estructurales",
      advancedRecovery: "Recuperación avanzada",
      advancedDesc: "Recuperación profunda para archivos PDF gravemente dañados o corruptos",
      optimization: "Optimización",
      optimizationDesc: "Limpia y optimiza la estructura del PDF sin perder contenido",
      advancedOptions: "Opciones avanzadas",
      showOptions: "Mostrar opciones",
      hideOptions: "Ocultar opciones",
      preserveFormFields: "Preservar campos de formulario",
      preserveFormFieldsDesc: "Mantener campos de formulario interactivos cuando sea posible",
      preserveAnnotations: "Preservar anotaciones",
      preserveAnnotationsDesc: "Conservar comentarios, resaltados y otras anotaciones",
      preserveBookmarks: "Preservar marcadores",
      preserveBookmarksDesc: "Mantener el esquema del documento y los marcadores",
      optimizeImages: "Optimizar imágenes",
      optimizeImagesDesc: "Recomprimir imágenes para reducir el tamaño del archivo",
      password: "Contraseña del PDF",
      passwordDesc: "Este PDF está protegido con contraseña. Ingresa la contraseña para repararlo.",
      repair: "Reparar PDF",
      repairing: "Reparando PDF...",
      security: "Tus archivos se procesan de forma segura. Todos los archivos subidos se eliminan automáticamente después del procesamiento.",
      analyzing: "Analizando la estructura del PDF",
      rebuilding: "Reconstruyendo la estructura del documento",
      recovering: "Recuperando contenido",
      fixing: "Corrigiendo referencias cruzadas",
      optimizing: "Optimizando archivo",
      finishing: "Finalizando"
    },
    results: {
      success: "PDF reparado con éxito",
      successMessage: "Tu PDF ha sido reparado y está listo para descargar.",
      issues: "Problemas de reparación detectados",
      issuesMessage: "Encontramos problemas al reparar tu PDF. Es posible que algunos contenidos no sean recuperables.",
      details: "Detalles de la reparación",
      fixed: "Problemas corregidos",
      warnings: "Advertencias",
      fileSize: "Tamaño del archivo",
      original: "Original",
      new: "Nuevo",
      reduction: "reducción",
      download: "Descargar PDF reparado",
      repairAnother: "Reparar otro PDF"
    }
  },
  faq: {
    categories: {
      general: "General",
      conversion: "Conversión",
      security: "Seguridad",
      account: "Cuenta",
      api: "API"
    },
    general: {
      question1: "¿Qué es ScanPro?",
      answer1: "ScanPro es una plataforma en línea integral para la gestión y conversión de PDFs. Nuestras herramientas te ayudan a convertir, editar, fusionar, dividir, comprimir y asegurar tus documentos PDF a través de una interfaz web intuitiva o API.",
      question2: "¿Necesito crear una cuenta para usar ScanPro?",
      answer2: "No, puedes usar nuestras herramientas básicas de PDF sin registrarte. Sin embargo, crear una cuenta gratuita te brinda beneficios como historial guardado, límites de tamaño de archivo más altos y acceso a funciones adicionales.",
      question3: "¿Están mis datos seguros en ScanPro?",
      answer3: "Sí, todos los archivos se procesan de forma segura en nuestros servidores con cifrado. No compartimos tus archivos con terceros, y los archivos se eliminan automáticamente de nuestros servidores después del procesamiento (dentro de las 24 horas). Para más detalles, consulta nuestra Política de Privacidad.",
      question4: "¿Qué dispositivos y navegadores soporta ScanPro?",
      answer4: "ScanPro funciona en todos los navegadores modernos, incluidos Chrome, Firefox, Safari y Edge. Nuestra plataforma es totalmente responsiva y funciona en computadoras de escritorio, tabletas y dispositivos móviles."
    },
    conversion: {
      question1: "¿Qué tipos de archivos puedo convertir hacia y desde?",
      answer1: "ScanPro permite convertir PDFs a muchos formatos, incluidos Word (DOCX), Excel (XLSX), PowerPoint (PPTX), imágenes (JPG, PNG), HTML y texto plano. También puedes convertir estos formatos de vuelta a PDF.",
      question2: "¿Qué tan precisas son sus conversiones de PDF?",
      answer2: "Nuestro motor de conversión usa algoritmos avanzados para mantener el formato, incluidos fuentes, imágenes, tablas y diseño. Sin embargo, documentos muy complejos pueden tener pequeñas diferencias de formato. Para mejores resultados, recomendamos usar nuestras herramientas 'PDF a Word' o 'PDF a Excel' para documentos con formato complejo.",
      question3: "¿Hay un límite de tamaño de archivo para las conversiones?",
      answer3: "Los usuarios gratuitos pueden convertir archivos de hasta 10 MB. Los suscriptores básicos hasta 50 MB, los Pro hasta 100 MB y los usuarios Enterprise hasta 500 MB. Si necesitas procesar archivos más grandes, contáctanos para soluciones personalizadas.",
      question4: "¿Por qué falló mi conversión de PDF?",
      answer4: "Las conversiones pueden fallar si el archivo está corrupto, protegido con contraseña o contiene elementos complejos que nuestro sistema no puede procesar. Intenta usar primero nuestra herramienta 'Reparar PDF' y vuelve a intentar la conversión. Si sigues teniendo problemas, prueba el modo de conversión 'Avanzado' o contacta al soporte."
    },
    security: {
      question1: "¿Cómo protejo mi PDF con una contraseña?",
      answer1: "Usa nuestra herramienta 'Proteger PDF'. Sube tu PDF, establece una contraseña, elige restricciones de permisos (si lo deseas) y haz clic en 'Proteger PDF'. Puedes controlar si los usuarios pueden imprimir, editar o copiar contenido de tu PDF.",
      question2: "¿Puedo eliminar una contraseña de mi PDF?",
      answer2: "Sí, usa nuestra herramienta 'Desbloquear PDF'. Deberás proporcionar la contraseña actual para eliminar la protección. Ten en cuenta que solo ayudamos a eliminar la protección de documentos que posees o tienes autorización para modificar.",
      question3: "¿Qué nivel de cifrado usan para la protección de PDF?",
      answer3: "Usamos cifrado AES de 256 bits, estándar de la industria, para la protección de PDF, lo que ofrece una seguridad sólida para tus documentos. También soportamos cifrado de 128 bits si necesitas compatibilidad con lectores de PDF más antiguos."
    },
    account: {
      question1: "¿Cómo actualizo mi suscripción?",
      answer1: "Inicia sesión en tu cuenta, ve al Panel de Control y selecciona la pestaña 'Suscripción'. Elige el plan que se adapte a tus necesidades y sigue las instrucciones de pago. Tus nuevas funciones se activarán inmediatamente después del pago.",
      question2: "¿Puedo cancelar mi suscripción?",
      answer2: "Sí, puedes cancelar tu suscripción en cualquier momento desde el Panel de Control en la pestaña 'Suscripción'. Seguirás teniendo acceso a las funciones premium hasta el final de tu período de facturación actual.",
      question3: "¿Cómo restablezco mi contraseña?",
      answer3: "En la página de inicio de sesión, haz clic en '¿Olvidaste tu contraseña?' e ingresa tu dirección de correo electrónico. Te enviaremos un enlace para restablecer la contraseña, válido por 1 hora. Si no recibes el correo, revisa tu carpeta de spam o contacta al soporte."
    },
    api: {
      question1: "¿Cómo obtengo una clave API?",
      answer1: "Regístrate para obtener una cuenta, luego ve a Panel de Control > Claves API para crear tu primera clave API. Las cuentas gratuitas obtienen 1 clave, los suscriptores básicos 3, los Pro 10 y los usuarios Enterprise más de 50 claves.",
      question2: "¿Cuáles son los límites de tasa de la API?",
      answer2: "Los límites de tasa dependen de tu nivel de suscripción: Gratuito (10 solicitudes/hora), Básico (100 solicitudes/hora), Pro (1,000 solicitudes/hora), Enterprise (5,000+ solicitudes/hora). También se aplican límites mensuales de operaciones por nivel.",
      question3: "¿Cómo integro la API con mi aplicación?",
      answer3: "Nuestra API usa puntos finales REST estándar con respuestas JSON. Puedes encontrar documentación completa, ejemplos de código y SDKs en nuestra sección de Desarrolladores. Ofrecemos ejemplos para varios lenguajes de programación, incluidos JavaScript, Python, PHP y Java."
    },
    title: "Preguntas frecuentes"
  },
  footer: {
    description: "Herramientas PDF avanzadas para profesionales. Convierte, edita, protege y optimiza tus documentos con nuestra potente plataforma web y API.",
    contactUs: "Contáctanos",
    address: "123 Calle Documento, Ciudad PDF, 94103, Estados Unidos",
    subscribe: "Suscríbete a nuestro boletín",
    subscribeText: "Recibe las últimas noticias, actualizaciones y consejos directamente en tu bandeja de entrada.",
    emailPlaceholder: "Tu dirección de correo electrónico",
    subscribeButton: "Suscribirse",
    pdfTools: "Herramientas PDF",
    pdfManagement: "Gestión de PDF",
    company: "Empresa",
    support: "Soporte",
    aboutUs: "Sobre nosotros",
    careers: "Carreras",
    blog: "Blog",
    helpCenter: "Centro de ayuda",
    apiDocs: "Documentación API",
    faqs: "Preguntas frecuentes",
    tutorials: "Tutoriales",
    systemStatus: "Estado del sistema",
    allRightsReserved: "Todos los derechos reservados.",
    termsOfService: "Términos de servicio",
    privacyPolicy: "Política de privacidad",
    cookiePolicy: "Política de cookies",
    security: "Seguridad",
    sitemap: "Mapa del sitio",
    validEmail: "Por favor ingresa una dirección de correo electrónico válida",
    subscribeSuccess: "¡Gracias por suscribirte a nuestro boletín!",
    viewAllTools: "Ver todas las herramientas PDF",
    repairPdf: "Reparar PDF",
    socialFacebook: "Facebook",
    socialTwitter: "Twitter",
    socialInstagram: "Instagram",
    socialLinkedin: "LinkedIn",
    socialGithub: "GitHub",
    socialYoutube: "YouTube"
  },

  security: {
    title: "Seguridad y Privacidad en ScanPro",
    description: "Nos tomamos en serio la seguridad y privacidad de tus documentos. Descubre cómo protegemos tus datos.",
    measures: {
      title: "Cómo protegemos tus datos"
    },
    sections: {
      encryption: {
        title: "Cifrado de extremo a extremo",
        description: "Todos los archivos se cifran durante la transferencia con TLS 1.3 y en reposo con cifrado AES-256. Tus documentos nunca viajan sin protección."
      },
      temporaryStorage: {
        title: "Almacenamiento temporal",
        description: "Los archivos se eliminan automáticamente en 24 horas después del procesamiento. No conservamos tus documentos más tiempo del necesario."
      },
      access: {
        title: "Controles de acceso",
        description: "Sistemas robustos de autenticación y autorización garantizan que solo tú puedas acceder a tus documentos e información de cuenta."
      },
      infrastructure: {
        title: "Infraestructura segura",
        description: "Nuestros sistemas funcionan en proveedores de nube empresarial con certificación ISO 27001 y auditorías de seguridad regulares."
      },
      compliance: {
        title: "Cumplimiento",
        description: "Nuestras operaciones siguen el GDPR, CCPA y otras regulaciones regionales de privacidad para proteger tus derechos de datos."
      },
      monitoring: {
        title: "Monitoreo continuo",
        description: "Revisiones de seguridad automáticas y manuales, escaneos de vulnerabilidades y detección de intrusiones protegen contra amenazas emergentes."
      }
    },
    tabs: {
      security: "Seguridad",
      privacy: "Privacidad",
      compliance: "Cumplimiento"
    },
    tabContent: {
      security: {
        title: "Nuestro enfoque de seguridad",
        description: "Medidas de seguridad integrales para proteger tus archivos y datos",
        encryption: {
          title: "Cifrado fuerte",
          description: "Usamos TLS 1.3 para datos en tránsito y AES-256 para datos en reposo. Todas las transferencias de archivos tienen cifrado de extremo a extremo."
        },
        auth: {
          title: "Autenticación segura",
          description: "Autenticación multifactor, almacenamiento seguro de contraseñas con bcrypt y monitoreo regular de cuentas por actividades sospechosas."
        },
        hosting: {
          title: "Hosting seguro",
          description: "Nuestra infraestructura se aloja en proveedores de nube empresarial con certificación ISO 27001. Implementamos segmentación de red, firewalls y sistemas de detección de intrusiones."
        },
        updates: {
          title: "Actualizaciones regulares",
          description: "Mantenemos parches y actualizaciones de seguridad regulares, realizamos evaluaciones de vulnerabilidades y pruebas de penetración para identificar y resolver problemas potenciales."
        }
      },
      privacy: {
        title: "Prácticas de privacidad",
        description: "Cómo manejamos tus datos personales y documentos",
        viewPolicy: "Ver política de privacidad completa"
      },
      compliance: {
        title: "Cumplimiento y certificaciones",
        description: "Estándares y regulaciones que seguimos",
        approach: {
          title: "Nuestro enfoque de cumplimiento",
          description: "ScanPro está diseñado con privacidad y seguridad por diseño. Revisamos y actualizamos nuestras prácticas regularmente para cumplir con regulaciones en evolución."
        },
        gdpr: {
          title: "Cumplimiento GDPR"
        },
        hipaa: {
          title: "Consideraciones HIPAA"
        }
      }
    },
    retention: {
      title: "Política de retención de datos",
      description: "Seguimos prácticas estrictas de minimización de datos. Así es cuánto tiempo conservamos diferentes tipos de datos:",
      documents: {
        title: "Documentos subidos",
        description: "Los archivos se eliminan automáticamente de nuestros servidores en 24 horas después del procesamiento. No guardamos copias de tus documentos a menos que optes explícitamente por funciones de almacenamiento disponibles en planes de pago."
      },
      account: {
        title: "Información de cuenta",
        description: "La información básica de la cuenta se conserva mientras mantengas una cuenta activa. Puedes eliminar tu cuenta en cualquier momento, lo que borrará tu información personal de nuestros sistemas."
      },
      usage: {
        title: "Datos de uso",
        description: "Las estadísticas de uso anónimas se retienen hasta 36 meses para ayudarnos a mejorar nuestros servicios. Estos datos no pueden usarse para identificarte personalmente."
      }
    },
    contact: {
      title: "¿Tienes preguntas sobre seguridad?",
      description: "Nuestro equipo de seguridad está listo para responder tus preguntas sobre cómo protegemos tus datos y privacidad.",
      button: "Contactar al equipo de seguridad"
    },
    policy: {
      button: "Política de privacidad"
    },
    faq: {
      dataCollection: {
        question: "¿Qué datos personales recopila ScanPro?",
        answer: "Recopilamos la mínima información necesaria para prestar nuestros servicios. Para usuarios registrados, esto incluye correo electrónico, nombre y estadísticas de uso. También recopilamos datos de uso anónimos para mejorar nuestros servicios. No analizamos, escaneamos o extraemos el contenido de tus documentos."
      },
      documentStorage: {
        question: "¿Cuánto tiempo almacenan mis documentos?",
        answer: "Los documentos se eliminan automáticamente de nuestros servidores después del procesamiento, normalmente en 24 horas. Para suscriptores de pago, hay opciones de almacenamiento de documentos, pero son solo funciones opcionales."
      },
      thirdParty: {
        question: "¿Comparten mis datos con terceros?",
        answer: "No vendemos ni alquilamos tus datos personales. Solo compartimos datos con terceros cuando es necesario para prestar nuestros servicios (como procesadores de pago para suscripciones) o cuando lo exige la ley. Todos los proveedores terceros son evaluados cuidadosamente y están obligados por acuerdos de protección de datos."
      },
      security: {
        question: "¿Cómo protegen mis datos?",
        answer: "Usamos medidas de seguridad estándar de la industria incluyendo cifrado TLS para transferencia de datos, cifrado AES-256 para datos almacenados, proveedores de infraestructura segura, controles de acceso y auditorías de seguridad regulares. Nuestros sistemas están diseñados con la seguridad como prioridad."
      },
      rights: {
        question: "¿Cuáles son mis derechos sobre mis datos?",
        answer: "Dependiendo de tu región, tienes derechos que incluyen: acceso a tus datos, corrección de datos inexactos, eliminación de tus datos, restricción de procesamiento, portabilidad de datos y objeción al procesamiento. Para ejercer estos derechos, contacta a nuestro equipo de soporte."
      },
      breach: {
        question: "¿Qué pasa en caso de una violación de datos?",
        answer: "Tenemos protocolos para detectar, responder y notificar a usuarios afectados por violaciones de datos según las leyes aplicables. Realizamos evaluaciones de seguridad regulares para minimizar el riesgo de violaciones y mantenemos un plan detallado de respuesta a incidentes."
      }
    }
  },

  developer: {
    title: "Documentación de la API para desarrolladores",
    description: "Integre las potentes herramientas de PDF de ScanPro en sus aplicaciones con nuestra API RESTful",
    tabs: {
      overview: "Visión general",
      authentication: "Autenticación",
      endpoints: "Endpoints",
      examples: "Ejemplos",
      pricing: "Precios"
    },
    examples: {
      title: "Ejemplos de código",
      subtitle: "Aprenda cómo integrar nuestra API con estos ejemplos listos para usar",
      pdfToWord: "Conversión de PDF a Word",
      mergePdfs: "Combinar PDFs",
      protectPdf: "Proteger PDF"
    },
    endpoints: {
      title: "Endpoints de la API",
      subtitle: "Referencia completa para todos los endpoints de la API disponibles",
      categories: {
        all: "Todos",
        conversion: "Conversión",
        manipulation: "Manipulación",
        security: "Seguridad",
        ocr: "OCR"
      },
      parameters: "Parámetros",
      paramName: "Nombre",
      type: "Tipo",
      required: "Requerido",
      description: "Descripción",
      responses: "Respuestas"
    },
    pricing: {
      title: "Precios de la API",
      subtitle: "Elija el plan adecuado para sus necesidades de integración de API",
      monthly: "Facturación mensual",
      yearly: "Facturación anual",
      discount: "Ahorre 20%",
      forever: "para siempre",
      includes: "Qué incluye:",
      getStarted: "Comenzar",
      subscribe: "Suscribirse",
      freePlan: {
        description: "Para uso ocasional y pruebas",
        feature1: "100 operaciones por mes",
        feature2: "10 solicitudes por hora",
        feature3: "1 clave API",
        feature4: "Operaciones básicas de PDF"
      },
      basicPlan: {
        description: "Para startups y proyectos pequeños",
        feature1: "1,000 operaciones por mes",
        feature2: "100 solicitudes por hora",
        feature3: "3 claves API",
        feature4: "Todas las operaciones de PDF",
        feature5: "OCR básico"
      },
      proPlan: {
        description: "Para empresas y usuarios avanzados",
        feature1: "10,000 operaciones por mes",
        feature2: "1,000 solicitudes por hora",
        feature3: "10 claves API",
        feature4: "OCR avanzado",
        feature5: "Soporte prioritario",
        feature6: "Marcas de agua personalizadas"
      },
      enterprisePlan: {
        description: "Para integraciones de alto volumen",
        feature1: "100,000+ operaciones por mes",
        feature2: "5,000+ solicitudes por hora",
        feature3: "50+ claves API",
        feature4: "Soporte dedicado",
        feature5: "Ayuda de integración personalizada",
        feature6: "Opciones de marca blanca"
      },
      customPricing: {
        title: "¿Necesita una solución personalizada?",
        description: "Para un uso intensivo de la API o requisitos de integración especializados, ofrecemos precios personalizados con soporte dedicado.",
        contactSales: "Contactar ventas",
        enterprisePlus: "Enterprise+",
        dedicated: "Infraestructura dedicada",
        sla: "SLAs personalizados",
        account: "Gestor de cuenta dedicado",
        custom: "Precios personalizados"
      }
    },
    authentication: {
      loginRequired: "Inicio de sesión requerido",
      loginMessage: "Inicie sesión en su cuenta para acceder a sus claves API.",
      signIn: "Iniciar sesión",
      yourApiKey: "Su clave API",
      noApiKeys: "Aún no tiene claves API.",
      managementKeys: "Gestionar claves API",
      createApiKey: "Crear clave API",
      title: "Autenticación de la API",
      subtitle: "Asegure sus solicitudes de API con claves API",
      apiKeys: {
        title: "Claves API",
        description: "Todas las solicitudes a la API de ScanPro requieren autenticación mediante una clave API. ¡Su clave API tiene muchos privilegios, así que asegúrese de mantenerla segura!"
      },
      howTo: {
        title: "Cómo autenticarse",
        description: "Puede autenticar sus solicitudes de API de una de estas dos maneras:"
      },
      header: {
        title: "1. Usando el encabezado HTTP (recomendado)",
        description: "Incluya su clave API en el encabezado x-api-key de su solicitud HTTP:"
      },
      query: {
        title: "2. Usando un parámetro de consulta",
        description: "Alternativamente, puede incluir su clave API como un parámetro de consulta:"
      },
      security: {
        title: "Mejores prácticas de seguridad",
        item1: "Nunca comparta su clave API públicamente",
        item2: "No almacene claves API en código del lado del cliente",
        item3: "Establezca permisos apropiados para sus claves API",
        item4: "Rote sus claves API periódicamente"
      },
      limits: {
        title: "Límites de tasa y cuotas",
        description: "Las solicitudes de API están sujetas a límites de tasa según su nivel de suscripción:",
        plan: "Plan",
        operations: "Operaciones",
        rate: "Límite de tasa",
        keys: "Claves API"
      },
      errors: {
        title: "Errores de límite de tasa",
        description: "Cuando exceda su límite de tasa, la API devolverá una respuesta 429 Too Many Requests con los siguientes encabezados:"
      }
    },
    api: {
      question1: "¿Cómo obtengo una clave API?",
      answer1: "Regístrese para obtener una cuenta, luego vaya a Panel > Claves API para crear su primera clave API. Las cuentas gratuitas obtienen 1 clave API, los suscriptores básicos obtienen 3, los suscriptores Pro obtienen 10 y los usuarios Enterprise obtienen 50+ claves.",
      question2: "¿Cuáles son los límites de tasa de la API?",
      answer2: "Los límites de tasa dependen de su nivel de suscripción: Gratis (10 solicitudes/hora), Básico (100 solicitudes/hora), Pro (1,000 solicitudes/hora), Enterprise (5,000+ solicitudes/hora). También se aplican límites de operaciones mensuales a cada nivel.",
      question3: "¿Cómo integro la API con mi aplicación?",
      answer3: "Nuestra API utiliza endpoints REST estándar con respuestas JSON. Puede encontrar documentación completa, ejemplos de código y SDKs en nuestra sección de desarrolladores. Proporcionamos ejemplos para varios lenguajes de programación, incluidos JavaScript, Python, PHP y Java."
    },
    overview: {
      title: "Visión general de la API",
      subtitle: "Todo lo que necesita saber sobre nuestra API",
      intro: "La API de ScanPro le permite integrar nuestras capacidades de procesamiento de PDF directamente en sus aplicaciones. Con una interfaz RESTful simple, puede convertir, comprimir, combinar, dividir y realizar otras operaciones en PDFs programáticamente.",
      features: {
        title: "Características clave",
        restful: "API RESTful con respuestas JSON",
        authentication: "Autenticación simple con claves API",
        operations: "Operaciones completas de PDF incluyendo conversión, compresión, combinación y más",
        scalable: "Niveles de precios escalables para satisfacer sus necesidades",
        secure: "Manejo seguro de archivos con transferencias cifradas y eliminación automática de archivos"
      },
      gettingStarted: "Comenzando",
      startSteps: "Para comenzar con la API de ScanPro:",
      step1: "Regístrese para obtener una cuenta",
      step2: "Genere una clave API desde su panel",
      step3: "Realice su primera solicitud API usando los ejemplos proporcionados",
      getStarted: "Comenzar"
    },
    tools: {
      conversion: {
        title: "Conversión de PDF",
        description: "Convierta PDFs a varios formatos (DOCX, XLSX, JPG) y viceversa."
      },
      manipulation: {
        title: "Manipulación de PDF",
        description: "Combine varios PDFs, divida PDFs en archivos separados o comprima PDFs para reducir el tamaño del archivo."
      },
      security: {
        title: "Seguridad de PDF",
        description: "Añada protección con contraseña, desbloquee PDFs protegidos y añada marcas de agua para la seguridad de los documentos."
      },
      viewEndpoints: "Ver endpoints"
    }
  },
  pricing: {
    description: "Elige el plan adecuado para tus necesidades de PDF. ScanPro ofrece opciones de precios flexibles desde gratuito hasta empresarial, con las funciones que necesitas.",

    // Page content
    title: "Precios simples y transparentes",
    subtitle: "Elige el plan adecuado para ti. Todos los planes incluyen nuestras herramientas PDF principales.",
    monthly: "Mensual",
    yearly: "Anual",
    saveUp: "Ahorra hasta un 20%",
    subscribe: "Suscríbete",
    feature: "Característica",
    featureCompare: "Comparación de características",

    // Features
    features: {
      operations: "Operaciones mensuales",
      amount: {
        free: "100 operaciones",
        basic: "1,000 operaciones",
        pro: "10,000 operaciones",
        enterprise: "100,000 operaciones"
      },
      apiAccess: "Acceso a API",
      apiKeys: {
        free: "1 clave API",
        basic: "3 claves API",
        pro: "10 claves API",
        enterprise: "50 claves API"
      },
      rateLimits: "Límite de tasa",
      rateLimit: {
        free: "100 solicitudes/hora",
        basic: "1000 solicitudes/hora",
        pro: "2000 solicitudes/hora",
        enterprise: "5000 solicitudes/hora"
      },
      fileSizes: "Tamaño máximo de archivo",
      fileSize: {
        free: "25 MB",
        basic: "50 MB",
        pro: "100 MB",
        enterprise: "200 MB"
      },
      ocr: "OCR (Reconocimiento de texto)",
      watermarking: "Marcas de agua",
      advancedProtection: "Protección avanzada de PDF",
      bulkProcessing: "Procesamiento masivo",
      supports: "Soporte",
      support: {
        free: "Soporte por correo electrónico",
        priority: "Soporte prioritario",
        dedicated: "Soporte dedicado"
      },
      whiteLabel: "Opciones de marca blanca",
      serviceLevel: "Acuerdo de nivel de servicio"
    },

    // Plan descriptions
    planDescriptions: {
      free: "Para necesidades ocasionales de PDF",
      basic: "Para individuos y equipos pequeños",
      pro: "Para profesionales y empresas",
      enterprise: "Para grandes organizaciones"
    },

    // FAQ section
    faq: {
      title: "Preguntas frecuentes",
      q1: {
        title: "¿Qué son las operaciones de PDF?",
        content: "Las operaciones de PDF incluyen convertir PDFs a otros formatos (Word, Excel, etc.), comprimir PDFs, fusionar PDFs, dividir PDFs, añadir marcas de agua, extraer texto y cualquier otra acción realizada en un archivo PDF a través de nuestro servicio."
      },
      q2: {
        title: "¿Puedo actualizar o degradar mi plan?",
        content: "Sí, puedes actualizar o degradar tu plan en cualquier momento. Al actualizar, el nuevo plan entra en vigor inmediatamente. Al degradar, el nuevo plan entrará en vigor al final de tu ciclo de facturación actual."
      },
      q3: {
        title: "¿Ofrecen reembolsos?",
        content: "Ofrecemos una garantía de devolución de dinero de 7 días en todos los planes de pago. Si no estás satisfecho con nuestro servicio, puedes solicitar un reembolso dentro de los 7 días de tu compra inicial."
      },
      q4: {
        title: "¿Qué pasa si excedo mi límite de operaciones mensuales?",
        content: "Si alcanzas tu límite de operaciones mensuales, no podrás realizar operaciones adicionales hasta que tu límite se reinicie al comienzo de tu próximo ciclo de facturación. Puedes actualizar tu plan en cualquier momento para aumentar tu límite."
      },
      q5: {
        title: "¿Están mis datos seguros?",
        content: "Sí, tomamos la seguridad de los datos muy en serio. Todas las subidas de archivos y procesamientos se realizan a través de conexiones HTTPS seguras. No almacenamos tus archivos más tiempo del necesario para el procesamiento, y todos los archivos se eliminan automáticamente tras completar el procesamiento."
      }
    },

    // CTA section
    cta: {
      title: "¿Listo para empezar?",
      subtitle: "Elige el plan adecuado para ti y comienza a transformar tus PDFs hoy mismo.",
      startBasic: "Comienza con Básico",
      explorePdfTools: "Explora herramientas PDF"
    },

    // Login dialog
    loginRequired: "Inicio de sesión requerido",
    loginRequiredDesc: "¿Necesitas iniciar sesión en tu cuenta antes de suscribirte. Te gustaría iniciar sesión ahora?",

    // Plan buttons
    getStarted: "Comenzar",
    currentPlan: "Plan actual"
  },
  signPdf: {
    title: "Firmar PDF: Añadir firmas digitales a documentos",
    description: "Añade fácilmente firmas digitales, anotaciones de texto, sellos y dibujos a tus documentos PDF",
    howTo: {
      title: "Cómo firmar documentos PDF",
      step1: {
        title: "Sube tu PDF",
        description: "Sube el documento PDF que deseas firmar o anotar"
      },
      step2: {
        title: "Añade tu firma",
        description: "Crea, sube o dibuja tu firma y colócala en el documento"
      },
      step3: {
        title: "Guardar y descargar",
        description: "Guarda tus cambios y descarga el documento PDF firmado"
      }
    },
    tools: {
      signature: "Firma",
      text: "Texto",
      stamp: "Sello",
      draw: "Dibujar",
      image: "Imagen"
    },
    options: {
      draw: "Dibujar firma",
      upload: "Subir firma",
      type: "Escribir firma",
      clear: "Borrar",
      save: "Guardar firma",
      color: "Color",
      fontSize: "Tamaño de fuente",
      cancel: "Cancelar",
      apply: "Aplicar",
      position: "Posición"
    },
    stamps: {
      approved: "Aprobado",
      rejected: "Rechazado",
      draft: "Borrador",
      final: "Final",
      confidential: "Confidencial"
    },
    messages: {
      noFile: "No se seleccionó ningún archivo",
      uploadFirst: "Por favor, sube un archivo PDF para firmar",
      processing: "Procesando tu PDF...",
      signed: "¡PDF firmado con éxito!",
      downloadReady: "Tu PDF firmado está listo para descargar",
      error: "Error al firmar el PDF",
      errorDesc: "Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo."
    },
    faq: {
      title: "Preguntas frecuentes",
      legality: {
        question: "¿Son las firmas digitales legalmente vinculantes?",
        answer: "Las firmas digitales creadas con nuestra herramienta son visualmente similares a las firmas manuscritas. Para firmas electrónicas legalmente vinculantes que cumplan con regulaciones como eIDAS o la Ley ESIGN, es posible que necesites un servicio de firma electrónica calificada. Nuestra herramienta es adecuada para documentos internos, borradores o cuando las firmas visuales son suficientes."
      },
      security: {
        question: "¿Qué tan seguras son las firmas?",
        answer: "Nuestras firmas son superposiciones visuales en el documento PDF. Proporcionan una representación visual del consentimiento, pero no incluyen funciones de seguridad criptográfica que se encuentran en soluciones avanzadas de firma digital. Tus documentos se procesan de forma segura y no almacenamos tus PDFs firmados."
      },
      formats: {
        question: "¿Qué formatos de firma se admiten?",
        answer: "Puedes crear firmas dibujando con el ratón/touchpad, subiendo un archivo de imagen (se recomienda PNG, JPG con fondo transparente) o escribiendo tu nombre en varios estilos de fuente."
      },
      multipleSignatures: {
        question: "¿Puedo añadir múltiples firmas a un documento?",
        answer: "Sí, puedes añadir múltiples firmas, anotaciones de texto, sellos y dibujos a tu documento. Esto es útil para documentos que requieren firmas de varias partes o necesitan anotaciones en diferentes ubicaciones."
      }
    },
    benefits: {
      title: "Beneficios de las firmas digitales",
      paperless: {
        title: "Sin papel",
        description: "Elimina la necesidad de imprimir, firmar, escanear y enviar documentos por correo electrónico"
      },
      time: {
        title: "Ahorra tiempo",
        description: "Firma documentos al instante desde cualquier lugar sin manipulación física"
      },
      professional: {
        title: "Apariencia profesional",
        description: "Crea documentos firmados limpios y de aspecto profesional"
      },
      workflow: {
        title: "Flujo de trabajo optimizado",
        description: "Acelera las aprobaciones de documentos y los procesos comerciales"
      }
    },
    useCases: {
      title: "Casos de uso comunes",
      contracts: {
        title: "Contratos y acuerdos",
        description: "Añade tu firma a contratos y acuerdos comerciales"
      },
      forms: {
        title: "Formularios y solicitudes",
        description: "Rellena y firma formularios sin imprimir"
      },
      approvals: {
        title: "Aprobaciones de documentos",
        description: "Marca documentos como aprobados con sellos y firmas oficiales"
      },
      feedback: {
        title: "Comentarios y revisiones",
        description: "Añade comentarios y anotaciones a documentos durante la revisión"
      }
    },
    draw: "Dibujar",
    addText: "Añadir texto",
    addImage: "Añadir imagen",
    download: "Descargar PDF firmado",
    processing: "Procesando...",
    clearAll: "Borrar todo",
    uploadSignature: "Subir firma",
    drawSignature: "Dibujar firma",
    signatureOptions: "Opciones de firma",
    annotationTools: "Herramientas de anotación",
    pages: "Páginas",
    uploadTitle: "Subir PDF para firmar",
    uploadDesc: "Arrastra y suelta tu archivo PDF aquí, o haz clic para buscar"
  },
  ocrPdf: {
    title: 'OCR PDF',
    description: 'Convierte archivos PDF no seleccionables en PDF seleccionables y buscables con alta precisión utilizando la tecnología de texto OCR',
    step1Title: 'Sube tu PDF',
    step1Description: 'Sube el PDF escaneado o el documento basado en imágenes que deseas hacer buscable con texto OCR',
    step2Title: 'Procesamiento OCR',
    step2Description: 'Nuestra avanzada tecnología OCR reconoce y extrae texto escaneado de tu PDF',
    step3Title: 'Descargar PDF buscable',
    step3Description: 'Obtén tu PDF mejorado con archivos de texto seleccionables, copiables y buscables',
    howItWorksTitle: 'Cómo funciona la tecnología OCR',
    howItWorksDescription: 'El Reconocimiento Óptico de Caracteres (OCR) es una tecnología que convierte diferentes tipos de documentos, como archivos PDF escaneados o imágenes, en datos editables y buscables. Aplica OCR a tu PDF escaneado para editarlo en Adobe Acrobat.',
    feature1Title: 'Documentos escaneados a texto',
    feature1Description: 'OCR convierte documentos escaneados e imágenes en texto legible por máquina, haciéndolos buscables y editables en Adobe Acrobat.',
    feature2Title: 'Soporte multilingüe',
    feature2Description: 'Nuestro motor OCR reconoce texto en múltiples idiomas con alta precisión, incluso en documentos complejos.',
    benefitsTitle: '¿Por qué usar OCR para tus PDF?',
    benefit1Title: 'Capacidad de búsqueda',
    benefit1Description: 'Encuentra información rápidamente buscando texto OCR dentro de tus documentos',
    benefit2Title: 'Copiar y pegar',
    benefit2Description: 'Copia texto directamente de los documentos PDF en lugar de volver a escribir el contenido',
    benefit3Title: 'Archivado',
    benefit3Description: 'Crea archivos buscables a partir de documentos escaneados y archivos de texto antiguos',
    benefit4Title: 'Análisis',
    benefit4Description: 'Analiza el contenido del documento con extracción de texto y procesamiento de datos',
    faqTitle: 'Preguntas frecuentes',
    faq1Question: '¿Mis datos están seguros durante el procesamiento OCR?',
    faq1Answer: 'Sí, nos tomamos muy en serio la seguridad de los datos. Todas las cargas y el procesamiento de archivos se realizan en servidores seguros. Tus archivos se eliminan automáticamente después de 24 horas y no utilizamos tus documentos para ningún otro propósito que no sea proporcionar el servicio OCR.',
    relatedToolsTitle: 'Herramientas PDF relacionadas',
    tool1Href: '/compress-pdf',
    tool1Title: 'Comprimir PDF',
    tool1IconColor: 'text-green-500',
    tool1BgColor: 'bg-green-100 dark:bg-green-900/30',
    tool2Href: '/pdf-to-word',
    tool2Title: 'PDF a Word',
    tool2IconColor: 'text-blue-500',
    tool2BgColor: 'bg-blue-100 dark:bg-blue-900/30',
    tool3Href: '/merge-pdf',
    tool3Title: 'Combinar PDF',
    tool3IconColor: 'text-red-500',
    tool3BgColor: 'bg-red-100 dark:bg-red-900/30',
    tool4Href: '/pdf-tools',
    tool4Title: 'Todas las herramientas PDF',
    tool4IconColor: 'text-purple-500',
    tool4BgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  rotatePdf: {
    title: "Girar Páginas PDF",
    description: "Gire fácilmente las páginas de PDF en el sentido de las agujas del reloj, en sentido contrario o al revés con nuestra herramienta en línea. Corrija documentos escaneados incorrectamente utilizando herramientas de edición de PDF precisas y botones para girar páginas seleccionadas o un rango de páginas.",
    howTo: {
      title: "Cómo Girar Páginas PDF",
      step1: {
        title: "Subir PDF",
        description: "Seleccione el PDF arrastrándolo y soltándolo o haciendo clic para subir el archivo que desea girar."
      },
      step2: {
        title: "Elegir Rotación",
        description: "Haga clic en las miniaturas de las páginas para seleccionar páginas o un rango de páginas, luego use la herramienta de rotación para especificar los ángulos (90°, 180° o 270°)."
      },
      step3: {
        title: "Descargar",
        description: "Procese y descargue su documento PDF girado con todas las páginas seleccionadas correctamente orientadas."
      }
    },
    why: {
      title: "¿Por Qué Girar Páginas PDF?",
      fixScanned: {
        title: "Corregir Documentos Escaneados",
        description: "Corrija la orientación de las páginas escaneadas incorrectamente para hacerlas legibles utilizando miniaturas de páginas y la herramienta de rotación."
      },
      presentation: {
        title: "Mejorar Presentaciones",
        description: "Gire las páginas de PDF o una sola página para optimizar la visualización en pantallas o durante presentaciones."
      },
      mixedOrientation: {
        title: "Corregir Orientaciones Mixtas",
        description: "Estándarice documentos con páginas en orientación vertical y horizontal mezcladas girando páginas seleccionadas o un rango de páginas."
      },
      printing: {
        title: "Optimizar para Imprimir",
        description: "Asegúrese de que todas las páginas estén correctamente orientadas antes de imprimir utilizando botones para girar un rango de páginas, ahorrando papel."
      }
    },
    features: {
      title: "Características de Rotación",
      individual: {
        title: "Rotación de Página Individual",
        description: "Haga clic en las miniaturas de las páginas para seleccionar y girar una sola página dentro de su documento."
      },
      batch: {
        title: "Selección de Páginas por Lotes",
        description: "Gire varias páginas a la vez seleccionando un rango de páginas con opciones para páginas impares, pares o todas las páginas."
      },
      preview: {
        title: "Vista Previa en Vivo",
        description: "Vea cómo se verán sus páginas giradas antes de procesarlas con miniaturas de las páginas seleccionadas."
      },
      precision: {
        title: "Control Preciso",
        description: "Elija ángulos de rotación exactos de 90°, 180° o 270° para cada página utilizando la herramienta de rotación."
      }
    },
    form: {
      uploadTitle: "Subir PDF para Girar",
      uploadDesc: "Arrastre y suelte su archivo PDF aquí o haga clic en el botón para seleccionar el PDF y abrirlo para editar.",
      rotateAll: "Girar Todas las Páginas",
      rotateEven: "Girar Páginas Pares",
      rotateOdd: "Girar Páginas Impares",
      rotateSelected: "Girar Páginas Seleccionadas",
      selectPages: "Seleccionar Páginas",
      rotateDirection: "Dirección de Rotación",
      clockwise90: "90° en Sentido Horario",
      clockwise180: "180° (Al Revés)",
      counterClockwise90: "90° en Sentido Antihorario",
      apply: "Aplicar Rotación",
      reset: "Restablecer Todo",
      processing: "Procesando PDF...",
      success: "¡PDF girado con éxito!",
      error: "Ocurrió un error al girar el PDF",
      showSelector: "Seleccionar Páginas",
      hideSelector: "Ocultar Selector de Páginas"
    },
    faq: {
      title: "Preguntas Frecuentes",
      permanent: {
        question: "¿La rotación es permanente?",
        answer: "Sí, la rotación se aplica permanentemente al PDF. Sin embargo, siempre puede volver a abrir el PDF y usar los botones para girarlo de nuevo si es necesario."
      },
      quality: {
        question: "¿La rotación afecta la calidad del PDF?",
        answer: "No, nuestra herramienta en línea conserva la calidad original de su PDF. Dado que solo cambiamos la orientación de las páginas seleccionadas y no recomprimimos el contenido, no hay pérdida de calidad en la imagen o el texto."
      },
      size: {
        question: "¿La rotación cambiará el tamaño de mi archivo?",
        answer: "Girar páginas generalmente tiene un impacto mínimo en el tamaño del archivo. El tamaño del archivo puede cambiar ligeramente debido a los metadatos actualizados, pero el contenido de su rango de páginas permanece sin cambios."
      },
      limitations: {
        question: "¿Hay alguna limitación en la rotación?",
        answer: "Puede girar archivos de hasta 100 MB con nuestro plan gratuito. Para archivos más grandes, considere actualizar a nuestros planes premium. Además, la herramienta de rotación proporciona ángulos estándar (90°, 180°, 270°) para páginas seleccionadas en lugar de ángulos arbitrarios."
      },
      secured: {
        question: "¿Mis archivos están seguros durante la rotación?",
        answer: "Sí, todos los archivos se procesan de manera segura en nuestros servidores y se eliminan automáticamente después del procesamiento. No retenemos ni compartimos sus documentos con terceros cuando selecciona el PDF para girar."
      }
    },
    bestPractices: {
      title: "Mejores Prácticas para la Rotación de PDF",
      dosList: [
        "Vista previa del documento con miniaturas de páginas antes de descargar la versión final",
        "Use la rotación de 180° para páginas al revés con la herramienta de rotación",
        "Gire todas las páginas a la vez si todo el documento o un rango de páginas tiene el mismo problema de orientación",
        "Guarde el archivo original antes de la rotación como respaldo",
        "Verifique todas las páginas seleccionadas después de la rotación para asegurarse de la orientación correcta"
      ],
      dontsList: [
        "No gire PDF protegidos con contraseña sin desbloquearlos primero",
        "No mezcle rotaciones de 90° y 270° en el mismo documento si la consistencia es importante",
        "No asuma que todas las páginas necesitan la misma rotación: verifique cada miniatura de página",
        "No gire campos de formulario si necesita mantenerlos funcionales",
        "No gire si el PDF ya está correctamente orientado"
      ],
      dos: "Hacer",
      donts: "No Hacer"
    },
    relatedTools: {
      title: "Herramientas Relacionadas",
      compress: "Comprimir PDF",
      merge: "Combinar PDF",
      split: "Dividir PDF",
      edit: "Editar PDF",
      viewAll: "Ver Todas las Herramientas"
    },
    messages: {
      selectAll: "Seleccionar todo",
      downloading: "Preparando descarga...",
      rotationApplied: "Rotación aplicada a {count} páginas",
      dragDrop: "Arrastrar y soltar para reordenar páginas",
      pageOf: "Página {current} de {total}",
      selectPageInfo: "Haga clic en las miniaturas de las páginas para seleccionar páginas para la rotación"
    }
  },
  pageNumber: {
    title: "Añadir números de página a un PDF",
    shortDescription: "Añade fácilmente números de página personalizables a tus documentos PDF",
    description: "Añade números de página personalizados a un PDF con varios formatos numéricos, posiciones y estilos usando nuestra herramienta en línea",

    uploadTitle: "Sube tu PDF",
    uploadDesc: "Sube un archivo PDF para añadir números de página o encabezados. Tu archivo será procesado de forma segura, compatible con cualquier sistema operativo.",

    messages: {
      noFile: "Por favor, sube un archivo PDF primero",
      success: "¡Números de página añadidos con éxito!",
      error: "Error al añadir los números de página",
      processing: "Procesando tu PDF..."
    },
    ui: {
      browse: "Examinar archivos",
      filesSecurity: "Tus archivos están seguros y nunca se almacenan permanentemente",
      error: "Tipo de archivo no válido. Por favor, sube un PDF.",
      cancel: "Cancelar",
      addPageNumbers: "Añadir números de página",
      processingProgress: "Procesando... ({progress}%)",
      successTitle: "Números de página añadidos con éxito",
      successDesc: "Tu PDF ha sido procesado y está listo para descargar",
      readyMessage: "¡Tu PDF está listo!",
      readyDesc: "Tu archivo PDF ha sido procesado y se han añadido números de página según tus ajustes.",
      download: "Descargar PDF",
      processAnother: "Procesar otro PDF",
      settingsTitle: "Configuración de números de página",
      numberFormat: "Formato de número",
      position: "Posición",
      topLeft: "Superior izquierda",
      topCenter: "Superior centro",
      topRight: "Superior derecha",
      bottomLeft: "Inferior izquierda",
      bottomCenter: "Inferior centro",
      bottomRight: "Inferior derecha",
      fontFamily: "Familia de fuentes",
      fontSize: "Tamaño de fuente",
      color: "Color",
      startFrom: "Comenzar desde",
      prefix: "Prefijo",
      suffix: "Sufijo",
      horizontalMargin: "Margen horizontal (px)",
      pagesToNumber: "Páginas a numerar",
      pagesHint: "Dejar en blanco para todas las páginas",
      pagesExample: "Usa comas para páginas individuales y guiones para rangos (ej. 1,3,5-10)",
      skipFirstPage: "Saltar primera página (ej. para portadas)",
      preview: "Vista previa:",
      pagePreview: "Vista previa de página"
    },
    howTo: {
      title: "Cómo añadir números de página",
      step1: {
        title: "Sube tu PDF",
        description: "Selecciona el archivo PDF al que deseas numerar las páginas"
      },
      step2: {
        title: "Personaliza los números de página",
        description: "Elige formatos numéricos, rango de páginas, posición, fuente y otras configuraciones para editar el PDF"
      },
      step3: {
        title: "Descarga tu PDF",
        description: "Procesa y descarga tu PDF con los números de página añadidos usando nuestra herramienta en línea"
      }
    },

    benefits: {
      title: "Beneficios de añadir números de página",
      navigation: {
        title: "Navegación mejorada",
        description: "Facilita la navegación por tus documentos con números de página claramente visibles en cualquier rango de páginas"
      },
      professional: {
        title: "Documentos profesionales",
        description: "Dale a tus documentos legales o comerciales un aspecto profesional con números correctamente formateados"
      },
      organization: {
        title: "Mejor organización",
        description: "Mantén el control de las páginas en documentos extensos y haz referencia a páginas específicas fácilmente con los números añadidos"
      },
      customization: {
        title: "Personalización completa",
        description: "Personaliza la apariencia y posición de los números de página o añade encabezados para que coincidan con el estilo de tu documento"
      }
    },

    useCases: {
      title: "Casos de uso comunes",
      books: {
        title: "Libros y e-books",
        description: "Añade fácilmente una numeración de páginas adecuada a tus libros, e-books o informes para mejorar la legibilidad y la referencia"
      },
      academic: {
        title: "Trabajos académicos",
        description: "Numera las páginas de tesis, disertaciones y trabajos de investigación según los estándares académicos con opciones de formato flexibles"
      },
      business: {
        title: "Documentos comerciales",
        description: "Añade números de página profesionales a propuestas, informes y planes de negocio sin necesidad de Adobe Acrobat Pro"
      },
      legal: {
        title: "Documentos legales",
        description: "Aplica una numeración de páginas consistente a contratos y documentos legales para una referencia adecuada"
      }
    },

    faq: {
      title: "Preguntas frecuentes",
      formats: {
        question: "¿Qué formatos de números están disponibles?",
        answer: "Nuestra herramienta en línea soporta múltiples formatos: numérico (1, 2, 3), números romanos (I, II, III) y alfabético (A, B, C). Elige el formato que necesites."
      },
      customize: {
        question: "¿Puedo personalizar cómo aparecen los números de página?",
        answer: "Sí, puedes personalizar completamente los números de página añadiendo prefijos (como 'Página '), sufijos (como ' de 10'), eligiendo fuentes, tamaños, colores y posicionándolos en cualquier lugar de la página."
      },
      skipPages: {
        question: "¿Puedo omitir ciertas páginas al añadir números de página?",
        answer: "¡Claro! Puedes especificar un rango de páginas para numerar selectivamente o saltarte la primera página (como una portada) con facilidad."
      },
      startNumber: {
        question: "¿Puedo empezar la numeración desde un número específico?",
        answer: "Sí, puedes establecer el número inicial de tu secuencia, ideal para documentos que continúan de otros o tienen necesidades de numeración únicas."
      },
      security: {
        question: "¿Es seguro mi PDF cuando lo subo?",
        answer: "Sí, todo el procesamiento es seguro. Tus archivos se encriptan durante la transferencia, se procesan y luego se eliminan automáticamente; no se almacenan permanentemente ni se accede a ellos más que para añadir los números."
      }
    },

    relatedTools: {
      title: "Herramientas relacionadas"
    }
  }

}