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
      const html = await this.fetchText(url);
      this.shadowRoot = this.container.attachShadow({ mode: 'open' });
      const processedHtml = this.processHtml(html);
      this.shadowRoot.innerHTML = processedHtml;
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
    if (script.src) {
      const code = await this.fetchText(script.src);
      return this.runInSandbox(code);
    } else {
      return this.runInSandbox(script.textContent || '');
    }
  }

  runInSandbox(code: string) {
    // 更强隔离建议使用with（proxy）包裹
    const wrappedCode = `
      (function(window) {
        try {
          with(window){ ${code} }
        } catch(e) {
          console.error('[MicroApp] Error executing script in sandbox:', e);
        }
      })(this.proxy))`;
    const script = document.createElement('script');
    script.text = wrappedCode;
    this.shadowRoot?.appendChild(script);
    script.remove();
    return true;
  }
  unmount() {
    if (this.shadowRoot) {
      while (this.shadowRoot.firstChild) {
        this.shadowRoot.removeChild(this.shadowRoot.firstChild);
      }
    }
    Object.keys(window).forEach(key => {
      if (key.startsWith(`__MICRO_APP__CASMADE__${this.appName}_`)) {
        delete (window as any)[key];
      }
    })
  }
}