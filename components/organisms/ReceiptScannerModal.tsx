'use client';

import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { useFinanceStore } from '@/stores/useFinanceStore';
import { Modal } from '@/components/atoms/Modal';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Badge } from '@/components/atoms/Badge';
import { formatRupiah } from '@/utils/cn';
import { PurchasedItem } from '@/types/finance';
import { parseReceiptText } from '@/utils/receiptParser';
import { preprocessReceiptImage } from '@/utils/imageProcessor';
import {
  Scan,
  UploadCloud,
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  Plus,
  Trash2,
  ShoppingBag,
  RefreshCw,
  FileText,
  Copy,
  Check,
  RotateCw,
  SlidersHorizontal,
  Save,
  ShieldCheck,
  Languages,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';



export const ReceiptScannerModal: React.FC = () => {
  const { isScannerOpen, setScannerOpen, categories, addTransaction } = useFinanceStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [scanStep, setScanStep] = useState<'upload' | 'scanning' | 'verify'>('upload');
  const [scanStatusMessage, setScanStatusMessage] = useState<string>('Memulai mesin Tesseract.js...');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [showRawText, setShowRawText] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Settings & Filter Presets
  const [ocrLanguage, setOcrLanguage] = useState<'ind+eng' | 'eng'>('ind+eng');
  const [filterPreset, setFilterPreset] = useState<'enhanced' | 'binarized' | 'original'>('enhanced');
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [currentFile, setCurrentFile] = useState<File | string | null>(null);

  // Extracted Results State
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string>('');
  const [transactionDate, setTransactionDate] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [subtotalAmount, setSubtotalAmount] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [mathVerified, setMathVerified] = useState<boolean>(false);
  const [confidenceScore, setConfidenceScore] = useState<number>(90);
  const [selectedCategory, setSelectedCategory] = useState<string>('Belanja Bulanan');
  const [purchasedItems, setPurchasedItems] = useState<PurchasedItem[]>([]);
  const [rawText, setRawText] = useState<string>('');

  // Save state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Process image with Tesseract.js OCR engine
  const processImageOCR = async (fileOrUrl: File | string, angle: number = rotationAngle) => {
    try {
      setCurrentFile(fileOrUrl);
      setScanStep('scanning');
      setScanProgress(5);
      setScanStatusMessage('Melakukan Preprocessing Gambar (Grayscale, Kontras & Sharpening)...');

      // 1. High-Accuracy Canvas Preprocessing
      const preprocessOptions = {
        targetWidth: 1400,
        autoContrast: filterPreset !== 'original',
        sharpen: filterPreset !== 'original',
        grayscale: filterPreset !== 'original',
        binarize: filterPreset === 'binarized',
        rotation: angle,
      };

      const processedDataUrl = await preprocessReceiptImage(fileOrUrl, preprocessOptions);

      if (typeof fileOrUrl !== 'string') {
        setImagePreviewUrl(processedDataUrl);
      } else {
        setImagePreviewUrl(fileOrUrl);
      }

      setScanProgress(20);
      setScanStatusMessage(
        ocrLanguage === 'ind+eng'
          ? 'Menginisialisasi Model Bahasa (Indonesia + English)...'
          : 'Menginisialisasi Model Bahasa (English)...'
      );

      // 2. High-Accuracy Tesseract.js Recognition with Worker & PSM 6
      let extractedRawText = '';
      try {
        const langs = ocrLanguage === 'ind+eng' ? ['ind', 'eng'] : ['eng'];
        const worker = await Tesseract.createWorker(langs, undefined, {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round(25 + m.progress * 65);
              setScanProgress(pct);
              setScanStatusMessage(`Mengenali Karakter Struk (${Math.round(m.progress * 100)}%)...`);
            } else if (m.status === 'loading language traineddata') {
              setScanProgress(15);
              setScanStatusMessage('Memuat Kamus Bahasa Tesseract OCR...');
            } else if (m.status) {
              setScanStatusMessage(`Tesseract: ${m.status}...`);
            }
          },
        });

        // Set PSM 6 (SINGLE_BLOCK) & preserve spaces between columns (Items ... Qty ... Price)
        await worker.setParameters({
          tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
          preserve_interword_spaces: '1',
        });

        const result = await worker.recognize(processedDataUrl);
        extractedRawText = result.data.text;
        await worker.terminate();
      } catch (workerError) {
        console.warn('Worker with ind+eng failed, falling back to standard recognize:', workerError);
        setScanStatusMessage('Menjalankan OCR fallback mode...');
        const fallbackResult = await Tesseract.recognize(processedDataUrl, 'eng');
        extractedRawText = fallbackResult.data.text;
      }

      setScanProgress(92);
      setScanStatusMessage('Menganalisis Pola Teks & Verifikasi Matematis...');

      // 3. Receipt Heuristic Parsing & Mathematical Self-Correction
      const parsedData = parseReceiptText(extractedRawText);

      setMerchantName(parsedData.merchantName);
      setTransactionDate(parsedData.date);
      setTotalAmount(parsedData.totalAmount);
      setSubtotalAmount(parsedData.subtotalAmount || 0);
      setTaxAmount(parsedData.taxAmount || 0);
      setMathVerified(!!parsedData.mathVerified);
      setConfidenceScore(parsedData.confidenceScore || 90);
      setSelectedCategory(parsedData.suggestedCategory);
      setPurchasedItems(parsedData.purchasedItems);
      setRawText(extractedRawText);

      setScanProgress(100);
      setScanStep('verify');
    } catch (error) {
      console.error('OCR Scanning error:', error);
      setScanStatusMessage('Gagal membaca teks struk. Menampilkan editor manual...');
      setScanStep('verify');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processImageOCR(files[0], rotationAngle);
    }
  };

  const handleRotate = () => {
    const nextAngle = (rotationAngle + 90) % 360;
    setRotationAngle(nextAngle);
    if (currentFile) {
      processImageOCR(currentFile, nextAngle);
    }
  };



  const handleCopyRawText = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddItemRow = () => {
    setPurchasedItems([
      ...purchasedItems,
      { id: `item-${Date.now()}`, name: 'Item Baru', qty: 1, price: 10000 },
    ]);
  };

  const handleRemoveItemRow = (id: string) => {
    setPurchasedItems(purchasedItems.filter((i) => i.id !== id));
  };

  const handleSaveTransaction = () => {
    setIsSaving(true);
    addTransaction({
      title: merchantName ? `${merchantName} (OCR)` : 'Belanja Struk OCR',
      merchant: merchantName || 'Merchant',
      amount: totalAmount,
      category: selectedCategory,
      type: 'expense',
      date: transactionDate || new Date().toISOString().split('T')[0],
      items: purchasedItems,
      notes: `Hasil Scan Smart OCR (${confidenceScore}% Akurasi${mathVerified ? ' • Terverifikasi Matematis' : ''})`,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setIsSaving(false);
      setScanStep('upload');
      setScannerOpen(false);
    }, 1000);
  };

  return (
    <Modal
      isOpen={isScannerOpen}
      onClose={() => {
        setScanStep('upload');
        setScannerOpen(false);
      }}
      title="Smart Receipt Scanner (High-Accuracy Client OCR)"
      subtitle="Teknologi OCR Tesseract.js dengan Preprocessing Canvas & Validasi Matematis Otomatis"
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Hidden File & Camera Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={cameraInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          capture="environment"
          className="hidden"
        />

        {/* Step 1: Upload / Camera Capture / Preset Configuration */}
        {scanStep === 'upload' && (
          <div className="space-y-5">
            {/* OCR Engine Controls & Filter Presets Bar */}
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-emerald-500" />
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">Pengaturan OCR:</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Language Mode Selector */}
                <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
                  <Languages size={12} className="text-zinc-400 ml-1.5 mr-1" />
                  <button
                    onClick={() => setOcrLanguage('ind+eng')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      ocrLanguage === 'ind+eng'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    ID + EN (Optimal)
                  </button>
                  <button
                    onClick={() => setOcrLanguage('eng')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      ocrLanguage === 'eng'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    EN Saja
                  </button>
                </div>

                {/* Preprocessing Filter Preset */}
                <div className="flex items-center bg-white dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-700">
                  <button
                    onClick={() => setFilterPreset('enhanced')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      filterPreset === 'enhanced'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Otomatis tingkatkan kontras & ketajaman tinta termal"
                  >
                    Auto-Enhance
                  </button>
                  <button
                    onClick={() => setFilterPreset('binarized')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      filterPreset === 'binarized'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                    title="Binarisasi adaptif untuk menghilangkan bayangan tangan / hp"
                  >
                    Anti-Bayangan
                  </button>
                  <button
                    onClick={() => setFilterPreset('original')}
                    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors ${
                      filterPreset === 'original'
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    }`}
                  >
                    Asli
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* File Upload Zone - Main upload for Web & Mobile */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl p-7 text-center space-y-3 hover:border-emerald-500 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[170px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Upload Foto Struk</h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Drag & drop atau klik untuk memilih file struk (JPG, PNG, WEBP)
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    Diproses privat di perangkat Anda • Privasi terjamin
                  </p>
                </div>
              </div>

              {/* Camera Capture Zone - Visible ONLY on Mobile devices, removed in web mode */}
              <div
                onClick={() => cameraInputRef.current?.click()}
                className="md:hidden border-2 border-dashed border-teal-500/40 dark:border-teal-500/30 bg-teal-50/40 dark:bg-teal-950/20 rounded-2xl p-4 text-center space-y-2 hover:border-teal-500 transition-colors cursor-pointer group flex flex-col items-center justify-center min-h-[120px]"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={22} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Ambil Foto Kamera (Mobile)</h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">Jepret langsung struk fisik dengan kamera HP</p>
                </div>
              </div>
            </div>

            {/* AI Accuracy Disclaimer Notice */}
            <div className="p-3.5 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs">
              <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={16} />
              <div className="space-y-1">
                <p className="font-semibold text-amber-900 dark:text-amber-200">
                  Perhatian: Hasil Pemindaian Struk Tidak 100% Akurat
                </p>
                <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  Hasil ekstraksi teks OCR cerdas menggunakan pemrosesan gambar dan algoritma AI yang <strong>tidak selalu 100% akurat</strong>. Kualitas cetak tinta kasir, lipatan kertas, dan pencahayaan foto dapat mempengaruhi hasil pembacaan. Anda selalu dapat meninjau dan mengoreksi rincian data sebelum menyimpannya ke pencatatan transaksi.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* Step 2: Live Scanning Progress */}
        {scanStep === 'scanning' && (
          <div className="py-10 text-center space-y-6">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
              <Scan size={36} className="text-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Memproses Ekstraksi OCR Cerdas
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {scanStatusMessage}
              </p>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2.5 rounded-full overflow-hidden max-w-md mx-auto">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Step 3: OCR Preview & Extracted Fields Display */}
        {scanStep === 'verify' && (
          <div className="space-y-5">
            {/* Top Accuracy & Verification Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Akurasi Ekstraksi: {confidenceScore}%
                  </span>
                  {mathVerified && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                      ✓ Terverifikasi Matematis (Subtotal + Pajak = Total)
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {imagePreviewUrl && (
                  <button
                    onClick={handleRotate}
                    className="text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800"
                    title="Putar gambar 90 derajat jika foto terbalik / miring"
                  >
                    <RotateCw size={12} /> Putar 90°
                  </button>
                )}
                <button
                  onClick={() => setShowRawText(!showRawText)}
                  className="text-zinc-500 dark:text-zinc-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Eye size={13} /> {showRawText ? 'Sembunyikan Raw' : 'Lihat Teks OCR'}
                </button>
              </div>
            </div>

            {/* AI OCR Accuracy Notice */}
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
              <AlertCircle size={15} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                <span className="font-semibold">Catatan Penting:</span> Hasil pemindaian OCR cerdas <strong>tidak 100% akurat</strong>. Mohon verifikasi kembali nama merchant, tanggal transaksi, daftar item, serta total nominal sebelum menyimpan.
              </p>
            </div>

            {/* Optional Image & Raw OCR Text preview tab */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imagePreviewUrl && (
                <div className="p-2 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center justify-center max-h-48 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreviewUrl} alt="Preview Struk" className="max-h-44 object-contain rounded-lg" />
                </div>
              )}

              {showRawText && (
                <div className={`${imagePreviewUrl ? 'md:col-span-2' : 'md:col-span-3'} relative`}>
                  <div className="flex items-center justify-between bg-zinc-850 px-3 py-1.5 rounded-t-xl text-[11px] text-zinc-400 border-b border-zinc-800">
                    <span>Raw OCR Text (Tesseract.js Engine Output)</span>
                    <button
                      onClick={handleCopyRawText}
                      className="flex items-center gap-1 hover:text-white transition-colors"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      {copied ? 'Tercopy' : 'Copy Text'}
                    </button>
                  </div>
                  <pre className="p-3 bg-zinc-900 text-emerald-400 font-mono text-[11px] rounded-b-xl overflow-x-auto border border-zinc-800 max-h-40">
                    {rawText || 'Tidak ada teks yang dapat dibaca.'}
                  </pre>
                </div>
              )}
            </div>

            {/* Extracted Transaction Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Nama Merchant Struk</label>
                <Input
                  value={merchantName}
                  onChange={(e) => setMerchantName(e.target.value)}
                  placeholder="Nama Toko / Merchant"
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Tanggal Struk</label>
                <Input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Total Belanja Diekstrak (IDR)</label>
                <Input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                />
                {subtotalAmount > 0 && (
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Subtotal: {formatRupiah(subtotalAmount)} {taxAmount > 0 ? `• Pajak: ${formatRupiah(taxAmount)}` : ''}
                  </p>
                )}
              </div>

              <div>
                <label className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1 block">Rekomendasi Kategori</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Extracted Line Items */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-semibold text-xs text-zinc-800 dark:text-zinc-200">
                  Detail Item Rincian Belanja ({purchasedItems.length})
                </h5>
                <button
                  onClick={handleAddItemRow}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Tambah Item
                </button>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden max-h-44 overflow-y-auto">
                {purchasedItems.length === 0 ? (
                  <div className="p-4 text-center text-zinc-400 text-xs">
                    Tidak ada rincian item individual yang terdeteksi.
                  </div>
                ) : (
                  purchasedItems.map((item, i) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => {
                          const updated = [...purchasedItems];
                          updated[i].name = e.target.value;
                          setPurchasedItems(updated);
                        }}
                        className="bg-transparent text-xs text-zinc-900 dark:text-zinc-100 font-medium focus:outline-none w-full"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => {
                            const updated = [...purchasedItems];
                            updated[i].qty = Number(e.target.value);
                            setPurchasedItems(updated);
                          }}
                          className="w-10 bg-zinc-100 dark:bg-zinc-800 text-center rounded text-xs py-0.5"
                        />
                        <span className="text-zinc-400">x</span>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => {
                            const updated = [...purchasedItems];
                            updated[i].price = Number(e.target.value);
                            setPurchasedItems(updated);
                          }}
                          className="w-20 bg-zinc-100 dark:bg-zinc-800 text-right rounded text-xs py-0.5"
                        />
                        <button
                          onClick={() => handleRemoveItemRow(item.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                variant="outline"
                size="md"
                icon={<RefreshCw size={14} />}
                onClick={() => setScanStep('upload')}
              >
                Scan Gambar Lain
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setScanStep('upload');
                    setScannerOpen(false);
                  }}
                >
                  Tutup Preview
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  icon={savedSuccess ? <Check size={14} /> : <Save size={14} />}
                  onClick={handleSaveTransaction}
                  disabled={isSaving || totalAmount <= 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {savedSuccess ? 'Tersimpan!' : isSaving ? 'Menyimpan...' : 'Simpan sebagai Transaksi'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
