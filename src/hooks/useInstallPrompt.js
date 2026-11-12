import { useEffect, useState } from 'react';

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault();
      setPromptEvent(event);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const install = async () => {
    if (!promptEvent) return false;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    setPromptEvent(null);
    return choice.outcome === 'accepted';
  };

  return { canInstall: Boolean(promptEvent), installed, install };
}
