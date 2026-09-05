import { PurchasedItem, ReceiptScanResult } from '@/types/finance';

/**
 * Clean OCR numeric text string converting currency prefixes, separators,
 * common letter-to-digit misreads, and stripping trailing decimal zeros (,00 / .00).
 */
export function cleanOcrNumber(rawStr: string): number {
  if (!rawStr) return 0;

  // Trim and remove currency labels
  let str = rawStr
    .replace(/^(?:RP|IDR|USD|SGD|EUR|RM)\.?\s*/i, '')
    .replace(/^(?:TOTAL|SUBTOTAL|TAX|CASH|TUNAI|KEMBALI)[:\s=]*/i, '')
    .trim();

  // Strip trailing decimal cents like ,00 or .00 (e.g. "245.000,00" -> "245.000")
  str = str.replace(/[,.]00(?:\s*[:;])?$/, '');

  // If ends with OCR artifact punctuation like ':' or ';' (e.g. "131,47:"), strip it
  str = str.replace(/[:;|\s]+$/, '');

  // Character substitution for common OCR font confusions in numeric contexts
  let cleaned = str
    .replace(/[oO]/g, '0')
    .replace(/[iIl|!]/g, '1')
    .replace(/[zZ]/g, '2')
    .replace(/[$sS]/g, '5')
    .replace(/[bB]/g, '8')
    .replace(/[gq]/g, '9');

  // Remove non-digits
  cleaned = cleaned.replace(/[^0-9]/g, '');
  const val = parseInt(cleaned, 10);
  return isNaN(val) ? 0 : val;
}

/**
 * Clean OCR item name strings dynamically by removing non-alphanumeric noise prefixes
 * and normalizing punctuation.
 */
export function cleanItemName(name: string): string {
  if (!name) return '';

  let cleaned = name
    // Strip leading non-alphanumeric noise symbols (~, —, ©, *, #, :, |, &, +, -, =, », ·)
    .replace(/^[^a-zA-Z0-9]+/, '')
    // Strip stray 1-2 char OCR prefix noise (e.g. "IN ", "BN ", "a ", "ou ", "IO ")
    .replace(/^[0-9A-Za-z]{1,2}\s+/, '')
    // Replace non-standard characters with spaces
    .replace(/[^a-zA-Z0-9\s.,&/'()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Fix common Indonesian word OCR typos on thermal receipts
  cleaned = cleaned
    .replace(/^Cum\b/i, 'Cumi')
    .replace(/^Cali\s+hanghung\b/i, 'Cah Kangkung')
    .replace(/^Cah\s+hanghung\b/i, 'Cah Kangkung')
    .replace(/\bGur\s*ih\b/i, 'Gurih');

  return cleaned;
}

/**
 * Month name lookup dictionary for date parsing (both Indonesian and English)
 */
const MONTH_MAP: Record<string, string> = {
  jan: '01', januari: '01', january: '01',
  feb: '02', februari: '02', february: '02',
  mar: '03', maret: '03', march: '03',
  apr: '04', april: '04',
  mei: '05', may: '05',
  jun: '06', juni: '06', june: '06',
  jul: '07', juli: '07', july: '07',
  agu: '08', agust: '08', agustus: '08', aug: '08', august: '08',
  sep: '09', september: '09',
  okt: '10', oktober: '10', oct: '10', october: '10',
  nov: '11', november: '11',
  des: '12', desember: '12', dec: '12', december: '12',
};

/**
 * Dynamic date parser handling Indonesian and International date formats on receipts
 */
export function parseReceiptDate(lines: string[]): string {
  const fallback = new Date().toISOString().split('T')[0];

  for (const line of lines) {
    // Format: DD-MM-YYYY or DD/MM/YYYY or YYYY-MM-DD or YYYY/MM/DD
    const numericMatch = line.match(
      /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})|(\d{4})[/-](\d{1,2})[/-](\d{1,2})/
    );
    if (numericMatch) {
      if (numericMatch[1] && numericMatch[2] && numericMatch[3]) {
        let day = numericMatch[1].padStart(2, '0');
        let month = numericMatch[2].padStart(2, '0');
        let year = numericMatch[3];
        if (year.length === 2) year = '20' + year;
        // Check if day/month might be inverted (e.g. if month > 12)
        if (parseInt(month, 10) > 12 && parseInt(day, 10) <= 12) {
          const tmp = day;
          day = month;
          month = tmp;
        }
        return `${year}-${month}-${day}`;
      } else if (numericMatch[4] && numericMatch[5] && numericMatch[6]) {
        const year = numericMatch[4];
        const month = numericMatch[5].padStart(2, '0');
        const day = numericMatch[6].padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }

    // Format with month name: e.g. "SEP 02 2026", "02 SEP 2026", "24 Mei 2023"
    const textDateMatch = line.match(
      /(?:(?:\b(\d{1,2})\s+([a-zA-Z]{3,9})\b)|(?:\b([a-zA-Z]{3,9})\s+(\d{1,2})\b))(?:\s*,?\s*(\d{2,4}))?/i
    );
    if (textDateMatch) {
      const day = (textDateMatch[1] || textDateMatch[4] || '1').padStart(2, '0');
      const rawMonth = (textDateMatch[2] || textDateMatch[3] || '').toLowerCase();
      let year = textDateMatch[5] || new Date().getFullYear().toString();
      if (year.length === 2) year = '20' + year;

      const monthKey = Object.keys(MONTH_MAP).find((m) => rawMonth.startsWith(m));
      if (monthKey) {
        return `${year}-${MONTH_MAP[monthKey]}-${day}`;
      }
    }
  }

  return fallback;
}

/**
 * Detect merchant name from receipt header lines, filtering POS software vendor headers
 * and address/tax noise lines.
 */
export function parseMerchantName(lines: string[]): string {
  const isPosSoftware = (str: string) =>
    /^(?:beepos|moka|pawoon|olsera|majoo|qasir|esb|gobiz|solopos|kasir pintar)\b/i.test(str.trim());

  const isHeaderNoise = (str: string) =>
    /(tanggal|date|waktu|time|kasir|cashier|no trx|invoice|bill|member|channel|dine in|take away|telp|phone|fax|alamat|jl\.|jalan|ruko|surabaya|jakarta|bandung|npwp|nib|\d{4}|\d{2}[/-]\d{2})/i.test(
      str
    );

  let candidate = '';
  let seenPosVendor = false;

  for (let i = 0; i < Math.min(8, lines.length); i++) {
    const rawLine = lines[i];
    const cleaned = cleanItemName(rawLine);

    if (cleaned.length < 2) continue;

    if (isPosSoftware(cleaned)) {
      seenPosVendor = true;
      continue;
    }

    if (!isHeaderNoise(cleaned) && cleaned.length >= 3) {
      // If we previously encountered POS software logo (e.g. BEEPOS), the immediate next valid line is the restaurant/store!
      if (seenPosVendor) {
        return cleaned;
      }
      if (!candidate) {
        candidate = cleaned;
      }
    }
  }

  return candidate || cleanItemName(lines[0]) || 'Toko / Merchant';
}

/**
 * Intelligent receipt parser with mathematical self-correction and multi-format line item detection.
 */
export function parseReceiptText(rawText: string): ReceiptScanResult {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return {
      merchantName: 'Toko / Merchant',
      date: new Date().toISOString().split('T')[0],
      totalAmount: 0,
      purchasedItems: [],
      suggestedCategory: 'Belanja Bulanan',
      rawOcrText: rawText,
      confidenceScore: 0,
    };
  }

  // 1. Merchant & Date Extraction
  const merchantName = parseMerchantName(lines);
  const transactionDate = parseReceiptDate(lines);

  // Helper classification functions
  const isSummaryLine = (str: string) =>
    /(?:subtotal|sub\s*total|pajak|tax|ppn|pb1|pb\s*1|service|svc|biaya|total|grand\s*total|tunai|cash|bayar|kembali|kembalian|change|debit|kredit|edc|qris|mandiri|bca|bri|bni|supported\s*by|bee\.id|terima\s*kasih|thank\s*you)/i.test(
      str
    );

  const isHeaderLine = (str: string) =>
    /(?:tanggal|date|waktu|time|kasir|cashier|no\s*trx|trx|invoice|bill|receipt|member|channel|dine\s*in|take\s*away|telp|phone|fax|alamat|jl\.|jalan|ruko|npwp|order\s*#|table\s*#|meja\s*#)/i.test(
      str
    );

  // 2. Multi-Format Line Items Extraction
  const purchasedItems: PurchasedItem[] = [];

  // Patterns for different receipt line structures:
  // Pattern 1 (Split Qty x Price Subtotal line): "2 x 12,000 24,000" or "ou 3% 7,500 22,500" or "| 3x 17,000 51,000"
  const splitQtyRowRegex = /^(?:[^a-zA-Z0-9\s]*\s*)?(?:[a-zA-Z]{1,2}\s+)?(\d+)\s*[%xX*@]\s*([\d.,]+)(?:\s+([\d.,]+))?$/;
  // Pattern 2 (Inline with Qty): "BERAS SUPER 5KG 1x 88,000" or "SUSU UHT 2 x 27.500 55.000"
  const inlineQtyRegex = /^(?:(\d+)\s*[%xX*@]\s*)?([a-zA-Z][a-zA-Z0-9\s.&/'()-]{2,})\s+(\d+)\s*[%xX*@]\s*([\d.,]+)(?:\s+([\d.,]+))?$/;
  // Pattern 3 (Prefix Qty): "2x KOPI KENANGAN MANTAN L 48,000"
  const prefixQtyRegex = /^(\d+)\s*[%xX*@]\s*([a-zA-Z][a-zA-Z0-9\s.&/'()-]{2,})\s+([\d.,]+)$/;
  // Pattern 4 (Simple item name with price at end): "BUTTER CROISSANT 20,000"
  const simpleItemPriceRegex = /^([a-zA-Z][a-zA-Z0-9\s.&/'()-]{2,})\s+([\d.,]{4,})$/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isSummaryLine(line) || isHeaderLine(line)) continue;

    // Check Pattern 1: Split 2-line format (Line i is "2 x 12,000 24,000", Line i-1 is "Bakso")
    const splitMatch = line.match(splitQtyRowRegex);
    if (splitMatch) {
      const qty = parseInt(splitMatch[1], 10) || 1;
      const price = cleanOcrNumber(splitMatch[2]);
      let subtotal = splitMatch[3] ? cleanOcrNumber(splitMatch[3]) : price * qty;

      // Mathematical self-correction for item line:
      // If qty * price != subtotal due to faded first digit (e.g. 3 * 7500 = 22500, read as 2500)
      if (price > 0 && Math.abs(qty * price - subtotal) > 0) {
        subtotal = qty * price;
      }

      if (price > 0 || subtotal > 0) {
        // Look backwards for the item name line
        let itemName = '';
        let j = i - 1;
        while (j >= 0) {
          const prevL = lines[j];
          if (
            splitQtyRowRegex.test(prevL) ||
            isSummaryLine(prevL) ||
            isHeaderLine(prevL)
          ) {
            break;
          }
          const cleaned = cleanItemName(prevL);
          if (cleaned.length >= 2) {
            itemName = cleaned;
            break;
          }
          j--;
        }

        if (!itemName) {
          itemName = `Item #${purchasedItems.length + 1}`;
        }

        purchasedItems.push({
          id: `item-${i}-${Date.now()}`,
          name: itemName,
          qty,
          price: price || Math.round(subtotal / qty),
        });
        continue;
      }
    }

    // Check Pattern 2: Inline with Qty (e.g. "BERAS SUPER 5KG 1x 88,000" or "SUSU UHT 2 x 27.500 55.000")
    const inlineMatch = line.match(inlineQtyRegex);
    if (inlineMatch) {
      const name = cleanItemName(inlineMatch[2]);
      const qty = parseInt(inlineMatch[3], 10) || 1;
      const unitOrSub = cleanOcrNumber(inlineMatch[4]);
      const subtotalRaw = inlineMatch[5] ? cleanOcrNumber(inlineMatch[5]) : unitOrSub * qty;
      const price = inlineMatch[5] ? unitOrSub : Math.round(subtotalRaw / qty);

      if (name.length >= 2 && (price > 0 || subtotalRaw > 0)) {
        purchasedItems.push({
          id: `item-${i}-${Date.now()}`,
          name,
          qty,
          price: price || subtotalRaw,
        });
        continue;
      }
    }

    // Check Pattern 3: Prefix Qty (e.g. "2x KOPI KENANGAN MANTAN L 48,000")
    const prefixMatch = line.match(prefixQtyRegex);
    if (prefixMatch) {
      const qty = parseInt(prefixMatch[1], 10) || 1;
      const name = cleanItemName(prefixMatch[2]);
      const totalNum = cleanOcrNumber(prefixMatch[3]);
      const price = Math.round(totalNum / qty);

      if (name.length >= 2 && totalNum > 0) {
        purchasedItems.push({
          id: `item-${i}-${Date.now()}`,
          name,
          qty,
          price: price || totalNum,
        });
        continue;
      }
    }

    // Check Pattern 4: Simple item name and price (e.g. "BUTTER CROISSANT 20,000")
    const simpleMatch = line.match(simpleItemPriceRegex);
    if (simpleMatch) {
      const name = cleanItemName(simpleMatch[1]);
      const price = cleanOcrNumber(simpleMatch[2]);
      if (name.length >= 3 && price >= 100 && !isSummaryLine(name)) {
        purchasedItems.push({
          id: `item-${i}-${Date.now()}`,
          name,
          qty: 1,
          price,
        });
        continue;
      }
    }
  }

  // 3. Summary & Financial Totals Extraction
  let extractedSubtotal = 0;
  let extractedTax = 0;
  let extractedDiscount = 0;
  let extractedTotal = 0;
  let extractedCash = 0;
  let extractedChange = 0;

  for (const line of lines) {
    const isSubtotal = /sub\s*total|subtotal|jml\s*total/i.test(line);
    const isTax = /pajak|tax|ppn|pb1|pb\s*1|service|svc/i.test(line);
    const isDiscount = /diskon|discount|potongan|hemat|promo/i.test(line);
    const isCash = /tunai|cash|bayar|tendered/i.test(line) && !/kembali/i.test(line);
    const isChange = /kembali|kembalian|change/i.test(line);
    const isGrandTotal = /total/i.test(line) && !isSubtotal;

    // Extract amounts using flexible currency regex
    const amountMatch = line.match(/[\d.,:;]{3,}/);
    if (amountMatch) {
      const val = cleanOcrNumber(amountMatch[0]);
      if (val > 0) {
        if (isSubtotal && extractedSubtotal === 0) extractedSubtotal = val;
        else if (isTax && extractedTax === 0) extractedTax = val;
        else if (isDiscount && extractedDiscount === 0) extractedDiscount = val;
        else if (isCash && extractedCash === 0) extractedCash = val;
        else if (isChange && extractedChange === 0) extractedChange = val;
        else if (isGrandTotal && extractedTotal === 0) extractedTotal = val;
      }
    }
  }

  // 4. Mathematical Cross-Checking & Auto-Correction
  // Receipts obey strict accounting equations:
  // Math A: Cash - Change = Total (e.g. 200,000 - 8,525 = 191,475)
  // Math B: Subtotal + Tax - Discount = Total (e.g. 172,500 + 18,975 = 191,475)
  // Math C: Sum(Items) = Subtotal
  let mathTotalFromCash = 0;
  if (extractedCash > 0 && extractedChange >= 0 && extractedCash > extractedChange) {
    mathTotalFromCash = extractedCash - extractedChange;
  }

  let mathTotalFromSubtotal = 0;
  if (extractedSubtotal > 0) {
    mathTotalFromSubtotal = extractedSubtotal + extractedTax - extractedDiscount;
  }

  const itemsSum = purchasedItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  let finalTotal = extractedTotal;
  let mathVerified = false;

  // Cross-verify and fix corrupted OCR total (e.g. thermal "131,47:" corrected to 191,475)
  if (mathTotalFromSubtotal > 0 && mathTotalFromCash > 0 && mathTotalFromSubtotal === mathTotalFromCash) {
    // Both independent equations agree perfectly!
    finalTotal = mathTotalFromSubtotal;
    mathVerified = true;
  } else if (mathTotalFromSubtotal > 0) {
    if (finalTotal === 0 || Math.abs(finalTotal - mathTotalFromSubtotal) > 50) {
      finalTotal = mathTotalFromSubtotal;
    }
    mathVerified = true;
  } else if (mathTotalFromCash > 0) {
    if (finalTotal === 0 || Math.abs(finalTotal - mathTotalFromCash) > 50) {
      finalTotal = mathTotalFromCash;
    }
    mathVerified = true;
  } else if (itemsSum > 0 && (finalTotal === 0 || Math.abs(finalTotal - (itemsSum + extractedTax - extractedDiscount)) <= 50)) {
    if (finalTotal === 0) finalTotal = itemsSum + extractedTax - extractedDiscount;
    mathVerified = true;
  } else if (finalTotal === 0 && itemsSum > 0) {
    // Fallback to sum of line items
    finalTotal = itemsSum + extractedTax - extractedDiscount;
  }

  // If subtotal is missing, backfill from item sum
  if (extractedSubtotal === 0 && itemsSum > 0) {
    extractedSubtotal = itemsSum;
  }

  // 5. Dynamic Category Classification
  const fullTextUpper = rawText.toUpperCase();
  let suggestedCategory = 'Belanja Bulanan';

  if (
    /BEEPOS|CAFE|KAFE|RESTAURANT|RESTO|BAKSO|KANGKUNG|CAP JAY|CUMI|FOOD|PIZZA|KENANGAN|WARUNG|DINE IN|TAKE AWAY|MCDONALD|KFC|STARBUCKS|GOKANA|HOKBEN|SOLARIA|KOPI|COFFEE/i.test(
      fullTextUpper
    )
  ) {
    suggestedCategory = 'Makanan & Minuman';
  } else if (
    /SUPERINDO|INDOMARET|ALFAMART|GROCERY|HYPERMART|MARKET|TRANSMART|FARMERS|RANCH|LOTTE|SUPERMARKET/i.test(
      fullTextUpper
    )
  ) {
    suggestedCategory = 'Belanja Bulanan';
  } else if (/PERTAMINA|SHELL|SPBU|BENSIN|PARKIR|GOJEK|GRAB|OJEK|TOL|BP/i.test(fullTextUpper)) {
    suggestedCategory = 'Transportasi';
  } else if (/PLN|TELKOM|INDIHOME|PDAM|PULSA|LISTRIK|BPJS/i.test(fullTextUpper)) {
    suggestedCategory = 'Tagihan & Utilitas';
  } else if (/APOTEK|KIMIA FARMA|GUARDIAN|WATSONS|CENTURY|KLINIK|RUMAH SAKIT|DOKTER/i.test(fullTextUpper)) {
    suggestedCategory = 'Kesehatan';
  } else if (/BIOSKOP|CINEMA|XXI|CGV|TIMEZONE|NETFLIX|SPOTIFY/i.test(fullTextUpper)) {
    suggestedCategory = 'Hiburan';
  }

  // Calculate dynamic confidence score
  let confidenceScore = 60;
  if (merchantName && merchantName !== 'Toko / Merchant') confidenceScore += 10;
  if (transactionDate) confidenceScore += 10;
  if (purchasedItems.length > 0) confidenceScore += 10;
  if (mathVerified) confidenceScore += 10;

  return {
    merchantName,
    date: transactionDate,
    totalAmount: finalTotal,
    subtotalAmount: extractedSubtotal,
    taxAmount: extractedTax,
    changeAmount: extractedChange,
    cashAmount: extractedCash,
    purchasedItems,
    suggestedCategory,
    rawOcrText: rawText,
    confidenceScore: Math.min(100, confidenceScore),
    mathVerified,
  };
}
