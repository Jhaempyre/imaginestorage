import { styles } from './styles.js';
import { createMainTemplate, createFileItemTemplate } from './templates.js';

export class WidgetUI {
  constructor(core) {
    this.core = core;
    this.shadowRoot = null;
    this.container = null;
    this.isOpen = false;
    this.files = new Map(); // Map<fileId, { file, status, progress }>
    this.fileIdCounter = 0;
  }

  mount(targetElement) {
    // Create shadow DOM for style isolation
    const host = document.createElement('div');
    host.id = 'imaginary-widget-host';
    this.shadowRoot = host.attachShadow({ mode: 'open' });

    // Add styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    this.shadowRoot.appendChild(styleSheet);

    // Add HTML template
    const template = document.createElement('div');
    template.innerHTML = createMainTemplate();
    this.shadowRoot.appendChild(template.firstElementChild);

    // Append to target or body
    if (targetElement) {
      targetElement.appendChild(host);
    } else {
      document.body.appendChild(host);
    }

    this.container = this.shadowRoot.querySelector('.widget-container');
    this.setupEventListeners();
    this.displayConstraints();
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.shadowRoot.getElementById('closeBtn');
    closeBtn.addEventListener('click', () => this.close());

    // Click outside to close
    this.container.addEventListener('click', (e) => {
      if (e.target === this.container) {
        this.close();
      }
    });

    // Browse button
    const browseBtn = this.shadowRoot.getElementById('browseBtn');
    const fileInput = this.shadowRoot.getElementById('fileInput');
    browseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      fileInput.click();
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset input
    });

    // Drag and drop
    const uploadArea = this.shadowRoot.getElementById('uploadArea');
    
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', () => {
      uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    });

    // Clear all button
    const clearBtn = this.shadowRoot.getElementById('clearBtn');
    clearBtn.addEventListener('click', () => this.clearAllFiles());

    // Upload all button
    const uploadAllBtn = this.shadowRoot.getElementById('uploadAllBtn');
    uploadAllBtn.addEventListener('click', () => this.uploadAllFiles());

    // File list delegation for remove buttons
    const fileList = this.shadowRoot.getElementById('fileList');
    fileList.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-action="remove"]');
      if (removeBtn) {
        const fileId = parseInt(removeBtn.dataset.fileId);
        this.removeFile(fileId);
      }
    });
  }

  handleFiles(files) {
    const errorMessage = this.shadowRoot.getElementById('errorMessage');
    errorMessage.innerHTML = '';

    files.forEach(file => {
      // Validate file
      const validation = this.core.config.validateFile(file);
      
      if (!validation.valid) {
        this.showError(validation.errors.join(', '));
        return;
      }

      // Add file to list
      const fileId = this.fileIdCounter++;
      this.files.set(fileId, {
        file,
        status: 'pending',
        progress: 0
      });

      this.renderFileItem(fileId, file);
    });

    this.updateUI();
  }

  renderFileItem(fileId, file) {
    const fileList = this.shadowRoot.getElementById('fileList');
    const fileItemHTML = createFileItemTemplate(file, fileId);
    fileList.insertAdjacentHTML('beforeend', fileItemHTML);
  }

  removeFile(fileId) {
    this.files.delete(fileId);
    const fileItem = this.shadowRoot.querySelector(`[data-file-id="${fileId}"]`);
    if (fileItem) {
      fileItem.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => fileItem.remove(), 300);
    }
    this.updateUI();
  }

  clearAllFiles() {
    this.files.clear();
    const fileList = this.shadowRoot.getElementById('fileList');
    fileList.innerHTML = '';
    this.updateUI();
    this.clearError();
  }

  async uploadAllFiles() {
    const uploadAllBtn = this.shadowRoot.getElementById('uploadAllBtn');
    uploadAllBtn.disabled = true;
    uploadAllBtn.textContent = 'Uploading...';

    for (const [fileId, fileData] of this.files.entries()) {
      if (fileData.status === 'pending') {
        await this.uploadFile(fileId, fileData.file);
      }
    }

    uploadAllBtn.disabled = false;
    uploadAllBtn.textContent = 'Upload All';
    
    // Emit complete event
    this.core.emit('upload:complete', {
      total: this.files.size,
      successful: Array.from(this.files.values()).filter(f => f.status === 'success').length,
      failed: Array.from(this.files.values()).filter(f => f.status === 'error').length
    });
  }

  async uploadFile(fileId, file) {
    const fileData = this.files.get(fileId);
    fileData.status = 'uploading';
    
    const fileItem = this.shadowRoot.querySelector(`[data-file-id="${fileId}"]`);
    const progressContainer = fileItem.querySelector('.progress-container');
    const progressFill = fileItem.querySelector('.progress-fill');
    const progressText = fileItem.querySelector('.progress-text');
    const statusContainer = fileItem.querySelector('.status-container');

    progressContainer.style.display = 'block';

    this.core.emit('upload:start', { fileId, file });

    try {
      // Request upload token
      const token = await this.core.requestUploadToken();

      // Upload file with progress
      const result = await this.core.uploadFile(token, file, (progress) => {
        fileData.progress = progress;
        progressFill.style.width = `${progress}%`;
        progressText.textContent = `Uploading... ${Math.round(progress)}%`;
        
        this.core.emit('upload:progress', { fileId, file, progress });
      });

      // Success
      fileData.status = 'success';
      fileData.url = result.url;
      
      progressContainer.style.display = 'none';
      statusContainer.style.display = 'block';
      statusContainer.innerHTML = `
        <div class="status-badge status-success">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Uploaded
        </div>
      `;

      this.core.emit('upload:success', { fileId, file, url: result.url });

    } catch (error) {
      // Error
      fileData.status = 'error';
      fileData.error = error.message;
      
      progressContainer.style.display = 'none';
      statusContainer.style.display = 'block';
      statusContainer.innerHTML = `
        <div class="status-badge status-error">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          Failed
        </div>
      `;

      this.core.emit('upload:error', { fileId, file, error: error.message });
      this.showError(`Failed to upload ${file.name}: ${error.message}`);
    }
  }

  updateUI() {
    const fileCount = this.shadowRoot.getElementById('fileCount');
    const uploadAllBtn = this.shadowRoot.getElementById('uploadAllBtn');
    const clearBtn = this.shadowRoot.getElementById('clearBtn');

    const totalFiles = this.files.size;
    const pendingFiles = Array.from(this.files.values()).filter(f => f.status === 'pending').length;

    if (totalFiles === 0) {
      fileCount.textContent = 'No files selected';
      uploadAllBtn.disabled = true;
      clearBtn.disabled = true;
    } else {
      fileCount.textContent = `${totalFiles} file${totalFiles !== 1 ? 's' : ''} selected`;
      uploadAllBtn.disabled = pendingFiles === 0;
      clearBtn.disabled = false;
    }
  }

  displayConstraints() {
    const constraintsInfo = this.shadowRoot.getElementById('constraintsInfo');
    const config = this.core.config;

    if (config.maxFileSize || config.allowedMimeTypes) {
      let html = '<div class="constraints-info">';
      html += '<strong>Upload limits:</strong> ';
      
      const limits = [];
      if (config.maxFileSize) {
        limits.push(`Max size: ${config.formatBytes(config.maxFileSize)}`);
      }
      if (config.allowedMimeTypes && config.allowedMimeTypes.length > 0) {
        const types = config.allowedMimeTypes.map(t => t.split('/')[1]).join(', ');
        limits.push(`Allowed types: ${types}`);
      }
      
      html += limits.join(' • ');
      html += '</div>';
      
      constraintsInfo.innerHTML = html;
    }
  }

  showError(message) {
    const errorMessage = this.shadowRoot.getElementById('errorMessage');
    errorMessage.innerHTML = `
      <div class="error-message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        ${message}
      </div>
    `;
  }

  clearError() {
    const errorMessage = this.shadowRoot.getElementById('errorMessage');
    errorMessage.innerHTML = '';
  }

  open() {
    if (!this.isOpen) {
      this.isOpen = true;
      this.container.style.display = 'flex';
      // Trigger reflow
      this.container.offsetHeight;
      this.container.classList.add('visible');
      document.body.style.overflow = 'hidden';
      this.core.emit('widget:open');
    }
  }

  close() {
    if (this.isOpen) {
      this.isOpen = false;
      this.container.classList.remove('visible');
      setTimeout(() => {
        this.container.style.display = 'none';
        document.body.style.overflow = '';
      }, 200);
      this.core.emit('widget:close');
    }
  }

  destroy() {
    const host = this.shadowRoot?.host;
    if (host) {
      host.remove();
    }
    this.files.clear();
    this.core.emit('widget:destroy');
  }
}