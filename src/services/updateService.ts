/**
 * Update Service
 *
 * Provides auto-update functionality using Tauri's updater plugin.
 * Supports checking for updates, downloading, and installing automatically.
 */

import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateInfo {
  version: string;
  currentVersion: string;
  date?: string;
  body?: string;
}

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'upToDate'
  | 'error';

export interface UpdateState {
  status: UpdateStatus;
  info?: UpdateInfo;
  error?: string;
  downloadProgress?: number;
}

class UpdateService {
  private listeners: Set<(state: UpdateState) => void> = new Set();
  private currentState: UpdateState = { status: 'idle' };

  /**
   * Subscribe to update state changes
   */
  subscribe(listener: (state: UpdateState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.currentState);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  private notify(state: UpdateState) {
    this.currentState = state;
    this.listeners.forEach(listener => listener(state));
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      this.notify({ status: 'checking' });

      const update = await check();

      if (!update) {
        this.notify({ status: 'upToDate' });
        return null;
      }

      if (update.available) {
        const updateInfo: UpdateInfo = {
          version: update.version,
          currentVersion: update.currentVersion,
          date: update.date,
          body: update.body,
        };

        this.notify({
          status: 'available',
          info: updateInfo,
        });

        // Automatically download and install
        await this.downloadAndInstall();

        return updateInfo;
      } else {
        this.notify({ status: 'upToDate' });
        return null;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.notify({
        status: 'error',
        error: errorMessage,
      });
      console.error('Update check failed:', error);
      return null;
    }
  }

  /**
   * Download and install the update
   */
  private async downloadAndInstall(): Promise<void> {
    try {
      this.notify({ ...this.currentState, status: 'downloading' });

      const update = await check();

      if (!update || !update.available) {
        return;
      }

      // Download with progress tracking
      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            console.log(`Download started. Size: ${contentLength} bytes`);
            break;
          case 'Progress':
            downloaded += event.data.chunkLength;
            const progress = contentLength > 0 ? (downloaded / contentLength) * 100 : 0;
            this.notify({
              ...this.currentState,
              status: 'downloading',
              downloadProgress: Math.round(progress),
            });
            console.log(`Download progress: ${Math.round(progress)}%`);
            break;
          case 'Finished':
            console.log('Download finished');
            break;
        }
      });

      // Update is ready
      this.notify({ ...this.currentState, status: 'ready' });

      // Automatically relaunch to apply update
      console.log('Relaunching to apply update...');
      await relaunch();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.notify({
        status: 'error',
        error: errorMessage,
      });
      console.error('Update download/install failed:', error);
    }
  }

  /**
   * Get current update state
   */
  getState(): UpdateState {
    return this.currentState;
  }
}

// Export singleton instance
export const updateService = new UpdateService();
