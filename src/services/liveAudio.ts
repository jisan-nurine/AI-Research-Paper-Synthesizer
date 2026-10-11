/**
 * Real-time Voice Live API client (gemini-3.8-live)
 * Manages WebSocket bridge, 16kHz microphone stream capture, and 24kHz audio playback
 */

export class LiveVoiceClient {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isConnected = false;
  private isMuted = false;
  private audioQueue: AudioBuffer[] = [];
  private isPlaying = false;
  private nextPlayTime = 0;

  public onStatusChange?: (status: 'disconnected' | 'connecting' | 'connected' | 'error', message?: string) => void;
  public onTranscript?: (text: string) => void;
  public onVolumeChange?: (level: number) => void;

  async start() {
    try {
      this.onStatusChange?.('connecting', 'Connecting to Gemini 3.8 Live API...');
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = async () => {
        console.log('Live API WebSocket opened');
        await this.initMicrophone();
        this.isConnected = true;
        this.onStatusChange?.('connected', 'Live voice session active');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'audio' && data.audio) {
            this.playPcmChunk(data.audio);
          } else if (data.type === 'text' && data.text) {
            this.onTranscript?.(data.text);
          } else if (data.type === 'interrupted') {
            this.stopPlayback();
          } else if (data.type === 'error') {
            this.onStatusChange?.('error', data.error);
          }
        } catch (e) {
          console.error('Error handling live message:', e);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.cleanup();
        this.onStatusChange?.('disconnected', 'Voice session ended');
      };

      this.ws.onerror = (err) => {
        console.error('Live WS error:', err);
        this.onStatusChange?.('error', 'Connection to voice agent failed');
      };
    } catch (err: any) {
      this.onStatusChange?.('error', err.message || 'Mic access or connection failed');
      this.cleanup();
    }
  }

  private async initMicrophone() {
    this.inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
    this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);
    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.inputAudioCtx.destination);

    this.scriptProcessor.onaudioprocess = (e) => {
      if (!this.isConnected || this.isMuted || !this.ws || this.ws.readyState !== WebSocket.OPEN) return;

      const inputData = e.inputBuffer.getChannelData(0);
      
      // Compute RMS volume for UI visualizer
      let sum = 0;
      for (let i = 0; i < inputData.length; i++) {
        sum += inputData[i] * inputData[i];
      }
      const rms = Math.sqrt(sum / inputData.length);
      this.onVolumeChange?.(Math.min(1, rms * 5));

      // Convert Float32Array to 16-bit PCM
      const pcm16 = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        const s = Math.max(-1, Math.min(1, inputData[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }

      // Convert to base64
      let binary = '';
      const bytes = new Uint8Array(pcm16.buffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      this.ws.send(JSON.stringify({ type: 'audio', audio: base64Audio }));
    };
  }

  sendTextMessage(text: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'text', text }));
    }
  }

  private playPcmChunk(base64Audio: string) {
    if (!this.outputAudioCtx) return;

    try {
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.outputAudioCtx.destination);

      const currentTime = this.outputAudioCtx.currentTime;
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;
    } catch (err) {
      console.error('Error playing raw PCM chunk:', err);
    }
  }

  private stopPlayback() {
    this.nextPlayTime = 0;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  stop() {
    this.cleanup();
  }

  private cleanup() {
    this.isConnected = false;
    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    if (this.inputAudioCtx) {
      this.inputAudioCtx.close().catch(() => {});
      this.inputAudioCtx = null;
    }
    if (this.outputAudioCtx) {
      this.outputAudioCtx.close().catch(() => {});
      this.outputAudioCtx = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
