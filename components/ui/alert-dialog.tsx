// src/components/ui/alert-dialog.tsx
import React from 'react';

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogContentProps {
  children: React.ReactNode;
}

interface AlertDialogHeaderProps {
  children: React.ReactNode;
}

interface AlertDialogFooterProps {
  children: React.ReactNode;
}

interface AlertDialogTitleProps {
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode;
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function AlertDialogContent({ children }: AlertDialogContentProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
      {children}
    </div>
  );
}

export function AlertDialogHeader({ children }: AlertDialogHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 text-center sm:text-left">
      {children}
    </div>
  );
}

export function AlertDialogFooter({ children }: AlertDialogFooterProps) {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
      {children}
    </div>
  );
}

export function AlertDialogTitle({ children }: AlertDialogTitleProps) {
  return (
    <h2 className="text-lg font-semibold text-gray-900">
      {children}
    </h2>
  );
}

export function AlertDialogDescription({ children }: AlertDialogDescriptionProps) {
  return (
    <p className="text-sm text-gray-500">
      {children}
    </p>
  );
}

export function AlertDialogAction({ children, className = '', ...props }: AlertDialogActionProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 
                 text-sm font-semibold text-white transition-colors 
                 hover:bg-red-700 focus:outline-none focus:ring-2 
                 focus:ring-red-400 focus:ring-offset-2 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function AlertDialogCancel({ children, className = '', ...props }: AlertDialogCancelProps) {
  return (
    <button
      className={`inline-flex h-10 items-center justify-center rounded-md border 
                 border-gray-200 bg-white px-4 py-2 text-sm font-semibold 
                 text-gray-900 transition-colors hover:bg-gray-100 
                 focus:outline-none focus:ring-2 focus:ring-gray-400 
                 focus:ring-offset-2 sm:mt-0 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}