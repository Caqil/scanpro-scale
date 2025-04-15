// lib/image-previews.ts

/**
 * Creates a canvas element with the image loaded onto it
 * @param file Image file to load onto canvas
 * @returns Promise with the canvas element and context
 */
async function createImageCanvas(file: File): Promise<{
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    img: HTMLImageElement;
    width: number;
    height: number;
}> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            resolve({ canvas, ctx, img, width: img.width, height: img.height });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Converts a hex color string to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse different formats
    let r, g, b;
    if (hex.length === 3) {
        // #RGB format
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        // #RRGGBB format
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    } else {
        // Default to black
        r = 0;
        g = 0;
        b = 0;
    }

    return { r, g, b };
}

/**
 * Makes a color transparent in a PNG image
 * @param file PNG file to process
 * @param options Options for making a color transparent
 * @returns Promise with a data URL of the processed image
 */
export async function makeTransparentPreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { canvas, ctx, width, height } = await createImageCanvas(file);

        // Parse the color
        const targetColor = hexToRgb(options.color as string);
        const tolerance = 30; // Color matching tolerance

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Loop through each pixel and make the selected color transparent
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Check if pixel color is within tolerance of target color
            if (
                Math.abs(r - targetColor.r) < tolerance &&
                Math.abs(g - targetColor.g) < tolerance &&
                Math.abs(b - targetColor.b) < tolerance
            ) {
                data[i + 3] = 0; // Set alpha to 0 (transparent)
            }
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Changes specific colors in a PNG image
 * @param file PNG file to process
 * @param options Options for changing colors
 * @returns Promise with a data URL of the processed image
 */
export async function changeColorsPreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { canvas, ctx, width, height } = await createImageCanvas(file);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Convert color mappings to RGB
        const mappings = (options.colorMappings as Array<{ sourceColor: string; targetColor: string }>).map(mapping => ({
            source: hexToRgb(mapping.sourceColor),
            target: hexToRgb(mapping.targetColor)
        }));

        const tolerance = options.tolerance as number || 30;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Alpha is at i+3

            // Check each color mapping
            for (const mapping of mappings) {
                if (
                    Math.abs(r - mapping.source.r) <= tolerance &&
                    Math.abs(g - mapping.source.g) <= tolerance &&
                    Math.abs(b - mapping.source.b) <= tolerance
                ) {
                    // Replace with target color
                    data[i] = mapping.target.r;
                    data[i + 1] = mapping.target.g;
                    data[i + 2] = mapping.target.b;
                    break; // Stop after first match
                }
            }
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Changes the color tone of a PNG image
 * @param file PNG file to process
 * @param options Options for changing color tone
 * @returns Promise with a data URL of the processed image
 */
export async function changeTonePreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { canvas, ctx, width, height } = await createImageCanvas(file);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Parse tone color
        const tone = hexToRgb(options.toneColor as string);

        // Calculate the blend factor (intensity as a decimal)
        const blendFactor = (options.intensity as number) / 100;
        const preserveGrays = options.preserveGrays as boolean;

        // Process each pixel
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const alpha = data[i + 3];

            // Skip transparent pixels
            if (alpha === 0) continue;

            // If preserving grayscale and this is a grayscale pixel, skip it
            if (preserveGrays && isGrayscale(r, g, b)) continue;

            // Blend the original color with the tone color based on intensity
            data[i] = Math.round(r * (1 - blendFactor) + tone.r * blendFactor);
            data[i + 1] = Math.round(g * (1 - blendFactor) + tone.g * blendFactor);
            data[i + 2] = Math.round(b * (1 - blendFactor) + tone.b * blendFactor);
            // Alpha channel remains unchanged
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Check if a color is grayscale (R = G = B approximately)
 */
function isGrayscale(r: number, g: number, b: number, tolerance: number = 5): boolean {
    return (
        Math.abs(r - g) <= tolerance &&
        Math.abs(g - b) <= tolerance &&
        Math.abs(r - b) <= tolerance
    );
}

/**
 * Adds a border to an image
 * @param file Image file to process
 * @param options Options for the border
 * @returns Promise with a data URL of the processed image
 */
export async function addBorderPreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { img, width, height } = await createImageCanvas(file);

        // Calculate dimensions
        const borderWidth = options.borderWidth as number || 0;
        const padding = options.padding as number || 0;
        const totalBorderWidth = borderWidth * 2;
        const totalPadding = padding * 2;

        const newWidth = width + totalPadding + totalBorderWidth;
        const newHeight = height + totalPadding + totalBorderWidth;

        // Create a new canvas with the border dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Apply border radius if needed
        const radius = options.borderRadius as number || 0;
        if (radius > 0) {
            ctx.beginPath();
            ctx.moveTo(radius, 0);
            ctx.lineTo(newWidth - radius, 0);
            ctx.quadraticCurveTo(newWidth, 0, newWidth, radius);
            ctx.lineTo(newWidth, newHeight - radius);
            ctx.quadraticCurveTo(newWidth, newHeight, newWidth - radius, newHeight);
            ctx.lineTo(radius, newHeight);
            ctx.quadraticCurveTo(0, newHeight, 0, newHeight - radius);
            ctx.lineTo(0, radius);
            ctx.quadraticCurveTo(0, 0, radius, 0);
            ctx.closePath();
            ctx.clip();
        }

        // Fill the border with color or gradient
        if (options.useGradient && options.gradientColor1 && options.gradientColor2) {
            let gradient;

            if (options.gradientType === 'linear') {
                // Calculate gradient angle
                const angle = options.gradientAngle as number || 45;
                const angleRad = (angle * Math.PI) / 180;

                // Calculate start and end points based on angle
                const x1 = newWidth / 2 - Math.cos(angleRad) * newWidth;
                const y1 = newHeight / 2 - Math.sin(angleRad) * newHeight;
                const x2 = newWidth / 2 + Math.cos(angleRad) * newWidth;
                const y2 = newHeight / 2 + Math.sin(angleRad) * newHeight;

                gradient = ctx.createLinearGradient(x1, y1, x2, y2);
            } else {
                // Radial gradient
                gradient = ctx.createRadialGradient(
                    newWidth / 2,
                    newHeight / 2,
                    0,
                    newWidth / 2,
                    newHeight / 2,
                    newWidth / 2
                );
            }

            gradient.addColorStop(0, options.gradientColor1 as string);
            gradient.addColorStop(1, options.gradientColor2 as string);

            ctx.fillStyle = gradient;
        } else {
            ctx.fillStyle = options.borderColor as string || '#000000';
        }

        ctx.fillRect(0, 0, newWidth, newHeight);

        // Add shadow if enabled
        if (options.useShadow && options.shadowColor) {
            ctx.shadowColor = options.shadowColor as string;
            ctx.shadowBlur = options.shadowBlur as number || 5;
            ctx.shadowOffsetX = options.shadowOffsetX as number || 0;
            ctx.shadowOffsetY = options.shadowOffsetY as number || 0;
        }

        // Draw the image in the center (with padding)
        ctx.shadowColor = 'transparent'; // Disable shadow for the image
        ctx.drawImage(img, borderWidth + padding, borderWidth + padding);

        // Add inner frame if enabled
        if (options.useFrame && options.frameWidth && options.frameWidth > 0) {
            const frameWidth = options.frameWidth as number;
            const frameColor = options.frameColor as string || '#FFFFFF';

            ctx.strokeStyle = frameColor;
            ctx.lineWidth = frameWidth;

            // Draw the inner frame
            ctx.strokeRect(
                borderWidth + frameWidth / 2,
                borderWidth + frameWidth / 2,
                width + padding * 2 - frameWidth,
                height + padding * 2 - frameWidth
            );
        }

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Adds text to an image
 * @param file Image file to process
 * @param options Options for the text
 * @returns Promise with a data URL of the processed image
 */
export async function addTextPreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { canvas, ctx, width, height } = await createImageCanvas(file);

        // Calculate position based on percentages
        const xPos = ((options.positionX as number) / 100) * width;
        const yPos = ((options.positionY as number) / 100) * height;

        // Setup font
        ctx.font = `${options.fontSize as number}px ${options.fontFamily as string}`;

        // Set text color and opacity
        const textColor = hexToRgb(options.textColor as string);
        const opacity = (options.opacity as number) / 100;
        ctx.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${opacity})`;

        // Setup text alignment
        ctx.textAlign = options.alignment as CanvasTextAlign;
        ctx.textBaseline = 'middle';

        // Calculate text width for background and border
        const textWidth = ctx.measureText(options.text as string).width;
        const textHeight = options.fontSize as number;
        const padding = options.padding as number || 0;

        // Save the canvas state before rotation
        ctx.save();

        // Translate and rotate
        ctx.translate(xPos, yPos);
        if ((options.rotation as number) !== 0) {
            ctx.rotate(((options.rotation as number) * Math.PI) / 180);
        }

        // Draw background if enabled
        if (options.bgColor && options.bgOpacity && (options.bgOpacity as number) > 0) {
            const bgColor = hexToRgb(options.bgColor as string);
            const bgOpacity = (options.bgOpacity as number) / 100;

            ctx.fillStyle = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${bgOpacity})`;

            // Adjust based on alignment
            let rectX = 0;
            if (options.alignment === 'center') rectX = -textWidth / 2;
            else if (options.alignment === 'right') rectX = -textWidth;

            ctx.fillRect(
                rectX - padding,
                -textHeight / 2 - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            );
        }

        // Draw border if enabled
        if (options.borderWidth && (options.borderWidth as number) > 0) {
            const borderColor = hexToRgb(options.borderColor as string || '#000000');

            ctx.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${opacity})`;
            ctx.lineWidth = options.borderWidth as number;

            // Adjust based on alignment
            let rectX = 0;
            if (options.alignment === 'center') rectX = -textWidth / 2;
            else if (options.alignment === 'right') rectX = -textWidth;

            ctx.strokeRect(
                rectX - padding,
                -textHeight / 2 - padding,
                textWidth + padding * 2,
                textHeight + padding * 2
            );
        }

        // Draw text shadow if enabled
        if (options.shadowEnabled && options.shadowColor) {
            const shadowColor = hexToRgb(options.shadowColor as string);

            ctx.shadowColor = `rgba(${shadowColor.r}, ${shadowColor.g}, ${shadowColor.b}, ${opacity})`;
            ctx.shadowBlur = options.shadowBlur as number || 5;
            ctx.shadowOffsetX = options.shadowOffsetX as number || 2;
            ctx.shadowOffsetY = options.shadowOffsetY as number || 2;
        }

        // Draw the text
        ctx.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, ${opacity})`;
        ctx.fillText(options.text as string, 0, 0);

        // Restore canvas state
        ctx.restore();

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Resizes an image
 * @param file Image file to process
 * @param options Options for resizing
 * @returns Promise with a data URL of the processed image
 */
export async function resizeImagePreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { img } = await createImageCanvas(file);

        // Create a new canvas with target dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        canvas.width = options.width as number;
        canvas.height = options.height as number;

        // Calculate dimensions based on resize method
        let sWidth, sHeight, dx, dy, dWidth, dHeight;

        switch (options.method as string) {
            case 'fit':
                // Preserve aspect ratio, fit within dimensions
                const ratio = Math.min(
                    (options.width as number) / img.width,
                    (options.height as number) / img.height
                );
                dWidth = img.width * ratio;
                dHeight = img.height * ratio;
                dx = ((options.width as number) - dWidth) / 2;
                dy = ((options.height as number) - dHeight) / 2;

                // Clear with transparent background
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dWidth, dHeight);
                break;

            case 'fill':
                // Stretch to fill dimensions
                ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, options.width as number, options.height as number);
                break;

            case 'cover':
                // Cover entire area (may crop)
                const coverRatio = Math.max(
                    (options.width as number) / img.width,
                    (options.height as number) / img.height
                );
                sWidth = (options.width as number) / coverRatio;
                sHeight = (options.height as number) / coverRatio;
                const sx = (img.width - sWidth) / 2;
                const sy = (img.height - sHeight) / 2;

                ctx.drawImage(
                    img,
                    sx, sy, sWidth, sHeight,
                    0, 0, options.width as number, options.height as number
                );
                break;

            default:
                // Default to 'fit'
                const defaultRatio = Math.min(
                    (options.width as number) / img.width,
                    (options.height as number) / img.height
                );
                dWidth = img.width * defaultRatio;
                dHeight = img.height * defaultRatio;
                dx = ((options.width as number) - dWidth) / 2;
                dy = ((options.height as number) - dHeight) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, img.width, img.height, dx, dy, dWidth, dHeight);
        }

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Rotates and flips an image
 * @param file Image file to process
 * @param options Options for rotation and flipping
 * @returns Promise with a data URL of the processed image
 */
export async function rotateImagePreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { img, width, height } = await createImageCanvas(file);

        // Calculate new dimensions based on rotation
        const angle = parseInt(options.rotationAngle as string);
        const swapDimensions = angle === 90 || angle === 270;

        const newWidth = swapDimensions ? height : width;
        const newHeight = swapDimensions ? width : height;

        // Create a new canvas with the right dimensions
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Translate and rotate
        ctx.save();
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate((angle * Math.PI) / 180);

        // Apply flipping if needed
        if (options.flipDirection === 'horizontal' || options.flipDirection === 'both') {
            ctx.scale(-1, 1);
        }
        if (options.flipDirection === 'vertical' || options.flipDirection === 'both') {
            ctx.scale(1, -1);
        }

        ctx.drawImage(img, -width / 2, -height / 2, width, height);
        ctx.restore();

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}

/**
 * Adds noise to an image
 * @param file Image file to process
 * @param options Options for adding noise
 * @returns Promise with a data URL of the processed image
 */
export async function addNoisePreview(file: File, options: Record<string, any>): Promise<string> {
    try {
        const { canvas, ctx, width, height } = await createImageCanvas(file);

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Apply noise based on type
        const noiseAmount = (options.noiseAmount as number) / 100; // Convert percentage to factor
        const noiseType = options.noiseType as string;
        const monochrome = options.monochrome as boolean;

        for (let i = 0; i < data.length; i += 4) {
            // Skip transparent pixels
            if (data[i + 3] === 0) continue;

            if (noiseType === 'gaussian') {
                // Gaussian noise - add random value from normal distribution
                let noise;
                if (monochrome) {
                    // Same noise for all channels (monochrome)
                    noise = (Math.random() * 2 - 1) * 255 * noiseAmount;
                    data[i] = Math.min(255, Math.max(0, data[i] + noise));
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
                } else {
                    // Different noise for each channel (colored)
                    data[i] = Math.min(255, Math.max(0, data[i] + (Math.random() * 2 - 1) * 255 * noiseAmount));
                    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + (Math.random() * 2 - 1) * 255 * noiseAmount));
                    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + (Math.random() * 2 - 1) * 255 * noiseAmount));
                }
            } else if (noiseType === 'salt-pepper') {
                // Salt & pepper noise - random black or white pixels
                if (Math.random() < noiseAmount) {
                    const val = Math.random() < 0.5 ? 0 : 255;
                    if (monochrome) {
                        data[i] = data[i + 1] = data[i + 2] = val;
                    } else {
                        // Randomly select which channels to affect
                        if (Math.random() < 0.33) data[i] = val;
                        if (Math.random() < 0.33) data[i + 1] = val;
                        if (Math.random() < 0.33) data[i + 2] = val;
                    }
                }
            }
        }

        // Put the modified image data back on the canvas
        ctx.putImageData(imageData, 0, 0);

        // Return as data URL
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Preview generation failed:', error);
        throw new Error('Failed to generate preview');
    }
}