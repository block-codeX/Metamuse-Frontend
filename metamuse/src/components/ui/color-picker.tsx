'use client';
import { forwardRef, useMemo, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { cn } from '@/lib/utils';
import type { ButtonProps } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
}
import type React from 'react';
import { useEffect, useRef } from 'react';
export function useForwardedRef<T>(ref: React.ForwardedRef<T>) {
  const innerRef = useRef<T>(null);
  useEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(innerRef.current);
    } else {
      ref.current = innerRef.current;
    }
  });
  return innerRef;
}
const ColorPicker = forwardRef<
  HTMLInputElement,
  Omit<ButtonProps, 'value' | 'onChange' | 'onBlur'> & ColorPickerProps
>(
  (
    { disabled, value, onChange, onBlur, name, className, ...props },
    forwardedRef
  ) => {
    const ref = useForwardedRef(forwardedRef);
    const [open, setOpen] = useState(false);
    const parsedValue = useMemo(() => {
      return value || '#FFFFFF';
    }, [value]);

    // Determine if we should show the default gradient background
    const hasSelectedColor = useMemo(() => {
      return  false;
    }, [value]);
    
    return (
      <div className="flex flex-col items-center gap-1">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild disabled={disabled} onBlur={onBlur}>
            <Button
              {...props}
              className={cn('block relative overflow-hidden w-7', className)}
              name={name}
              onClick={() => {
                setOpen(true);
              }}
              size='icon'
              style={{
                background: hasSelectedColor ? parsedValue : 'transparent',
              }}
              variant='outline'
            >
              {/* Gradient background when no color is selected */}
                <div 
                  className="absolute inset-0 w-7 h-full bg-gradient-to-br from-red-500 cursor-pointer via-green-500 to-blue-500 animate-gradient-x"
                  style={{
                    backgroundSize: '400% 400%',
                    animation: 'gradient 3s ease infinite'
                  }}
                />
              <style jsx>{`
                @keyframes gradient {
                  0% { background-position: 0% 50%; }
                  50% { background-position: 100% 50%; }
                  100% { background-position: 0% 50%; }
                }
              `}</style>
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-full'>
            <HexColorPicker color={parsedValue} onChange={onChange} />
            <Input
              maxLength={7}
              onChange={(e) => {
                onChange(e?.currentTarget?.value);
              }}
              ref={ref}
              value={parsedValue}
              className="mt-2"
            />
          </PopoverContent>
        </Popover>
        
        {/* Small color preview below the picker */}
        <div 
          className="w-6 h-6 rounded-md border border-gray-300 shadow-sm cursor-pointer active:scale-95 transition-all-ease"
          onClick={() => {
            onChange(parsedValue)
          }}
          style={{ backgroundColor: parsedValue }}
          aria-label="Selected color preview"
        />
      </div>
    );
  }
);
ColorPicker.displayName = 'ColorPicker';
export { ColorPicker };