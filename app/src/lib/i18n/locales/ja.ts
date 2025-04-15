/* eslint import/no-anonymous-default-export: [2, {"allowObject": true}] */
export default {
  metadata: {
    title: "ScanPro - 無料PDF変換、編集、OCR & PDFロック解除",
    template: "%s | ScanPro - PDFツール",
    description: "ScanProでPDFを変換、編集、ロック解除、圧縮、結合、分割、OCRします。無料で高速なオンラインPDFツール—ダウンロード不要。",
    keywords: "PDF変換, PDF編集, オンラインOCR, PDFロック解除, PDF圧縮, PDF結合, PDF分割, 無料PDFツール, オンラインPDF編集, ScanPro"
  },
  nav: {
    tools: "ツール",
    company: "会社",
    pricing: "API 料金",
    convertPdf: "PDF変換",
    convertPdfDesc: "PDFを他の形式に、または他の形式から変換",
    selectLanguage: "言語を選択",
    downloadApp: "アプリをダウンロード",
    getApp: "移動中に使えるPDFツールのモバイルアプリを入手",
    appStores: "ScanProアプリを入手",
    mobileTools: "移動中のPDFツール",
    signIn: "サインイン",
    signUp: "サインアップ",
    signOut: "サインアウト",
    dashboard: "ダッシュボード",
    profile: "プロフィール",
    account: "アカウント"
  },
  auth: {
    email: "メール",
    emailPlaceholder: "name@example.com",
    password: "パスワード",
    passwordPlaceholder: "あなたのパスワード",
    confirmPassword: "パスワードの確認",
    confirmPasswordPlaceholder: "パスワードを確認",
    forgotPassword: "パスワードを忘れましたか？",
    rememberMe: "ログイン情報を記憶",
    signIn: "サインイン",
    signingIn: "サインイン中...",
    orContinueWith: "または以下で続行",
    dontHaveAccount: "アカウントをお持ちでないですか？",
    signUp: "サインアップ",
    loginSuccess: "サインインに成功しました",
    loginError: "エラーが発生しました。もう一度お試しください。",
    invalidCredentials: "メールまたはパスワードが無効です",
    emailRequired: "メールが必要です",
    passwordRequired: "パスワードが必要です",
    invalidEmail: "有効なメールアドレスを入力してください",
    name: "名前",
    namePlaceholder: "あなたの名前",
    createAccount: "アカウントを作成",
    creatingAccount: "アカウント作成中...",
    alreadyHaveAccount: "すでにアカウントをお持ちですか？",
    nameRequired: "名前が必要です",
    passwordLength: "パスワードは8文字以上である必要があります",
    passwordStrength: "パスワードの強度",
    passwordWeak: "弱い",
    passwordFair: "普通",
    passwordGood: "良い",
    passwordStrong: "強い",
    passwordsDoNotMatch: "パスワードが一致しません",
    agreeTerms: "私は以下に同意します",
    termsOfService: "利用規約",
    and: "および",
    privacyPolicy: "プライバシーポリシー",
    agreeToTerms: "利用規約に同意してください",
    registrationFailed: "登録に失敗しました",
    accountCreated: "アカウントが正常に作成されました",
    unknownError: "エラーが発生しました",
    forgotInstructions: "メールアドレスを入力してください。パスワードをリセットするための手順をお送りします。",
    sendResetLink: "リセットリンクを送信",
    sending: "送信中...",
    resetEmailSent: "パスワードリセットメールが送信されました",
    resetPasswordError: "リセットメールの送信に失敗しました",
    checkYourEmail: "メールを確認してください",
    resetInstructions: "そのメールアドレスにアカウントが存在する場合、パスワードをリセットする手順を送信しました。",
    didntReceiveEmail: "メールが届きませんでしたか？",
    tryAgain: "もう一度試す",
    backToLogin: "ログインに戻る",
    validatingToken: "リセットリンクを検証中...",
    invalidToken: "このパスワードリセットリンクは無効または期限切れです。新しくリクエストしてください。",
    requestNewLink: "新しいリセットリンクをリクエスト",
    passwordResetSuccess: "パスワードのリセットに成功しました",
    passwordResetSuccessMessage: "パスワードが正常にリセットされました。まもなくログインページにリダイレクトされます。",
    passwordResetSuccessSubtext: "自動的にリダイレクトされない場合は、下のボタンをクリックしてください。",
    resettingPassword: "パスワードをリセット中...",
    resetPassword: "パスワードをリセット"
  },
  dashboard: {
    title: "ダッシュボード",
    overview: "概要",
    apiKeys: "APIキー",
    subscription: "サブスクリプション",
    profile: "プロフィール",
    totalUsage: "総使用量",
    operations: "今月の操作",
    active: "アクティブ",
    inactive: "非アクティブ",
    keysAllowed: "許可されたキー",
    mostUsed: "最も使用されている",
    of: "の",
    files: "ファイル",
    usageByOperation: "操作ごとの使用量",
    apiUsageBreakdown: "今月のあなたのAPI使用量の内訳",
    noData: "データがありません",
    createApiKey: "APIキーを作成",
    revokeApiKey: "APIキーを取り消す",
    confirmRevoke: "このAPIキーを取り消しますか？この操作は元に戻せません。",
    keyRevoked: "APIキーが正常に取り消されました",
    noApiKeys: "APIキーがありません",
    noApiKeysDesc: "まだAPIキーを作成していません。",
    createFirstApiKey: "最初のAPIキーを作成",
    keyName: "キー名",
    keyNamePlaceholder: "私のAPIキー",
    keyNameDesc: "後で簡単に識別できるようにキーに説明的な名前を付けてください。",
    permissions: "権限",
    generateKey: "キーを生成",
    newApiKeyCreated: "新しいAPIキーが作成されました",
    copyKeyDesc: "今すぐこのキーをコピーしてください。セキュリティ上の理由で再度表示されません！",
    copyAndClose: "コピーして閉じる",
    keyCopied: "APIキーがクリップボードにコピーされました",
    lastUsed: "最終使用",
    never: "未使用"
  },
  subscription: {
    currentPlan: "現在のプラン",
    subscriptionDetails: "あなたのサブスクリプションの詳細と使用制限",
    plan: "プラン",
    free: "無料",
    basic: "ベーシック",
    pro: "プロ",
    enterprise: "エンタープライズ",
    renewsOn: "サブスクリプションの更新日",
    cancelSubscription: "サブスクリプションをキャンセル",
    changePlan: "プランを変更",
    upgrade: "アップグレード",
    downgrade: "ダウングレード",
    features: "機能",
    limitations: "制限",
    confirm: "確認",
    cancel: "キャンセル",
    subscriptionCanceled: "サブスクリプションが正常にキャンセルされました",
    upgradeSuccess: "サブスクリプションが正常にアップグレードされました",
    pricingPlans: "価格プラン",
    monthly: "月",
    operationsPerMonth: "月ごとの操作",
    requestsPerHour: "時間ごとのリクエスト",
    apiKey: "APIキー",
    apiKeys: "APIキー",
    basicPdf: "基本的なPDF操作",
    allPdf: "すべてのPDF操作",
    basicOcr: "基本的なOCR",
    advancedOcr: "高度なOCR",
    prioritySupport: "優先サポート",
    customWatermarks: "カスタム透かし",
    noWatermarking: "透かしなし",
    limitedOcr: "制限付きOCR",
    noPrioritySupport: "優先サポートなし",
    dedicatedSupport: "専用サポート",
    customIntegration: "カスタム統合の支援",
    whiteLabel: "ホワイトラベルオプション"
  },
  profile: {
    // Personal Information
    personalInfo: "個人情報",
    updatePersonalInfo: "個人情報を更新する",
    name: "名前",
    namePlaceholder: "フルネームを入力してください",
    email: "メール",
    emailUnchangeable: "メールは変更できません",
    memberSince: "メンバー登録日",
    updateProfile: "プロフィールを更新",
    updating: "更新中...",
    updateSuccess: "プロフィールが正常に更新されました",
    updateFailed: "プロフィールの更新に失敗しました",
    updateError: "プロフィールの更新中にエラーが発生しました",

    // Password Management
    changePassword: "パスワードを変更",
    updatePasswordDesc: "アカウントのパスワードを更新する",
    currentPassword: "現在のパスワード",
    currentPasswordPlaceholder: "現在のパスワードを入力してください",
    newPassword: "新しいパスワード",
    newPasswordPlaceholder: "新しいパスワードを入力してください",
    confirmPassword: "新しいパスワードの確認",
    confirmPasswordPlaceholder: "新しいパスワードを確認してください",
    changingPassword: "パスワードを変更中...",
    passwordUpdateSuccess: "パスワードが正常に更新されました",
    passwordUpdateFailed: "パスワードの更新に失敗しました",
    passwordUpdateError: "パスワードの更新中にエラーが発生しました",

    // Password Validation
    passwordWeak: "弱い",
    passwordFair: "普通",
    passwordGood: "良い",
    passwordStrong: "強い",
    passwordMismatch: "新しいパスワードが一致しません",
    passwordLength: "パスワードは8文字以上である必要があります",
    passwordStrength: "パスワードの強度",
    passwordTips: "セキュリティのために、8文字以上の強力なパスワードを選び、大文字、小文字、数字、記号を含めてください。"
  },

  // ヒーローセクション
  hero: {
    badge: "強力なPDFツール",
    title: "オールインワンPDF変換＆編集",
    description: "無料オンラインツールでPDFを変換、圧縮、結合、分割、回転、透かし追加などが可能。インストール不要。",
    btConvert: "変換開始",
    btTools: "すべてのツールを探索"
  },

  popular: {
    pdfToWord: "PDFからWordへ",
    pdfToWordDesc: "PDFファイルを編集可能なDOCおよびDOCXドキュメントに簡単に変換。",
    pdfToExcel: "PDFからExcelへ",
    pdfToExcelDesc: "PDFからデータを数秒でExcelスプレッドシートに抽出。",
    pdfToPowerPoint: "PDFからPowerPointへ",
    pdfToPowerPointDesc: "PDFプレゼンテーションを編集可能なPowerPointスライドに変換。",
    pdfToJpg: "PDFからJPGへ",
    pdfToJpgDesc: "PDFページをJPG画像に変換、またはPDFからすべての画像を抽出。",
    pdfToPng: "PDFからPNGへ",
    pdfToPngDesc: "PDFページを高品質の透明PNG画像に変換。",
    pdfToHtml: "PDFからHTMLへ",
    pdfToHtmlDesc: "PDFドキュメントをウェブ対応のHTML形式に変換。",
    wordToPdf: "WordからPDFへ",
    wordToPdfDesc: "Wordドキュメントを完璧な書式とレイアウトでPDFに変換。",
    excelToPdf: "ExcelからPDFへ",
    excelToPdfDesc: "Excelスプレッドシートを完璧にフォーマットされたPDFドキュメントに変換。",
    powerPointToPdf: "PowerPointからPDFへ",
    powerPointToPdfDesc: "PowerPointプレゼンテーションをPDFに変換して簡単に共有。",
    jpgToPdf: "JPGからPDFへ",
    jpgToPdfDesc: "JPG画像からカスタマイズ可能なオプションでPDFファイルを作成。",
    pngToPdf: "PNGからPDFへ",
    pngToPdfDesc: "透明背景をサポートしてPNG画像からPDFに変換。",
    htmlToPdf: "HTMLからPDFへ",
    htmlToPdfDesc: "ウェブページやHTMLコンテンツをPDFドキュメントに変換。",
    mergePdf: "PDF結合",
    mergePdfDesc: "利用可能な最も簡単なPDF結合ツールで、希望する順序でPDFを結合。",
    splitPdf: "PDF分割",
    splitPdfDesc: "特定のページを抽出するか、PDFを複数のドキュメントに分割。",
    compressPdf: "PDF圧縮",
    compressPdfDesc: "最大限のPDF品質を保ちつつファイルサイズを削減。",
    rotatePdf: "PDF回転",
    rotatePdfDesc: "必要に応じてPDFページの向きを変更。",
    watermark: "透かし追加",
    watermarkDesc: "テキストまたは画像の透かしを追加してPDFドキュメントを保護およびブランド化。",
    unlockPdf: "PDFロック解除",
    unlockPdfDesc: "PDFファイルからパスワード保護と制限を解除。",
    protectPdf: "PDF保護",
    protectPdfDesc: "パスワード保護を追加してPDFドキュメントをセキュアに。",
    signPdf: "PDF署名",
    signPdfDesc: "PDFドキュメントにデジタル署名を安全に追加。",
    ocr: "OCR",
    ocrDesc: "光学文字認識を使用してスキャンされたドキュメントからテキストを抽出。",
    editPdf: "PDF編集",
    editPdfDesc: "PDFドキュメント内のテキスト、画像、ページを変更。",
    redactPdf: "PDF編集削除",
    redactPdfDesc: "PDFファイルから機密情報を永久に削除。",
    viewAll: "すべてのPDFツールを表示"
  },

  // 変換セクション
  converter: {
    title: "変換開始",
    description: "PDFをアップロードし、変換したい形式を選択",
    tabUpload: "アップロード＆変換",
    tabApi: "API統合",
    apiTitle: "APIとの統合",
    apiDesc: "REST APIを使用してアプリケーション内でプログラム的にPDFを変換",
    apiDocs: "APIドキュメントを表示"
  },

  // 変換ページ
  convert: {
    title: {
      pdfToWord: "PDFをWordにオンライン変換 - 無料PDFからDOCコンバーター",
      pdfToExcel: "PDFをExcelにオンライン変換 - PDFデータをXLSに抽出",
      pdfToPowerPoint: "PDFをPowerPointに変換 - PDFからPPTコンバーター",
      pdfToJpg: "PDFをJPG画像に変換 - 高品質PDFからJPEG",
      pdfToPng: "PDFをPNGにオンライン変換 - PDFから透明なPNG",
      pdfToHtml: "PDFをHTMLウェブページに変換 - PDFからHTML5コンバーター",
      wordToPdf: "WordをPDFにオンライン変換 - 無料DOCからPDFコンバーター",
      excelToPdf: "ExcelをPDFに変換 - XLSからPDFコンバーターツール",
      powerPointToPdf: "PowerPointをPDFにオンライン変換 - PPTからPDF",
      jpgToPdf: "JPGをPDFにオンライン変換 - 画像からPDF作成",
      pngToPdf: "PNGをPDFに変換 - 透明画像からPDFコンバーター",
      htmlToPdf: "HTMLをPDFにオンライン変換 - ウェブページからPDF生成",
      generic: "オンラインファイルコンバーター - 文書、画像などを変換"
    },
    description: {
      pdfToWord: "PDF文書を編集可能なWordファイルに簡単に変換。無料のPDFからWordコンバーターはDOC/DOCX出力で書式を保持します。",
      pdfToExcel: "PDFファイルから表やデータをExcelスプレッドシートに抽出。分析用に正確なデータ書式でPDFをXLS/XLSXに変換。",
      pdfToPowerPoint: "PDFプレゼンテーションを編集可能なPowerPointスライドに変換。PDFからPPTコンバーターはスライドレイアウトとデザイン要素を保持。",
      pdfToJpg: "PDFページを高品質JPG画像に変換。PDFから画像を抽出または各ページをJPEGとして保存しオンラインで共有。",
      pdfToPng: "PDFページを透明なPNG画像に変換。透明背景が必要なグラフィックデザイナーに最適。",
      pdfToHtml: "PDF文書をHTMLウェブページに変換。高度なコンバーターでPDFからレスポンシブHTML5ウェブサイトを作成。",
      wordToPdf: "Word文書を完璧な書式でPDFに変換。プロ品質の無料DOC/DOCXからPDFコンバーター。",
      excelToPdf: "ExcelスプレッドシートをPDF文書に変換。XLS/XLSXからPDFへの変換で数式、グラフ、表を保持。",
      powerPointToPdf: "PowerPointプレゼンテーションをPDF形式に変換。PPT/PPTXからPDFコンバーターはスライド遷移とノートを保持。",
      jpgToPdf: "JPG画像からPDFファイルを作成。複数のJPEG写真を1つのPDF文書にオンラインで結合。",
      pngToPdf: "PNG画像からPDFファイルを作成。透明性を保持したまま透明PNGグラフィックをPDFに変換。",
      htmlToPdf: "HTMLウェブページをPDF文書に変換。オンラインHTMLからPDF生成ツールでウェブサイトをPDFとして保存。",
      generic: "形式間で変換するファイルを選択。PDF、Word、Excel、PowerPoint、JPG、PNG、HTML用の無料オンラインドキュメントコンバーター。"
    },
    howTo: {
      title: "{from}を{to}にオンラインで変換する方法",
      step1: {
        title: "ファイルをアップロード",
        description: "コンピュータ、Google Drive、またはDropboxから変換したい{from}ファイルをアップロード"
      },
      step2: {
        title: "形式を変換",
        description: "変換ボタンをクリックすると、高度な変換技術でファイルが処理されます"
      },
      step3: {
        title: "結果をダウンロード",
        description: "変換された{to}ファイルを即時ダウンロードまたは共有可能なリンクを取得"
      }
    },
    options: {
      title: "高度な変換オプション",
      ocr: "OCRを有効にする（光学文字認識）",
      ocrDescription: "スキャンした文書や画像から編集可能なテキストを抽出",
      preserveLayout: "元のレイアウトを保持",
      preserveLayoutDescription: "元の文書の書式とレイアウトを正確に維持",
      quality: "出力品質",
      qualityDescription: "変換ファイルの品質レベルを設定（ファイルサイズに影響）",
      qualityOptions: {
        low: "低（ファイルサイズ小、処理高速）",
        medium: "中（品質とサイズのバランス）",
        high: "高（最高品質、ファイル大）"
      },
      pageOptions: "ページオプション",
      allPages: "すべてのページ",
      selectedPages: "選択したページ",
      pageRangeDescription: "カンマ区切りでページ番号やページ範囲を入力",
      pageRangeExample: "例: 1,3,5-12（1、3、5～12ページを変換）"
    },
    moreTools: "関連ドキュメント変換ツール",
    expertTips: {
      title: "変換の専門家のヒント",
      pdfToWord: [
        "PDFからWordへの最適な結果には、PDFに明確な機械可読テキストがあることを確認",
        "スキャン文書や画像ベースPDFではOCRを有効にして編集可能なテキストを抽出",
        "複雑なレイアウトは変換後、完璧な書式のために微調整が必要な場合あり"
      ],
      pdfToExcel: [
        "明確な境界線のある表はPDFからExcelへより正確に変換",
        "XLS/XLSXへのデータ抽出を改善するためスキャンPDFをOCRで前処理",
        "変換後スプレッドシート数式を確認（自動転送されない場合あり）"
      ],
      generic: [
        "高品質設定はファイルサイズ大だが出力品質向上",
        "スキャンしたテキストやテキストを含む画像にはOCRを使用",
        "ダウンロード前に必ず変換後ファイルをプレビューして精度を確認"
      ]
    },
    advantages: {
      title: "{from}を{to}に変換する利点",
      pdfToWord: [
        "PDF形式でロックされていたテキストをDOCコンバーターで編集・修正",
        "ドキュメントを一から再作成せずにコンテンツを更新",
        "他のWord文書やテンプレートで使用する情報を抽出"
      ],
      pdfToExcel: [
        "静的PDF形式のデータをXLSツールで分析・操作",
        "抽出したスプレッドシートデータでグラフ作成や計算実行",
        "Excel形式で財務報告書や数値情報を簡単に更新"
      ],
      wordToPdf: [
        "完璧な書式を維持した普遍的に読めるPDF文書を作成",
        "安全なPDF出力で不要な変更からコンテンツを保護",
        "すべてのデバイスとプラットフォームで一貫した文書表示を確保"
      ],
      generic: [
        "文書をより有用で編集可能な形式に変換",
        "対象ファイルタイプをサポートするプログラムでコンテンツにアクセスして使用",
        "特別なソフトウェアなしで他者が簡単に開ける形式でファイルを共有"
      ]
    }
  },
  features: {
    title: "高度なPDFツールと機能 | ScanPro",
    description: "ScanProの包括的なPDFツールと機能のスイートを探索し、ドキュメント管理、変換、編集などを行います。think",

    hero: {
      title: "高度なPDFツールと機能",
      description: "ScanProをすべてのドキュメント管理ニーズに対する究極のソリューションにする包括的なツールと機能のスイートをご覧ください。"
    },

    overview: {
      power: {
        title: "強力な処理",
        description: "高度なアルゴリズムにより、高品質のドキュメント処理と変換が驚異的な精度で行われます。"
      },
      security: {
        title: "銀行レベルのセキュリティ",
        description: "あなたのドキュメントは256ビットSSL暗号化で保護され、処理後に自動的に削除されます。"
      },
      accessibility: {
        title: "ユニバーサルアクセシビリティ",
        description: "完全なクロスプラットフォーム互換性で、あらゆるデバイスからドキュメントとツールにアクセスできます。"
      }
    },

    allFeatures: {
      title: "すべての機能"
    },

    learnMore: "もっと知る",

    categories: {
      conversion: {
        title: "PDF変換",
        description: "高い精度とフォーマットの保持で、PDFをさまざまな形式に変換します。",
        features: {
          pdfToWord: {
            title: "PDFからWordへの変換",
            description: "PDFファイルをフォーマット、表、画像を保持した編集可能なWordドキュメントに変換します。"
          },
          pdfToExcel: {
            title: "PDFからExcelへの変換",
            description: "PDFからテーブルを正確なデータフォーマットの編集可能なExcelスプレッドシートに抽出します。"
          },
          pdfToImage: {
            title: "PDFから画像への変換",
            description: "PDFページをカスタマイズ可能な解像度で高品質のJPG、PNG、またはTIFF画像に変換します。"
          },
          officeToPdf: {
            title: "OfficeからPDFへの変換",
            description: "Word、Excel、PowerPointファイルをレイアウトとフォーマットを保持したPDF形式に変換します。"
          }
        }
      },

      editing: {
        title: "PDF編集と管理",
        description: "包括的なツールセットを使用してPDFドキュメントを編集、整理、最適化します。",
        features: {
          merge: {
            title: "PDFの結合",
            description: "複数のPDFファイルをカスタマイズ可能なページ順序で1つのドキュメントに結合します。"
          },
          split: {
            title: "PDFの分割",
            description: "大きなPDFをページ範囲で小さなドキュメントに分割するか、特定のページを抽出します。"
          },
          compress: {
            title: "PDFの圧縮",
            description: "品質を維持しながらPDFファイルサイズを縮小し、共有と保存を容易にします。"
          },
          watermark: {
            title: "ウォーターマークの追加",
            description: "透明度、位置、回転をカスタマイズ可能なテキストまたは画像のウォーターマークをPDFに追加します。"
          }
        }
      },

      security: {
        title: "PDFセキュリティと保護",
        description: "暗号化、パスワード保護、デジタル署名でPDFドキュメントを保護します。",
        features: {
          protect: {
            title: "パスワード保護",
            description: "アクセスを制御し、不正な閲覧を防ぐためにPDFをパスワード保護で暗号化します。"
          },
          unlock: {
            title: "PDFのロック解除",
            description: "許可されたアクセス権を持つPDFからパスワード保護を解除します。"
          },
          signature: {
            title: "デジタル署名",
            description: "ドキュメント認証と検証のためにPDFにデジタル署名を追加します。"
          },
          redaction: {
            title: "PDFの編集",
            description: "PDFドキュメントから機密情報を永久に削除します。"
          }
        }
      },

      ocr: {
        title: "OCR技術",
        description: "当社の高度なOCR技術を使用して、スキャンされたドキュメントや画像からテキストを抽出します。",
        features: {
          textExtraction: {
            title: "テキスト抽出",
            description: "スキャンされたPDFや画像から高い精度と言語サポートでテキストを抽出します。"
          },
          searchable: {
            title: "検索可能なPDF",
            description: "スキャンされたドキュメントをテキスト認識付きの検索可能なPDFに変換します。"
          },
          multilingual: {
            title: "多言語サポート",
            description: "非ラテン文字や特殊文字を含む100以上の言語に対するOCRサポート。"
          },
          batchProcessing: {
            title: "バッチ処理",
            description: "効率的なバッチOCR機能を使用して複数のドキュメントを一度に処理します。"
          }
        }
      },

      api: {
        title: "APIと統合",
        description: "当社の堅牢なAPIを使用して、PDF処理機能をアプリケーションに統合します。",
        features: {
          restful: {
            title: "RESTful API",
            description: "PDF処理とドキュメント管理のためのシンプルで強力なRESTful API。"
          },
          sdks: {
            title: "SDKとライブラリ",
            description: "JavaScript、Python、PHPを含むさまざまなプログラミング言語向けの開発者フレンドリーなSDK。"
          },
          webhooks: {
            title: "ウェブフック",
            description: "非同期PDF処理ワークフローのリアルタイムイベント通知。"
          },
          customization: {
            title: "APIカスタマイズ",
            description: "カスタマイズ可能なエンドポイントとパラメータでAPIを特定のニーズに合わせて調整します。"
          }
        }
      },

      cloud: {
        title: "クラウドプラットフォーム",
        description: "当社の安全なクラウドストレージと処理プラットフォームで、どこからでもドキュメントにアクセスできます。",
        features: {
          storage: {
            title: "クラウドストレージ",
            description: "暗号化されたクラウドストレージでどこからでも安全にドキュメントを保存およびアクセスできます。"
          },
          sync: {
            title: "デバイス間同期",
            description: "すべてのデバイス間でドキュメントをシームレスに同期し、外出先でもアクセス可能です。"
          },
          sharing: {
            title: "ドキュメント共有",
            description: "安全なリンクと権限制御でドキュメントを簡単に共有します。"
          },
          history: {
            title: "バージョン履歴",
            description: "バージョン履歴でドキュメントの変更を追跡し、必要に応じて以前のバージョンを復元します。"
          }
        }
      },

      enterprise: {
        title: "エンタープライズ機能",
        description: "ビジネスおよびエンタープライズ要件向けに設計された高度な機能。",
        features: {
          batch: {
            title: "バッチ処理",
            description: "効率的なバッチ処理システムで数百のドキュメントを同時に処理します。"
          },
          workflow: {
            title: "カスタムワークフロー",
            description: "ビジネスニーズに合わせた自動ドキュメント処理ワークフローを作成します。"
          },
          compliance: {
            title: "コンプライアンスと監査",
            description: "GDPR、HIPAA、その他の規制コンプライアンス向けの強化されたセキュリティ機能。"
          },
          analytics: {
            title: "使用分析",
            description: "ドキュメント処理活動とユーザー操作に関する詳細な洞察。"
          }
        }
      }
    },

    mobile: {
      title: "ScanProモバイルアプリ",
      description: "ScanProの強力なPDFツールを外出先で利用できます。当社のモバイルアプリは、便利でモバイルフレンドリーなインターフェースで同じ堅牢な機能を提供します。",
      feature1: {
        title: "ドキュメントのスキャンとデジタル化",
        description: "カメラを使用して物理的なドキュメントをスキャンし、即座に高品質のPDFに変換します。"
      },
      feature2: {
        title: "移動中のPDF編集",
        description: "スマートフォンやタブレットからPDFドキュメントを簡単に編集、注釈付け、署名できます。"
      },
      feature3: {
        title: "クラウド同期",
        description: "安全なクラウドストレージですべてのデバイス間でドキュメントをシームレスに同期します。"
      }
    },

    comparison: {
      title: "機能比較",
      description: "さまざまなプランを比較して、ニーズに最適なものを見つけてください。",
      feature: "機能",
      free: "無料",
      basic: "ベーシック",
      pro: "プロ",
      enterprise: "エンタープライズ",
      features: {
        convert: "PDF変換",
        merge: "結合と分割",
        compress: "圧縮",
        ocr: "OCRベーシック",
        advancedOcr: "高度なOCR",
        watermark: "ウォーターマーク",
        protect: "パスワード保護",
        api: "APIアクセス",
        batch: "バッチ処理",
        priority: "優先サポート",
        customWorkflow: "カスタムワークフロー",
        whiteLabel: "ホワイトラベル",
        dedicated: "専用サポート"
      }
    },

    testimonials: {
      title: "ユーザーの声",
      quote1: "ScanProは私たちのチームがドキュメントを扱う方法に革命をもたらしました。OCR機能は驚くほど正確で、バッチ処理は毎週何時間も節約してくれます。",
      name1: "サラ・ジョンソン",
      title1: "オペレーションマネージャー",
      quote2: "APIの統合はシームレスでした。ScanProをワークフローに統合し、効率の違いは歴然です。サポートチームも一流です。",
      name2: "デビッド・チェン",
      title2: "テックリード",
      quote3: "中小企業の経営者として、手頃な価格と包括的なツールセットはScanProを驚くべき価値にしています。特に、外出先でドキュメントを扱えるモバイルアプリが大好きです。",
      name3: "マリア・ガルシア",
      title3: "ビジネスオーナー"
    }
  },

  // CTAセクション
  cta: {
    title: "変換の準備はできていますか？",
    description: "必要な任意の形式にPDFを無料で変換。",
    startConverting: "変換開始",
    exploreTools: "すべてのツールを探索"
  },

  // PDFツールページ
  pdfTools: {
    title: "すべてのPDFツール",
    description: "PDFを扱うために必要なすべてが一箇所に",
    categories: {
      convertFromPdf: "PDFからの変換",
      convertToPdf: "PDFへの変換",
      basicTools: "基本ツール",
      organizePdf: "PDF整理",
      pdfSecurity: "PDFセキュリティ"
    }
  },

  // ツールの説明
  toolDescriptions: {
    pdfToWord: "PDFファイルを編集可能なDOCおよびDOCXドキュメントに簡単に変換。",
    pdfToPowerpoint: "PDFファイルを編集可能なPPTおよびPPTXスライドショーに変換。",
    pdfToExcel: "PDFからデータを数秒でExcelスプレッドシートに直接抽出。",
    pdfToJpg: "PDFの各ページをJPGに変換、またはPDFに含まれるすべての画像を抽出。",
    pdfToPng: "PDFの各ページをPNGに変換、またはPDFに含まれるすべての画像を抽出。",
    pdfToHtml: "HTMLのウェブページをPDFに変換。ページのURLをコピー＆ペースト。",
    wordToPdf: "DOCおよびDOCXファイルをPDFに変換して読みやすく。",
    powerpointToPdf: "PPTおよびPPTXスライドショーをPDFに変換して閲覧しやすく。",
    excelToPdf: "EXCELスプレッドシートをPDFに変換して読みやすく。",
    jpgToPdf: "JPG画像を数秒でPDFに変換。向きやマージンを簡単に調整。",
    pngToPdf: "PNG画像を数秒でPDFに変換。向きやマージンを簡単に調整。",
    htmlToPdf: "ウェブページをPDFに変換。URLをコピー＆ペーストしてPDFに変換。",
    mergePdf: "利用可能な最も簡単なPDF結合ツールで、希望する順序でPDFを結合。",
    splitPdf: "PDFファイルを複数のドキュメントに分割するか、PDFから特定のページを抽出します。",
    compressPdf: "最大限のPDF品質を保ちつつファイルサイズを削減。",
    rotatePdf: "必要な方法でPDFを回転。複数のPDFを一度に回転も可能！",
    watermark: "数秒でPDFに画像またはテキストの透かしを追加。タイポグラフィ、透明度、位置を選択。",
    unlockPdf: "PDFのパスワードセキュリティを解除し、自由にPDFを使用可能に。",
    protectPdf: "PDFファイルにパスワード保護を追加。不正アクセスを防ぐためにPDFを暗号化。",
    ocr: "光学文字認識を使用してスキャンされたドキュメントからテキストを抽出。"
  },
  splitPdf: {
    title: "PDF分割 - PDFページをオンラインで分離",
    description: "無料のオンラインPDF分割ツールを使用して、PDFファイルを複数のドキュメントに簡単に分割したり、ページを削除したり、特定のページを抽出したりできます",
    howTo: {
      title: "オンラインでPDFファイルを分割する方法",
      step1: {
        title: "PDFをアップロード",
        description: "ファイルを選択してクリックし、分割したいPDF、ページを削除したいPDF、またはページを抽出したいPDFをドラッグアンドドロップ機能でアップロードします"
      },
      step2: {
        title: "分割するページを選択",
        description: "分割方法を選択：範囲でページを選択、PDFページを個別に分離、またはNページごとにPDFを複数のファイルに分割"
      },
      step3: {
        title: "分割ファイルをダウンロード",
        description: "分割されたPDFファイルまたは分離されたページを個別のドキュメントとして即座にダウンロード"
      }
    },
    options: {
      splitMethod: "分割方法を選択",
      byRange: "ページ範囲で分割",
      extractAll: "すべてのページを個別のPDFとして抽出",
      everyNPages: "Nページごとに分割",
      everyNPagesNumber: "ファイルごとのページ数",
      everyNPagesHint: "各出力ファイルにはこの数のページが含まれます",
      pageRanges: "ページ範囲",
      pageRangesHint: "複数のPDFファイルを作成するために、カンマで区切られたページ範囲を入力（例：1-5、8、11-13）"
    },
    splitting: "PDFを分割中...",
    splitDocument: "ドキュメントを分割",
    splitSuccess: "PDFが正常に分割されました！",
    splitSuccessDesc: "あなたのPDFは{count}個の個別ファイルに分割されました",
    results: {
      title: "PDF分割結果",
      part: "部分",
      pages: "ページ",
      pagesCount: "ページ"
    },
    faq: {
      title: "PDF分割に関するよくある質問",
      q1: {
        question: "分割後のPDFファイルはどうなりますか？",
        answer: "プライバシーとセキュリティのために、アップロードおよび生成されたすべてのファイルは24時間後にサーバーから自動的に削除されます。"
      },
      q2: {
        question: "分割できるページ数に制限はありますか？",
        answer: "無料版では最大100ページのPDFをサポートしています。より大きなファイルや無制限の分割にはプレミアムプランにアップグレードしてください。"
      },
      q3: {
        question: "PDFからページを削除したり、特定のページを抽出できますか？",
        answer: "はい、「ページ範囲で分割」オプションを使用して、ページを削除したり、オンラインでPDFから特定のセクションを抽出したりできます。"
      },
      q4: {
        question: "分割中にページの順序を変更できますか？",
        answer: "現在、分割中はページの順序が維持されます。分割後にページを並べ替えるには、ドラッグアンドドロップ機能付きのPDFマージツールを使用してください。"
      }
    },
    useCases: {
      title: "当社のPDF分割ツールの人気用途",
      chapters: {
        title: "PDFページを章ごとに分離",
        description: "大きな本やレポートを個別の章に分割して、共有やナビゲーションを簡単に"
      },
      extract: {
        title: "PDFからページを抽出",
        description: "フォームや証明書などのページを選択して、簡単なファイルとクリックで長いドキュメントから抽出"
      },
      remove: {
        title: "PDFからページを削除",
        description: "広告や空白ページなどの不要なページを、保持したいページを選択してそれに応じて分割することで削除"
      },
      size: {
        title: "サイズ縮小のためにPDFを複数のファイルに分割",
        description: "オンライPDF分割ツールを使用して、大きなPDFを小さなファイルに分割し、メールやメッセージ送信を簡単に"
      }
    },
    newSection: {
      title: "なぜ当社のオンラインPDF分割ツールを使用するのか？",
      description: "当社のPDF分割ツールを使えば、PDFページを分離したり、ページを削除したり、PDFを複数のファイルに迅速かつ安全に分割したりできます。ドラッグアンドドロップのシンプルさを楽しみ、ページを正確に選択し、ソフトウェアのダウンロードなしでドキュメントをオンラインで管理できます。",
      additional: "プロジェクトのためにPDFページを分離する必要がある場合、不要なページを削除する場合、または共有を容易にするためにPDFを複数のファイルに分割する場合、当社のオンラインPDF分割ツールは完璧なツールです。ユーザーフレンドリーなドラッグアンドドロップインターフェースで、ファイルをアップロードしてページを簡単に選択できます。当社のサービスは迅速で安全、そして無料—ソフトウェアをインストールせずにPDFドキュメントをオンラインで管理するのに最適です。大きなPDFを分割したり、特定のページを抽出したり、ファイルサイズを数クリックで縮小したりできます！"
    },
    seoContent: {
      title: "当社のPDF分割ツールでPDF管理をマスター",
      p1: "PDFを複数のファイルに分割したり、特定のページをオンラインで引き出すための手間のかからない方法が必要ですか？当社のPDF分割ツールは、ドキュメント管理のストレスを軽減するために設計されています。学生、忙しいプロフェッショナル、または個人ファイルを整理しているだけでも、ページを削除したり、必要なものを選んだり、大きなPDFを瞬時に分割したりできます。ファイルをアップローダーにドラッグし、分割スタイル—ページ範囲、単一ページ、または数ページごと—をクリックして選択すれば完了です。今日見つけることができる最も便利なオンラインPDF分割ツールの1つです。",
      p2: "PDFの分割がこれほど簡単になることはありません。巨大なレポートから1ページだけ取り出したい？空白のシートや広告がすべてを混乱させているのにうんざり？当社のツールを使えば、どのページを保持するかを正確に指定し、それらを個別のファイルや小さなバッチに変換できます。すべてオンラインで—ダウンロードは不要です。当社のPDF分割ツールを使えば、扱いにくいドキュメントを整理された管理しやすい部分に変え、ファイルサイズの頭痛なしでメール送信、保存、または共有する準備ができます。",
      p3: "当社のオンラインPDF分割ツールは、シンプルなレイアウトと堅牢なオプションで輝きます。教科書を章に分けたり、長い契約を重要な部分に簡単に切り分けたりできます。ドラッグアンドドロップ機能でスムーズに—ファイルをドロップしてクリックするだけで開始できます。分割前にPDFをプレビューして、ページを正確に選択することもできます。そして一番良いところは？100ページまでのファイルに対して無料なので、誰でもすぐに始められます。",
      p4: "なぜ当社のPDF分割ツールを選ぶのか？それは速く、安全で、柔軟性に富んでいます。プレゼンテーション用のページを引き出したり、ドキュメントを整理するために余分なものを捨てたり、PDFを複数のファイルに分割してより良い整理をしたり—すべてブラウザからできます。『オンラインでPDFを分割』、『ページを削除』、『PDFページを分離』などの検索で表示されるように最適化されているので、必要なときにすぐに見つかります。今日試してみて、PDF管理がどれほどスムーズになるかを実感してください！"
    },
    relatedTools: "関連ツール",
    popular: {
      viewAll: "すべてのツールを見る"
    }
  },
  // PDF結合ページ
  mergePdf: {
    title: "PDFファイルをオンラインで結合 | 無料ウェブブラウザPDF結合ツール",
    description: "すべてのオペレーティングシステムで動作するブラウザベースの結合ツールを使用して、複数のPDFファイルを迅速かつ簡単に1つのドキュメントにまとめます",
    intro: "当社のオンラインPDF結合ツールを使用すると、数回のクリックで複数のドキュメントを1つの結合ファイルにまとめることができます。インストールは不要で、どのオペレーティングシステムのウェブブラウザでも直接動作します。",

    // How-to section
    howTo: {
      title: "ブラウザでPDFファイルを結合する方法",
      step1: {
        title: "ファイルのアップロード",
        description: "結合したいPDFファイルをアップロードします。デバイスから複数のファイルを一度に選択するか、ウェブブラウザに直接ドラッグ＆ドロップしてください。"
      },
      step2: {
        title: "順序の調整",
        description: "ドラッグ＆ドロップでファイルを最終的な結合ファイルに表示したい順序に並べ替えます。当社の結合ツールは複数のPDFの整理を直感的に行えます。"
      },
      step3: {
        title: "ダウンロード",
        description: "「PDFを結合」ボタンをクリックし、どのウェブブラウザからでも結合されたPDFファイルをデバイスに直接ダウンロードします。"
      }
    },

    // Benefits section
    benefits: {
      title: "当社のオンラインPDF結合ツールの利点",
      compatibility: {
        title: "すべてのデバイスで動作",
        description: "当社のウェブブラウザベースのPDF結合ツールは、Windows、macOS、Linux、モバイルオペレーティングシステムでインストール不要で完璧に機能します。"
      },
      privacy: {
        title: "安全かつプライベート",
        description: "あなたのドキュメントはウェブブラウザ内で処理され、結合後に自動的に削除されるため、機密情報がプライベートに保たれます。"
      },
      simplicity: {
        title: "ユーザーフレンドリーなインターフェース",
        description: "直感的なドラッグ＆ドロップインターフェースにより、当社のオンラインツールを初めて使うユーザーでも複数のPDFファイルを簡単に結合できます。"
      },
      quality: {
        title: "高品質な出力",
        description: "当社の結合ツールは、結合ファイル内の元の書式、画像、テキスト品質を保持し、プロフェッショナルな結果を保証します。"
      }
    },

    // Use cases section
    useCases: {
      title: "PDF結合の一般的な用途",
      business: {
        title: "ビジネスドキュメント",
        description: "財務報告書、契約書、プレゼンテーションをクライアントや利害関係者向けの包括的なドキュメントにまとめます。"
      },
      academic: {
        title: "学術論文",
        description: "研究論文、引用、付録をレビュー用に準備された完全な学術提出物に結合します。"
      },
      personal: {
        title: "個人記録",
        description: "領収書、保証書、取扱説明書を簡単に参照できる整理されたデジタル記録にまとめます。"
      },
      professional: {
        title: "プロフェッショナルポートフォリオ",
        description: "複数の作品サンプルを1つの簡単に共有可能なドキュメントに結合して、印象的なポートフォリオを作成します。"
      }
    },

    // FAQ section
    faq: {
      title: "よくある質問",
      q1: {
        question: "オンライン結合ツールで結合できるPDFの数に制限はありますか？",
        answer: "当社の無料ウェブブラウザベースの結合ツールでは、一度に最大20のPDFファイルを結合できます。複数の大きなバッチを結合する場合は、無制限の結合操作が可能なプレミアムプランへのアップグレードを検討してください。"
      },
      q2: {
        question: "オンライン結合ツールを使用する際、PDFファイルはプライベートに保たれますか？",
        answer: "はい、あなたのプライバシーが最優先です。当社のブラウザベースの結合ツールにアップロードされたすべてのファイルは安全に処理され、処理後にサーバーから自動的に削除されます。ドキュメントの内容にアクセスしたり保存したりすることはありません。"
      },
      q3: {
        question: "パスワード保護されたPDFをオンライン結合ツールで結合できますか？",
        answer: "パスワード保護されたPDFについては、まず当社のオンラインPDFロック解除ツールを使用してロックを解除し、その後結合してください。当社のブラウザベースの結合ツールは、保護されたドキュメントを検出すると通知します。"
      },
      q4: {
        question: "オンラインPDF結合ツールはすべてのオペレーティングシステムで動作しますか？",
        answer: "はい、当社のウェブブラウザベースのPDF結合ツールは、Windows、macOS、Linux、iOS、Androidを含むすべての主要なオペレーティングシステムで動作します。最新のウェブブラウザがあれば、ソフトウェアをインストールせずにPDFを結合できます。"
      },
      q5: {
        question: "結合できるPDFファイルのサイズはどのくらいですか？",
        answer: "当社の無料オンライン結合ツールは、各ファイル最大100MBをサポートします。結合されるすべてのファイルの合計サイズは、ウェブブラウザでの最適なパフォーマンスのために300MBを超えないようにしてください。"
      },
      q6: {
        question: "結合されたファイルは元のPDFのすべての機能を保持しますか？",
        answer: "はい、当社の高度な結合ツールは、元のPDFからのテキスト、画像、書式、ハイパーリンク、ほとんどのインタラクティブ要素を最終的な結合ファイルに保持します。"
      }
    },

    // Tips section
    tips: {
      title: "PDFを効果的に結合するためのヒント",
      tip1: {
        title: "結合前に整理",
        description: "ファイル名を数値的に変更（例：01_intro.pdf、02_content.pdf）して、当社の結合ツールにアップロードする前に整理しやすくしてください。"
      },
      tip2: {
        title: "大きなファイルを最適化",
        description: "複数の大きなドキュメントを結合する場合、まず当社のPDF圧縮ツールを使用して、最終的な結合ファイルのパフォーマンスを向上させてください。"
      },
      tip3: {
        title: "プレビューを確認",
        description: "ファイルを整理した後、当社のオンラインツールのプレビュー機能を使用して、結合PDFを確定する前に順序を確認してください。"
      },
      tip4: {
        title: "ブックマークを検討",
        description: "プロフェッショナルなドキュメントの場合、当社のPDF編集ツールを使用して結合ファイルにブックマークを追加し、ナビゲーションを容易にしてください。"
      }
    },

    // Comparison section
    comparison: {
      title: "なぜ当社のウェブブラウザ結合ツールを選ぶのか",
      point1: {
        title: "ソフトウェアのインストール不要",
        description: "デスクトップアプリケーションとは異なり、当社のオンラインPDF結合ツールは、ソフトウェアをダウンロードまたはインストールせずにウェブブラウザで直接動作します。"
      },
      point2: {
        title: "クロスプラットフォーム互換性",
        description: "当社のブラウザベースのツールはすべてのオペレーティングシステムで動作し、デスクトップの代替品は特定のプラットフォームのみをサポートすることが多いです。"
      },
      point3: {
        title: "無料でアクセス可能",
        description: "高価なデスクトップ代替品やサブスクリプションサービスと比較して、当社のPDF結合機能を無料で利用できます。"
      },
      point4: {
        title: "定期的なアップデート",
        description: "当社のオンライン結合ツールは、ユーザーからの手動アップデートを必要とせずに継続的に改善されています。"
      }
    },

    // UI elements and messages
    ui: {
      of: "の",
      files: "ファイル",
      filesToMerge: "結合するファイル",
      dragToReorder: "ドラッグして並べ替え",
      downloadReady: "ダウンロード準備完了",
      downloadMerged: "結合ファイルのダウンロード",
      mergePdfs: "PDFを結合",
      processingMerge: "PDFを結合中...",
      successMessage: "PDFが正常に結合されました！",
      dragDropHere: "ここにPDFをドラッグ＆ドロップ",
      or: "または",
      browseFiles: "ファイルを閲覧",
      fileLimit: "最大20のPDFファイルを結合",
      noPdfsSelected: "PDFが選択されていません",
      addMoreFiles: "さらにファイルを追加",
      rearrangeMessage: "結合PDF内の順序を並べ替えるためにファイルをドラッグ",
      removeFile: "削除",
      filePreview: "プレビュー",
      startOver: "最初からやり直す",
      mergingInProgress: "結合中...",
      pleaseWait: "PDFファイルを結合する間お待ちください",
      processingFile: "処理中",
      retry: "結合を再試行"
    },
  },

  // OCRページ
  ocr: {
    title: "OCR抽出：簡単なテキスト認識",
    description: "高度なOCRソフトウェアと機械学習を使用して、スキャンされたPDFや画像ファイルを編集可能なテキストに変換します",
    howTo: {
      title: "OCR抽出の仕組み",
      step1: { title: "アップロード", description: "スキャンされたPDFまたは画像ファイルを画像からテキストへの変換ツールにアップロードします。" },
      step2: { title: "OCRツールの設定", description: "言語、ページ範囲、高度な設定を選択して、最適なテキスト認識を実現します。" },
      step3: { title: "テキスト抽出", description: "抽出したテキストをコピーするか、画像からテキストへの変換ツールで.txtファイルとしてダウンロードします。" }
    },
    faq: {
      title: "よくある質問",
      questions: {
        accuracy: { question: "OCR抽出技術の精度はどの程度ですか？", answer: "当社のOCRソフトウェアは、良好にスキャンされたドキュメント内の明確な印刷テキストに対して90～99%の精度を達成します。画像ファイルの品質が低い場合や珍しいフォントでは精度が低下することがあります。" },
        languages: { question: "どの言語がサポートされていますか？", answer: "英語、フランス語、ドイツ語、スペイン語、中国語、日本語、アラビア語、ロシア語など、100以上の言語をサポートしています。" },
        recognition: { question: "なぜテキストが正しく認識されないのですか？", answer: "テキスト認識にはいくつかの要因が影響します：ドキュメントの品質、解像度、コントラスト、複雑なレイアウト、手書き、または間違った言語選択。" },
        pageLimit: { question: "処理できるページ数に制限はありますか？", answer: "無料ユーザーにはPDFあたり50ページの制限があります。プレミアムユーザーは最大500ページのPDFを処理できます。" },
        security: { question: "OCR処理中のデータは安全ですか？", answer: "はい、お客様のセキュリティが最優先です。アップロードされたすべてのファイルは安全なサーバーで処理され、処理後に自動的に削除されます。" }
      }
    },
    relatedTools: "関連するOCRおよびPDFツール",
    processing: { title: "OCRソフトウェアでの処理", message: "テキスト認識はファイルのサイズと複雑さに応じて数分かかることがあります" },
    results: { title: "抽出したテキストの結果", copy: "コピー", download: "ダウンロード .txt" },
    languages: { english: "英語", french: "フランス語", german: "ドイツ語", spanish: "スペイン語", chinese: "中国語", japanese: "日本語", arabic: "アラビア語", russian: "ロシア語" },
    whatIsOcr: {
      title: "OCR抽出とは何ですか？",
      description: "光学文字認識（OCR）は、機械学習によってサポートされる技術で、スキャンされたドキュメント、PDF、画像ファイルを編集可能かつ検索可能なテキストに変換します。",
      explanation: "画像からテキストへの変換ツールは、ドキュメント画像の構造を分析し、文字やテキスト要素を識別して、機械が読み取れる形式に変換します。",
      extractionList: { scannedPdfs: "テキストが画像として存在するスキャンされたPDF", imageOnlyPdfs: "テキストレイヤーのない画像のみのPDF", embeddedImages: "テキストを含む埋め込み画像のあるPDF", textCopyingIssues: "テキストを直接コピーできないドキュメント" }
    },
    whenToUse: {
      title: "画像からテキスト抽出ツールをいつ使用するか",
      idealFor: "以下に最適：",
      idealForList: { scannedDocuments: "PDFとして保存されたスキャンされたドキュメント", oldDocuments: "デジタルテキストレイヤーのない古いドキュメント", textSelectionIssues: "テキスト選択/コピーが機能しないPDF", textInImages: "抽出が必要なテキストを含む画像ファイル", searchableArchives: "スキャンされたドキュメントから検索可能なアーカイブを作成" },
      notNecessaryFor: "以下には不要：",
      notNecessaryForList: { digitalPdfs: "テキストが選択可能なネイティブデジタルPDF", createdDigitally: "デジタルドキュメントから直接作成されたPDF", copyPasteAvailable: "すでにコピー＆ペースト可能なドキュメント", formatPreservation: "フォーマットを保持する必要があるファイル（代わりにPDFからDOCXへの変換を使用）" }
    },
    limitations: {
      title: "OCRツールの制限とヒント",
      description: "当社のOCRソフトウェアは強力ですが、注意すべきいくつかの制限があります：",
      factorsAffecting: "テキスト認識の精度に影響する要因：",
      factorsList: { documentQuality: "ドキュメントの品質（解像度、コントラスト）", complexLayouts: "複雑なレイアウトとフォーマット", handwrittenText: "手書きテキスト（認識が制限される）", specialCharacters: "特殊文字とシンボル", multipleLanguages: "1つのドキュメント内の複数の言語" },
      tipsForBest: "最良の結果を得るためのヒント：",
      tipsList: { highQualityScans: "高品質のスキャンを使用（300 DPI以上）", correctLanguage: "ドキュメントに正しい言語を選択", enhanceScannedImages: "「スキャン画像の強化」を有効にして精度を向上", smallerPageRanges: "大きなドキュメントでは小さなページ範囲を処理", reviewText: "抽出したテキストを後で確認・修正" }
    },
    options: { scope: "抽出するページ", all: "すべてのページ", custom: "特定のページ", pages: "ページ番号", pagesHint: "例: 1,3,5-9", enhanceScanned: "スキャン画像の強化", enhanceScannedHint: "OCR精度を向上させるために画像を前処理（スキャンドキュメントに推奨）", preserveLayout: "レイアウトを保持", preserveLayoutHint: "段落や改行を含む元のレイアウトを維持しようとする" },
    ocrTool: "OCR抽出ツール",
    ocrToolDesc: "スキャンされたドキュメントや画像ファイルを画像からテキストへの変換ツールで編集可能なテキストに変換",
    uploadPdf: "OCR抽出のためのファイルアップロード",
    dragDrop: "PDFまたは画像ファイルをここにドラッグ＆ドロップするか、クリックして参照",
    selectPdf: "ファイルを選択",
    uploading: "アップロード中...",
    maxFileSize: "最大ファイルサイズ：50MB",
    invalidFile: "無効なファイルタイプ",
    invalidFileDesc: "PDFまたはサポートされている画像ファイルを選択してください",
    fileTooLarge: "ファイルが大きすぎます",
    fileTooLargeDesc: "最大ファイルサイズは50MBです",
    noFile: "ファイルが選択されていません",
    noFileDesc: "テキスト認識のためにファイルを選択してください",
    changeFile: "ファイルを変更",
    languageLabel: "ドキュメントの言語",
    selectLanguage: "言語を選択",
    pageRange: "ページ範囲",
    allPages: "すべてのページ",
    specificPages: "特定のページ",
    pageRangeExample: "例: 1-3, 5, 7-9",
    pageRangeInfo: "個別のページまたは範囲をカンマで区切って入力",
    preserveLayout: "レイアウトを保持",
    preserveLayoutDesc: "ドキュメントの構造とフォーマットを維持しようとする",
    extractText: "テキストを抽出",
    extractingText: "テキスト抽出中...",
    processingPdf: "ファイルを処理中",
    processingInfo: "ファイルのサイズと複雑さに応じて数分かかることがあります",
    analyzing: "コンテンツを分析中",
    preprocessing: "ページを前処理中",
    recognizing: "テキストを認識中",
    extracting: "コンテンツを抽出中",
    finalizing: "結果を確定中",
    finishing: "終了中",
    extractionComplete: "テキスト抽出が完了しました",
    extractionCompleteDesc: "テキストが画像からテキストへの抽出ツールで正常に抽出されました",
    extractionError: "テキスト抽出に失敗しました",
    extractionFailed: "テキストを抽出できませんでした",
    unknownError: "不明なエラーが発生しました",
    textCopied: "テキストがクリップボードにコピーされました",
    copyFailed: "テキストのコピーに失敗しました",
    textPreview: "テキストプレビュー",
    rawText: "生テキスト",
    extractedText: "抽出したテキスト",
    previewDesc: "フォーマット付きの抽出したテキストのプレビュー",
    rawTextOutput: "生テキスト出力",
    rawTextDesc: "フォーマットなしのプレーンテキスト",
    noTextFound: "ファイルにテキストが見つかりませんでした",
    copyText: "テキストをコピー",
    downloadText: "テキストをダウンロード",
    processAnother: "別のファイルを処理",
    supportedLanguages: "英語、スペイン語、フランス語、ドイツ語、中国語、日本語など15以上の言語をサポート。より高い精度のために適切な言語を選択してください。"
  },

  // PDF保護ページ
  protectPdf: {
    title: "PDFをパスワード保護",
    description: "パスワード保護とカスタムアクセス許可でPDFドキュメントをセキュアに",
    howTo: {
      title: "PDFを保護する方法",
      step1: {
        title: "アップロード",
        description: "パスワードで保護したいPDFファイルをアップロード。"
      },
      step2: {
        title: "セキュリティオプションを設定",
        description: "パスワードを作成し、印刷、コピー、編集の許可をカスタマイズ。"
      },
      step3: {
        title: "ダウンロード",
        description: "パスワード保護されたPDFファイルをダウンロードして安全に共有。"
      }
    },
    why: {
      title: "PDFを保護する理由",
      confidentiality: {
        title: "機密性",
        description: "パスワードを持つ許可された個人のみが機密ドキュメントを開いて閲覧できるようにする。"
      },
      controlledAccess: {
        title: "アクセス制御",
        description: "受信者がドキュメントで何ができるか（印刷や編集など）を決定する特定の許可を設定。"
      },
      authorizedDistribution: {
        title: "許可された配布",
        description: "契約書、研究、知的財産を共有する際に誰がドキュメントにアクセスできるかを制御。"
      },
      documentExpiration: {
        title: "ドキュメントの有効期限",
        description: "パスワード保護は、無期限にアクセス可能であってはならない時間制限のあるドキュメントに追加のセキュリティ層を追加。"
      }
    },
    security: {
      title: "PDFセキュリティの理解",
      passwords: {
        title: "ユーザーパスワード対オーナーパスワード",
        user: "ユーザーパスワード：ドキュメントを開くのに必要。このパスワードがないと内容を閲覧できない。",
        owner: "オーナーパスワード：許可を制御。当社のツールではシンプルにするため両方のパスワードを同じに設定。"
      },
      encryption: {
        title: "暗号化レベル",
        aes128: "128ビットAES：良好なセキュリティを提供し、Acrobat Reader 7以降と互換性あり。",
        aes256: "256ビットAES：より強力なセキュリティを提供するが、Acrobat Reader X（10）以降が必要。"
      },
      permissions: {
        title: "許可制御",
        printing: {
          title: "印刷",
          description: "ドキュメントを印刷できるかどうか、またどの品質レベルで印刷できるかを制御。"
        },
        copying: {
          title: "コンテンツのコピー",
          description: "テキストや画像を選択してクリップボードにコピーできるかを制御。"
        },
        editing: {
          title: "編集",
          description: "注釈、フォーム入力、コンテンツ変更を含むドキュメントの修正を制御。"
        }
      }
    },
    form: {
      password: "パスワード",
      confirmPassword: "パスワードの確認",
      encryptionLevel: "暗号化レベル",
      permissions: {
        title: "アクセス許可",
        allowAll: "すべて許可（開くためのパスワードのみ）",
        restricted: "制限付きアクセス（カスタム許可）"
      },
      allowedActions: "許可されたアクション：",
      allowPrinting: "印刷を許可",
      allowCopying: "テキストと画像のコピーを許可",
      allowEditing: "編集と注釈を許可"
    },
    bestPractices: {
      title: "パスワード保護のベストプラクティス",
      dos: "すべきこと",
      donts: "すべきでないこと",
      dosList: [
        "文字、数字、特殊文字を混ぜた強力でユニークなパスワードを使用",
        "パスワードをパスワードマネージャーに安全に保存",
        "PDFとは別の安全なチャネルでパスワードを共有",
        "機密性の高いドキュメントには256ビット暗号化を使用"
      ],
      dontsList: [
        "「password123」や「1234」などの簡単で推測しやすいパスワードを使用しない",
        "PDFと同じメールでパスワードを送信しない",
        "すべての保護されたPDFに同じパスワードを使用しない",
        "極めて機密性の高い情報に対してパスワード保護だけに頼らない"
      ]
    },
    faq: {
      encryptionDifference: {
        question: "暗号化レベルの違いは何ですか？",
        answer: "128ビットおよび256ビットAES暗号化を提供。128ビットは古いPDFリーダー（Acrobat 7以降）と互換性があり、256ビットはより強力なセキュリティを提供するが新しいリーダー（Acrobat X以降）が必要。"
      },
      removeProtection: {
        question: "後でパスワード保護を解除できますか？",
        answer: "はい、「PDFロック解除」ツールを使用してPDFファイルからパスワード保護を解除できますが、現在のパスワードを知っている必要があります。"
      },
      securityStrength: {
        question: "パスワード保護はどの程度安全ですか？",
        answer: "当社のツールは業界標準のAES暗号化を使用。セキュリティは選択するパスワードの強さと暗号化レベルに依存。文字を混ぜた強力でユニークなパスワードを推奨。"
      },
      contentQuality: {
        question: "パスワード保護はPDFのコンテンツや品質に影響しますか？",
        answer: "いいえ、パスワード保護はドキュメントにセキュリティを追加するだけで、コンテンツ、レイアウト、PDFの品質には一切影響しません。"
      },
      batchProcessing: {
        question: "複数のPDFを一度に保護できますか？",
        answer: "現在、当社のツールは1つのPDFを一度に処理。複数のファイルのバッチ処理には、APIまたはプレミアムソリューションを検討。"
      }
    },
    protecting: "保護中...",
    protected: "PDFが正常に保護されました！",
    protectedDesc: "PDFファイルが暗号化され、パスワード保護されました。"
  },

  watermarkPdf: {
    title: "PDFに透かしを追加",
    description: "保護、ブランディング、または識別のために、PDFドキュメントにカスタムテキストまたは画像の透かしを追加します。",
    textWatermark: "テキスト透かし",
    imageWatermark: "画像透かし",
    privacyNote: "あなたのファイルは安全に処理されます。すべてのアップロードは処理後に自動的に削除されます。",
    headerTitle: "PDFに透かしを追加",
    headerDescription: "ブランディング、著作権保護、ドキュメント分類のために、PDFドキュメントにカスタムテキストまたは画像の透かしを追加します。",
    invalidFileType: "無効なファイル形式",
    selectPdfFile: "PDFファイルを選択してください",
    fileTooLarge: "ファイルが大きすぎます",
    maxFileSize: "最大ファイルサイズは50MBです",
    invalidImageType: "無効な画像形式",
    supportedFormats: "対応形式：PNG、JPG、SVG",
    imageTooLarge: "画像が大きすぎます",
    maxImageSize: "最大画像サイズは5MBです",
    noFileSelected: "ファイルが選択されていません",
    noImageSelected: "透かし画像が選択されていません",
    selectWatermarkImage: "透かしとして使用する画像を選択してください",
    noTextEntered: "透かしテキストが入力されていません",
    enterWatermarkText: "透かしとして使用するテキストを入力してください",
    success: "透かしが正常に追加されました",
    successDesc: "あなたのPDFに透かしが追加され、ダウンロードの準備が整いました",
    failed: "透かしの追加に失敗しました",
    unknownError: "不明なエラーが発生しました",
    unknownErrorDesc: "不明なエラーが発生しました。もう一度お試しください",
    uploadTitle: "透かしを追加するPDFをアップロード",
    uploadDesc: "PDFファイルをここにドラッグ＆ドロップするか、クリックして参照してください",
    uploading: "アップロード中...",
    selectPdf: "PDFファイルを選択",
    maxSize: "最大ファイルサイズ：50MB",
    change: "ファイルを変更",
    commonOptions: "透かし設定",
    position: "位置",
    center: "中央",
    tile: "タイル",
    custom: "カスタム",
    applyToPages: "ページに適用",
    all: "すべてのページ",
    even: "偶数ページ",
    odd: "奇数ページ",
    customPages: "カスタムページ",
    pagesFormat: "ページ番号をカンマで区切るか、ハイフンで範囲を指定してください（例：1,3,5-10）",
    processing: "処理中...",
    addWatermark: "透かしを追加",
    adding: "透かしを追加中",
    pleaseWait: "ドキュメントを処理している間お待ちください",
    download: "PDFをダウンロード",
    newWatermark: "別の透かしを追加",
    text: {
      text: "透かしテキスト",
      placeholder: "例：機密、ドラフトなど",
      color: "テキストカラー",
      font: "フォント",
      selectFont: "フォントを選択",
      size: "フォントサイズ",
      opacity: "透明度",
      rotation: "回転",
      preview: "プレビュー"
    },
    image: {
      title: "透かし画像",
      upload: "透かしとして使用する画像をアップロード",
      select: "画像を選択",
      formats: "対応形式：PNG、JPEG、SVG",
      change: "画像を変更",
      scale: "スケール",
      opacity: "透明度",
      rotation: "回転"
    },
    positionX: "位置 X",
    positionY: "位置 Y",
    positions: {
      topLeft: "左上",
      topRight: "右上",
      bottomLeft: "左下",
      bottomRight: "右下",
      center: "中央",
      tile: "タイル",
      custom: "カスタム"
    },
    howTo: {
      title: "透かしの追加方法",
      step1: { title: "PDFをアップロード", description: "透かしを追加したいPDFファイルを選択してアップロードします" },
      step2: { title: "透かしをカスタマイズ", description: "テキストまたは画像透かしを選択し、その外観をカスタマイズします" },
      step3: { title: "透かし付きPDFをダウンロード", description: "ファイルを処理し、透かし付きPDFドキュメントをダウンロードします" }
    },
    why: {
      title: "なぜ透かしを追加するのか",
      copyright: { title: "著作権保護", description: "著作権通知や所有者情報を追加して知的財産を保護します" },
      branding: { title: "ブランディングとアイデンティティ", description: "配布ドキュメントにロゴやブランドテキストを追加してブランドアイデンティティを強化します" },
      classification: { title: "ドキュメント分類", description: "ドキュメントをドラフト、機密、最終版としてマークしてステータスを示します" },
      tracking: { title: "ドキュメント追跡", description: "配布を追跡し、漏洩を特定するために一意の識別子を追加します" }
    },
    types: {
      title: "透かしの種類とオプション",
      text: {
        title: "テキスト透かし",
        description: "さまざまなオプションでテキスト透かしをカスタマイズ：",
        options: {
          text: "カスタムテキストコンテンツ（複数行対応）",
          font: "フォントファミリー、サイズ、カラー",
          rotation: "回転角度（0-360度）",
          opacity: "透明度レベル（透明から完全に見えるまで）",
          position: "位置（中央、タイル、カスタム配置）"
        }
      },
      image: {
        title: "画像透かし",
        description: "これらのカスタマイズで画像透かしを追加：",
        options: {
          upload: "独自のロゴまたは画像をアップロード",
          scale: "スケールとサイズ変更",
          rotation: "回転オプション",
          opacity: "透明度コントロール",
          position: "位置のカスタマイズ"
        }
      }
    },
    faq: {
      title: "よくある質問",
      removable: { question: "PDFから透かしを削除できますか？", answer: "標準の透かしは半永久的で、専門ソフトウェアなしでは削除が困難です。ただし、完全に改ざん防止ではありません。より安全な透かしにはProプランをご検討ください。" },
      printing: { question: "ドキュメントを印刷すると透かしは表示されますか？", answer: "はい、印刷時にも透かしが表示されます。透明度を調整して印刷物で目立たなくできます。" },
      pages: { question: "特定のページにのみ透かしを追加できますか？", answer: "はい、Proプランでは特定のページに透かしを適用できます。" },
      formats: { question: "画像透かしにサポートされている形式は？", answer: "PNG、JPG/JPEG、SVGをサポートしています。透明性が必要な場合はPNGが推奨されます。" },
      multiple: { question: "1つのドキュメントに複数の透かしを追加できますか？", answer: "Proユーザーは複数の透かしを追加可能、無料ユーザーは1つに制限されます。" },
      q1: { question: "私のPDFファイルは安全ですか？", answer: "はい、すべてのアップロードは安全に処理され、処理後に自動削除されます。" },
      q2: { question: "どのような透かしを追加できますか？", answer: "カスタマイズ可能なフォントのテキスト透かしや、PNG、JPG、SVGを使用した画像透かしです。" },
      q3: { question: "透かしを追加した後に削除できますか？", answer: "追加してダウンロードした後、透かしはPDFの恒久的な一部となります。" },
      q4: { question: "ファイルサイズに制限はありますか？", answer: "はい、PDFの最大サイズは50MB、画像透かしは5MBです。" }
    },
    bestPractices: {
      title: "透かしのベストプラクティス",
      dos: "すべきこと",
      donts: "すべきでないこと",
      dosList: [
        "コンテンツを隠さないよう半透明の透かしを使用",
        "カバー範囲を広げるために斜めの透かしを検討",
        "大きなドキュメントを処理する前にサンプルページでテスト",
        "視認性を高めるためにコントラストのある色を使用",
        "法的保護のために著作権記号©を含める"
      ],
      dontsList: [
        "暗すぎるまたは不透明な透かしを使用しない",
        "重要なテキストや要素の上に透かしを配置しない",
        "読みにくくなる小さなテキストを使用しない",
        "ドキュメントのセキュリティを透かしだけに頼らない",
        "ピクセル化する低解像度の画像を使用しない"
      ]
    },
    relatedTools: {
      title: "関連ツール",
      protect: "PDFを保護",
      sign: "PDFに署名",
      edit: "PDFを編集",
      ocr: "PDFのOCR",
      viewAll: "すべてのツールを表示"
    }
  },
  compressPdf: {
    title: "PDFファイルを圧縮",
    description: "ドキュメントの品質を維持しながら、PDFファイルのサイズを簡単に削減",
    quality: {
      high: "高品質",
      highDesc: "最小限の圧縮、最高の視覚品質",
      balanced: "バランス",
      balancedDesc: "視覚的な劣化を最小限に抑えた良い圧縮",
      maximum: "最大圧縮",
      maximumDesc: "高い圧縮率、視覚品質が低下する可能性あり"
    },
    processing: {
      title: "処理オプション",
      processAllTogether: "すべてのファイルを同時に処理",
      processSequentially: "ファイルを1つずつ処理"
    },
    status: {
      uploading: "アップロード中...",
      compressing: "圧縮中...",
      completed: "完了",
      failed: "失敗"
    },
    results: {
      title: "圧縮結果の概要",
      totalOriginal: "元の合計",
      totalCompressed: "圧縮後の合計",
      spaceSaved: "節約されたスペース",
      averageReduction: "平均削減率",
      downloadAll: "すべての圧縮ファイルをZIPとしてダウンロード"
    },
    of: "の",
    files: "ファイル",
    filesToCompress: "圧縮するファイル",
    compressAll: "ファイルを圧縮",
    qualityPlaceholder: "圧縮品質を選択",
    reduction: "削減",
    zipDownloadSuccess: "すべての圧縮ファイルが正常にダウンロードされました",
    overallProgress: "全体の進捗",
    reducedBy: "削減率",
    success: "圧縮成功",
    error: {
      noFiles: "圧縮するPDFファイルを選択してください",
      noCompressed: "ダウンロード可能な圧縮ファイルがありません",
      downloadZip: "ZIPファイルのダウンロードに失敗しました",
      generic: "PDFファイルの圧縮に失敗しました",
      unknown: "不明なエラーが発生しました",
      failed: "ファイルの圧縮に失敗しました"
    },
    howTo: {
      title: "PDFファイルの圧縮方法",
      step1: {
        title: "PDFをアップロード",
        description: "圧縮したい大きなPDFファイルをアップロードします。当社の無料PDF圧縮ツールは100MBまでのファイルをサポートし、Windows、Linuxなどのプラットフォームで動作します。"
      },
      step2: {
        title: "品質を選択",
        description: "画質を損なわずにファイルサイズを縮小するために、希望の圧縮レベルを選択します。PDFをどの程度圧縮したいかに基づいて最適なモードを選んでください。"
      },
      step3: {
        title: "ダウンロード",
        description: "圧縮されたPDFファイルをダウンロードします。オンライン共有やメール添付に最適な小さなファイルサイズを実現します。"
      }
    },
    why: {
      title: "PDFを圧縮する理由",
      uploadSpeed: {
        title: "超高速アップロード",
        description: "圧縮されたPDFファイル、特に大きなPDFファイルはアップロードが速く、オンラインでドキュメントを遅延なく共有できます。"
      },
      emailFriendly: {
        title: "メール対応",
        description: "ファイルサイズを縮小し、PDFをメールのサイズ制限内に収めます。当社のPDF圧縮ツールは品質を損なうことなく簡単な共有を実現します。"
      },
      storage: {
        title: "ストレージ効率",
        description: "当社のPDF圧縮ツールを使用して大きなPDFを小さく効率的なファイルに圧縮することで、デバイスやクラウドのストレージを節約できます。"
      },
      quality: {
        title: "品質維持",
        description: "品質を損なうことなくPDFを圧縮します。スマートモードにより、ファイルサイズを縮小しながら高い視覚的明瞭さを維持します。"
      }
    },
    faq: {
      title: "よくある質問",
      howMuch: {
        question: "PDFファイルはどれくらい圧縮できますか？",
        answer: "ほとんどの大きなPDFファイルは、内容に応じて20〜80％圧縮できます。当社のPDF圧縮ツールはさまざまなユースケースに最適化されており、特に画像の多いPDFで効果的にファイルサイズを縮小できます。"
      },
      quality: {
        question: "圧縮はPDFの品質に影響しますか？",
        answer: "当社のツールでは選択肢があります：ロスレスモードで視覚的な違いなくPDFを圧縮するか、ファイルサイズを最大限に縮小するために高圧縮を選択できます。必要な品質を損なうことなく無料で圧縮されたPDFを取得できます。"
      },
      secure: {
        question: "圧縮時にPDFデータは安全ですか？",
        answer: "はい、データは安全です。すべてのPDFファイルは安全にオンライン処理され、24時間後に自動的に削除されます。WindowsでもLinuxでも、ファイルは暗号化され、共有されることはありません。"
      },
      fileLimits: {
        question: "ファイルサイズの制限は？",
        answer: "無料ユーザーは10MBまでのPDFファイルを圧縮できます。プレミアムプランでは1ファイルあたり500MBまでサポートします。1つのPDFでも複数でも、当社のツールは大きなPDFファイルを簡単に処理します。"
      },
      batch: {
        question: "複数のPDFを一度に圧縮できますか？",
        answer: "はい、PDFを一括圧縮できます。複数のファイルをアップロードし、当社のPDF圧縮ツールで各ファイルのサイズを効率的に縮小できます。個人でもチームでも最適です。"
      }
    },
    modes: {
      title: "圧縮モード",
      moderate: {
        title: "中程度の圧縮",
        description: "品質を損なわずにPDFファイルを圧縮するバランスの取れたモードです。オンライン共有やアーカイブに最適で、良好な画質を維持します。"
      },
      high: {
        title: "高圧縮",
        description: "顕著な圧縮でファイルサイズを積極的に縮小します。大きなPDFファイルをすばやく縮小するのに理想的で、高解像度よりも小さなサイズが重要な場合に最適です。"
      },
      lossless: {
        title: "ロスレス圧縮",
        description: "不要なデータをクリーンアップしてPDFを圧縮し、外観に影響を与えずにファイルサイズを縮小します。品質が最も重要な場合のベストオプションです。"
      }
    },
    bestPractices: {
      title: "PDF圧縮のベストプラクティス",
      dos: "推奨事項",
      donts: "非推奨事項",
      dosList: [
        "最良の結果を得るために、PDF作成前に画像を圧縮する",
        "ニーズに合った適切な圧縮レベルを選択する",
        "圧縮前に元のファイルをバックアップとして保管する",
        "重要なドキュメントにはロスレス圧縮を使用する",
        "ファイルサイズをさらに縮小するために不要なページを削除する"
      ],
      dontsList: [
        "印刷用のドキュメントを過度に圧縮しない",
        "すべての詳細が重要な法的文書やアーカイブ文書を圧縮しない",
        "既に高度に圧縮されたPDFを繰り返し圧縮しない",
        "主にテキストを含むPDFで大幅な縮小を期待しない",
        "ファイルサイズが問題でない場合は圧縮しない"
      ]
    },
    relatedTools: {
      title: "関連ツール",
      merge: "PDFを結合",
      split: "PDFを分割",
      pdfToWord: "PDFをWordに",
      pdfToJpg: "PDFをJPGに",
      viewAll: "すべてのツールを表示"
    }
  },

  // PDFロック解除
  unlockPdf: {
    title: "私たちのPDFアンロッカーでPDFファイルを簡単にアンロック",
    description: "オンラインPDFアンロックツールを使用して、PDFパスワードを削除し、PDFファイルを迅速に保護解除します。どのオペレーティングシステムでも安全でないPDFファイルを作成するためにPDFをアンロックします。",
    metaDescription: "私たちのPDFアンロッカーでPDFファイルを簡単にアンロック。PDF許可パスワードを削除し、オンラインPDFを保護解除し、アンロックされたファイルを安全にダウンロードします。",
    keywords: "PDFファイル アンロック, PDFファイルの解除方法, PDF アンロック, PDFファイル アンロック, PDFにアンロック, PDFファイル アンロック, 安全でないPDFファイル, PDFアンロッカー, アンロックされたファイル, PDFドキュメント アンロック, SmallPDF アンロック, PDFs アンロック, PDF保護ツール, 許可パスワード, ファイルのダウンロード, PDFからのパスワード, オンラインPDF, PDFパスワードの削除, SmallPDF PDF アンロック, PDFの削除, 保存をクリック, パスワードクリック, PDFアンロックツール",

    // Benefits Section
    benefits: {
      title: "PDFファイルをアンロックするために私たちのPDFアンロックツールを使う理由",
      list: [
        {
          title: "高速PDFアンロッカー",
          description: "私たちのPDFアンロックツールを使用してPDFパスワードを迅速に削除し、安全でないPDFファイルを作成し、ファイルを即座にダウンロードする準備をします。"
        },
        {
          title: "PDFファイルの簡単なアンロック",
          description: "簡単なパスワード入力ボックスで、許可パスワードまたはドキュメントオープン パスワードを入力してオンラインでPDFファイルをアンロック—保存をクリックして完了です。"
        },
        {
          title: "あらゆるプラットフォームでPDFsをアンロック",
          description: "私たちのオンラインPDFアンロッカーはどのオペレーティングシステムでも動作し、SmallPDFアンロックまたは私たちのPDFアンロックツールを使用してPDFファイルをスムーズにアンロックします。"
        },
        {
          title: "安全なPDFドキュメント アンロック",
          description: "私たちのツールでPDFファイルからパスワードを安全に削除し、PDFをアンロックした後もアンロックされたファイルがプライベートに保たれることを保証します。"
        }
      ]
    },

    // Use Cases Section
    useCases: {
      title: "PDFファイルの解除方法：トップユースケース",
      list: [
        {
          title: "許可パスワード付きPDFファイルのアンロック",
          description: "私たちのPDFアンロッカーを使用して許可パスワードを削除し、パスワードクリックが分かっている場合に完全なアクセスを得るためにPDFにアンロックします。"
        },
        {
          title: "ビジネス向けオンラインPDF",
          description: "ビジネスドキュメントからPDFパスワードを削除するためにオンラインでPDFファイルをアンロックし、迅速な保存クリックで共有と編集を簡素化します。"
        },
        {
          title: "PDF学習教材のアンロック",
          description: "私たちのPDFアンロックツールでオンラインPDF学習リソースを保護解除し、スムーズな学習のための安全でないPDFファイルを作成します。"
        },
        {
          title: "個人PDFドキュメントのアンロック",
          description: "私たちのSmallPDFアンロックPDF代替品を使用して個人コレクションからPDFファイルをアンロックする方法を学び、ファイルをダウンロードします。"
        }
      ]
    },

    // How-To Section
    howTo: {
      title: "3ステップでPDFファイルをアンロックする方法",
      upload: {
        title: "ステップ1：オンラインPDFをアップロード",
        description: "私たちのPDFアンロックツールで保護解除したいPDFファイルをアップロードしてPDFのアンロックを開始します。"
      },
      enterPassword: {
        title: "ステップ2：許可パスワードを入力",
        description: "PDFからのパスワード（ドキュメントオープンパスワードや許可パスワードなど）を入力するためにパスワード入力ボックスを使用します。"
      },
      download: {
        title: "ステップ3：アンロックされたファイルをダウンロード",
        description: "PDFパスワードを削除した後、ファイルを安全でないPDFファイルとしてダウンロードしてPDFファイルのアンロックを完了します。"
      }
    },

    // Features Section
    features: {
      title: "私たちのPDFアンロッカーの主な機能",
      list: [
        {
          title: "すべてのオンラインPDFをサポート",
          description: "許可パスワードまたはドキュメントオープンパスワード付きのPDFファイルを簡単にアンロックします。"
        },
        {
          title: "迅速なPDFアンロックプロセス",
          description: "私たちの高速PDFアンロックツールで数秒でPDFパスワードを削除し、ファイルをダウンロードするのに最適です。"
        },
        {
          title: "クロスプラットフォームPDFドキュメント アンロック",
          description: "どのオペレーティングシステムでも私たちのPDFアンロッカーを使用してPDFファイルをスムーズにアンロックします。"
        },
        {
          title: "安全なSmallPDFアンロック代替",
          description: "暗号化処理でPDFファイルを保護解除し、SmallPDFアンロックPDFの安全な代替品を提供します。"
        }
      ]
    },

    // FAQ Section
    faq: {
      passwordRequired: {
        question: "PDFファイルをアンロックするためにパスワードクリックが必要ですか？",
        answer: "はい、PDFsをアンロックするには、パスワード入力ボックスにPDFからのパスワード（ドキュメントオープンパスワードや許可パスワードなど）を入力する必要があります。私たちのツールはパスワードを回避しません。"
      },
      security: {
        question: "このツールでPDFファイルをアンロックするのは安全ですか？",
        answer: "はい、私たちのPDFアンロックツールは暗号化されたサーバーでオンラインPDFを処理します。ファイルをダウンロードした後、ファイルやパスワードを保存しません。"
      },
      restrictions: {
        question: "パスワードクリックなしでPDFにアンロックできますか？",
        answer: "はい、ドキュメントオープンパスワードがないが許可パスワードがある場合、PDFの制限を削除するためにアップロードしてください。"
      },
      quality: {
        question: "PDFのアンロックは品質に影響しますか？",
        answer: "いいえ、私たちのPDFアンロッカーはPDF設定からパスワードのみを削除します—アンロックされたファイルは元の品質を維持します。"
      },
      compatibility: {
        question: "SmallPDFアンロックPDFユーザーにも対応していますか？",
        answer: "はい、私たちのPDFアンロックツールはどのオペレーティングシステムでも動作し、SmallPDFアンロックの優れた代替としてオンラインでPDFファイルをアンロックします。"
      }
    },

    // Status Messages
    passwordProtected: "パスワード保護されています",
    notPasswordProtected: "パスワード保護されていません",
    unlocking: "PDFをアンロック中...",
    unlockSuccess: "PDFが正常にアンロックされました！",
    unlockSuccessDesc: "あなたのPDFドキュメントのアンロックが完了しました！今すぐアンロックされたファイルをダウンロードしてください。"
  },

  // ファイルアップローダー
  fileUploader: {
    dropHere: "ここにファイルをドロップ",
    dropHereaDesc: "PDFファイルをここにドロップするかクリックして参照",
    dragAndDrop: "ファイルをドラッグ＆ドロップ",
    browse: "ファイルを参照",
    dropHereDesc: "ファイルをここにドロップするかクリックして参照。",
    maxSize: "最大サイズは100MB。",
    remove: "削除",
    inputFormat: "入力形式",
    outputFormat: "出力形式",
    ocr: "OCRを有効にする",
    ocrDesc: "光学文字認識を使用してスキャンされたドキュメントからテキストを抽出",
    quality: "品質",
    low: "低",
    high: "高",
    password: "パスワード",
    categories: {
      documents: "ドキュメント",
      spreadsheets: "スプレッドシート",
      presentations: "プレゼンテーション",
      images: "画像"
    },
    converting: "変換中",
    successful: "変換成功",
    successDesc: "ファイルが正常に変換され、ダウンロードの準備が整いました。",
    download: "変換されたファイルをダウンロード",
    filesSecurity: "プライバシーとセキュリティのためにファイルは24時間後に自動的に削除されます。"
  },

  // 共通UI要素
  ui: {
    upload: "アップロード",
    download: "ダウンロード",
    cancel: "キャンセル",
    confirm: "確認",
    save: "保存",
    next: "次へ",
    previous: "前へ",
    finish: "完了",
    processing: "処理中...",
    success: "成功！",
    error: "エラー",
    copy: "コピー",
    remove: "削除",
    browse: "参照",
    dragDrop: "ドラッグ＆ドロップ",
    or: "または",
    close: "閉じる",
    apply: "適用",
    loading: "読み込み中...",
    preview: "プレビュー",
    reupload: "別のファイルをアップロード",
    continue: "続ける",
    skip: "スキップ",
    retry: "再試行",
    addMore: "さらに追加",
    clear: "クリア",
    clearAll: "すべてクリア",
    done: "完了",
    extract: "抽出",
    new: "新着！",
    phone: "電話",
    address: "住所",
    filesSecurity: "プライバシーとセキュリティのためにファイルは24時間後に自動的に削除されます。"
  },

  contact: {
    title: "お問い合わせ",
    description: "ご質問やフィードバックがありますか？ぜひお聞かせください。",
    form: {
      title: "メッセージを送信",
      description: "以下のフォームにご記入いただければ、できるだけ早くご返信いたします。",
      name: "お名前",
      email: "メールアドレス",
      subject: "件名",
      message: "メッセージ",
      submit: "メッセージを送信"
    },
    success: "メッセージが正常に送信されました",
    successDesc: "ご連絡ありがとうございます。できるだけ早くご返信いたします。",
    error: "メッセージの送信に失敗しました",
    errorDesc: "メッセージの送信中にエラーが発生しました。後でもう一度お試しください。",
    validation: {
      name: "名前は必須です",
      email: "有効なメールアドレスを入力してください",
      subject: "件名は必須です",
      message: "メッセージは必須です"
    },
    supportHours: {
      title: "サポート時間",
      description: "対応可能な時間",
      weekdays: "月曜日 - 金曜日",
      weekdayHours: "午前9時 - 午後6時（東部標準時）",
      saturday: "土曜日",
      saturdayHours: "午前10時 - 午後4時（東部標準時）",
      sunday: "日曜日",
      closed: "休業"
    },
    faq: {
      title: "よくある質問",
      responseTime: {
        question: "返信にはどのくらい時間がかかりますか？",
        answer: "すべての問い合わせに24〜48営業時間以内に返信することを目指しています。ピーク時には最大72時間かかる場合があります。"
      },
      technicalSupport: {
        question: "技術的な問題のサポートを受けられますか？",
        answer: "はい、技術サポートチームがPDFツールで発生するあらゆる問題をサポートします。"
      },
      phoneSupport: {
        question: "電話サポートはありますか？",
        answer: "記載されているサポート時間中に電話サポートを提供しています。即時対応が必要な場合は、メールが最も早い方法です。"
      },
      security: {
        question: "個人情報は安全ですか？",
        answer: "プライバシーを真剣に考えています。すべての通信は暗号化され、個人情報を第三者と共有することはありません。"
      }
    }
  },

  // 会社概要ページ
  about: {
    hero: {
      title: "デジタルドキュメント管理の強化",
      description: "ScanProはシンプルなアイデアから生まれました：ドキュメント管理をシームレスで効率的、そして誰にとってもアクセスしやすくすること。私たちは人々がデジタルドキュメントと対話する方法を変革することを信じています。"
    },
    story: {
      title: "私たちのストーリー",
      paragraph1: "2022年に設立されたScanProは、複雑で直感的でないPDFツールに取り組むことへのフラストレーションから生まれました。私たちの創設者である技術愛好家とドキュメント管理の専門家は、強力かつユーザーフレンドリーなソリューションを生み出す機会を見出しました。",
      paragraph2: "小さなプロジェクトとして始まったものは、すぐに学生や専門家から大企業まで、世界中の何千人ものユーザーにサービスを提供する包括的なプラットフォームへと成長しました。"
    },
    missionValues: {
      title: "私たちの使命と価値観",
      mission: {
        title: "使命",
        description: "直感的で強力かつアクセスしやすいPDFツールを提供することでデジタルドキュメント管理を簡素化し、生産性と創造性を高めること。"
      },
      customerFirst: {
        title: "顧客第一",
        description: "私たちはユーザー体験を優先し、実際のユーザーからのフィードバックに基づいてツールを継続的に改善します。あなたのニーズが私たちの革新を推進します。"
      },
      privacy: {
        title: "プライバシーとセキュリティ",
        description: "私たちは最先端のセキュリティ対策とあなたのプライバシーへの絶対的な尊重をもって、あなたのデータを保護することに取り組んでいます。"
      }
    },
    coreValues: {
      title: "私たちのコアバリュー",
      innovation: {
        title: "革新",
        description: "私たちはドキュメント管理において可能なことの限界を継続的に押し広げます。"
      },
      collaboration: {
        title: "協力",
        description: "私たちは社内およびユーザーとのチームワークの力を信じています。"
      },
      accessibility: {
        title: "アクセシビリティ",
        description: "私たちのツールはシンプルで直感的、そして誰にとっても利用可能であるように設計されています。"
      }
    },
    team: {
      title: "私たちのチームに会う",
      description: "ScanProは、ユーザー向けに可能な限り最高のPDFツールを作成することに注力する小さな献身的なチームによって支えられています。",
      member1: {
        name: "チャクラ",
        role: "アプリ開発リーダー",
        bio: "私たちのアプリケーションの開発を監督し、堅牢なバックエンドソリューションを実装し、ツールがスムーズかつ効率的に動作することを保証します。"
      },
      member2: {
        name: "アブディ",
        role: "フロントエンドウェブ開発者",
        bio: "私たちのツールを直感的でアクセスしやすくするユーザーインターフェースを作成し、すべてのウェブプラットフォームで優れたユーザー体験を提供することに注力します。"
      },
      member3: {
        name: "アンジ",
        role: "マーケティングスペシャリスト",
        bio: "私たちのツールを必要とする人々とつなぐマーケティング活動をリードし、認知度を高め、プラットフォームの成長を推進します。"
      }
    }
  },

  // 利用規約およびプライバシーページ
  legal: {
    termsTitle: "利用規約",
    privacyTitle: "プライバシーポリシー",
    lastUpdated: "最終更新",
    introduction: {
      title: "はじめに",
      description: "サービスをご利用になる前に、これらの規約をよくお読みください。"
    },
    dataUse: {
      title: "データの使用方法",
      description: "ご依頼いただいたサービスを提供するためにのみファイルを処理します。すべてのファイルは24時間後に自動的に削除されます。"
    },
    cookies: {
      title: "クッキーとトラッキング",
      description: "ユーザー体験の向上とウェブサイトのトラフィック分析のためにクッキーを使用します。"
    },
    rights: {
      title: "あなたの権利",
      description: "個人情報へのアクセス、修正、削除の権利があります。"
    }
  },

  // エラーページ
  error: {
    notFound: "ページが見つかりません",
    notFoundDesc: "申し訳ありません。お探しのページが見つかりませんでした。",
    serverError: "サーバーエラー",
    serverErrorDesc: "申し訳ありません。サーバーで何か問題が発生しました。後でもう一度お試しください。",
    goHome: "ホームに戻る",
    tryAgain: "もう一度試す"
  },
  universalCompressor: {
    title: "ユニバーサルファイルコンプレッサー",
    description: "PDF、画像、オフィス文書を品質を維持しながら圧縮",
    dropHereDesc: "ここにファイルをドラッグ＆ドロップ（PDF、JPG、PNG、DOCX、PPTX、XLSX）",
    filesToCompress: "圧縮するファイル",
    compressAll: "すべてのファイルを圧縮",
    results: {
      title: "圧縮結果",
      downloadAll: "すべての圧縮ファイルをダウンロード"
    },
    fileTypes: {
      pdf: "PDF文書",
      image: "画像",
      office: "オフィス文書",
      unknown: "不明なファイル"
    },
    howTo: {
      title: "ファイルの圧縮方法",
      step1: {
        title: "ファイルをアップロード",
        description: "圧縮したいファイルをアップロードしてください"
      },
      step2: {
        title: "品質を選択",
        description: "お好みの圧縮レベルを選択してください"
      },
      step3: {
        title: "ダウンロード",
        description: "圧縮をクリックして圧縮ファイルをダウンロードしてください"
      }
    },
    faq: {
      compressionRate: {
        question: "ファイルはどのくらい圧縮できますか？",
        answer: "圧縮率はファイルの種類や内容によって異なります。PDFは通常20～70%、画像は30～80%、オフィス文書は10～50%圧縮されます。"
      },
      quality: {
        question: "圧縮はファイルの品質に影響しますか？",
        answer: "当社の圧縮アルゴリズムは、サイズ削減と品質維持のバランスを取ります。'高品質'設定ではほぼ同一の視覚的品質を維持します。"
      },
      sizeLimit: {
        question: "ファイルサイズに制限はありますか？",
        answer: "はい、各ファイル100MBまで圧縮可能です。"
      }
    }
  },
  faq: {
    categories: {
      general: "一般",
      conversion: "変換",
      security: "セキュリティ",
      account: "アカウント",
      api: "API"
    },
    general: {
      question1: "ScanProとは何ですか？",
      answer1: "ScanProは、PDFの管理と変換のための包括的なオンラインプラットフォームです。私たちのツールは、直感的なウェブインターフェースまたはAPIを通じて、PDFドキュメントの変換、編集、結合、分割、圧縮、セキュリティ保護をサポートします。",
      question2: "ScanProを使うためにアカウントを作成する必要がありますか？",
      answer2: "いいえ、登録せずに基本的なPDFツールを使用できます。ただし、無料アカウントを作成すると、履歴の保存、ファイルサイズ制限の拡大、追加機能へのアクセスなどの利点が得られます。",
      question3: "ScanProで私のデータは安全ですか？",
      answer3: "はい、すべてのファイルは暗号化されたサーバーで安全に処理されます。ファイルは第三者と共有されず、処理後（24時間以内）にサーバーから自動的に削除されます。詳細については、プライバシーポリシーをご覧ください。",
      question4: "ScanProはどのデバイスやブラウザをサポートしていますか？",
      answer4: "ScanProは、Chrome、Firefox、Safari、Edgeを含むすべての最新ブラウザで動作します。プラットフォームは完全にレスポンシブで、デスクトップ、タブレット、モバイルデバイスで利用可能です。"
    },
    conversion: {
      question1: "どのようなファイル形式に変換できますか、またその逆も可能ですか？",
      answer1: "ScanProは、PDFをWord（DOCX）、Excel（XLSX）、PowerPoint（PPTX）、画像（JPG、PNG）、HTML、プレーンテキストなど多くの形式に変換できます。これらの形式をPDFに戻すことも可能です。",
      question2: "PDF変換の精度はどの程度ですか？",
      answer2: "当社の変換エンジンは、フォント、画像、表、レイアウトを含む書式を維持するために高度なアルゴリズムを使用します。ただし、非常に複雑なドキュメントでは、書式にわずかな違いが生じる場合があります。最適な結果を得るには、複雑な書式のドキュメントに「PDFからWord」または「PDFからExcel」ツールを使用することをお勧めします。",
      question3: "変換にファイルサイズの制限はありますか？",
      answer3: "無料ユーザーは10MBまでのファイルを変換できます。ベーシック購読者は50MBまで、プロ購読者は100MBまで、エンタープライズユーザーは500MBまでです。より大きなファイルを処理する必要がある場合は、カスタムソリューションについてお問い合わせください。",
      question4: "なぜPDF変換が失敗したのですか？",
      answer4: "ファイルが破損している、パスワードで保護されている、またはシステムが処理できない複雑な要素が含まれている場合、変換が失敗することがあります。まず「PDF修復」ツールを使用し、再度変換を試みてください。問題が続く場合は、「高度な」変換モードを試すか、サポートにご連絡ください。"
    },
    security: {
      question1: "PDFにパスワードをどうやって設定しますか？",
      answer1: "「PDF保護」ツールを使用してください。PDFをアップロードし、パスワードを設定し、必要に応じて権限制限を選択して、「PDF保護」をクリックします。ユーザーが印刷、編集、またはコンテンツのコピーを許可するかどうかを制御できます。",
      question2: "PDFからパスワードを削除できますか？",
      answer2: "はい、「PDFロック解除」ツールを使用してください。保護を解除するには現在のパスワードを入力する必要があります。なお、当社はあなたが所有しているか、変更許可を持つドキュメントからのパスワード保護の解除のみをサポートします。",
      question3: "PDF保護に使用する暗号化レベルは何ですか？",
      answer3: "PDF保護には業界標準の256ビットAES暗号化を使用し、ドキュメントに強力なセキュリティを提供します。古いPDFリーダーとの互換性が必要な場合、128ビット暗号化もサポートしています。"
    },
    account: {
      question1: "サブスクリプションをどうやってアップグレードしますか？",
      answer1: "アカウントにログインし、ダッシュボードに移動して「サブスクリプション」タブを選択します。ニーズに合ったプランを選び、支払い手順に従ってください。支払い後すぐに新機能が有効になります。",
      question2: "サブスクリプションをキャンセルできますか？",
      answer2: "はい、ダッシュボードの「サブスクリプション」タブからいつでもサブスクリプションをキャンセルできます。現在の請求期間の終了までプレミアム機能にアクセスできます。",
      question3: "パスワードをリセットするにはどうすればいいですか？",
      answer3: "ログインページで「パスワードを忘れた場合？」をクリックし、メールアドレスを入力してください。1時間有効なパスワードリセットリンクを送信します。メールが届かない場合は、スパムフォルダを確認するか、サポートにご連絡ください。"
    },
    api: {
      question1: "APIキーはどうやって取得しますか？",
      answer1: "アカウントを登録し、ダッシュボード > APIキーに移動して最初のAPIキーを作成してください。無料アカウントは1キー、ベーシック購読者は3キー、プロ購読者は10キー、エンタープライズユーザーは50以上のキーを取得できます。",
      question2: "APIのレート制限は何ですか？",
      answer2: "レート制限はサブスクリプション層に依存します：無料（10リクエスト/時間）、ベーシック（100リクエスト/時間）、プロ（1,000リクエスト/時間）、エンタープライズ（5,000+リクエスト/時間）。各層には月間操作制限も適用されます。",
      question3: "APIをアプリケーションにどうやって統合しますか？",
      answer3: "当社のAPIは、JSON応答を備えた標準RESTエンドポイントを使用します。開発者セクションで包括的なドキュメント、コードサンプル、SDKを見つけることができます。JavaScript、Python、PHP、Javaなどのさまざまなプログラミング言語の例を提供しています。"
    },
    title: "よくある質問"
  },
  footer: {
    description: "プロフェッショナル向けの高度なPDFツール。強力なウェブベースのプラットフォームとAPIを使用して、ドキュメントを変換、編集、保護、最適化します。",
    contactUs: "お問い合わせ",
    address: "123 ドキュメントストリート, PDFシティ, 94103, アメリカ合衆国",
    subscribe: "ニュースレターを購読する",
    subscribeText: "最新のニュース、アップデート、ヒントを直接受信トレイに受け取ります。",
    emailPlaceholder: "メールアドレス",
    subscribeButton: "購読",
    pdfTools: "PDFツール",
    pdfManagement: "PDF管理",
    company: "会社",
    support: "サポート",
    aboutUs: "私たちについて",
    careers: "採用情報",
    blog: "ブログ",
    helpCenter: "ヘルプセンター",
    apiDocs: "APIドキュメント",
    faqs: "よくある質問",
    tutorials: "チュートリアル",
    systemStatus: "システムステータス",
    allRightsReserved: "全著作権所有。",
    termsOfService: "利用規約",
    privacyPolicy: "プライバシーポリシー",
    cookiePolicy: "クッキーポリシー",
    security: "セキュリティ",
    sitemap: "サイトマップ",
    validEmail: "有効なメールアドレスを入力してください",
    subscribeSuccess: "ニュースレターの購読ありがとうございます！",
    viewAllTools: "すべてのPDFツールを見る",
    repairPdf: "PDFを修復",
    socialFacebook: "Facebook",
    socialTwitter: "Twitter",
    socialInstagram: "Instagram",
    socialLinkedin: "LinkedIn",
    socialGithub: "GitHub",
    socialYoutube: "YouTube"
  },

  security: {
    title: "ScanProのセキュリティとプライバシー",
    description: "私たちはあなたのドキュメントのセキュリティとプライバシーを真剣に考えています。データ保護の方法をご覧ください。",
    measures: {
      title: "データ保護の方法"
    },
    sections: {
      encryption: {
        title: "エンドツーエンド暗号化",
        description: "すべてのファイルは転送中にTLS 1.3で、保存時にはAES-256暗号化で保護されます。あなたのドキュメントは決して無防備な状態で移動しません。"
      },
      temporaryStorage: {
        title: "一時保存",
        description: "ファイルは処理後24時間以内に自動的に削除されます。必要な期間以上にドキュメントを保持することはありません。"
      },
      access: {
        title: "アクセス制御",
        description: "堅牢な認証・認可システムにより、あなただけがドキュメントとアカウント情報にアクセスできます。"
      },
      infrastructure: {
        title: "安全なインフラストラクチャ",
        description: "当社のシステムはISO 27001認証を取得したエンタープライズクラスのクラウドプロバイダーで運用され、定期的なセキュリティ監査を受けています。"
      },
      compliance: {
        title: "コンプライアンス",
        description: "GDPR、CCPAおよびその他の地域のプライバシー規制に準拠し、あなたのデータ権利を保護します。"
      },
      monitoring: {
        title: "継続的監視",
        description: "自動および手動のセキュリティレビュー、脆弱性スキャン、侵入検知システムにより新たな脅威から保護します。"
      }
    },
    tabs: {
      security: "セキュリティ",
      privacy: "プライバシー",
      compliance: "コンプライアンス"
    },
    tabContent: {
      security: {
        title: "当社のセキュリティアプローチ",
        description: "ファイルとデータを保護する包括的なセキュリティ対策",
        encryption: {
          title: "強力な暗号化",
          description: "転送中のデータにはTLS 1.3を、保存データにはAES-256を使用しています。すべてのファイル転送はエンドツーエンドで暗号化されます。"
        },
        auth: {
          title: "安全な認証",
          description: "多要素認証、bcryptを使用した安全なパスワード保存、不審な活動に対する定期的なアカウント監視を実施しています。"
        },
        hosting: {
          title: "安全なホスティング",
          description: "当社のインフラストラクチャはISO 27001認証を取得したエンタープライズクラスのクラウドプロバイダーでホストされています。ネットワークセグメンテーション、ファイアウォール、侵入検知システムを実装しています。"
        },
        updates: {
          title: "定期的な更新",
          description: "定期的なセキュリティパッチと更新を維持し、脆弱性評価とペネトレーションテストを実施して潜在的な問題を特定・対処します。"
        }
      },
      privacy: {
        title: "プライバシー慣行",
        description: "個人データとドキュメントの取り扱い方法",
        viewPolicy: "プライバシーポリシー全文を表示"
      },
      compliance: {
        title: "コンプライアンスと認証",
        description: "準拠している基準と規制",
        approach: {
          title: "当社のコンプライアンスアプローチ",
          description: "ScanProはプライバシーとセキュリティを設計段階から組み込んで開発されています。変化する規制に準拠するため、定期的に慣行を見直し更新しています。"
        },
        gdpr: {
          title: "GDPRコンプライアンス"
        },
        hipaa: {
          title: "HIPAAに関する考慮事項"
        }
      }
    },
    retention: {
      title: "データ保持ポリシー",
      description: "データ最小化の厳格な慣行に従っています。各種データの保持期間は以下の通りです:",
      documents: {
        title: "アップロードされたドキュメント",
        description: "ファイルは処理後24時間以内に当社サーバーから自動的に削除されます。有料プラン向けのストレージ機能を明示的に選択しない限り、ドキュメントのコピーは保持しません。"
      },
      account: {
        title: "アカウント情報",
        description: "基本アカウント情報はアカウントがアクティブな間保持されます。アカウントはいつでも削除可能で、削除すると個人情報が当社システムから除去されます。"
      },
      usage: {
        title: "利用データ",
        description: "サービス改善のため、匿名化された利用統計を最大36ヶ月間保持します。このデータで個人を特定することはできません。"
      }
    },
    contact: {
      title: "セキュリティに関する質問は？",
      description: "当社のセキュリティチームが、データとプライバシーの保護方法についての質問にお答えします。",
      button: "セキュリティチームに連絡"
    },
    policy: {
      button: "プライバシーポリシー"
    },
    faq: {
      dataCollection: {
        question: "ScanProはどのような個人データを収集しますか？",
        answer: "サービス提供に必要な最小限の情報を収集します。登録ユーザーには、メールアドレス、氏名、利用統計が含まれます。サービス改善のため匿名の利用データも収集します。ドキュメント内容の分析、スキャン、マイニングは行いません。"
      },
      documentStorage: {
        question: "ドキュメントはどのくらい保存されますか？",
        answer: "ドキュメントは通常、処理後24時間以内に当社サーバーから自動削除されます。有料サブスクリプションではドキュメント保存オプションを利用できますが、これは明示的な選択が必要な機能です。"
      },
      thirdParty: {
        question: "第三者とデータを共有しますか？",
        answer: "個人データの販売や貸与は行いません。サービスの提供に必要な場合（サブスクリプションの決済処理業者など）や法律で要求される場合にのみ、第三者とデータを共有します。すべての第三者プロバイダーは厳格な審査を受け、データ保護契約に拘束されます。"
      },
      security: {
        question: "データはどのように保護されていますか？",
        answer: "業界標準のセキュリティ対策を採用しています。データ転送にはTLS暗号化、保存データにはAES-256暗号化、安全なインフラプロバイダー、アクセス制御、定期的なセキュリティ監査を実施。セキュリティを最優先に設計されたシステムです。"
      },
      rights: {
        question: "データに関する私の権利は？",
        answer: "お住まいの地域により、データアクセス権、不正確なデータの修正権、データ削除権、処理制限権、データポータビリティ権、処理異議申立権などがあります。権利行使にはサポートチームまでご連絡ください。"
      },
      breach: {
        question: "データ侵害が発生した場合どうなりますか？",
        answer: "適用される法律に従い、侵害の検知、対応、影響を受けるユーザーへの通知を行うプロトコルを用意しています。侵害リスクを最小化するため定期的なセキュリティ評価を実施し、詳細なインシデント対応計画を維持しています。"
      }
    }
  },

  developer: {
    title: "開発者向けAPIドキュメント",
    description: "ScanProの強力なPDFツールをRESTful APIでアプリケーションに統合",
    tabs: {
      overview: "概要",
      authentication: "認証",
      endpoints: "エンドポイント",
      examples: "例",
      pricing: "価格"
    },
    examples: {
      title: "コード例",
      subtitle: "これらのすぐに使える例でAPIの統合方法を学ぶ",
      pdfToWord: "PDFからWordへの変換",
      mergePdfs: "PDFの結合",
      protectPdf: "PDFの保護"
    },
    endpoints: {
      title: "APIエンドポイント",
      subtitle: "利用可能なすべてのAPIエンドポイントの完全なリファレンス",
      categories: {
        all: "すべて",
        conversion: "変換",
        manipulation: "操作",
        security: "セキュリティ",
        ocr: "OCR"
      },
      parameters: "パラメータ",
      paramName: "名前",
      type: "タイプ",
      required: "必須",
      description: "説明",
      responses: "応答"
    },
    pricing: {
      title: "API価格",
      subtitle: "API統合のニーズに合ったプランを選択",
      monthly: "月額請求",
      yearly: "年額請求",
      discount: "20%節約",
      forever: "永久",
      includes: "含まれるもの:",
      getStarted: "始める",
      subscribe: "購読",
      freePlan: {
        description: "時折の使用とテスト用",
        feature1: "月間100操作",
        feature2: "1時間あたり10リクエスト",
        feature3: "1 APIキー",
        feature4: "基本的なPDF操作"
      },
      basicPlan: {
        description: "スタートアップや小規模プロジェクト向け",
        feature1: "月間1,000操作",
        feature2: "1時間あたり100リクエスト",
        feature3: "3 APIキー",
        feature4: "すべてのPDF操作",
        feature5: "基本OCR"
      },
      proPlan: {
        description: "企業やパワーユーザー向け",
        feature1: "月間10,000操作",
        feature2: "1時間あたり1,000リクエスト",
        feature3: "10 APIキー",
        feature4: "高度なOCR",
        feature5: "優先サポート",
        feature6: "カスタム透かし"
      },
      enterprisePlan: {
        description: "高ボリューム統合向け",
        feature1: "月間100,000以上の操作",
        feature2: "1時間あたり5,000以上のリクエスト",
        feature3: "50以上のAPIキー",
        feature4: "専任サポート",
        feature5: "カスタム統合支援",
        feature6: "ホワイトラベルオプション"
      },
      customPricing: {
        title: "カスタムソリューションが必要ですか？",
        description: "高ボリュームAPI使用や特殊な統合要件に対して、専任サポート付きのカスタム価格を提供します。",
        contactSales: "営業に連絡",
        enterprisePlus: "エンタープライズ+",
        dedicated: "専用インフラストラクチャ",
        sla: "カスタムSLA",
        account: "専任アカウントマネージャー",
        custom: "カスタム価格"
      }
    },
    authentication: {
      loginRequired: "ログイン必須",
      loginMessage: "APIキーにアクセスするにはアカウントにサインインしてください。",
      signIn: "サインイン",
      yourApiKey: "あなたのAPIキー",
      noApiKeys: "まだAPIキーがありません。",
      managementKeys: "APIキーの管理",
      createApiKey: "APIキーを作成",
      title: "API認証",
      subtitle: "APIキーでAPIリクエストを保護",
      apiKeys: {
        title: "APIキー",
        description: "ScanPro APIへのすべてのリクエストはAPIキーを使用した認証が必要です。APIキーには多くの特権があるため、安全に保管してください！"
      },
      howTo: {
        title: "認証方法",
        description: "APIリクエストを次の2つの方法のいずれかで認証できます："
      },
      header: {
        title: "1. HTTPヘッダーの使用（推奨）",
        description: "HTTPリクエストのx-api-keyヘッダーにAPIキーを含めてください："
      },
      query: {
        title: "2. クエリパラメータの使用",
        description: "または、APIキーをクエリパラメータとして含めることもできます："
      },
      security: {
        title: "セキュリティのベストプラクティス",
        item1: "APIキーを公開しないでください",
        item2: "APIキーをクライアント側コードに保存しないでください",
        item3: "APIキーに適切な権限を設定してください",
        item4: "APIキーを定期的にローテーションしてください"
      },
      limits: {
        title: "レート制限とクォータ",
        description: "APIリクエストはサブスクリプション層に基づくレート制限の対象です：",
        plan: "プラン",
        operations: "操作",
        rate: "レート制限",
        keys: "APIキー"
      },
      errors: {
        title: "レート制限エラー",
        description: "レート制限を超えた場合、APIは以下のヘッダーとともに429 Too Many Requests応答を返します："
      }
    },
    api: {
      question1: "APIキーはどうやって取得しますか？",
      answer1: "アカウントに登録し、ダッシュボード > APIキーに移動して最初のAPIキーを作成します。無料アカウントは1キー、ベーシック購読者は3キー、プロ購読者は10キー、エンタープライズユーザーは50以上のキーです。",
      question2: "APIのレート制限は何ですか？",
      answer2: "レート制限はサブスクリプション層に依存します：無料（10リクエスト/時）、ベーシック（100リクエスト/時）、プロ（1,000リクエスト/時）、エンタープライズ（5,000+リクエスト/時）。各層に月間操作制限も適用されます。",
      question3: "APIをアプリケーションにどうやって統合しますか？",
      answer3: "当社のAPIはJSON応答を伴う標準RESTエンドポイントを使用します。開発者セクションで包括的なドキュメント、コードサンプル、SDKを見つけることができます。JavaScript、Python、PHP、Javaなどのプログラミング言語向けの例を提供しています。"
    },
    overview: {
      title: "API概要",
      subtitle: "当社のAPIについて知っておくべきすべて",
      intro: "ScanPro APIを使用すると、当社のPDF処理機能をアプリケーションに直接統合できます。シンプルなRESTfulインターフェースで、PDFをプログラムで変換、圧縮、結合、分割、その他の操作が可能です。",
      features: {
        title: "主な機能",
        restful: "JSON応答を伴うRESTful API",
        authentication: "APIキーによるシンプルな認証",
        operations: "変換、圧縮、結合などを含む包括的なPDF操作",
        scalable: "ニーズに合わせたスケーラブルな価格層",
        secure: "暗号化された転送と自動ファイル削除による安全なファイル処理"
      },
      gettingStarted: "開始方法",
      startSteps: "ScanPro APIを始めるには：",
      step1: "アカウントにサインアップ",
      step2: "ダッシュボードからAPIキーを生成",
      step3: "提供された例を使用して最初のAPIリクエストを実行",
      getStarted: "始める"
    },
    tools: {
      conversion: {
        title: "PDF変換",
        description: "PDFをさまざまな形式（DOCX、XLSX、JPG）に変換、またはその逆。"
      },
      manipulation: {
        title: "PDF操作",
        description: "複数のPDFを結合、PDFを別々のファイルに分割、またはファイルサイズを減らすためにPDFを圧縮。"
      },
      security: {
        title: "PDFセキュリティ",
        description: "パスワード保護を追加、保護されたPDFのロック解除、ドキュメントセキュリティのための透かし追加。"
      },
      viewEndpoints: "エンドポイントを表示"
    }
  },
  pricing: {
    description: "PDFのニーズに合ったプランを選んでください。ScanProは無料からエンタープライズまで柔軟な料金オプションを提供し、必要な機能が揃っています。",

    // Page content
    title: "シンプルで透明な料金",
    subtitle: "あなたに合ったプランを選んでください。すべてのプランに当社の主要なPDFツールが含まれています。",
    monthly: "月額",
    yearly: "年額",
    saveUp: "最大20%お得",
    subscribe: "購読",
    feature: "機能",
    featureCompare: "機能比較",

    // Features
    features: {
      operations: "月間操作数",
      amount: {
        free: "100操作",
        basic: "1,000操作",
        pro: "10,000操作",
        enterprise: "100,000操作"
      },
      apiAccess: "APIアクセス",
      apiKeys: {
        free: "1 APIキー",
        basic: "3 APIキー",
        pro: "10 APIキー",
        enterprise: "50 APIキー"
      },
      rateLimits: "レート制限",
      rateLimit: {
        free: "100リクエスト/時間",
        basic: "1000リクエスト/時間",
        pro: "1000リクエスト/時間",
        enterprise: "5000リクエスト/時間"
      },
      fileSizes: "最大ファイルサイズ",
      fileSize: {
        free: "25 MB",
        basic: "50 MB",
        pro: "100 MB",
        enterprise: "200 MB"
      },
      ocr: "OCR（文字認識）",
      watermarking: "ウォーターマーク",
      advancedProtection: "高度なPDF保護",
      bulkProcessing: "一括処理",
      supports: "サポート",
      support: {
        free: "メールサポート",
        priority: "優先サポート",
        dedicated: "専用サポート"
      },
      whiteLabel: "ホワイトラベルオプション",
      serviceLevel: "サービスレベル契約"
    },

    // Plan descriptions
    planDescriptions: {
      free: "たまに使うPDFニーズ向け",
      basic: "個人や小規模チーム向け",
      pro: "プロフェッショナルや企業向け",
      enterprise: "大規模組織向け"
    },

    // FAQ section
    faq: {
      title: "よくある質問",
      q1: {
        title: "PDF操作とは何ですか？",
        content: "PDF操作には、PDFを他の形式（Word、Excelなど）に変換する、PDFを圧縮する、PDFを結合する、PDFを分割する、ウォーターマークを追加する、テキストを抽出する、当社のサービスを通じてPDFファイルに対して行われるその他の操作が含まれます。"
      },
      q2: {
        title: "プランをアップグレードまたはダウングレードできますか？",
        content: "はい、いつでもプランをアップグレードまたはダウングレードできます。アップグレードの場合、新しいプランはすぐに有効になります。ダウングレードの場合、新しいプランは現在の請求サイクルの終了時に有効になります。"
      },
      q3: {
        title: "返金はありますか？",
        content: "すべての有料プランに7日間の返金保証を提供しています。当社のサービスにご満足いただけない場合、初回購入から7日以内に返金をリクエストできます。"
      },
      q4: {
        title: "月間操作制限を超えた場合どうなりますか？",
        content: "月間操作制限に達した場合、次の請求サイクルの開始時に制限がリセットされるまで追加の操作はできません。制限を増やすためにいつでもプランをアップグレードできます。"
      },
      q5: {
        title: "私のデータは安全ですか？",
        content: "はい、当社はデータのセキュリティを真剣に考えています。すべてのファイルアップロードと処理はセキュアなHTTPS接続を介して行われます。処理に必要な期間以上ファイルは保存せず、処理が完了するとすべてのファイルが自動的に削除されます。"
      }
    },

    // CTA section
    cta: {
      title: "始める準備はできていますか？",
      subtitle: "あなたに合ったプランを選んで、今日からPDFの変換を始めましょう。",
      startBasic: "ベーシックから始める",
      explorePdfTools: "PDFツールを探索"
    },

    // Login dialog
    loginRequired: "サインインが必要です",
    loginRequiredDesc: "購読する前にアカウントにサインインする必要があります。今すぐサインインしますか？",

    // Plan buttons
    getStarted: "始める",
    currentPlan: "現在のプラン"
  },
  signPdf: {
    title: "PDFに署名：文書にデジタル署名を追加",
    description: "PDF文書にデジタル署名、テキスト注釈、スタンプ、描画を簡単に追加できます",
    howTo: {
      title: "PDF文書に署名する方法",
      step1: {
        title: "PDFをアップロード",
        description: "署名または注釈を付けたいPDF文書をアップロードしてください"
      },
      step2: {
        title: "署名を追加",
        description: "署名を作成、アップロード、または描画して文書に配置してください"
      },
      step3: {
        title: "保存＆ダウンロード",
        description: "変更を保存し、署名済みのPDF文書をダウンロードしてください"
      }
    },
    tools: {
      signature: "署名",
      text: "テキスト",
      stamp: "スタンプ",
      draw: "描画",
      image: "画像"
    },
    options: {
      draw: "署名を描画",
      upload: "署名をアップロード",
      type: "署名を入力",
      clear: "クリア",
      save: "署名を保存",
      color: "色",
      fontSize: "フォントサイズ",
      cancel: "キャンセル",
      apply: "適用",
      position: "位置"
    },
    stamps: {
      approved: "承認済み",
      rejected: "却下",
      draft: "下書き",
      final: "最終版",
      confidential: "機密"
    },
    messages: {
      noFile: "ファイルが選択されていません",
      uploadFirst: "署名するPDFファイルをまずアップロードしてください",
      processing: "PDFを処理中...",
      signed: "PDFが正常に署名されました！",
      downloadReady: "署名済みのPDFがダウンロード可能です",
      error: "PDFの署名にエラー",
      errorDesc: "リクエストの処理中にエラーが発生しました。もう一度お試しください。"
    },
    faq: {
      title: "よくある質問",
      legality: {
        question: "デジタル署名は法的に拘束力がありますか？",
        answer: "当ツールで作成されたデジタル署名は、手書きの署名と視覚的に似ています。eIDASやESIGN法などの規制に準拠した法的に拘束力のある電子署名には、資格のある電子署名サービスが必要な場合があります。当ツールは内部文書、下書き、または視覚的な署名で十分な場合に適しています。"
      },
      security: {
        question: "署名の安全性はどの程度ですか？",
        answer: "当ツールの署名はPDF文書上の視覚的なオーバーレイです。同意の視覚的表現を提供しますが、高度なデジタル署名ソリューションに見られる暗号化セキュリティ機能は含まれていません。文書は安全に処理され、署名済みのPDFは保存されません。"
      },
      formats: {
        question: "サポートされている署名形式は何ですか？",
        answer: "マウス/タッチパッドで描画、画像ファイル（PNG、JPG、透明背景推奨）のアップロード、またはさまざまなフォントスタイルで名前を入力することで署名を作成できます。"
      },
      multipleSignatures: {
        question: "1つの文書に複数の署名を追加できますか？",
        answer: "はい、複数の署名、テキスト注釈、スタンプ、描画を文書に追加できます。これは、複数の関係者からの署名が必要な文書や、異なる場所に注釈が必要な場合に便利です。"
      }
    },
    benefits: {
      title: "デジタル署名の利点",
      paperless: {
        title: "ペーパーレス化",
        description: "文書を印刷、署名、スキャン、メールで送信する必要をなくします"
      },
      time: {
        title: "時間節約",
        description: "物理的な取り扱いなしでどこからでも即座に文書に署名"
      },
      professional: {
        title: "プロフェッショナルな外観",
        description: "クリーンでプロフェッショナルな署名済み文書を作成"
      },
      workflow: {
        title: "効率的なワークフロー",
        description: "文書の承認とビジネスプロセスを加速"
      }
    },
    useCases: {
      title: "一般的な使用例",
      contracts: {
        title: "契約書と合意書",
        description: "ビジネス契約書や合意書に署名を追加"
      },
      forms: {
        title: "フォームと申請書",
        description: "印刷せずにフォームを記入して署名"
      },
      approvals: {
        title: "文書承認",
        description: "公式スタンプと署名で文書を承認済みとしてマーク"
      },
      feedback: {
        title: "フィードバックと修正",
        description: "レビュー中に文書にコメントや注釈を追加"
      }
    },
    draw: "描画",
    addText: "テキストを追加",
    addImage: "画像を追加",
    download: "署名済みPDFをダウンロード",
    processing: "処理中...",
    clearAll: "すべてクリア",
    uploadSignature: "署名をアップロード",
    drawSignature: "署名を描画",
    signatureOptions: "署名オプション",
    annotationTools: "注釈ツール",
    pages: "ページ",
    uploadTitle: "署名用PDFをアップロード",
    uploadDesc: "PDFファイルをここにドラッグ＆ドロップするか、クリックして参照してください"
  },
  ocrPdf: {
    title: 'OCR PDF',
    description: 'OCRテキスト技術を使用して、選択不可能なPDFファイルを高精度で選択可能かつ検索可能なPDFに変換します',
    step1Title: 'PDFをアップロード',
    step1Description: 'OCRテキストで検索可能にしたいスキャンされたPDFまたは画像ベースのドキュメントをアップロードします',
    step2Title: 'OCR処理',
    step2Description: '当社の先進的なOCR技術は、PDFからスキャンされたテキストを認識して抽出します',
    step3Title: '検索可能なPDFをダウンロード',
    step3Description: '選択可能、コピー可能、検索可能なテキストファイルを含む改良されたPDFを取得します',
    howItWorksTitle: 'OCR技術のしくみ',
    howItWorksDescription: '光学文字認識（OCR）は、スキャンされたPDFファイルや画像などのさまざまなドキュメントを編集可能かつ検索可能なデータに変換する技術です。スキャンされたPDFにOCRを適用して、Adobe Acrobatで編集します。',
    feature1Title: 'スキャンされたドキュメントをテキストに',
    feature1Description: 'OCRはスキャンされたドキュメントや画像を機械可読テキストに変換し、Adobe Acrobatで検索可能かつ編集可能にします。',
    feature2Title: '多言語対応',
    feature2Description: '当社のOCRエンジンは、複雑なドキュメントでも高精度で複数の言語のテキストを認識します。',
    benefitsTitle: 'PDFにOCRを使用する理由',
    benefit1Title: '検索可能性',
    benefit1Description: 'ドキュメント内のOCRテキストを検索して、迅速に情報を見つけます',
    benefit2Title: 'コピー＆ペースト',
    benefit2Description: 'コンテンツを再入力する代わりに、PDFドキュメントから直接テキストをコピーします',
    benefit3Title: 'アーカイブ',
    benefit3Description: 'スキャンされたドキュメントや古いテキストファイルから検索可能なアーカイブを作成します',
    benefit4Title: '分析',
    benefit4Description: 'テキスト抽出とデータ処理を使用してドキュメントの内容を分析します',
    faqTitle: 'よくある質問',
    faq1Question: 'OCR処理中、私のデータは安全ですか？',
    faq1Answer: 'はい、データのセキュリティを非常に重要視しています。すべてのファイルのアップロードと処理は、セキュアなサーバーで行われます。ファイルは24時間後に自動的に削除され、OCRサービスを提供する以外の目的では使用しません。',
    relatedToolsTitle: '関連するPDFツール',
    tool1Href: '/compress-pdf',
    tool1Title: 'PDFを圧縮',
    tool1IconColor: 'text-green-500',
    tool1BgColor: 'bg-green-100 dark:bg-green-900/30',
    tool2Href: '/pdf-to-word',
    tool2Title: 'PDFをWordに',
    tool2IconColor: 'text-blue-500',
    tool2BgColor: 'bg-blue-100 dark:bg-blue-900/30',
    tool3Href: '/merge-pdf',
    tool3Title: 'PDFをマージ',
    tool3IconColor: 'text-red-500',
    tool3BgColor: 'bg-red-100 dark:bg-red-900/30',
    tool4Href: '/pdf-tools',
    tool4Title: 'すべてのPDFツール',
    tool4IconColor: 'text-purple-500',
    tool4BgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  rotatePdf: {
    title: "PDFページの回転",
    description: "オンラインツールを使用して、PDFページを時計回り、反時計回り、または上下逆に簡単に回転させます。正確なPDF編集ツールとボタンを使用して、誤ってスキャンされたドキュメントを修正し、選択したページやページ範囲を回転させます。",
    howTo: {
      title: "PDFページの回転方法",
      step1: {
        title: "PDFのアップロード",
        description: "回転させたいファイルを選択するために、PDFをドラッグアンドドロップするか、アップロードするためにクリックします。"
      },
      step2: {
        title: "回転の選択",
        description: "ページサムネイルをクリックしてページやページ範囲を選択し、回転ツールを使用して角度（90°、180°、または270°）を指定します。"
      },
      step3: {
        title: "ダウンロード",
        description: "選択したすべてのページが正しく向いているように、回転されたPDFドキュメントを処理してダウンロードします。"
      }
    },
    why: {
      title: "PDFページを回転させる理由",
      fixScanned: {
        title: "スキャンされたドキュメントの修正",
        description: "ページサムネイルと回転ツールを使用して、誤ってスキャンされたページの向きを修正し、読みやすくします。"
      },
      presentation: {
        title: "プレゼンテーションの改善",
        description: "プレゼンテーション中や画面での表示を最適化するために、PDFページや1ページを回転させます。"
      },
      mixedOrientation: {
        title: "混合向きの修正",
        description: "縦横混在のページを含むドキュメントを標準化するために、選択したページやページ範囲を回転させます。"
      },
      printing: {
        title: "印刷の最適化",
        description: "ページ範囲を回転させるボタンを使用して、印刷前にすべてのページが正しく向いていることを確認し、紙を節約します。"
      }
    },
    features: {
      title: "回転機能",
      individual: {
        title: "個別ページの回転",
        description: "ドキュメント内の1ページを選択して回転させるために、ページサムネイルをクリックします。"
      },
      batch: {
        title: "バッチページ選択",
        description: "奇数ページ、偶数ページ、またはすべてのページのオプションでページ範囲を選択して、複数のページを一度に回転させます。"
      },
      preview: {
        title: "ライブプレビュー",
        description: "選択したページのサムネイルで、回転されたページが処理前にどのように表示されるかを確認します。"
      },
      precision: {
        title: "正確なコントロール",
        description: "回転ツールを使用して、各ページに対して90°、180°、または270°の正確な回転角度を選択します。"
      }
    },
    form: {
      uploadTitle: "回転するPDFをアップロード",
      uploadDesc: "PDFを編集するために開くために、ここにPDFファイルをドラッグアンドドロップするか、ボタンをクリックしてPDFを選択します。",
      rotateAll: "すべてのページを回転",
      rotateEven: "偶数ページを回転",
      rotateOdd: "奇数ページを回転",
      rotateSelected: "選択したページを回転",
      selectPages: "ページを選択",
      rotateDirection: "回転方向",
      clockwise90: "時計回り90°",
      clockwise180: "180°（上下逆）",
      counterClockwise90: "反時計回り90°",
      apply: "回転を適用",
      reset: "すべてリセット",
      processing: "PDFを処理しています...",
      success: "PDFが正常に回転しました！",
      error: "PDFを回転中にエラーが発生しました",
      showSelector: "ページを選択",
      hideSelector: "ページセレクターを非表示"
    },
    faq: {
      title: "よくある質問",
      permanent: {
        question: "回転は永続的ですか？",
        answer: "はい、回転はPDFに永続的に適用されます。ただし、必要に応じてPDFを再度開き、ボタンを使用して再度回転させることができます。"
      },
      quality: {
        question: "回転はPDFの品質に影響しますか？",
        answer: "いいえ、オンラインツールはPDFの元の品質を保持します。ページの向きだけを変更し、コンテンツを再圧縮しないため、画像やテキストの品質が低下することはありません。"
      },
      size: {
        question: "回転はファイルサイズを変更しますか？",
        answer: "ページを回転することは、ファイルサイズに最小限の影響しか与えません。メタデータが更新されるため、ファイルサイズがわずかに変わることがありますが、ページ範囲のコンテンツは変わりません。"
      },
      limitations: {
        question: "回転に制限はありますか？",
        answer: "無料プランでは、100MBまでのファイルを回転できます。より大きなファイルについては、プレミアムプランを検討してください。また、回転ツールは、選択したページに対して標準角度（90°、180°、270°）を提供します。"
      },
      secured: {
        question: "回転中、ファイルは安全ですか？",
        answer: "はい、すべてのファイルはサーバー上で安全に処理され、処理後に自動的に削除されます。PDFを回転するために選択すると、ファイルは第三者と共有されたり保存されたりしません。"
      }
    },
    bestPractices: {
      title: "PDF回転のベストプラクティス",
      dosList: [
        "最終バージョンをダウンロードする前に、ページサムネイルでドキュメントをプレビューします",
        "回転ツールを使用して、上下逆のページに180°回転を適用します",
        "ドキュメント全体またはページ範囲に同じ向きの問題がある場合は、すべてのページを一度に回転します",
        "回転前に元のファイルをバックアップとして保存します",
        "回転後、すべての選択したページが正しく向いていることを確認します"
      ],
      dontsList: [
        "パスワードで保護されたPDFを解除せずに回転しないでください",
        "一貫性が重要な場合、同じドキュメント内で90°と270°の回転を混在させないでください",
        "すべてのページが同じ回転を必要とすると仮定せず、各ページサムネイルを確認します",
        "フォームフィールドを機能させたままにしておきたい場合は回転しないでください",
        "PDFが既に正しく向いている場合は回転しないでください"
      ],
      dos: "すること",
      donts: "しないこと"
    },
    relatedTools: {
      title: "関連ツール",
      compress: "PDFを圧縮",
      merge: "PDFを結合",
      split: "PDFを分割",
      edit: "PDFを編集",
      viewAll: "すべてのツールを表示"
    },
    messages: {
      selectAll: "すべて選択",
      downloading: "ダウンロードを準備しています...",
      rotationApplied: "{count}ページに回転を適用",
      dragDrop: "ページを並べ替えるためにドラッグアンドドロップ",
      pageOf: "{total}中のページ{current}",
      selectPageInfo: "回転するページを選択するためにページサムネイルをクリック"
    }
  },
  pageNumber: {
    title: "PDFにページ番号を追加",
    shortDescription: "PDFドキュメントにカスタマイズ可能なページ番号を簡単に追加",
    description: "オンラインツールを使用して、さまざまな数値形式、位置、スタイルでPDFにカスタムページ番号を追加",

    uploadTitle: "PDFをアップロード",
    uploadDesc: "ページ番号またはヘッダーを追加するためにPDFファイルをアップロードしてください。ファイルは安全に処理され、あらゆるオペレーティングシステムと互換性があります。",

    messages: {
      noFile: "まずPDFファイルをアップロードしてください",
      success: "ページ番号が正常に追加されました！",
      error: "ページ番号の追加中にエラーが発生しました",
      processing: "PDFを処理中..."
    },
    ui: {
      browse: "ファイルを閲覧",
      filesSecurity: "あなたのファイルは安全で、永久に保存されることはありません",
      error: "無効なファイルタイプです。PDFをアップロードしてください。",
      cancel: "キャンセル",
      addPageNumbers: "ページ番号を追加",
      processingProgress: "処理中... ({progress}%)",
      successTitle: "ページ番号が正常に追加されました",
      successDesc: "あなたのPDFは処理され、ダウンロードの準備が整いました",
      readyMessage: "あなたのPDFが準備できました！",
      readyDesc: "あなたのPDFファイルは処理され、設定に従ってページ番号が追加されました。",
      download: "PDFをダウンロード",
      processAnother: "別のPDFを処理",
      settingsTitle: "ページ番号設定",
      numberFormat: "番号形式",
      position: "位置",
      topLeft: "左上",
      topCenter: "上中央",
      topRight: "右上",
      bottomLeft: "左下",
      bottomCenter: "下中央",
      bottomRight: "右下",
      fontFamily: "フォントファミリー",
      fontSize: "フォントサイズ",
      color: "色",
      startFrom: "開始番号",
      prefix: "接頭辞",
      suffix: "接尾辞",
      horizontalMargin: "水平マージン (px)",
      pagesToNumber: "番号を付けるページ",
      pagesHint: "すべてのページの場合は空白のまま",
      pagesExample: "個別のページにはカンマを、範囲にはハイフンを使用します (例: 1,3,5-10)",
      skipFirstPage: "最初のページをスキップ (例: 表紙用)",
      preview: "プレビュー:",
      pagePreview: "ページプレビュー"
    },
    howTo: {
      title: "ページ番号の追加方法",
      step1: {
        title: "PDFをアップロード",
        description: "ページ番号を付けたいPDFファイルを選択してください"
      },
      step2: {
        title: "ページ番号をカスタマイズ",
        description: "数値形式、ページ範囲、位置、フォント、その他の設定を選択してPDFを編集"
      },
      step3: {
        title: "PDFをダウンロード",
        description: "オンラインツールを使用してPDFを処理し、ページ番号が追加されたPDFをダウンロード"
      }
    },

    benefits: {
      title: "ページ番号を追加する利点",
      navigation: {
        title: "ナビゲーションの向上",
        description: "どのページ範囲でも明確に見えるページ番号でドキュメント内のナビゲーションを容易に"
      },
      professional: {
        title: "プロフェッショナルなドキュメント",
        description: "法的またはビジネスドキュメントに適切にフォーマットされた番号でプロフェッショナルな外観を"
      },
      organization: {
        title: "より良い整理",
        description: "大きなドキュメントのページを追跡し、追加された番号で特定のページを簡単に参照"
      },
      customization: {
        title: "完全なカスタマイズ",
        description: "ドキュメントのスタイルに合わせてページ番号の外観と位置をカスタマイズするか、ヘッダーを追加"
      }
    },

    useCases: {
      title: "一般的な使用例",
      books: {
        title: "書籍と電子書籍",
        description: "書籍、電子書籍、またはレポートに適切なページ番号を簡単に追加して、読みやすさと参照を向上"
      },
      academic: {
        title: "学術論文",
        description: "論文、学位論文、研究論文に学術基準に従ってページ番号を付け、柔軟なフォーマットオプションで"
      },
      business: {
        title: "ビジネスドキュメント",
        description: "提案書、レポート、ビジネスプランにプロフェッショナルなページ番号を追加、Adobe Acrobat Pro不要"
      },
      legal: {
        title: "法的ドキュメント",
        description: "契約書や法的書類に一貫したページ番号を適用して適切な参照を確保"
      }
    },

    faq: {
      title: "よくある質問",
      formats: {
        question: "どのような数値形式が利用できますか？",
        answer: "当社のオンラインツールは複数の形式をサポートしています：数値（1、2、3）、ローマ数字（I、II、III）、アルファベット（A、B、C）。ニーズに合った形式を選択してください。"
      },
      customize: {
        question: "ページ番号の外観をカスタマイズできますか？",
        answer: "はい、ページ番号を完全にカスタマイズできます。プレフィックス（例：「ページ」）、サフィックス（例：「/10」）、フォント、サイズ、色を選択し、ページ上のどこにでも配置できます。"
      },
      skipPages: {
        question: "ページ番号を追加する際に特定のページをスキップできますか？",
        answer: "もちろんです！ページ範囲を指定して選択的に番号を付けたり、最初のページ（例：表紙）を簡単にスキップできます。"
      },
      startNumber: {
        question: "特定の番号からページ番号を開始できますか？",
        answer: "はい、シーケンスの開始番号を設定できます。他のドキュメントから続く場合や独自の番号付けが必要な場合に最適です。"
      },
      security: {
        question: "アップロードしたPDFは安全ですか？",
        answer: "はい、すべての処理は安全です。ファイルは転送中に暗号化され、処理後に自動的に削除されます—永続的な保存や番号追加以外のアクセスはありません。"
      }
    },

    relatedTools: {
      title: "関連ツール"
    }
  }

}