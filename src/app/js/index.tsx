import { render } from 'preact';
import { ActWidget } from '@datenanfragen/components';

const App = () => (
    <>
        <button
            className="button button-secondary"
            onClick={() =>
                window.email
                    .sendMessage({
                        from: 'hi@example.org',
                        to: 'hudson.kunze77@ethereal.email',
                        subject: 'Hello world',
                        text: 'How is it going?',
                    })
                    .then((info) => console.log(info))
            }
        >
            Send demo email
        </button>
        <ActWidget requestTypes={['access', 'erasure']} company="datenanfragen" transportMedium="email" />
    </>
);

const el = document.getElementById('app');
if (el) render(<App />, el);

// TODO: Error handler.
const logError = (err: ErrorEvent | PromiseRejectionEvent) => {
    // Work around annoying Chromium bug, see: https://stackoverflow.com/q/72396527
    if ('defaultPrevented' in err && !err.defaultPrevented) console.error('An error occurred:', err);
};
window.addEventListener('unhandledrejection', logError);
window.addEventListener('error', logError);
