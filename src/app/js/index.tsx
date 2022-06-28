import { render } from 'preact';
import { ActWidget } from '@datenanfragen/components';

const App = () => (
    <>
        <ActWidget requestTypes={['access', 'erasure']} company="datenanfragen" transportMedium="email" />
    </>
);

const el = document.getElementById('app');
if (el) render(<App />, el);

// TODO: Error handler.
const logError = (err: unknown) => console.error('An error occurred:', err);
window.addEventListener('unhandledrejection', logError);
window.addEventListener('error', logError);
