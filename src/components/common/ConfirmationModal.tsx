'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  confirmLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  confirmLoading = false
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={24} color="#ef4444" />,
          iconBg: 'rgba(239, 68, 68, 0.15)',
          btnBg: '#ef4444',
          btnColor: '#ffffff'
        };
      case 'primary':
        return {
          icon: <HelpCircle size={24} color="var(--primary-light)" />,
          iconBg: 'rgba(99, 102, 241, 0.15)',
          btnBg: 'var(--primary)',
          btnColor: '#ffffff'
        };
      case 'warning':
      default:
        return {
          icon: <AlertCircle size={24} color="#f59e0b" />,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          btnBg: '#f59e0b',
          btnColor: '#000000'
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '460px', 
          width: '92%', 
          padding: '1.5rem',
          borderRadius: 'var(--radius-lg)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: style.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {style.icon}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              {title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              {message}
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-ghost btn-icon" 
            onClick={onClose} 
            style={{ padding: '0.25rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '1.5rem' }}>
          <button 
            type="button" 
            className="btn btn-secondary btn-sm" 
            onClick={onClose}
            disabled={confirmLoading}
            style={{ fontWeight: 600, padding: '0.5rem 1rem' }}
          >
            {cancelText}
          </button>
          <button 
            type="button" 
            className="btn btn-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={confirmLoading}
            style={{ 
              fontWeight: 700, 
              padding: '0.5rem 1.15rem',
              background: style.btnBg,
              color: style.btnColor,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
