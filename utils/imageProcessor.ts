/**
 * High-Accuracy Image Preprocessor for Receipt OCR
 * Implements HTML5 Canvas image enhancement tailored for thermal receipts:
 * - Optimal resolution normalization (~1200-1600px width)
 * - ITU-R BT.601 Luminance Grayscale Conversion
 * - Adaptive Contrast Stretching & Auto-Levels (Percentile-based)
 * - Mild 3x3 Convolution Sharpening (clarifies dot-matrix thermal ink)
 * - Adaptive Local Binarization (Integral Image / Bradley-Roth algorithm for shadow removal)
 * - Rotation & Orientation Normalization (90°, 180°, 270°)
 */

export interface PreprocessOptions {
  /** Target width to normalize character height for Tesseract neural net (default: 1400px) */
  targetWidth?: number;
  /** Apply auto contrast stretching / histogram leveling */
  autoContrast?: boolean;
  /** Apply unsharp edge sharpening to clarify thermal dots */
  sharpen?: boolean;
  /** Convert to grayscale */
  grayscale?: boolean;
  /** Apply adaptive binarization to eliminate shadows and background gradients */
  binarize?: boolean;
  /** Rotation in degrees (0, 90, 180, 270) */
  rotation?: number;
  /** Invert colors (useful for dark or inverted thermal paper) */
  invert?: boolean;
}

/**
 * Load image source into an HTMLImageElement safely
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error('Gagal memuat gambar untuk preprocessing: ' + err));
    img.src = src;
  });
}

/**
 * Apply 3x3 convolution kernel to canvas ImageData
 */
function applyConvolution(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  kernel: number[],
  divisor: number = 1,
  offset: number = 0
): ImageData {
  const { width, height, data } = imageData;
  const output = ctx.createImageData(width, height);
  const outData = output.data;

  // Copy alpha channel
  for (let i = 0; i < data.length; i += 4) {
    outData[i + 3] = data[i + 3];
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      let kIdx = 0;

      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const pixelIdx = ((y + ky) * width + (x + kx)) * 4;
          const weight = kernel[kIdx++];
          r += data[pixelIdx] * weight;
          g += data[pixelIdx + 1] * weight;
          b += data[pixelIdx + 2] * weight;
        }
      }

      const dstIdx = (y * width + x) * 4;
      outData[dstIdx] = Math.min(255, Math.max(0, r / divisor + offset));
      outData[dstIdx + 1] = Math.min(255, Math.max(0, g / divisor + offset));
      outData[dstIdx + 2] = Math.min(255, Math.max(0, b / divisor + offset));
    }
  }

  return output;
}

/**
 * Adaptive Local Thresholding using Integral Image (Bradley-Roth algorithm)
 * Effectively removes phone shadows, gradient illumination, and paper discoloration.
 */
function applyAdaptiveThreshold(
  imageData: ImageData,
  windowPercent: number = 0.12,
  thresholdT: number = 0.15
): void {
  const { width, height, data } = imageData;
  const integral = new Float64Array(width * height);

  // Step 1: Compute integral image of grayscale values
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const gray = data[idx]; // data is already grayscale
      rowSum += gray;
      if (y === 0) {
        integral[y * width + x] = rowSum;
      } else {
        integral[y * width + x] = integral[(y - 1) * width + x] + rowSum;
      }
    }
  }

  // Step 2: Compare each pixel to local neighborhood mean
  const s = Math.max(8, Math.round(width * windowPercent));
  const sHalf = Math.floor(s / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const x1 = Math.max(0, x - sHalf);
      const x2 = Math.min(width - 1, x + sHalf);
      const y1 = Math.max(0, y - sHalf);
      const y2 = Math.min(height - 1, y + sHalf);

      const count = (x2 - x1 + 1) * (y2 - y1 + 1);

      // Sum from integral image
      let sum = integral[y2 * width + x2];
      if (x1 > 0) sum -= integral[y2 * width + (x1 - 1)];
      if (y1 > 0) sum -= integral[(y1 - 1) * width + x2];
      if (x1 > 0 && y1 > 0) sum += integral[(y1 - 1) * width + (x1 - 1)];

      const idx = (y * width + x) * 4;
      const pixelVal = data[idx];
      // If pixel is darker than (mean * (1 - thresholdT)), it's ink (0), else background (255)
      const isInk = pixelVal * count <= sum * (1.0 - thresholdT);
      const val = isInk ? 0 : 255;

      data[idx] = val;
      data[idx + 1] = val;
      data[idx + 2] = val;
    }
  }
}

/**
 * Preprocess an uploaded receipt image to maximize OCR text recognition accuracy.
 */
export async function preprocessReceiptImage(
  fileOrUrl: File | string,
  options: PreprocessOptions = {}
): Promise<string> {
  const {
    targetWidth = 1400,
    autoContrast = true,
    sharpen = true,
    grayscale = true,
    binarize = false,
    rotation = 0,
    invert = false,
  } = options;

  // If running in SSR or headless environment without document/canvas, fallback to raw url
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    if (typeof fileOrUrl === 'string') return fileOrUrl;
    return URL.createObjectURL(fileOrUrl);
  }

  let objectUrl: string | null = null;
  let srcUrl: string;

  if (typeof fileOrUrl === 'string') {
    srcUrl = fileOrUrl;
  } else {
    objectUrl = URL.createObjectURL(fileOrUrl);
    srcUrl = objectUrl;
  }

  try {
    const img = await loadImage(srcUrl);

    // Calculate dimensions
    let origW = img.naturalWidth || img.width;
    let origH = img.naturalHeight || img.height;

    // Apply target resolution scaling (normalize to optimal OCR character density)
    let scale = 1;
    if (origW > 0) {
      if (origW < 1000) {
        // Upscale small or low-res images
        scale = Math.min(2.5, targetWidth / origW);
      } else if (origW > 2200) {
        // Downscale excessively large smartphone photos to prevent memory exhaustion
        scale = targetWidth / origW;
      }
    }

    let drawW = Math.round(origW * scale);
    let drawH = Math.round(origH * scale);

    // Check if rotation swaps aspect ratio
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const isSwapped = normalizedRotation === 90 || normalizedRotation === 270;
    const canvasW = isSwapped ? drawH : drawW;
    const canvasH = isSwapped ? drawW : drawH;

    const canvas = document.createElement('canvas');
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      return srcUrl;
    }

    // High quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Handle rotation transform
    ctx.save();
    ctx.translate(canvasW / 2, canvasH / 2);
    if (normalizedRotation !== 0) {
      ctx.rotate((normalizedRotation * Math.PI) / 180);
    }
    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    let imgData = ctx.getImageData(0, 0, canvasW, canvasH);
    const data = imgData.data;

    // 1. Grayscale Conversion (ITU-R BT.601 luminance)
    if (grayscale || autoContrast || binarize) {
      for (let i = 0; i < data.length; i += 4) {
        const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
    }

    // 2. Auto Contrast & Histogram Stretching (Levels)
    if (autoContrast && !binarize) {
      // Find 1st percentile and 99th percentile luminance to reject noise speckles
      const histogram = new Uint32Array(256);
      for (let i = 0; i < data.length; i += 4) {
        histogram[data[i]]++;
      }

      const totalPixels = canvasW * canvasH;
      const lowerLimit = Math.floor(totalPixels * 0.02);
      const upperLimit = Math.floor(totalPixels * 0.98);

      let minLum = 0;
      let maxLum = 255;
      let accum = 0;

      for (let i = 0; i < 256; i++) {
        accum += histogram[i];
        if (accum >= lowerLimit) {
          minLum = i;
          break;
        }
      }

      accum = 0;
      for (let i = 255; i >= 0; i--) {
        accum += histogram[i];
        if (accum >= (totalPixels - upperLimit)) {
          maxLum = i;
          break;
        }
      }

      if (maxLum > minLum) {
        const range = maxLum - minLum;
        for (let i = 0; i < data.length; i += 4) {
          const val = data[i];
          let stretched = Math.round(((val - minLum) * 255) / range);
          stretched = Math.max(0, Math.min(255, stretched));
          data[i] = stretched;
          data[i + 1] = stretched;
          data[i + 2] = stretched;
        }
      }
    }

    // 3. Adaptive Local Binarization (if enabled)
    if (binarize) {
      applyAdaptiveThreshold(imgData, 0.1, 0.14);
    }

    ctx.putImageData(imgData, 0, 0);

    // 4. Sharpening Filter (clarifies dot-matrix thermal ink edges)
    if (sharpen && !binarize) {
      // Mild unsharp mask kernel: [0, -0.4, 0, -0.4, 2.6, -0.4, 0, -0.4, 0]
      const sharpenKernel = [
        0, -0.35, 0,
        -0.35, 2.4, -0.35,
        0, -0.35, 0,
      ];
      const sharpened = applyConvolution(ctx, imgData, sharpenKernel, 1, 0);
      ctx.putImageData(sharpened, 0, 0);
    }

    // 5. Inversion (if dark receipt with light ink)
    if (invert) {
      const invData = ctx.getImageData(0, 0, canvasW, canvasH);
      const d = invData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
      ctx.putImageData(invData, 0, 0);
    }

    return canvas.toDataURL('image/png');
  } finally {
    if (objectUrl) {
      // Keep object URL available for rendering if needed or clean up
    }
  }
}

/**
 * Rotate an image by specified angle (clockwise degrees)
 */
export async function rotateReceiptImage(
  fileOrUrl: File | string,
  degrees: number
): Promise<string> {
  return preprocessReceiptImage(fileOrUrl, {
    rotation: degrees,
    autoContrast: false,
    sharpen: false,
    grayscale: false,
    binarize: false,
  });
}
