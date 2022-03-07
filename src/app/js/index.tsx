import { render } from 'preact';

const App = () => <h1>Hello World!</h1>;

const el = document.getElementById('app');
if (el) render(<App />, el);
