export function createMainTemplate() {
  return `
    <div class="widget-container">
      <div class="widget-modal">
        <div class="widget-header">
          <div class="widget-title">
            <div class="widget-logo">IS</div>
            <span>Upload Files</span>
          </div>
          <button class="close-btn" id="closeBtn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"/>
            </svg>
          </button>
        </div>

        <div class="widget-body">
          <div class="upload-area" id="uploadArea">
            <div class="upload-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div class="upload-text">Drag & drop files here</div>
            <div class="upload-hint">or click to browse from your device</div>
            <button class="upload-btn" id="browseBtn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Choose Files
            </button>
            <input type="file" class="file-input" id="fileInput" multiple />
          </div>

          <div id="constraintsInfo"></div>
          <div id="errorMessage"></div>
          <div class="file-list" id="fileList"></div>
        </div>

        <div class="widget-footer">
          <div class="footer-info">
            <span id="fileCount">No files selected</span>
          </div>
          <div class="footer-actions">
            <button class="btn-secondary" id="clearBtn">Clear All</button>
            <button class="btn-primary" id="uploadAllBtn" disabled>Upload All</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function createFileItemTemplate(file, id) {
  const icon = getFileIcon(file.type);
  return `
    <div class="file-item" data-file-id="${id}">
      <div class="file-info">
        <div class="file-icon">${icon}</div>
        <div class="file-details">
          <div class="file-name" title="${file.name}">${file.name}</div>
          <div class="file-size">${formatBytes(file.size)}</div>
        </div>
        <div class="file-actions">
          <button class="action-btn remove-btn" data-action="remove" data-file-id="${id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="progress-container" style="display: none;">
        <div class="progress-bar">
          <div class="progress-fill" style="width: 0%"></div>
        </div>
        <div class="progress-text">Uploading... 0%</div>
      </div>
      <div class="status-container" style="display: none;"></div>
    </div>
  `;
}

function getFileIcon(mimeType) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  if (mimeType.includes('text')) return '📝';
  return '📁';
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}