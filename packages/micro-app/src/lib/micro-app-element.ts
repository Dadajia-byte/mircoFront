import { MicroAppSandbox } from './sandbox';
export class MicroAppELement extends HTMLElement {
  static get observedAttributes() {
    return ['name', 'url'];
  }

  sandbox: MicroAppSandbox | null = null;

  connectedCallback() {
    this.renderLoading();
    this.loadApp();
  }

  attributeChangedCallback(name: string, oldVal: string, newVal: string) {
    if (oldVal !== newVal) {
      this.renderLoading();
      this.loadApp();
    }
  }

  async loadApp() {
    const name = this.getAttribute('name');
    const url = this.getAttribute('url');

    if (!name || !url) {
      console.error('MicroApp requires both "name" and "url" attributes');
      return;
    }

    if (this.sandbox) {
      this.sandbox.unmount();
      this.sandbox = null;
    }

    this.sandbox = new MicroAppSandbox(name, this);
    await this.sandbox.loadApp(url);
  }

  renderLoading() {
    this.innerHTML = `
      <div style="
        display: flex; 
        justify-content: center; 
        align-items: center; 
        height: 100px;
        color: #7f8c8d;
        font-size: 1.1rem;
      ">
        正在加载微应用...
      </div>
    `;
  }
}

export function defineElement(tagName: string) {
  window.customElements.define(tagName, MicroAppELement);
}