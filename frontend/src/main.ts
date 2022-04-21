import './style.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (app === null) {
  throw new Error('Set #app to <div>');
}

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`;
