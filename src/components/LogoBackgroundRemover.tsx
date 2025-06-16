import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Download, Loader2 } from 'lucide-react';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export default function LogoBackgroundRemover() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcessCurrentLogo = async () => {
    setIsProcessing(true);
    setError(null);
    
    try {
      // Load the current logo
      const response = await fetch('/lovable-uploads/27904f0e-c6d8-4bb1-b158-ebbb5a1487e1.png');
      const blob = await response.blob();
      
      // Set original image for preview
      setOriginalImage(URL.createObjectURL(blob));
      
      // Load and process the image
      const imageElement = await loadImage(blob);
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
    } catch (err) {
      console.error('Error processing logo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar a imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    
    try {
      // Set original image for preview
      setOriginalImage(URL.createObjectURL(file));
      
      // Load and process the image
      const imageElement = await loadImage(file);
      const processedBlob = await removeBackground(imageElement);
      
      // Create URL for processed image
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Erro ao processar a imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const a = document.createElement('a');
    a.href = processedImage;
    a.download = 'go-nomad-logo-transparent.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#E76F51] mb-2">
          Remoção de Fundo da Logo
        </h1>
        <p className="text-[#8C5B3E]">
          Use IA para remover o fundo da logo e criar uma versão transparente
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={handleProcessCurrentLogo}
          disabled={isProcessing}
          className="bg-[#E76F51] hover:bg-[#AD4F36] text-white"
        >
          {isProcessing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Processar Logo Atual
        </Button>

        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Nova Imagem
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {(originalImage || processedImage) && (
        <div className="grid md:grid-cols-2 gap-6">
          {originalImage && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#E76F51]">Imagem Original</h3>
              <div className="border rounded-lg p-4 bg-white">
                <img
                  src={originalImage}
                  alt="Imagem original"
                  className="w-full h-auto max-h-64 object-contain mx-auto"
                />
              </div>
            </div>
          )}

          {processedImage && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-[#E76F51]">Sem Fundo</h3>
              <div className="border rounded-lg p-4 bg-transparent bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px]">
                <img
                  src={processedImage}
                  alt="Imagem sem fundo"
                  className="w-full h-auto max-h-64 object-contain mx-auto"
                />
              </div>
              <Button
                onClick={handleDownload}
                className="w-full bg-[#E76F51] hover:bg-[#AD4F36] text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PNG Transparente
              </Button>
            </div>
          )}
        </div>
      )}

      {isProcessing && (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#E76F51]" />
          <p className="text-[#8C5B3E]">
            Processando imagem com IA... Isso pode levar alguns minutos.
          </p>
        </div>
      )}
    </div>
  );
}
