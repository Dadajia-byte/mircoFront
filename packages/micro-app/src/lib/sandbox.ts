export class MicroAppSandbox {
  appName: string;
  container: HTMLElement;
  proxy: WindowProxy;
  styles: string[];
  shadowRoot: ShadowRoot | null;

  constructor(appName: string, container: HTMLElement) {
    this.appName = appName;
    this.container = container;
    this.proxy = this.createProxy();
    this.styles = [];
    this.shadowRoot = null;
  }

  createProxy(): WindowProxy {
    const appName = this.appName;
    return new Proxy(window, {
      get(target, key) {
        if (key === 'fetch') {
          return (url: string, options: {}) => fetch(url, {...options, mode: 'cors', credentials: 'same-origin' });
        }
        return Reflect.get(target, key);
      },
      set(target, key, value) {
        if (typeof key === 'string' && !key.startsWith('__MICRO_APP__CASMADE')) {
          (target as any)[`__MICRO_APP__CASMADE__${appName}_${key}`] = value;
          return true;
        }
        return Reflect.set(target, key, value);
      }
    });
  }

  async loadApp(url: string) {
    try {
      // 确保旧的 shadowRoot 被完全清理
      await this.unmount();
      
      // 检查容器是否已经有 shadowRoot
      if (this.container.shadowRoot) {
        console.warn('[MicroApp] Container already has a shadow root, removing it...');
        // @ts-ignore - 强制移除 shadowRoot
        this.container.shadowRoot = null;
      }

      const html = await this.fetchText(url);
      this.shadowRoot = this.container.attachShadow({ mode: 'open' });
      const processedHtml = this.processHtml(html);
      this.shadowRoot.innerHTML = processedHtml;

      // 添加调试信息
      console.debug('[MicroApp] Shadow DOM created:', this.shadowRoot);

      const scriptTags = this.shadowRoot.querySelectorAll('script');
      for (const script of Array.from(scriptTags)) {
        await this.executeScript(script as HTMLScriptElement);
      }
    } catch (error) {
      console.error(`[MicroApp] Error loading app ${this.appName}:`, error);
    }
  }

  async fetchText(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.text();
  }

  processHtml(html: string): string {
    const baseUrl = this.getBaseUrl(html);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const styles = doc.querySelectorAll('style, link[rel="stylesheet"]');
    for (const style of Array.from(styles)) {
      if (style.tagName === 'STYLE') {
        this.styles.push(style.textContent || '');
      } else {
        const href = new URL((style as HTMLLinkElement).href, baseUrl).href;
        this.styles.push(`@import url('${href});`);
      }
      style.remove();
    }
    const scripts = doc.querySelectorAll('script');
    for (const script of Array.from(scripts)) {
      if ((script as HTMLScriptElement).src) {
        (script as HTMLScriptElement).src = new URL((script as HTMLScriptElement).src, baseUrl).href;
      }
    }
    let processedHtml = '';
    if (doc.head) processedHtml += doc.head.innerHTML;
    if (doc.body) processedHtml += doc.body.innerHTML;
    processedHtml = `<style id="micro-app-casmade-styles">${this.styles.join('\n')}</style>${processedHtml}`;
    return processedHtml;
  }

  getBaseUrl(html: string) {
    const baseTagMatch = html.match(/<base\s+href=["']([^"']+)["']/i);
    if (baseTagMatch) return baseTagMatch[1];
    return window.location.href;
  }

  async executeScript(script: HTMLScriptElement) {
    try {
      let code = '';
      if (script.src) {
        code = await this.fetchText(script.src);
      } else {
        code = script.textContent || '';
      }

      // 移除可能存在的 import/export 语句
      code = this.processModuleCode(code);
      return this.runInSandbox(code);
    } catch (error) {
      console.error('[MicroApp] Script execution error:', error);
    }
  }

  processModuleCode(code: string): string {
    // 修复正则表达式
    return code
      .replace(/import[\s\S]*?['"]\s*;?/g, '') // 更安全的 import 语句匹配
      .replace(/export[\s\S]*?['"]\s*;?/g, ''); // 更安全的 export 语句匹配
  }

 runInSandbox(code: string) {
    return new Promise((resolve, reject) => {
      try {
        const wrappedCode = `
          (function(window) {
            try {
              with(window) {
                ${code}
              }
              return true;
            } catch(e) {
              console.error('[MicroApp] Script execution error:', e);
              return false;
            }
          })(this.proxy);
        `;

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = wrappedCode;
        
        // 使用临时容器执行脚本
        const container = document.createElement('div');
        container.style.display = 'none';
        document.body.appendChild(container);
        
        script.onload = () => {
          container.remove();
          resolve(true);
        };
        script.onerror = (err) => {
          container.remove();
          reject(err);
        };
        
        container.appendChild(script);
      } catch (error) {
        console.error('[MicroApp] Error in runInSandbox:', error);
        reject(error);
      }
    });
  }
  async unmount() {
    if (this.shadowRoot) {
      // 移除所有子节点
      this.shadowRoot.innerHTML = '';
      
      // 清理全局变量
      Object.keys(window).forEach(key => {
        if (key.startsWith(`__MICRO_APP__CASMADE__${this.appName}_`)) {
          delete (window as any)[key];
        }
      });

      // 重置 shadowRoot
      this.shadowRoot = null;
    }
    
    return Promise.resolve();
  }
}