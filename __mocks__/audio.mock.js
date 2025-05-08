class MockAudio {
    constructor() {
      this.paused = true;
      this.currentTime = 0;
      this.duration = 180; // Default duration (3 minutes)
      this.volume = 0.7;
      this._listeners = {};
    }
  
    play() {
      this.paused = false;
      if (this._listeners['play']) this._listeners['play']();
      return Promise.resolve();
    }
  
    pause() {
      this.paused = true;
      if (this._listeners['pause']) this._listeners['pause']();
    }
  
    addEventListener(event, callback) {
      this._listeners[event] = callback;
    }
  
    removeEventListener(event) {
      delete this._listeners[event];
    }
  }
  
  global.Audio = MockAudio;