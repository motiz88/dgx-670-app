import '../styles/globals.css';
import type { AppProps } from 'next/app';
import MidiAccessProvider from '../components/MidiAccessProvider';
import AnnouncementsProvider from '../components/AnnouncementsProvider';
import { InputModeProvider } from '../utils/useInputMode';
import { MidiConfigProvider } from '../components/MidiConfig';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MidiAccessProvider>
      <InputModeProvider>
        <MidiConfigProvider>
          <AnnouncementsProvider>
            <Component {...pageProps} />
          </AnnouncementsProvider>
        </MidiConfigProvider>
      </InputModeProvider>
    </MidiAccessProvider>
  );
}
export default MyApp;
