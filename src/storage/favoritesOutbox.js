const OUTBOX_KEY = 'iera.favorites.outbox.v1';

export function getOutbox() {
  try {
    const raw = window.localStorage.getItem(OUTBOX_KEY);
    const entries = raw === null ? [] : JSON.parse(raw);
    if (!Array.isArray(entries)) throw new Error('Format antrean tidak valid.');
    return entries;
  } catch (error) {
    throw new Error(`Antrean sinkronisasi tidak dapat dibaca: ${error.message}`);
  }
}

function saveOutbox(entries) {
  try {
    window.localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  } catch (error) {
    throw new Error(`Antrean perubahan tidak dapat disimpan: ${error.message}`);
  }
}

export function enqueue(operation) {
  const entries = getOutbox();
  const entry = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    queuedAt: new Date().toISOString()
  };
  saveOutbox([...entries, entry]);
  return entry.id;
}

export function removeOutboxEntry(id) {
  saveOutbox(getOutbox().filter((entry) => entry.id !== id));
}
