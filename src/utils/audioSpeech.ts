// Voice and Audio Notification Utility for REKAPIN AJA

// Play a pleasant welcome chime tone using Web Audio API
export const playChime = (type: 'welcome' | 'logout' = 'welcome') => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    if (type === 'welcome') {
      // Pleasant harmonious ascending chord (C5 - E5 - G5 - C6)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } else {
      // Soft gentle descending chord (G5 - E5 - C5)
      const freqs = [783.99, 659.25, 523.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0, now + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.10, now + idx * 0.09 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.5);
      });
    }
  } catch (err) {
    console.debug('Web Audio not supported or blocked:', err);
  }
};

// Find the best Indonesian voice available in the browser
const getIndonesianVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Prioritize Indonesian voices (id-ID, Indonesian)
  const idVoice = voices.find(
    (v) =>
      v.lang.toLowerCase().includes('id-id') ||
      v.lang.toLowerCase().includes('id_id') ||
      v.lang.toLowerCase().startsWith('id') ||
      v.name.toLowerCase().includes('indonesia') ||
      v.name.toLowerCase().includes('damayanti') ||
      v.name.toLowerCase().includes('gadis')
  );

  return idVoice || voices[0] || null;
};

// Speak text in clear, firm, and pleasant Indonesian voice
export const speakIndonesian = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    // Cancel any previous speaking to prevent overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 0.95; // Clear, articulate, firm yet calm pace
    utterance.pitch = 1.05; // Slightly pleasant and welcoming tone
    utterance.volume = 1.0;

    const voice = getIndonesianVoice();
    if (voice) {
      utterance.voice = voice;
    }

    // Workaround for Chrome bug where speechSynthesis might pause on long utterances
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.debug('SpeechSynthesis error:', err);
  }
};

/**
 * Play welcome sound and voice announcement:
 * "Selamat Datang [Nama User] di aplikasi REKAPIN AJA"
 */
export const playWelcomeVoice = (username: string) => {
  playChime('welcome');
  
  // Format clean display name
  const cleanName = username.trim() || 'Pengguna';
  const welcomeText = `Selamat Datang ${cleanName} di aplikasi Rekapin Aja`;

  // Slight delay so the pleasant chime begins just before the voice speaks
  setTimeout(() => {
    speakIndonesian(welcomeText);
  }, 250);
};

/**
 * Play logout sound and voice announcement:
 * "Anda telah keluar dari aplikasi"
 */
export const playLogoutVoice = () => {
  playChime('logout');
  
  const logoutText = 'Anda telah keluar dari aplikasi';

  setTimeout(() => {
    speakIndonesian(logoutText);
  }, 200);
};
