'use client';

import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle, X } from 'lucide-react';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const handleCancel = () => {
    if (onCancel) onCancel();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <AlertTriangle size={24} color="#ef4444" />,
          iconBg: 'rgba(239, 68, 68, 0.12)',
          iconBorder: 'rgba(239, 68, 68, 0.25)',
          badgeColor: '#ef4444',
          btnBg: 'linear-gradient(135deg, #ef4444, #dc2626)',
          btnShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
          btnColor: '#ffffff'
        };
      case 'warning':
        return {
          icon: <AlertCircle size={24} color="#f59e0b" />,
          iconBg: 'rgba(245, 158, 11, 0.12)',
          iconBorder: 'rgba(245, 158, 11, 0.25)',
          badgeColor: '#f59e0b',
          btnBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
          btnShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
          btnColor: '#ffffff'
        };
      case 'primary':
      default:
        return {
          icon: <HelpCircle size={24} color="var(--primary-light)" />,
          iconBg: 'rgba(99, 102, 241, 0.12)',
          iconBorder: 'rgba(99, 102, 241, 0.25)',
          badgeColor: 'var(--primary-light)',
          btnBg: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          btnShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
          btnColor: '#ffffff'
        };
    }
  };

  const style = getVariantStyles();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmClick = async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleCancel}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100001,
        background: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%',
          maxWidth: '440px',
          padding: '1.75rem',
          borderRadius: '20px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px var(--card-inner-border)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        {/* Top Close Button */}
        <button 
          type="button" 
          className="btn btn-ghost btn-icon" 
          onClick={handleCancel} 
          style={{ 
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.4rem',
            color: 'var(--text-muted)'
          }}
          title="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: style.iconBg,
            border: `1px solid ${style.iconBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {style.icon}
          </div>

          <div style={{ flex: 1, paddingRight: '1.5rem' }}>
            <h3 style={{ 
              fontSize: '1.18rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              lineHeight: 1.3,
              margin: '0 0 0.4rem 0'
            }}>
              {title}
            </h3>
            <p style={{ 
              fontSize: '0.86rem', 
              color: 'var(--text-secondary)', 
              lineHeight: 1.55, 
              margin: 0 
            }}>
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', 
          gap: '0.75rem', 
          marginTop: '1.25rem',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={isSubmitting}
            style={{ 
              width: '100%',
              minWidth: 0,
              padding: '0.75rem 1rem',
              fontWeight: 600,
              fontSize: '0.88rem',
              borderRadius: '12px',
              justifyContent: 'center',
              boxSizing: 'border-box',
              cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {cancelText}
          </button>

          <button 
            type="button" 
            className="btn"
            onClick={handleConfirmClick}
            disabled={isSubmitting}
            style={{ 
              width: '100%',
              minWidth: 0,
              padding: '0.75rem 1rem',
              fontWeight: 700, 
              fontSize: '0.88rem',
              borderRadius: '12px',
              background: style.btnBg,
              boxShadow: style.btnShadow,
              color: style.btnColor,
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              justifyContent: 'center',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              textAlign: 'center',
              lineHeight: 1.25,
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner" />
                <span>Processing...</span>
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
