
import { useEffect } from 'react';
import Cookies from 'js-cookie';

// Cache for storing image URLs
const imageCache = new Map<string, string>();

export function useFormPersistence(
  formValues: Record<string, any>, 
  formId: string
) {
  // Load saved form data from cookies on mount
  useEffect(() => {
    const savedData = Cookies.get(formId);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach(key => {
          formValues[key] = parsedData[key];
        });
      } catch (e) {
        console.error('Error parsing saved form data:', e);
      }
    }
  }, [formId, formValues]);

  // Save form data to cookies whenever it changes
  const saveFormData = (data: Record<string, any>) => {
    Cookies.set(formId, JSON.stringify(data), { expires: 7 }); // Expires in 7 days
  };

  // Cache image URL
  const cacheImage = (productId: string, imageUrl: string) => {
    imageCache.set(productId, imageUrl);
  };

  // Get cached image URL
  const getCachedImage = (productId: string) => {
    return imageCache.get(productId);
  };

  return { saveFormData, cacheImage, getCachedImage };
}
