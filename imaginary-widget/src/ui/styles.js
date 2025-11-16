export const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :host {
    --primary: #6366f1;
    --primary-dark: #4f46e5;
    --primary-light: #818cf8;
    --success: #10b981;
    --error: #ef4444;
    --warning: #f59e0b;
    --bg: #ffffff;
    --bg-secondary: #f9fafb;
    --border: #e5e7eb;
    --text: #111827;
    --text-secondary: #6b7280;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .widget-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    animation: fadeIn 0.2s ease;
    opacity: 1;
    display: none;
  }

  .widget-container.visible {
  display:flex;
    opacity: 1;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .widget-modal {
    background: var(--bg);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow: hidden;
    animation: slideUp 0.3s ease;
    transform: translateY(20px);
  }

  .widget-container.visible .widget-modal {
    transform: translateY(0);
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .widget-header {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .widget-title {
    font-size: 20px;
    font-weight: 600;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .widget-logo {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 16px;
  }

  .close-btn {
    background: transparent;
    border: none;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: var(--bg-secondary);
    color: var(--text);
  }

  .widget-body {
    padding: 24px;
    max-height: calc(90vh - 180px);
    overflow-y: auto;
  }

  .upload-area {
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
    background: var(--bg-secondary);
    position: relative;
    overflow: hidden;
  }

  .upload-area::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent);
    transition: left 0.5s;
  }

  .upload-area:hover::before {
    left: 100%;
  }

  .upload-area:hover {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.05);
    transform: translateY(-2px);
  }

  .upload-area.drag-over {
    border-color: var(--primary);
    background: rgba(99, 102, 241, 0.1);
    transform: scale(1.02);
  }

  .upload-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 16px;
    background: linear-gradient(135deg, var(--primary), var(--primary-light));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
  }

  .upload-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 8px;
  }

  .upload-hint {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .upload-btn {
    background: var(--primary);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .upload-btn:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .upload-btn:active {
    transform: translateY(0);
  }

  .file-input {
    display: none;
  }

  .file-list {
    margin-top: 24px;
  }

  .file-item {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    animation: slideIn 0.3s ease;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
  }

  .file-icon {
    width: 40px;
    height: 40px;
    background: var(--primary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    flex-shrink: 0;
  }

  .file-details {
    flex: 1;
    min-width: 0;
  }

  .file-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .file-size {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .file-actions {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    background: transparent;
  }

  .action-btn:hover {
    background: var(--bg);
  }

  .remove-btn {
    color: var(--error);
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--bg);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    border-radius: 3px;
    transition: width 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .progress-text {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 8px;
    text-align: center;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
  }

  .status-success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--success);
  }

  .status-error {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error);
  }

  .status-uploading {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
  }

  .error-message {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid var(--error);
    color: var(--error);
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .constraints-info {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 12px 16px;
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .constraints-info strong {
    color: var(--text);
  }

  .widget-footer {
    padding: 16px 24px;
    border-top: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .footer-info {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .footer-actions {
    display: flex;
    gap: 12px;
  }

  .btn-secondary {
    background: var(--bg-secondary);
    color: var(--text);
    border: 1px solid var(--border);
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-secondary:hover {
    background: var(--bg);
    border-color: var(--text-secondary);
  }

  .btn-primary {
    background: var(--primary);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    background: var(--primary-dark);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  .btn-primary:disabled {
    background: var(--border);
    cursor: not-allowed;
    box-shadow: none;
  }

  /* Scrollbar styles */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--bg-secondary);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--text-secondary);
  }
`;