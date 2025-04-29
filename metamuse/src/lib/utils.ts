import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { useAuthStore } from "./stores/auth.store"; // Adjust path accordingly
import { BACKEND_BASE_URL } from "./config";
import chroma from "chroma-js";
import { formatDistanceToNow } from 'date-fns';
import * as fabric from "fabric";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export const api = (withAuth = false) => {
  const instance = axios.create({
    baseURL: BACKEND_BASE_URL,
    withCredentials: true, // Enables sending cookies with requests
  });

  if (withAuth) {
    instance.interceptors.request.use(async (config) => {
      const token = await useAuthStore.getState().getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
      return config;
    });
  }

  return instance;
};

export const getInitials = (firstName: string, lastName?: string): string => {
  if (lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  }

  const splitName = firstName.split(" ");
  if (splitName.length >= 2) {
    return `${splitName[0].charAt(0)}${splitName[1].charAt(0)}`;
  }

  return `${firstName.charAt(0)}`;
};
// Add or update this function in your utils file

export const getColorsFromId = (id: string) => {
  // Generate a more distributed hash from the entire ID
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    // Use prime numbers to improve distribution
    hash = (hash * 31 + id.charCodeAt(i)) % 360;
  }
  
  // Use the last 6 characters of the ID to add more variation
  const secondaryHash = parseInt(id.slice(-6), 16) % 100;
  
  // Create HSL values with good spread
  const hue = hash; // 0-359
  const saturation = 65 + (secondaryHash % 20); // 65-85%
  const lightness = 45 + (secondaryHash % 15); // 45-60%
  
  // Calculate whether text should be light or dark based on background brightness
  const isLightBackground = lightness > 50;
  
  return {
    background: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
    text: isLightBackground ? '#000000' : '#ffffff'
  };
};
export const getRandomComplementaryColors = () => {
  const color1 = chroma.random();
  const color2 = chroma.random();

  const contrastColor1 = chroma.contrast(color1, "white") > chroma.contrast(color1, "black") ? "white" : "black";
  const contrastColor2 = chroma.contrast(color2, "white") > chroma.contrast(color2, "black") ? "white" : "black";

  return [
    { background: color1.hex(), text: contrastColor1 },
    { background: color2.hex(), text: contrastColor2 },
  ];
};
export const humanizeDate = (dateString: string) => {
  const date = new Date(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const reconstructImg = async (canvas: any, projectId: any) => {
  let imgUrl = null;
  try {
    const response = await api().get(`/projects/${projectId}/reconstruct`);
    if (response.status === 200) {
      const { canvas: canvasSettings, objects } = response.data;
        // Initialize Fabric.js canvas
        // const canvasWidth = canvasSettings?.width || canvas.getWidth();
        // const canvasHeight = canvasSettings?.height || canvas.getHeight();
        // const backgroundColor = canvasSettings?.backgroundColor || '#fff';
        // canvas.setWidth(canvasWidth);
        // canvas.setHeight(canvasHeight);
        // canvas.setBackgroundColor(backgroundColor);
        const elements = objects ? Object.values(objects) : [];
        console.log("Elements", elements);
        if (elements.length === 0) {
          console.warn('No objects found in the canvas');
          return null;
        } 
        const data = JSON.stringify({ objects: elements })
        await canvas.loadFromJSON(data)
        canvas.renderAll()
      // Generate image URL from the Fabric canvas
      imgUrl = canvas.toDataURL({ format: "png", quality: 1.0, multiplier: 1, });
    }
    return imgUrl;
  } catch (error) {
    console.error("Error reconstructing image:", error);
    return null;
  }
};