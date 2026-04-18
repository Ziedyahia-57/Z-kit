// utils/soundUtils.js
class SoundManager {
  constructor() {
    this.sounds = new Map();
    this.globalEnabled = true;
    this.globalVolume = 1;
  }

  loadSound(key, src, volume = 1) {
    if (!this.sounds.has(key)) {
      const audio = new Audio(src);
      audio.volume = volume;
      this.sounds.set(key, audio);
    }
    return this.sounds.get(key);
  }

  play(key, volume = null) {
    if (!this.globalEnabled) return;

    const sound = this.sounds.get(key);
    if (sound) {
      sound.currentTime = 0;
      if (volume !== null) {
        sound.volume = volume;
      }
      sound.play().catch((err) => console.warn("Sound playback failed:", err));
    }
  }

  setGlobalEnabled(enabled) {
    this.globalEnabled = enabled;
  }

  setGlobalVolume(volume) {
    this.globalVolume = volume;
    this.sounds.forEach((sound) => {
      sound.volume = volume;
    });
  }
}

export const soundManager = new SoundManager();
