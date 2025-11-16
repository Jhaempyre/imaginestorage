import { WidgetCore } from './core/WidgetCore.js';
import { WidgetUI } from './ui/WidgetUI.js';

class ImaginaryWidget {
  constructor() {
    this.core = null;
    this.ui = null;
    this.isInitialized = false;
  }

  async init(options) {
    if (this.isInitialized) {
      console.warn('Widget is already initialized');
      return this;
    }

    try {
      // Create core instance
      this.core = new WidgetCore(options);

      // Initialize core (fetch constraints)
      await this.core.initialize();

      // Create UI instance
      this.ui = new WidgetUI(this.core);

      // Mount UI
      this.ui.mount(options.mount || null);

      this.isInitialized = true;

      // Setup default event handlers if provided
      if (options.onSuccess) {
        this.core.on('upload:success', options.onSuccess);
      }

      if (options.onError) {
        this.core.on('upload:error', options.onError);
      }

      if (options.onProgress) {
        this.core.on('upload:progress', options.onProgress);
      }

      if (options.onComplete) {
        this.core.on('upload:complete', options.onComplete);
      }

      console.log('✅ ImaginaryWidget initialized successfully');
      return this;

    } catch (error) {
      console.error('❌ Failed to initialize ImaginaryWidget:', error);
      throw error;
    }
  }

  open() {
    if (!this.isInitialized) {
      console.error('Widget is not initialized. Call init() first.');
      return;
    }
    this.ui.open();
  }

  close() {
    if (!this.isInitialized) {
      return;
    }
    this.ui.close();
  }

  on(event, callback) {
    if (!this.isInitialized) {
      console.error('Widget is not initialized. Call init() first.');
      return;
    }
    return this.core.on(event, callback);
  }

  off(event, callback) {
    if (!this.isInitialized) {
      return;
    }
    this.core.off(event, callback);
  }

  destroy() {
    if (!this.isInitialized) {
      return;
    }

    this.ui.destroy();
    this.core.reset();
    this.isInitialized = false;
    console.log('🗑️ ImaginaryWidget destroyed');
  }

  getConstraints() {
    if (!this.isInitialized) {
      console.error('Widget is not initialized. Call init() first.');
      return null;
    }
    return this.core.getConstraints();
  }
}

// Export as global variable
if (typeof window !== 'undefined') {
  window.ImaginaryWidget = ImaginaryWidget;
}

// Export for module systems
export default ImaginaryWidget;