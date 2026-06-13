import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Loader2, CheckCircle2 } from 'lucide-react';
import jsPDF from 'jspdf';

interface FormData {
  serviceType: string;
  name: string;
  email: string;
  clientDescription?: string;
  budgetMin?: number;
  budgetMax?: number;
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
  timeline: string;
  breakdown: string;
}

export default function QuoteForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    serviceType: '',
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState('');

  const serviceOptions = [
    { id: 'website', label: 'Website', icon: '🌐' },
    { id: 'mobileapp', label: 'Mobile App', icon: '📱' },
    { id: 'desktopapp', label: 'Desktop App', icon: '💻' },
    { id: 'api', label: 'API', icon: '⚡' },
  ];

  const websiteTypes = [
    { id: 'static', label: 'Static Website', description: 'Simple, fast, no database' },
    { id: 'dynamic', label: 'Dynamic Website', description: 'Database-driven, interactive' },
    { id: 'ecommerce', label: 'E-commerce', description: 'Online store with payments' },
  ];

  const designComplexities = [
    { id: 'simple', label: 'Simple', description: 'Basic layout, standard components' },
    { id: 'medium', label: 'Medium', description: 'Custom design, animations' },
    { id: 'complex', label: 'Complex', description: 'Advanced UI/UX, 3D elements' },
  ];

  const mobileFeatures = [
    { key: 'hasPushNotifications', label: 'Push Notifications' },
    { key: 'hasMobileOfflineMode', label: 'Offline Mode' },
    { key: 'hasGPS', label: 'GPS/Location' },
    { key: 'hasCamera', label: 'Camera Integration' },
    { key: 'hasSocialIntegration', label: 'Social Media Integration' },
    { key: 'hasInAppPurchases', label: 'In-app Purchases' },
    { key: 'hasChat', label: 'Chat/Messaging' },
    { key: 'hasUserProfiles', label: 'User Profiles' },
    { key: 'hasCloudSync', label: 'Cloud Sync' },
    { key: 'hasBiometricAuth', label: 'Biometric Auth' },
    { key: 'hasAR', label: 'AR Features' },
    { key: 'hasVoiceRecognition', label: 'Voice Recognition' },
    { key: 'hasVideoStreaming', label: 'Video Streaming' },
    { key: 'hasAudioRecording', label: 'Audio Recording' },
    { key: 'hasFileSharing', label: 'File Sharing' },
  ];

  const desktopFeatures = [
    { key: 'hasAutoUpdate', label: 'Auto-update System' },
    { key: 'hasCloudStorage', label: 'Cloud Storage' },
    { key: 'hasDesktopOfflineMode', label: 'Offline Mode' },
    { key: 'hasMultiUser', label: 'Multi-user Support' },
    { key: 'hasDataExport', label: 'Data Export' },
    { key: 'hasCustomThemes', label: 'Custom Themes' },
    { key: 'hasKeyboardShortcuts', label: 'Keyboard Shortcuts' },
    { key: 'hasDragDrop', label: 'Drag & Drop' },
    { key: 'hasFileManagement', label: 'File Management' },
    { key: 'hasPrintSupport', label: 'Print Support' },
    { key: 'hasPluginSystem', label: 'Plugin System' },
    { key: 'hasAPIIntegration', label: 'API Integration' },
    { key: 'hasRealTimeSync', label: 'Real-time Sync' },
    { key: 'hasEncryption', label: 'Encryption' },
    { key: 'hasDatabase', label: 'Database' },
  ];

  const apiFeatures = [
    { key: 'hasAuthentication', label: 'Authentication' },
    { key: 'hasDocumentation', label: 'Documentation' },
    { key: 'hasRateLimiting', label: 'Rate Limiting' },
    { key: 'hasCaching', label: 'Caching' },
    { key: 'hasWebhooks', label: 'Webhooks' },
    { key: 'hasVersioning', label: 'Versioning' },
    { key: 'hasMonitoring', label: 'Monitoring' },
    { key: 'hasLogging', label: 'Logging' },
    { key: 'hasTesting', label: 'Testing' },
    { key: 'hasGraphQL', label: 'GraphQL' },
    { key: 'hasRealTime', label: 'Real-time' },
    { key: 'hasFileUpload', label: 'File Upload' },
    { key: 'hasEmailIntegration', label: 'Email Integration' },
    { key: 'hasSMSIntegration', label: 'SMS Integration' },
    { key: 'hasWebSocket', label: 'WebSocket' },
  ];

  const websiteFeatures = [
    { key: 'hasLogin', label: 'User Login' },
    { key: 'hasDatabase', label: 'Database' },
    { key: 'hasPayment', label: 'Payment Integration' },
    { key: 'hasBlog', label: 'Blog' },
    { key: 'hasGallery', label: 'Gallery' },
    { key: 'hasContactForm', label: 'Contact Form' },
    { key: 'hasSearch', label: 'Search' },
    { key: 'hasMultiLanguage', label: 'Multi-language' },
    { key: 'hasAnalytics', label: 'Analytics' },
    { key: 'hasSEO', label: 'SEO Optimization' },
    { key: 'hasSocialMedia', label: 'Social Media Integration' },
    { key: 'hasNewsletter', label: 'Newsletter' },
    { key: 'hasBookingSystem', label: 'Booking System' },
    { key: 'hasLiveChat', label: 'Live Chat' },
    { key: 'hasDarkMode', label: 'Dark Mode' },
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
    
    // Helper function to clean text from Arabic characters for PDF
    const cleanText = (text: string) => {
      // Remove Arabic characters and keep only Latin characters, numbers, and basic punctuation
      return text.replace(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g, '');
    };
    
    // Header
    doc.setFillColor(139, 92, 246);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.text('DevZoneDZ', 20, 25);
    doc.setFontSize(12);
    doc.text('Professional Development Services', 20, 35);

    // Quote Details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text('Project Quote', 20, 60);

    doc.setFontSize(12);
    doc.text(`Client: ${formData.name}`, 20, 75);
    doc.text(`Email: ${formData.email}`, 20, 85);
    doc.text(`Service: ${serviceOptions.find(s => s.id === formData.serviceType)?.label}`, 20, 95);

    // Price
    doc.setFillColor(139, 92, 246);
    doc.rect(20, 110, 170, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(`${result.estimatedPrice.toLocaleString()} DZD`, 105, 130, { align: 'center' });

    // Timeline
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text('Estimated Timeline:', 20, 155);
    doc.setFontSize(12);
    // Clean timeline text
    const cleanedTimeline = cleanText(result.timeline);
    doc.text(cleanedTimeline || result.timeline.replace(/[^\x00-\x7F]/g, ''), 20, 165);

    // Breakdown
    doc.setFontSize(14);
    doc.text('Project Details:', 20, 185);
    doc.setFontSize(10);
    // Clean breakdown text
    const cleanedBreakdown = cleanText(result.breakdown);
    const breakdownText = cleanedBreakdown || result.breakdown.replace(/[^\x00-\x7F]/g, '');
    const lines = doc.splitTextToSize(breakdownText, 170);
    doc.text(lines, 20, 195);

    // Contact
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Contact: imadedar98@gmail.com | +213 657 496 125', 20, 280);
    doc.text('Chebli, Blida, Algeria', 20, 285);

    doc.save(`devzonedz-quote-${Date.now()}.pdf`);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Select Service Type</h2>
      <div className="grid grid-cols-2 gap-4">
        {serviceOptions.map((service) => (
          <motion.button
            key={service.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setFormData({ ...formData, serviceType: service.id });
              setStep(2);
            }}
            className={`p-6 rounded-2xl border-2 transition-all ${
              formData.serviceType === service.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-white/20 bg-white/10 hover:border-purple-500/50'
            }`}
          >
            <div className="text-4xl mb-2">{service.icon}</div>
            <div className="text-white font-semibold">{service.label}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white mb-6">Project Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-purple-300 text-sm mb-2 block">Your Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
            placeholder="Enter your name"
          />
        </div>
        
        <div>
          <label className="text-purple-300 text-sm mb-2 block">Email Address</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="text-purple-300 text-sm mb-2 block">Describe Your Project</label>
          <textarea
            value={formData.clientDescription}
            onChange={(e) => setFormData({ ...formData, clientDescription: e.target.value })}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
            placeholder="Describe what you want to build..."
            rows={3}
          />
        </div>

        <div>
          <label className="text-purple-300 text-sm mb-2 block">Budget Range (DZD): {formData.budgetMin?.toLocaleString() || 0} - {formData.budgetMax?.toLocaleString() || 0}</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={formData.budgetMin || ''}
              onChange={(e) => setFormData({ ...formData, budgetMin: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="Min budget"
            />
            <input
              type="number"
              value={formData.budgetMax || ''}
              onChange={(e) => setFormData({ ...formData, budgetMax: parseInt(e.target.value) || undefined })}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-purple-500"
              placeholder="Max budget"
            />
          </div>
        </div>

        {formData.serviceType === 'website' && (
          <>
            <div>
              <label className="text-purple-300 text-sm mb-2 block">Website Type</label>
              <div className="grid grid-cols-1 gap-3">
                {websiteTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({ ...formData, websiteType: type.id as any })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.websiteType === type.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-white font-semibold">{type.label}</div>
                    <div className="text-purple-300 text-sm">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-purple-300 text-sm mb-2 block">Number of Pages: {formData.pages || 1}</label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.pages || 1}
                onChange={(e) => setFormData({ ...formData, pages: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-purple-300 text-sm mb-2 block">Design Complexity</label>
              <div className="grid grid-cols-3 gap-3">
                {designComplexities.map((complexity) => (
                  <button
                    key={complexity.id}
                    onClick={() => setFormData({ ...formData, designComplexity: complexity.id as any })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.designComplexity === complexity.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-white font-semibold text-sm">{complexity.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {websiteFeatures.map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter(f => f !== feature.key) });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {formData.serviceType === 'mobileapp' && (
          <>
            <div>
              <label className="text-purple-300 text-sm mb-2 block">Platform</label>
              <div className="grid grid-cols-3 gap-3">
                {['ios', 'android', 'both'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setFormData({ ...formData, platform: platform as any })}
                    className={`p-3 rounded-xl border-2 text-center transition-all capitalize ${
                      formData.platform === platform
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-white font-semibold">{platform}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-purple-300 text-sm mb-2 block">Number of Screens: {formData.screens || 1}</label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.screens || 1}
                onChange={(e) => setFormData({ ...formData, screens: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {mobileFeatures.map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter(f => f !== feature.key) });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {formData.serviceType === 'desktopapp' && (
          <>
            <div>
              <label className="text-purple-300 text-sm mb-2 block">Operating System</label>
              <div className="grid grid-cols-2 gap-3">
                {['windows', 'mac', 'linux', 'cross-platform'].map((os) => (
                  <button
                    key={os}
                    onClick={() => setFormData({ ...formData, os: os as any })}
                    className={`p-3 rounded-xl border-2 text-center transition-all capitalize ${
                      formData.os === os
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/20 bg-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <div className="text-white font-semibold">{os}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {desktopFeatures.map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter(f => f !== feature.key) });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}

        {formData.serviceType === 'api' && (
          <>
            <div>
              <label className="text-purple-300 text-sm mb-2 block">Number of Endpoints: {formData.endpoints || 1}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={formData.endpoints || 1}
                onChange={(e) => setFormData({ ...formData, endpoints: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <label className="text-purple-300 text-sm font-medium block">Features</label>
              <div className="grid grid-cols-2 gap-3">
                {apiFeatures.map((feature) => (
                  <label key={feature.key} className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10">
                    <input
                      type="checkbox"
                      checked={formData.features?.includes(feature.key)}
                      onChange={(e) => {
                        const features = formData.features || [];
                        if (e.target.checked) {
                          setFormData({ ...formData, features: [...features, feature.key] });
                        } else {
                          setFormData({ ...formData, features: features.filter(f => f !== feature.key) });
                        }
                      }}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-white text-sm">{feature.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(1)}
          className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
        >
          Back
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
          disabled={loading || !formData.name || !formData.email}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Get Quote'}
        </motion.button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Quote Generated!</h2>
        <p className="text-purple-300">Here's your estimated project cost</p>
      </div>

      <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/20 rounded-2xl p-6">
        <div className="text-center">
          <div className="text-purple-300 text-sm mb-2">Estimated Price</div>
          <div className="text-4xl font-bold text-white mb-4">{result?.estimatedPrice.toLocaleString()} DZD</div>
          <div className="text-purple-300 text-sm mb-1">Timeline</div>
          <div className="text-white font-semibold">{result?.timeline}</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="text-purple-300 text-sm mb-2">Project Breakdown</div>
        <div className="text-white text-sm whitespace-pre-wrap">{result?.breakdown}</div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={generatePDF}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download PDF
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setStep(1);
            setFormData({ serviceType: '', name: '', email: '' });
            setResult(null);
          }}
          className="flex-1 px-6 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all"
        >
          New Quote
        </motion.button>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 border border-white/20 rounded-3xl p-6 md:p-10 w-full max-w-2xl max-h-[90vh] overflow-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-purple-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
            {error}
          </div>
        )}

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
      </motion.div>
    </motion.div>
  );
}
