import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Download, Loader2, CheckCircle2, Globe, MessageCircle } from 'lucide-react';
import jsPDF from 'jspdf';

interface FormData {
  serviceType: string;
  clientDescription: string;
  name: string;
  email: string;
  language: 'en' | 'ar' | 'fr';
  budgetMin: number;
  budgetMax: number;
  // Website specific
  websiteType?: 'static' | 'dynamic' | 'ecommerce';
  pages?: number;
  designComplexity?: 'simple' | 'medium' | 'complex';
  // Mobile App specific
  platform?: 'ios' | 'android' | 'both';
  screens?: number;
  // Desktop App specific
  os?: 'windows' | 'mac' | 'linux' | 'cross-platform';
  // API specific
  endpoints?: number;
  // Features - dynamic based on service type
  features?: string[];
}

interface QuoteResult {
  estimatedPrice: number;
  currency: string;
  timeline: string;
  breakdown: string;
  budgetComparison?: {
    min: number;
    max: number;
    status: 'within_budget' | 'over_budget' | 'under_budget';
  };
}

const translations = {
  en: {
    title: 'Get a Quote',
    subtitle: 'Tell us about your project',
    whatLookingFor: 'What are you looking for?',
    describeProject: 'Describe what you want to build',
    describePlaceholder: 'e.g., A car dealership website with inventory management, or a pet food store with online ordering...',
    yourName: 'Your Name',
    yourEmail: 'Your Email',
    budget: 'Your Budget (DZD)',
    budgetRange: 'Budget Range: {min} - {max} DZD',
    whatsapp: 'Contact via WhatsApp',
    withinBudget: 'Within your budget',
    overBudget: 'Over your budget',
    underBudget: 'Under your budget',
    budgetComparison: 'Budget Comparison: Your budget {min}-{max} DZD vs Estimated {price} DZD',
    getQuote: 'Get Quote',
    back: 'Back',
    downloadPDF: 'Download PDF',
    newQuote: 'New Quote',
    quoteGenerated: 'Quote Generated!',
    hereEstimatedCost: 'Here\'s your estimated project cost',
    estimatedPrice: 'Estimated Price',
    timeline: 'Timeline',
    projectBreakdown: 'Project Breakdown',
    website: 'Website',
    mobileApp: 'Mobile App',
    desktopApp: 'Desktop App',
    api: 'API',
    // Website types
    staticWebsite: 'Static Website',
    staticWebsiteDesc: 'Simple, fast, no database',
    dynamicWebsite: 'Dynamic Website',
    dynamicWebsiteDesc: 'Database-driven, interactive',
    ecommerce: 'E-commerce',
    ecommerceDesc: 'Online store with payments',
    // Design complexities
    simple: 'Simple',
    simpleDesc: 'Basic layout, standard components',
    medium: 'Medium',
    mediumDesc: 'Custom design, animations',
    complex: 'Complex',
    complexDesc: 'Advanced UI/UX, 3D elements',
    // PDF labels
    pdfTitle: 'DevZoneDZ',
    pdfSubtitle: 'Professional Development Services',
    pdfQuote: 'Project Quote',
    pdfClient: 'Client:',
    pdfEmail: 'Email:',
    pdfService: 'Service:',
    pdfProjectDesc: 'Project Description:',
    pdfTimeline: 'Estimated Timeline:',
    pdfDetails: 'Project Details:',
    pdfContact: 'Contact: imadedar98@gmail.com | +213 657 496 125',
    // Mobile features
    pushNotifications: 'Push Notifications',
    offlineMode: 'Offline Mode',
    gpsLocation: 'GPS/Location',
    cameraIntegration: 'Camera Integration',
    socialMediaIntegration: 'Social Media Integration',
    inAppPurchases: 'In-app Purchases',
    chatMessaging: 'Chat/Messaging',
    analytics: 'Analytics',
    userProfiles: 'User Profiles',
    cloudSync: 'Cloud Sync',
    biometricAuth: 'Biometric Auth',
    arFeatures: 'AR Features',
    voiceRecognition: 'Voice Recognition',
    videoStreaming: 'Video Streaming',
    realTimeUpdates: 'Real-time Updates',
    // Desktop features
    autoUpdate: 'Auto-update System',
    cloudStorage: 'Cloud Storage',
    multiUser: 'Multi-user Support',
    dataExport: 'Data Export/Import',
    customThemes: 'Custom Themes',
    keyboardShortcuts: 'Keyboard Shortcuts',
    dragDrop: 'Drag & Drop Interface',
    fileManagement: 'File Management',
    printSupport: 'Print Support',
    pluginSystem: 'Plugin/Extension System',
    apiIntegration: 'API Integration',
    realTimeSync: 'Real-time Sync',
    encryption: 'Data Encryption',
    // API features
    authentication: 'Authentication System',
    documentation: 'API Documentation',
    rateLimiting: 'Rate Limiting',
    caching: 'Caching Layer',
    webhooks: 'Webhooks Support',
    versioning: 'API Versioning',
    monitoring: 'Monitoring & Analytics',
    logging: 'Advanced Logging',
    testing: 'Automated Testing',
    graphql: 'GraphQL Support',
    fileUpload: 'File Upload/Storage',
    emailIntegration: 'Email Integration',
    smsIntegration: 'SMS Integration',
  },
  ar: {
    title: 'احصل على عرض سعر',
    subtitle: 'أخبرنا عن مشروعك',
    whatLookingFor: 'ماذا تبحث عن؟',
    describeProject: 'صف ما تريد بناءه',
    describePlaceholder: 'مثال: موقع وكالة سيارات مع إدارة المخزون، أو متجر طعام للحيوانات الأليفة مع الطلب عبر الإنترنت...',
    yourName: 'اسمك',
    yourEmail: 'بريدك الإلكتروني',
    budget: 'ميزانيتك (دينار جزائري)',
    budgetRange: 'نطاق الميزانية: {min} - {max} دج',
    whatsapp: 'تواصل عبر واتساب',
    withinBudget: 'ضمن ميزانيتك',
    overBudget: 'فوق ميزانيتك',
    underBudget: 'أقل من ميزانيتك',
    budgetComparison: 'مقارنة الميزانية: ميزانيتك {min}-{max} دج مقابل المقدر {price} دج',
    getQuote: 'احصل على عرض سعر',
    back: 'رجوع',
    downloadPDF: 'تحميل PDF',
    newQuote: 'عرض سعر جديد',
    quoteGenerated: 'تم إنشاء العرض!',
    hereEstimatedCost: 'إليك التكلفة المقدرة لمشروعك',
    estimatedPrice: 'السعر المقدر',
    timeline: 'الجدول الزمني',
    projectBreakdown: 'تفاصيل المشروع',
    website: 'موقع ويب',
    mobileApp: 'تطبيق جوال',
    desktopApp: 'تطبيق سطح مكتب',
    api: 'واجهة برمجة',
    // Website types
    staticWebsite: 'موقع ثابت',
    staticWebsiteDesc: 'بسيط، سريع، بدون قاعدة بيانات',
    dynamicWebsite: 'موقع ديناميكي',
    dynamicWebsiteDesc: 'مدعوم بقاعدة بيانات، تفاعلي',
    ecommerce: 'تجارة إلكترونية',
    ecommerceDesc: 'متجر إلكتروني مع الدفع',
    // Design complexities
    simple: 'بسيط',
    simpleDesc: 'تخطيط أساسي، مكونات قياسية',
    medium: 'متوسط',
    mediumDesc: 'تصميم مخصص، رسوم متحركة',
    complex: 'معقد',
    complexDesc: 'واجهة مستخدم متقدمة، عناصر ثلاثية الأبعاد',
    // PDF labels
    pdfTitle: 'DevZoneDZ',
    pdfSubtitle: 'خدمات التطوير الاحترافية',
    pdfQuote: 'عرض المشروع',
    pdfClient: 'العميل:',
    pdfEmail: 'البريد الإلكتروني:',
    pdfService: 'الخدمة:',
    pdfProjectDesc: 'وصف المشروع:',
    pdfTimeline: 'الجدول الزمني المقدر:',
    pdfDetails: 'تفاصيل المشروع:',
    pdfContact: 'التواصل: imadedar98@gmail.com | +213 657 496 125',
    // Mobile features
    pushNotifications: 'إشعارات الدفع',
    offlineMode: 'وضع عدم الاتصال',
    gpsLocation: 'GPS/الموقع',
    cameraIntegration: 'تكامل الكاميرا',
    socialMediaIntegration: 'تكامل وسائل التواصل الاجتماعي',
    inAppPurchases: 'المشتريات داخل التطبيق',
    chatMessaging: 'الدردشة/المراسلة',
    analytics: 'التحليلات',
    userProfiles: 'ملفات المستخدمين',
    cloudSync: 'المزامنة السحابية',
    biometricAuth: 'المصادقة البيومترية',
    arFeatures: 'ميزات الواقع المعزز',
    voiceRecognition: 'التعرف على الصوت',
    videoStreaming: 'بث الفيديو',
    realTimeUpdates: 'التحديثات الفورية',
    // Desktop features
    autoUpdate: 'نظام التحديث التلقائي',
    cloudStorage: 'التخزين السحابي',
    multiUser: 'دعم المستخدمين المتعددين',
    dataExport: 'تصدير/استيراد البيانات',
    customThemes: 'السمات المخصصة',
    keyboardShortcuts: 'اختصارات لوحة المفاتيح',
    dragDrop: 'واجهة السحب والإفلات',
    fileManagement: 'إدارة الملفات',
    printSupport: 'دعم الطباعة',
    pluginSystem: 'نظام الإضافات',
    apiIntegration: 'تكامل API',
    realTimeSync: 'المزامنة الفورية',
    encryption: 'تشفير البيانات',
    // API features
    authentication: 'نظام المصادقة',
    documentation: 'توثيق API',
    rateLimiting: 'تقييد المعدل',
    caching: 'طبقة التخزين المؤقت',
    webhooks: 'دعم Webhooks',
    versioning: 'إصدارات API',
    monitoring: 'المراقبة والتحليلات',
    logging: 'التسجيل المتقدم',
    testing: 'الاختبار الآلي',
    graphql: 'دعم GraphQL',
    fileUpload: 'رفع/تخزين الملفات',
    emailIntegration: 'تكامل البريد الإلكتروني',
    smsIntegration: 'تكامل الرسائل النصية',
  },
  fr: {
    title: 'Obtenir un devis',
    subtitle: 'Parlez-nous de votre projet',
    whatLookingFor: 'Que recherchez-vous?',
    describeProject: 'Décrivez ce que vous voulez construire',
    describePlaceholder: 'ex: Un site de concession automobile avec gestion des stocks, ou un magasin d\'aliments pour animaux avec commande en ligne...',
    yourName: 'Votre nom',
    yourEmail: 'Votre email',
    budget: 'Votre budget (DZD)',
    budgetRange: 'Plage budgétaire: {min} - {max} DZD',
    whatsapp: 'Contacter via WhatsApp',
    withinBudget: 'Dans votre budget',
    overBudget: 'Au-dessus de votre budget',
    underBudget: 'En dessous de votre budget',
    budgetComparison: 'Comparaison budgétaire: Votre budget {min}-{max} DZD vs Estimé {price} DZD',
    getQuote: 'Obtenir un devis',
    back: 'Retour',
    downloadPDF: 'Télécharger PDF',
    newQuote: 'Nouveau devis',
    quoteGenerated: 'Devis généré!',
    hereEstimatedCost: 'Voici le coût estimé de votre projet',
    estimatedPrice: 'Prix estimé',
    timeline: 'Délai',
    projectBreakdown: 'Détails du projet',
    website: 'Site Web',
    mobileApp: 'Application Mobile',
    desktopApp: 'Application de Bureau',
    api: 'API',
    // Website types
    staticWebsite: 'Site Statique',
    staticWebsiteDesc: 'Simple, rapide, sans base de données',
    dynamicWebsite: 'Site Dynamique',
    dynamicWebsiteDesc: 'Avec base de données, interactif',
    ecommerce: 'E-commerce',
    ecommerceDesc: 'Boutique en ligne avec paiements',
    // Design complexities
    simple: 'Simple',
    simpleDesc: 'Mise en page de base, composants standard',
    medium: 'Moyen',
    mediumDesc: 'Design personnalisé, animations',
    complex: 'Complexe',
    complexDesc: 'UI/UX avancé, éléments 3D',
    // PDF labels
    pdfTitle: 'DevZoneDZ',
    pdfSubtitle: 'Services de Développement Professionnel',
    pdfQuote: 'Devis de Projet',
    pdfClient: 'Client:',
    pdfEmail: 'Email:',
    pdfService: 'Service:',
    pdfProjectDesc: 'Description du Projet:',
    pdfTimeline: 'Délai Estimé:',
    pdfDetails: 'Détails du Projet:',
    pdfContact: 'Contact: imadedar98@gmail.com | +213 657 496 125',
    // Mobile features
    pushNotifications: 'Notifications Push',
    offlineMode: 'Mode Hors Ligne',
    gpsLocation: 'GPS/Localisation',
    cameraIntegration: 'Intégration Caméra',
    socialMediaIntegration: 'Intégration Réseaux Sociaux',
    inAppPurchases: 'Achats In-App',
    chatMessaging: 'Chat/Messagerie',
    analytics: 'Analytiques',
    userProfiles: 'Profils Utilisateur',
    cloudSync: 'Synchronisation Cloud',
    biometricAuth: 'Authentification Biométrique',
    arFeatures: 'Fonctionnalités AR',
    voiceRecognition: 'Reconnaissance Vocale',
    videoStreaming: 'Streaming Vidéo',
    realTimeUpdates: 'Mises à jour en Temps Réel',
    // Desktop features
    autoUpdate: 'Système de Mise à Jour Automatique',
    cloudStorage: 'Stockage Cloud',
    multiUser: 'Support Multi-utilisateur',
    dataExport: 'Export/Import de Données',
    customThemes: 'Thèmes Personnalisés',
    keyboardShortcuts: 'Raccourcis Clavier',
    dragDrop: 'Interface Glisser-Déposer',
    fileManagement: 'Gestion de Fichiers',
    printSupport: 'Support Impression',
    pluginSystem: 'Système de Plugins',
    apiIntegration: 'Intégration API',
    realTimeSync: 'Synchronisation Temps Réel',
    encryption: 'Chiffrement des Données',
    // API features
    authentication: 'Système d\'Authentification',
    documentation: 'Documentation API',
    rateLimiting: 'Limitation de Taux',
    caching: 'Couche de Cache',
    webhooks: 'Support Webhooks',
    versioning: 'Versioning API',
    monitoring: 'Surveillance et Analytiques',
    logging: 'Journalisation Avancée',
    testing: 'Tests Automatisés',
    graphql: 'Support GraphQL',
    fileUpload: 'Téléchargement/Stockage de Fichiers',
    emailIntegration: 'Intégration Email',
    smsIntegration: 'Intégration SMS',
  },
};

export default function QuoteDemo() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    serviceType: '',
    clientDescription: '',
    name: '',
    email: '',
    language: 'en',
    budgetMin: 50000,
    budgetMax: 150000,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState('');

  const t = translations[formData.language as 'en' | 'ar' | 'fr'];

  const serviceOptions = [
    { id: 'website', label: t.website, icon: '🌐' },
    { id: 'mobileapp', label: t.mobileApp, icon: '📱' },
    { id: 'desktopapp', label: t.desktopApp, icon: '💻' },
    { id: 'api', label: t.api, icon: '⚡' },
  ];

  const websiteTypes = [
    { id: 'static', label: t.staticWebsite, description: t.staticWebsiteDesc },
    { id: 'dynamic', label: t.dynamicWebsite, description: t.dynamicWebsiteDesc },
    { id: 'ecommerce', label: t.ecommerce, description: t.ecommerceDesc },
  ];

  const designComplexities = [
    { id: 'simple', label: t.simple, description: t.simpleDesc },
    { id: 'medium', label: t.medium, description: t.mediumDesc },
    { id: 'complex', label: t.complex, description: t.complexDesc },
  ];

  const mobileFeatures = [
    { key: 'hasPushNotifications', label: t.pushNotifications },
    { key: 'hasMobileOfflineMode', label: t.offlineMode },
    { key: 'hasGPS', label: t.gpsLocation },
    { key: 'hasCamera', label: t.cameraIntegration },
    { key: 'hasSocialIntegration', label: t.socialMediaIntegration },
    { key: 'hasInAppPurchases', label: t.inAppPurchases },
    { key: 'hasChat', label: t.chatMessaging },
    { key: 'hasUserProfiles', label: t.userProfiles },
    { key: 'hasCloudSync', label: t.cloudSync },
    { key: 'hasBiometricAuth', label: t.biometricAuth },
    { key: 'hasAR', label: t.arFeatures },
    { key: 'hasVoiceRecognition', label: t.voiceRecognition },
    { key: 'hasVideoStreaming', label: t.videoStreaming },
    { key: 'hasAudioRecording', label: 'Audio Recording' },
    { key: 'hasFileSharing', label: 'File Sharing' },
  ];

  const desktopFeatures = [
    { key: 'hasAutoUpdate', label: t.autoUpdate },
    { key: 'hasCloudStorage', label: t.cloudStorage },
    { key: 'hasDesktopOfflineMode', label: 'Offline Mode' },
    { key: 'hasMultiUser', label: t.multiUser },
    { key: 'hasDataExport', label: t.dataExport },
    { key: 'hasCustomThemes', label: t.customThemes },
    { key: 'hasKeyboardShortcuts', label: t.keyboardShortcuts },
    { key: 'hasDragDrop', label: t.dragDrop },
    { key: 'hasFileManagement', label: t.fileManagement },
    { key: 'hasPrintSupport', label: t.printSupport },
    { key: 'hasPluginSystem', label: t.pluginSystem },
    { key: 'hasAPIIntegration', label: t.apiIntegration },
    { key: 'hasRealTimeSync', label: t.realTimeSync },
    { key: 'hasEncryption', label: t.encryption },
    { key: 'hasDatabase', label: 'Database' },
  ];

  const apiFeatures = [
    { key: 'hasAuthentication', label: t.authentication },
    { key: 'hasDocumentation', label: t.documentation },
    { key: 'hasRateLimiting', label: t.rateLimiting },
    { key: 'hasCaching', label: t.caching },
    { key: 'hasWebhooks', label: t.webhooks },
    { key: 'hasVersioning', label: t.versioning },
    { key: 'hasMonitoring', label: t.monitoring },
    { key: 'hasLogging', label: t.logging },
    { key: 'hasTesting', label: t.testing },
    { key: 'hasGraphQL', label: t.graphql },
    { key: 'hasRealTime', label: 'Real-time' },
    { key: 'hasFileUpload', label: t.fileUpload },
    { key: 'hasEmailIntegration', label: t.emailIntegration },
    { key: 'hasSMSIntegration', label: t.smsIntegration },
    { key: 'hasWebSocket', label: 'WebSocket' },
  ];

  const websiteFeatures = [
    { key: 'hasLogin', label: 'User Login System' },
    { key: 'hasDatabase', label: 'Database Integration' },
    { key: 'hasPayment', label: 'Payment Integration' },
    { key: 'hasBlog', label: 'Blog System' },
    { key: 'hasGallery', label: 'Image Gallery' },
    { key: 'hasContactForm', label: 'Contact Form' },
    { key: 'hasSearch', label: 'Search Functionality' },
    { key: 'hasMultiLanguage', label: 'Multi-language Support' },
    { key: 'hasAnalytics', label: 'Analytics Integration' },
    { key: 'hasSEO', label: 'SEO Optimization' },
    { key: 'hasSocialMedia', label: 'Social Media Integration' },
    { key: 'hasNewsletter', label: 'Newsletter System' },
    { key: 'hasBookingSystem', label: 'Booking System' },
    { key: 'hasLiveChat', label: 'Live Chat' },
    { key: 'hasFAQ', label: 'FAQ Section' },
  ];

  const getFeatures = () => {
    switch (formData.serviceType) {
      case 'website': return websiteFeatures;
      case 'mobileapp': return mobileFeatures;
      case 'desktopapp': return desktopFeatures;
      case 'api': return apiFeatures;
      default: return [];
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Use Vercel serverless function in production, local server in development
    const API_URL = import.meta.env.PROD 
      ? '/api/quote' 
      : import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001/api/quote`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to get quote');
      
      const data = await response.json();
      setResult(data);
      setStep(3);
    } catch (err) {
      setError('Failed to generate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!result) return;

    const doc = new jsPDF();
    const lang = formData.language;

    // Header
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text(t.pdfTitle, 20, 25);
    doc.setFontSize(12);
    doc.text(t.pdfSubtitle, 20, 35);

    // Quote Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(t.pdfQuote, 20, 60);

    doc.setFontSize(12);
    doc.text(`${t.pdfClient} ${formData.name}`, 20, 75);
    doc.text(`${t.pdfEmail} ${formData.email}`, 20, 85);
    doc.text(`${t.pdfService} ${serviceOptions.find(s => s.id === formData.serviceType)?.label}`, 20, 95);
    doc.text(`${t.pdfProjectDesc} ${formData.clientDescription}`, 20, 105);

    // Price
    doc.setFillColor(139, 92, 246);
    doc.rect(20, 115, 170, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(`${result.estimatedPrice.toLocaleString()} DZD`, 105, 135, { align: 'center' });

    // Timeline
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text(t.pdfTimeline, 20, 160);
    doc.setFontSize(12);
    doc.text(result.timeline, 20, 170);

    // Breakdown
    doc.setFontSize(14);
    doc.text(t.pdfDetails, 20, 190);
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(result.breakdown, 170);
    doc.text(lines, 20, 200);

    // Contact
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(t.pdfContact, 20, 280);
    doc.text('Chebli, Blida, Algeria', 20, 285);

    doc.save(`devzonedz-quote-${Date.now()}.pdf`);
  };

  const calculateBusinessMultiplier = (description: string): number => {
    const lowerDesc = description.toLowerCase();
    
    // High-value businesses
    if (lowerDesc.includes('car') || lowerDesc.includes('automotive') || lowerDesc.includes('dealership') ||
        lowerDesc.includes('real estate') || lowerDesc.includes('property') || lowerDesc.includes('hotel') ||
        lowerDesc.includes('restaurant chain') || lowerDesc.includes('franchise') || lowerDesc.includes('enterprise')) {
      return 2.0;
    }
    
    // Medium-value businesses
    if (lowerDesc.includes('shop') || lowerDesc.includes('store') || lowerDesc.includes('retail') ||
        lowerDesc.includes('clinic') || lowerDesc.includes('law firm') || lowerDesc.includes('agency')) {
      return 1.5;
    }
    
    // Standard businesses
    return 1.0;
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 w-8' : 'bg-white/20 w-2'
            }`}
          />
        ))}
      </div>

      {/* Language Selector */}
      <div className="flex justify-end gap-2">
        {(['en', 'ar', 'fr'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setFormData({ ...formData, language: lang })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              formData.language === lang
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
            }`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
        >
          {t.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-purple-200"
        >
          {t.subtitle}
        </motion.p>
      </div>

      {/* Client Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <label className="text-purple-300 text-sm font-medium block">{t.describeProject}</label>
        <textarea
          value={formData.clientDescription}
          onChange={(e) => setFormData({ ...formData, clientDescription: e.target.value })}
          className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:bg-white/10 resize-none transition-all"
          rows={4}
          placeholder={t.describePlaceholder}
        />
      </motion.div>

      {/* Budget Range */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <label className="text-purple-300 text-sm font-medium block">{t.budget}</label>
        <div className="bg-gradient-to-br from-white/5 to-white/10 border-2 border-white/10 rounded-2xl p-6 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div className="space-y-2">
              <label className="text-purple-300 text-xs font-medium block">Min (DZD)</label>
              <input
                type="number"
                value={formData.budgetMin}
                onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white text-center focus:outline-none focus:border-purple-500 transition-all"
                min="0"
                step="5000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-purple-300 text-xs font-medium block">Max (DZD)</label>
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white text-center focus:outline-none focus:border-purple-500 transition-all"
                min="0"
                step="5000"
              />
            </div>
          </div>
          <div className="text-center py-3 px-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
            <span className="text-purple-200 text-sm font-medium">
              {t.budgetRange.replace('{min}', formData.budgetMin.toLocaleString()).replace('{max}', formData.budgetMax.toLocaleString())}
            </span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-white text-center">{t.whatLookingFor}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {serviceOptions.map((service) => (
            <motion.button
              key={service.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setFormData({ ...formData, serviceType: service.id });
                setStep(2);
              }}
              className={`p-6 rounded-2xl border-2 transition-all backdrop-blur-sm ${
                formData.serviceType === service.id
                  ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                  : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
              }`}
            >
              <div className="text-5xl mb-3">{service.icon}</div>
              <div className="text-white font-semibold text-sm">{service.label}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 w-8' : 'bg-white/20 w-2'
            }`}
          />
        ))}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
      >
        {t.title}
      </motion.h2>
      
      <div className="space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <label className="text-purple-300 text-sm font-medium block">{t.yourName}</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
            placeholder="Enter your name"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-purple-300 text-sm font-medium block">{t.yourEmail}</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-6 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-purple-300/50 focus:outline-none focus:border-purple-500 focus:bg-white/10 transition-all"
            placeholder="Enter your email"
          />
        </motion.div>

        {formData.serviceType === 'website' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Website Type</label>
              <div className="grid grid-cols-1 gap-3">
                {websiteTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, websiteType: type.id as any })}
                    className={`p-5 rounded-xl border-2 text-left transition-all backdrop-blur-sm ${
                      formData.websiteType === type.id
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                        : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-semibold">{type.label}</div>
                    <div className="text-purple-300 text-sm">{type.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Number of Pages: {formData.pages || 1}</label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.pages || 1}
                onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Design Complexity</label>
              <div className="grid grid-cols-3 gap-3">
                {designComplexities.map((complexity) => (
                  <motion.button
                    key={complexity.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, designComplexity: complexity.id as any })}
                    className={`p-4 rounded-xl border-2 text-center transition-all backdrop-blur-sm ${
                      formData.designComplexity === complexity.id
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                        : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-semibold text-sm">{complexity.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {websiteFeatures.map((feature) => (
                  <motion.label
                    key={feature.key}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter((f: string) => f !== feature.key) });
                        }
                      }}
                      className="w-5 h-5 rounded accent-purple-500"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {formData.serviceType === 'mobileapp' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {['ios', 'android', 'both'].map((platform) => (
                  <motion.button
                    key={platform}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, platform: platform as any })}
                    className={`p-4 rounded-xl border-2 text-center transition-all backdrop-blur-sm capitalize ${
                      formData.platform === platform
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                        : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-semibold">{platform}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Number of Screens: {formData.screens || 1}</label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.screens || 1}
                onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {mobileFeatures.map((feature) => (
                  <motion.label
                    key={feature.key}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter((f: string) => f !== feature.key) });
                        }
                      }}
                      className="w-5 h-5 rounded accent-purple-500"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {formData.serviceType === 'desktopapp' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Operating System</label>
              <div className="grid grid-cols-2 gap-3">
                {['windows', 'mac', 'linux', 'cross-platform'].map((os) => (
                  <motion.button
                    key={os}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFormData({ ...formData, os: os as any })}
                    className={`p-4 rounded-xl border-2 text-center transition-all backdrop-blur-sm capitalize ${
                      formData.os === os
                        ? 'border-purple-500 bg-purple-500/20 shadow-lg shadow-purple-500/30'
                        : 'border-white/20 bg-white/5 hover:border-purple-500/50 hover:bg-white/10'
                    }`}
                  >
                    <div className="text-white font-semibold">{os}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {desktopFeatures.map((feature) => (
                  <motion.label
                    key={feature.key}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter((f: string) => f !== feature.key) });
                        }
                      }}
                      className="w-5 h-5 rounded accent-purple-500"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {formData.serviceType === 'api' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Number of Endpoints: {formData.endpoints || 1}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.endpoints || 1}
                onChange={(e) => setFormData({ ...formData, endpoints: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {apiFeatures.map((feature) => (
                  <motion.label
                    key={feature.key}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter((f: string) => f !== feature.key) });
                        }
                      }}
                      className="w-5 h-5 rounded accent-purple-500"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </motion.label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4 mt-8"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(1)}
          className="flex-1 px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
        >
          {t.back}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !formData.name || !formData.email}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/30"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.getQuote}
        </motion.button>
      </motion.div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all ${
              step >= s ? 'bg-purple-500 w-8' : 'bg-white/20 w-2'
            }`}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6 shadow-lg shadow-green-500/30" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">{t.quoteGenerated}</h2>
        <p className="text-purple-200 text-lg">{t.hereEstimatedCost}</p>
      </motion.div>

      {/* Budget Comparison */}
      {result?.budgetComparison && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`bg-gradient-to-br rounded-2xl p-6 border-2 backdrop-blur-sm ${
            result.budgetComparison.status === 'within_budget'
              ? 'from-green-600/20 to-emerald-600/20 border-green-500/50 shadow-lg shadow-green-500/20'
              : result.budgetComparison.status === 'over_budget'
              ? 'from-red-600/20 to-orange-600/20 border-red-500/50 shadow-lg shadow-red-500/20'
              : 'from-blue-600/20 to-cyan-600/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
          }`}
        >
          <div className="text-center">
            <div className="text-white text-lg font-semibold mb-2">
              {result.budgetComparison.status === 'within_budget' ? t.withinBudget :
               result.budgetComparison.status === 'over_budget' ? t.overBudget : t.underBudget}
            </div>
            <div className="text-purple-200 text-sm">
              {t.budgetComparison
                .replace('{min}', result.budgetComparison.min.toLocaleString())
                .replace('{max}', result.budgetComparison.max.toLocaleString())
                .replace('{price}', result?.estimatedPrice?.toLocaleString() || '0')}
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-2 border-white/20 rounded-2xl p-8 backdrop-blur-sm shadow-lg shadow-purple-500/20"
      >
        <div className="text-center">
          <div className="text-purple-300 text-sm font-medium mb-3">{t.estimatedPrice}</div>
          <div className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{result?.estimatedPrice?.toLocaleString() || '0'} DZD</div>
          <div className="text-purple-300 text-sm mb-1">{t.timeline}</div>
          <div className="text-white font-semibold text-lg">{result?.timeline || 'N/A'}</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 border-2 border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="text-purple-300 text-sm font-medium mb-3">{t.projectBreakdown}</div>
        <div className="text-white text-sm whitespace-pre-wrap leading-relaxed">{result?.breakdown}</div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generatePDF}
          className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30"
        >
          <Download className="w-5 h-5" />
          {t.downloadPDF}
        </motion.button>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://wa.me/213657496125"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl text-white font-semibold hover:from-green-500 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
        >
          <MessageCircle className="w-5 h-5" />
          {t.whatsapp}
        </motion.a>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setStep(1);
          setFormData({ serviceType: '', clientDescription: '', name: '', email: '', language: 'en', budgetMin: 50000, budgetMax: 150000 });
          setResult(null);
        }}
        className="w-full px-6 py-4 bg-white/10 border-2 border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
      >
        {t.newQuote}
      </motion.button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8 md:p-16 overflow-auto relative">
      <div className="max-w-4xl mx-auto pt-16">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep1()}
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep2()}
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep3()}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
