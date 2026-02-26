import React, { useState, useEffect, useRef } from 'react';

// Secure IPC via contextBridge (window.ppapi)
const { ppapi } = window;
import { supabase, getUserEntitlements, signOut } from './supabase';

const PREMIUM_FONT = "'Segoe UI', 'Inter', system-ui, -apple-system, sans-serif";

// --- Helper Functions ---

function formatRelativeTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function sanitizeText(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function isSensitiveContent(text) {
    const sensitivePatterns = [
        /password/i, /secret/i, /api[_-]?key/i, /token/i,
        /credit[_-]?card/i, /ssn/i,
        /\b\d{3}-\d{2}-\d{4}\b/,
        /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,
    ];
    return sensitivePatterns.some(pattern => pattern.test(text));
}

// --- Components ---

function WidgetViewer() {
    const [text, setText] = useState('');
    const [speed, setSpeed] = useState(1.0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [storeHistory, setStoreHistory] = useState(true);
    const [alwaysOnTop, setAlwaysOnTop] = useState(true);
    const [isSeekMode, setIsSeekMode] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voices, setVoices] = useState([]);
    const [currentHotkey, setCurrentHotkey] = useState('Ctrl+Alt+R');
    const [user, setUser] = useState(null);
    const [plan, setPlan] = useState('free');

    // Highlighting State
    const [currentWordIndex, setCurrentWordIndex] = useState(-1);
    const [currentCharIndex, setCurrentCharIndex] = useState(-1);
    const [rewindDuration, setRewindDuration] = useState(10);
    const [toast, setToast] = useState(null);
    const synthRef = useRef(window.speechSynthesis);
    const utteranceRef = useRef(null);
    const textAreaRef = useRef(null);
    const isPlayingRef = useRef(false);
    const playbackIdRef = useRef(0);

    // Keep ref in sync with state for async checks
    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    // Load voices on mount
    useEffect(() => {
        const loadVoices = () => {
            const systemVoices = synthRef.current.getVoices().map(v => ({ name: v.name, uri: v.voiceURI || v.name }));
            const kokoroVoices = [
                { name: 'Bella (AI)', uri: 'piper-af_bella', voiceURI: 'piper-af_bella', lang: 'en-US' }
            ];

            console.log(`[Renderer] System voices loaded: ${systemVoices.length}`);
            setVoices([...kokoroVoices, ...systemVoices]);

            // Wait for store to load before deciding on default
            ppapi.invoke('store-get', 'voice').then(saved => {
                if (!saved && !selectedVoice) {
                    setSelectedVoice('piper-af_bella');
                }
            });
        };

        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices;
        }

        loadVoices();
    }, []);

    // Load initial settings
    useEffect(() => {
        const load = async () => {
            const savedSpeed = await ppapi.invoke('store-get', 'speed');
            const savedVoiceURI = await ppapi.invoke('store-get', 'voice');
            const savedStoreHistory = await ppapi.invoke('store-get', 'storeHistory');
            const savedAlwaysOnTop = await ppapi.invoke('store-get', 'alwaysOnTop');
            const savedRewind = await ppapi.invoke('store-get', 'rewindDuration');
            if (savedSpeed !== undefined) setSpeed(savedSpeed);
            if (savedVoiceURI) {
                // Migrate old kokoro- prefix to piper-
                const migratedVoice = savedVoiceURI.startsWith('kokoro-')
                    ? savedVoiceURI.replace('kokoro-', 'piper-')
                    : savedVoiceURI;
                setSelectedVoice(migratedVoice);
                if (migratedVoice !== savedVoiceURI) {
                    ppapi.invoke('store-set', 'voice', migratedVoice);
                }
            }
            if (savedStoreHistory !== undefined) setStoreHistory(savedStoreHistory);
            if (savedAlwaysOnTop !== undefined) setAlwaysOnTop(savedAlwaysOnTop);
            if (savedRewind !== undefined) setRewindDuration(savedRewind);

            const savedHotkey = await ppapi.invoke('get-current-hotkey');
            if (savedHotkey) setCurrentHotkey(savedHotkey.replace('CommandOrControl', 'Ctrl'));
        };
        load();
    }, []);

    // Auth State Hook
    useEffect(() => {
        if (supabase) {
            supabase.auth.getSession().then(({ data: { session } }) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    getUserEntitlements(session.user.id).then(ent => setPlan(ent.plan));
                }
            });
        }

        if (!supabase) return;

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                getUserEntitlements(session.user.id).then(ent => setPlan(ent.plan));
            } else {
                setPlan('free');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Listen for updates from Settings Window
    useEffect(() => {
        const handleStoreUpdate = (event, key, value) => {
            if (key === 'speed') setSpeed(value);
            if (key === 'voice') setSelectedVoice(value);
            if (key === 'alwaysOnTop') setAlwaysOnTop(value);
            if (key === 'storeHistory') setStoreHistory(value);
            if (key === 'rewindDuration') setRewindDuration(value);
            if (key === 'captureHotkey') setCurrentHotkey(value.replace('CommandOrControl', 'Ctrl'));
        };

        const unsubscribe = ppapi.on('store-updated', handleStoreUpdate);
        return () => unsubscribe();
    }, []);

    // Listen for text from Main (Hotkey Trigger)
    useEffect(() => {
        const handleShowAndRead = (event, incomingText) => {
            setText(incomingText);
            // Wait for state to settle, then speak. 
            // We use a tiny timeout or just call speak with the text.
            setTimeout(() => speak(0, incomingText), 50);
        };
        const unShowAndRead = ppapi.on('show-and-read', handleShowAndRead);
        const unShowError = ppapi.on('show-error', handleShowError);

        return () => {
            unShowAndRead();
            unShowError();
        };
    }, [selectedVoice, speed, plan]); // Dependencies needed for speak() inside listener

    // Listen for deep links (Magic Link redirect)
    useEffect(() => {
        const handleDeepLink = async (event, url) => {
            console.log('[Renderer] Received deep link:', url);
            // URL format: pasteplay://auth#access_token=...&refresh_token=...
            if (url.includes('#access_token=')) {
                try {
                    const hash = url.split('#')[1];
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        });

                        if (error) throw error;
                        setToast({ message: "Successfully logged in via magic link!", type: "success" });
                        setTimeout(() => setToast(null), 3000);
                    }
                } catch (err) {
                    console.error('[Renderer] Deep link auth error:', err);
                    setToast({ message: "Auth failed: " + err.message, type: "error" });
                    setTimeout(() => setToast(null), 3000);
                }
            }
        };

        const unsubscribeDeep = ppapi.on('deep-link', handleDeepLink);
        return () => unsubscribeDeep();
    }, []);

    // Listen for stop requests from Main (e.g. hotkey triggered)
    useEffect(() => {
        const stopHandler = () => handleStop();
        const unsubscribeStop = ppapi.on('stop-speaking-request', stopHandler);
        return () => unsubscribeStop();
    }, []);

    // Main Playback Logic
    const speak = (startIndex = 0, textOverride = null) => {
        // Increment playback ID to invalidate any previous pending requests
        const currentId = ++playbackIdRef.current;

        // Stop EVERYTHING locally before starting a new speak request.
        handleStop(true);

        // ONLY proceed if this is still the active request
        if (currentId !== playbackIdRef.current) return;
        const targetText = textOverride !== null ? textOverride : text;
        startSpeaking(startIndex, targetText, currentId);
    };

    const startSpeaking = (startIndex, targetText, currentId) => {
        if (!targetText || !targetText.trim()) return;

        // Gating: Enforce 2000 character HARD CAP for free users
        let textToSpeak = targetText.substring(startIndex);
        if (plan === 'free' && targetText.length > 2000) {
            const cappedText = targetText.substring(0, 2000);
            if (startIndex >= 2000) {
                setToast({ message: "Free tier limit reached. Upgrade to Pro for unlimited.", type: "warning" });
                setTimeout(() => setToast(null), 3000);
                return;
            }
            setToast({ message: "Free tier: Limited to first 2,000 characters.", type: "warning" });
            setTimeout(() => setToast(null), 3000);
            textToSpeak = cappedText.substring(startIndex);
        }
        if (!textToSpeak || !textToSpeak.trim()) return;

        console.log(`[Diagnostic] Speak called. selectedVoice: "${selectedVoice}" (ID: ${currentId})`);

        // Handle dual-mode speaking: AI voices via Piper (main process), system voices via Web Speech API
        if (selectedVoice && selectedVoice.startsWith('piper-')) {
            if (plan === 'free') {
                setToast({ message: "Bella AI is a Pro feature. Falling back to system voice...", type: "warning" });
                setTimeout(() => setToast(null), 3000);
                // Continue execution to the system voice logic below by NOT returning
            } else {
                const voiceId = selectedVoice.replace('piper-', '');
                setIsPlaying(true);
                isPlayingRef.current = true; // Sync ref immediately
                setToast({ message: 'Generating AI speech...', type: 'info' });

                ppapi.invoke('tts-speak', textToSpeak, voiceId, speed).then((result) => {
                    setToast(null);

                    // CRITICAL: If a NEW request started while we were waiting, DISCARD this audio.
                    if (currentId !== playbackIdRef.current) {
                        console.log(`[App] Discarding stale AI audio (expected ID ${playbackIdRef.current}, got ${currentId})`);
                        return;
                    }

                    if (result.error || !isPlayingRef.current) {
                        if (result.error) {
                            setToast({ message: result.error, type: 'warning' });
                            setTimeout(() => setToast(null), 4000);
                        }
                        setIsPlaying(false);
                        isPlayingRef.current = false;
                        return;
                    }

                    // Stop any existing system speech one last time
                    if (synthRef.current) synthRef.current.cancel();

                    // Play the WAV datalink returned by Piper
                    const audio = new Audio(result.audioDataUrl);
                    window._piperAudio = audio; // Store reference for stop
                    audio.playbackRate = 1.0;

                    // --- Real-time Highlighting for AI ---
                    audio.onloadedmetadata = () => {
                        if (window._piperTimer) clearInterval(window._piperTimer);

                        const charCount = textToSpeak.length;
                        const duration = audio.duration;
                        if (!duration || isNaN(duration)) return;

                        window._piperTimer = setInterval(() => {
                            // Double check currentId during playback too
                            if (currentId !== playbackIdRef.current || !audio || audio.paused || audio.ended) return;

                            const progress = audio.currentTime / duration;
                            const estimateIndex = Math.floor(progress * charCount);

                            if (estimateIndex < charCount) {
                                setCurrentCharIndex(startIndex + estimateIndex);
                            }
                        }, 50);
                    };

                    audio.onended = () => {
                        // Only update state if this is still the active playback
                        if (currentId === playbackIdRef.current) {
                            setIsPlaying(false);
                            isPlayingRef.current = false;
                            setCurrentCharIndex(-1);
                        }
                        window._piperAudio = null;
                        if (window._piperTimer) {
                            clearInterval(window._piperTimer);
                            window._piperTimer = null;
                        }
                    };

                    audio.onerror = (e) => {
                        console.error('[App] Audio playback error:', e);
                        if (currentId === playbackIdRef.current) {
                            setIsPlaying(false);
                            isPlayingRef.current = false;
                            setToast({ message: 'Audio playback failed', type: 'warning' });
                            setTimeout(() => setToast(null), 3000);
                        }
                        if (window._piperTimer) {
                            clearInterval(window._piperTimer);
                            window._piperTimer = null;
                        }
                    };

                    audio.play().catch(err => {
                        console.error('[App] Audio play failed:', err);
                        if (currentId === playbackIdRef.current) {
                            setIsPlaying(false);
                            isPlayingRef.current = false;
                        }
                    });
                });
                return; // EXIT EARLY for AI voices (Pro Only)
            }
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        // Find system voice object
        if (selectedVoice && !selectedVoice.startsWith('piper-')) {
            const allVoices = synthRef.current.getVoices();
            const voiceObj = allVoices.find(v => v.voiceURI === selectedVoice || v.name === selectedVoice);
            if (voiceObj) {
                utterance.voice = voiceObj;
            }
        }

        utterance.rate = speed;

        utterance.onstart = () => {
            setIsPlaying(true);
        };

        utterance.onend = () => {
            if (!synthRef.current.speaking) {
                setIsPlaying(false);
                setCurrentCharIndex(-1);
            }
        };

        utterance.onerror = (e) => {
            console.error('TTS Error', e);
            setIsPlaying(false);
        };

        // Word Boundary for Highlighting
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                setCurrentCharIndex(startIndex + event.charIndex);
            }
        };

        utteranceRef.current = utterance;

        console.log(`[Diagnostic] Play clicked. selectedVoice: "${selectedVoice}"`);

        synthRef.current.speak(utterance);
    };

    const handlePlay = () => {
        if (window._piperAudio && window._piperAudio.paused) {
            window._piperAudio.play();
            setIsPlaying(true);
        } else if (synthRef.current.paused) {
            synthRef.current.resume();
            setIsPlaying(true);
        } else {
            speak(0);
        }
    };

    const handleReverse = () => {
        speak(0);
    };

    const handleRewind = () => {
        // Estimate characters based on avg 15 chars/sec at 1.0x speed
        const charsToJump = rewindDuration * 15 * speed;
        const targetIndex = Math.max(0, (currentCharIndex === -1 ? 0 : currentCharIndex) - charsToJump);
        speak(targetIndex);
    };

    const handleSeekToggle = () => {
        setIsSeekMode(!isSeekMode);
    };

    const handleTextClick = (e) => {
        if (!isSeekMode) return;

        // In Read View (spans), we handle clicks on the spans themselves now.
        // In Edit Mode (textarea), we handle it in the textarea onClick.
        // This parent click is a fallback.
        setIsSeekMode(false);
    };

    const handleWordClick = (e, charIndex) => {
        e.stopPropagation();
        speak(charIndex);
        if (isSeekMode) setIsSeekMode(false);
    };

    const handleStop = (isReplacing = false) => {
        console.log(`[App] handleStop called (isReplacing=${isReplacing})`);

        // 1. Stop Browser Synth
        if (synthRef.current) {
            synthRef.current.cancel();
        }

        // 2. Stop Piper Audio Object
        if (window._piperAudio) {
            window._piperAudio.pause();
            window._piperAudio.currentTime = 0;
            window._piperAudio = null;
        }

        // 3. Clear Highlighting Timer
        if (window._piperTimer) {
            clearInterval(window._piperTimer);
            window._piperTimer = null;
        }

        // 4. Force Main Process to kill piper (Unconditional)
        ppapi.invoke('tts-stop');

        // 5. Update State & Refs synchronously
        setIsPlaying(false);
        isPlayingRef.current = false;
        setCurrentCharIndex(-1);
    };

    const handlePause = () => {
        if (window._piperAudio && !window._piperAudio.paused) {
            window._piperAudio.pause();
            setIsPlaying(false);
        } else if (synthRef.current.speaking && !synthRef.current.paused) {
            synthRef.current.pause();
            setIsPlaying(false);
        }
    };

    // Listen for incoming text
    useEffect(() => {
        const handleShowAndRead = async (event, newText) => {
            // Cancel any current speech
            synthRef.current.cancel();

            // Removing sanitizeText for display in TextArea to allow editing, 
            // but we should sanitize for history saving if needed.
            // Actually, textareas are safe from XSS.
            setText(newText);

            // Save to history
            // Logic duplicated here and in settings? Ideally centralize logic.
            // We just focus on widget logic here.

            if (storeHistory && !isSensitiveContent(newText)) {
                // We do invoke store-set, but we need current list.
                // Optimistic: Just fire and forget? No, need allow append.
                // Main process manages file, so 'store-get' is safe.
                const currentHistory = await ppapi.invoke('store-get', 'history') || [];
                const timestamp = Date.now();
                const newItem = { text: newText, timestamp, pinned: false };
                const filtered = currentHistory.filter(item => item.text !== newText);
                const updated = [newItem, ...filtered].slice(0, 50);
                ppapi.invoke('store-set', 'history', updated);
            }

            // Start playing immediately with the NEW text specifically
            speak(0, newText);
        };

        const handleEmpty = () => {
            setText('');
            handleStop();
        };

        const handleError = (event, msg) => {
            setToast({ message: msg, type: 'error' });
            setTimeout(() => setToast(null), 3000);
        };

        const unShowAndRead = ppapi.on('show-and-read', handleShowAndRead);
        const unEmpty = ppapi.on('show-widget-empty', handleEmpty);
        const unError = ppapi.on('show-error', handleError);

        return () => {
            unShowAndRead();
            unEmpty();
            unError();
        };
    }, [selectedVoice, speed, storeHistory, voices]); // Re-bind if voices change

    const handleSpeedChange = (e) => {
        const s = parseFloat(e.target.value);
        setSpeed(s);
        ppapi.invoke('store-set', 'speed', s);
        if (isPlaying) {
            const currentPos = currentCharIndex !== -1 ? currentCharIndex : 0;
            speak(currentPos);
        }
    };

    const handleOpenSettings = () => {
        ppapi.send('open-settings');
    };

    const handleCloseWidget = () => {
        handleStop();
        ppapi.send('hide-window');
    };

    // MANUAL RESIZE LOGIC
    const [resizingMode, setResizingMode] = useState(null); // 'tl' or 'br'
    const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, winX: 0, winY: 0 });

    const handleResizeMouseDown = (e, mode) => {
        setResizingMode(mode);
        resizeStartRef.current = {
            x: e.screenX,
            y: e.screenY,
            w: window.outerWidth,
            h: window.outerHeight,
            winX: window.screenX,
            winY: window.screenY
        };
        e.preventDefault();
        e.stopPropagation();
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!resizingMode) return;

            const deltaX = e.screenX - resizeStartRef.current.x;
            const deltaY = e.screenY - resizeStartRef.current.y;

            if (resizingMode === 'br') {
                const newWidth = Math.max(40, resizeStartRef.current.w + deltaX);
                const newHeight = Math.max(40, resizeStartRef.current.h + deltaY);
                ppapi.send('resize-window-bounds', {
                    x: resizeStartRef.current.winX,
                    y: resizeStartRef.current.winY,
                    width: newWidth,
                    height: newHeight
                });
            } else if (resizingMode === 'tl') {
                const clampedDeltaX = Math.min(deltaX, resizeStartRef.current.w - 40);
                const clampedDeltaY = Math.min(deltaY, resizeStartRef.current.h - 40);

                ppapi.send('resize-window-bounds', {
                    x: resizeStartRef.current.winX + clampedDeltaX,
                    y: resizeStartRef.current.winY + clampedDeltaY,
                    width: resizeStartRef.current.w - clampedDeltaX,
                    height: resizeStartRef.current.h - clampedDeltaY
                });
            }
        };

        const handleMouseUp = () => {
            setResizingMode(null);
        };

        if (resizingMode) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [resizingMode]);

    // Render Logic for Highlighting
    // We overlay a div on top of the textarea (or replace it) when playing.
    // Or simpler: Just render the Highlighted Text View always, and switch to Textarea on click/edit?
    // Let's try: When IS PLAYING: Show Div. When STOPPED/PAUSED: Show Textarea.

    // Helper to render highlighted text with WORD-LEVEL precision
    // Now supports CJK languages (Chinese, Japanese, Korean) using Intl.Segmenter
    const renderHighlightedText = () => {
        if (!text) return null;

        let segments = [];
        try {
            // Intl.Segmenter is a modern API that handles word boundaries for many languages
            const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
            const iter = segmenter.segment(text);
            for (const segment of iter) {
                segments.push({
                    text: segment.segment,
                    index: segment.index
                });
            }
        } catch (e) {
            // Fallback for older environments (though Electron should be fine)
            let cumulativeIndex = 0;
            segments = text.split(/(\s+)/).map(s => {
                const item = { text: s, index: cumulativeIndex };
                cumulativeIndex += s.length;
                return item;
            });
        }

        return (
            <div style={{ padding: '10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>
                {segments.map((segment, idx) => {
                    const start = segment.index;
                    const end = start + segment.text.length;

                    const isWhitespace = /^\s+$/.test(segment.text);
                    if (isWhitespace) return <span key={idx}>{segment.text}</span>;

                    const isCurrentlyHighlighted = currentCharIndex >= start && currentCharIndex < end;

                    return (
                        <span
                            key={idx}
                            onClick={(e) => {
                                if (isSeekMode) {
                                    e.stopPropagation();
                                    speak(start);
                                    setIsSeekMode(false);
                                }
                            }}
                            style={{
                                background: isCurrentlyHighlighted ? '#ffeb3b' : 'transparent',
                                color: isCurrentlyHighlighted ? '#000' : 'inherit',
                                borderRadius: '2px',
                                fontWeight: isCurrentlyHighlighted ? 'bold' : 'normal',
                                cursor: isSeekMode ? 'crosshair' : 'default',
                                transition: 'background 0.1s'
                            }}
                            title={isSeekMode ? `Start from: ${segment.text.trim()}` : ""}
                        >
                            {segment.text}
                        </span>
                    );
                })}
            </div>
        );
    };

    if (!supabase) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', background: '#000', color: '#fff',
                fontFamily: PREMIUM_FONT, textAlign: 'center', padding: '20px'
            }}>
                <h1 style={{ color: '#60a5fa' }}>Configuration Missing</h1>
                <p style={{ color: '#9ca3af', maxWidth: '400px' }}>
                    The app is missing its Supabase connection details.
                    Please ensure you have a <code>.env</code> file in your project root with
                    <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>.
                </p>
                <div style={{ marginTop: '20px', fontSize: '0.8em', color: '#666' }}>
                    Check DevTools (opened automatically) for technical details.
                </div>
            </div>
        );
    }

    return (
        <div className="widget-container" style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            fontFamily: PREMIUM_FONT
        }}>
            {toast && (
                <div className={`toast toast-${toast.type}`} style={{
                    position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)',
                    background: toast.type === 'error' ? '#f44336' : '#4caf50', color: 'white',
                    padding: '8px 16px', borderRadius: '4px', zIndex: 10000, fontSize: '0.9em',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)', pointerEvents: 'none'
                }}>
                    {toast.message}
                </div>
            )}
            <header className="header" style={{ position: 'relative', padding: '10px', background: '#222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', WebkitAppRegion: 'drag' }}>
                <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    pasteplay.app <span style={{ fontSize: '0.7em', color: '#888', textTransform: 'uppercase', fontWeight: '900' }}>beta</span>
                    {plan === 'free' && (
                        <span style={{
                            fontSize: '0.8em',
                            color: text.length > 2000 ? '#f44336' : '#888',
                            background: 'rgba(255,255,255,0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 'normal'
                        }}>
                            {text.length.toLocaleString()} / 2,000
                        </span>
                    )}
                </span>
                <div style={{
                    position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '0.85em', color: '#888', background: 'rgba(0,0,0,0.3)',
                    padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)',
                    fontWeight: 'bold', pointerEvents: 'none', whiteSpace: 'nowrap'
                }}>
                    Hotkey: <span style={{ color: '#aaa' }}>{currentHotkey}</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', WebkitAppRegion: 'no-drag' }}>
                    <button
                        onClick={() => {
                            const newVal = !alwaysOnTop;
                            setAlwaysOnTop(newVal);
                            ppapi.send('set-always-on-top', newVal);
                        }}
                        title={alwaysOnTop ? "Always on Top (Active)" : "Enable Always on Top"}
                        style={{
                            background: alwaysOnTop ? 'rgba(76, 175, 80, 0.2)' : 'none',
                            color: alwaysOnTop ? '#4caf50' : '#666',
                            border: alwaysOnTop ? '1px solid #4caf50' : 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1em',
                            padding: '2px 6px',
                            transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        📌
                    </button>
                    <button onClick={handleOpenSettings} title="Settings" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>⚙️</button>
                    <button onClick={handleCloseWidget} title="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}>✕</button>
                </div>
            </header>

            <main className="main-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', overflow: 'hidden' }}>

                {/* Text Display Area */}
                <div
                    onClick={handleTextClick}
                    style={{
                        flex: 1, position: 'relative', overflowY: 'auto', background: '#111',
                        borderRadius: '5px', border: isSeekMode ? '2px solid #ffeb3b' : '1px solid #444',
                        cursor: isSeekMode ? 'crosshair' : 'default',
                        transition: 'border 0.2s',
                        marginBottom: '5px'
                    }}
                >
                    {isSeekMode && <div style={{ position: 'absolute', top: '5px', right: '10px', fontSize: '0.8em', color: '#ffeb3b', zIndex: 10 }}>Select word...</div>}
                    {isPlaying ? (
                        <div
                            style={{ padding: '10px', color: '#eee', minHeight: '100%' }}
                            onClick={() => { }}
                        >
                            {renderHighlightedText()}
                        </div>
                    ) : (
                        <textarea
                            ref={textAreaRef}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onClick={(e) => {
                                if (isSeekMode) {
                                    const index = e.target.selectionStart;
                                    speak(index);
                                    setIsSeekMode(false);
                                }
                            }}
                            placeholder="Waiting for text..."
                            style={{
                                width: '100%', height: '100%', resize: 'none', padding: '10px',
                                background: 'transparent', border: 'none', color: '#eee', outline: 'none',
                                fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit'
                            }}
                        />
                    )}
                </div>

                <div className="controls-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px' }}>
                    <div className="btn-group" style={{ display: 'flex', gap: '4px' }}>
                        <button className="icon-btn" onClick={handlePlay} disabled={isPlaying || !text.trim()} title="Play">▶</button>
                        <button className="icon-btn" onClick={handlePause} disabled={!isPlaying} title="Pause">||</button>
                        <button className="icon-btn" onClick={handleRewind} disabled={!text.trim()} title={`Rewind ${rewindDuration}s`}>⏪</button>
                        <button className="icon-btn" onClick={handleReverse} disabled={!text.trim()} title="Restart">↺</button>
                        <button
                            className={`icon-btn ${isSeekMode ? 'seeking' : ''}`}
                            onClick={handleSeekToggle}
                            disabled={!text.trim()}
                            style={{ background: isSeekMode ? '#ffeb3b' : '', color: isSeekMode ? '#000' : '' }}
                            title="Set start point (⌶)"
                        >
                            ⌶
                        </button>
                    </div>

                    <div className="slider-container" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Improved speed visualization */}
                        <span style={{ minWidth: '40px', fontSize: '0.8em' }}>{speed.toFixed(1)}x</span>
                        <input
                            type="range"
                            min="0.5"
                            max="3.0"
                            step="0.25"
                            value={speed}
                            onChange={handleSpeedChange}
                            style={{ flex: 1 }}
                        />
                    </div>
                </div>
            </main>

            {/* Top-Left Resize Handle - Larger and Visible */}
            <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'tl')}
                className="resize-handle tl"
                style={{
                    position: 'absolute', top: '0', left: '0',
                    width: '24px', height: '24px',
                    cursor: 'nw-resize',
                    background: 'linear-gradient(315deg, rgba(255,255,255,0.2) 50%, #888 50%)',
                    zIndex: 10000,
                    WebkitAppRegion: 'no-drag',
                    transition: 'background 0.2s',
                }}
            />

            {/* Bottom-Right Resize Handle - Larger and Visible */}
            <div
                onMouseDown={(e) => handleResizeMouseDown(e, 'br')}
                className="resize-handle br"
                style={{
                    position: 'absolute', bottom: '0', right: '0',
                    width: '24px', height: '24px',
                    cursor: 'se-resize',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 50%, #888 50%)',
                    zIndex: 10000,
                    WebkitAppRegion: 'no-drag',
                    transition: 'background 0.2s',
                }}
                title="Drag to resize"
            />
        </div>
    );
}

function SettingsViewer() {
    // ... (This function remains largely similar, but needs to populate voice list from Window Speech API)
    // Actually, IPC 'request-voices' no longer exists. We must use SpeechSynthesis here too.

    const [history, setHistory] = useState([]);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [autoCopy, setAutoCopy] = useState(true);
    const [storeHistory, setStoreHistory] = useState(true);
    const [alwaysOnTop, setAlwaysOnTop] = useState(true);
    const [robotAvailable, setRobotAvailable] = useState(false);
    const [currentHotkey, setCurrentHotkey] = useState('');
    const [isRecordingHotkey, setIsRecordingHotkey] = useState(false);
    const [toast, setToast] = useState(null);
    const [user, setUser] = useState(null);
    const [plan, setPlan] = useState('free');
    const [email, setEmail] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [rewindDuration, setRewindDuration] = useState(10);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Auth State Hook
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                getUserEntitlements(session.user.id).then(ent => setPlan(ent.plan));
            }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                getUserEntitlements(session.user.id).then(ent => setPlan(ent.plan));
            } else {
                setPlan('free');
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email) return;
        setIsLoggingIn(true);
        const { error } = await signInWithMagicLink(email);
        setIsLoggingIn(false);
        if (error) {
            showToast(error.message, 'error');
        } else {
            showToast('Magic link sent! Check your email.');
        }
    };

    const handleLogout = async () => {
        await signOut();
        showToast('Logged out');
    };

    // Initial Load
    useEffect(() => {
        const load = async () => {
            const h = await ppapi.invoke('store-get', 'history') || [];
            const v = await ppapi.invoke('store-get', 'voice');
            const ac = await ppapi.invoke('store-get', 'autoCopy');
            const sh = await ppapi.invoke('store-get', 'storeHistory');
            const ra = await ppapi.invoke('check-robotjs');
            const hk = await ppapi.invoke('get-current-hotkey');
            const aot = await ppapi.invoke('store-get', 'alwaysOnTop');

            setHistory(h);
            if (v) {
                const migratedVoice = v.startsWith('kokoro-') ? v.replace('kokoro-', 'piper-') : v;
                setSelectedVoice(migratedVoice);
                if (migratedVoice !== v) ppapi.invoke('store-set', 'voice', migratedVoice);
            }
            if (ac !== undefined) setAutoCopy(ac);
            if (sh !== undefined) setStoreHistory(sh);
            if (aot !== undefined) setAlwaysOnTop(aot);
            setRobotAvailable(ra);
            setCurrentHotkey(hk ? hk.replace('CommandOrControl', 'Ctrl') : 'Ctrl+Alt+R');
            const savedRewind = await ppapi.invoke('store-get', 'rewindDuration');
            if (savedRewind !== undefined) setRewindDuration(savedRewind);
        };
        load();

        // Load Voices Client-Side
        const loadVoices = () => {
            const systemVoices = window.speechSynthesis.getVoices().map(v => ({ name: v.name, uri: v.voiceURI || v.name }));
            const kokoroVoices = [
                { name: 'Bella (AI)', uri: 'piper-af_bella', voiceURI: 'piper-af_bella' },
            ];
            setVoices([...kokoroVoices, ...systemVoices]);
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        // Listen for updates from Main Window
        const handleStoreUpdate = (event, key, value) => {
            if (key === 'history') setHistory(value);
            if (key === 'voice') setSelectedVoice(value);
            if (key === 'autoCopy') setAutoCopy(value);
            if (key === 'storeHistory') setStoreHistory(value);
            if (key === 'alwaysOnTop') setAlwaysOnTop(value);
            if (key === 'rewindDuration') setRewindDuration(value);
            if (key === 'captureHotkey') setCurrentHotkey(value.replace('CommandOrControl', 'Ctrl'));
        };
        const unsubscribe = ppapi.on('store-updated', handleStoreUpdate);

        return () => {
            unsubscribe();
        };
    }, []);

    const handleVoiceChange = (e) => {
        const v = e.target.value;
        setSelectedVoice(v);
        ppapi.invoke('store-set', 'voice', v); // Saving name/URI
    };

    // ... (Rest of handlers remain same) ...
    const handleAutoCopyToggle = () => {
        const newVal = !autoCopy;
        setAutoCopy(newVal);
        ppapi.invoke('store-set', 'autoCopy', newVal);
    };

    const handleStoreHistoryToggle = () => {
        const newVal = !storeHistory;
        setStoreHistory(newVal);
        ppapi.invoke('store-set', 'storeHistory', newVal);
    };

    const handleClearHistory = () => {
        ppapi.invoke('store-set', 'history', []);
        showToast('History cleared.');
    };

    const handleTogglePin = (index) => {
        const item = history[index];
        const newHistory = [...history];
        newHistory[index] = { ...item, pinned: !item.pinned };

        // Optimistic update
        setHistory(newHistory);
        ppapi.invoke('store-set', 'history', newHistory);
    };

    const handleDeleteHistory = (index) => {
        const updated = history.filter((_, i) => i !== index);
        ppapi.invoke('store-set', 'history', updated);
    };

    const handlePlayHistory = (text) => {
        ppapi.send('show-in-widget', text);
    };

    const handleAppRelaunch = () => {
        if (window.confirm('Are you sure you want to restart the application?')) {
            ppapi.send('app-relaunch');
        }
    };

    // Removed handleWindowScaleChange

    const startRecordingHotkey = () => {
        setIsRecordingHotkey(true);
    };

    useEffect(() => {
        if (!isRecordingHotkey) return;
        const handleKeyDown = (e) => {
            e.preventDefault();
            const modifiers = [];
            if (e.ctrlKey || e.metaKey) modifiers.push('Ctrl');
            if (e.altKey) modifiers.push('Alt');
            if (e.shiftKey) modifiers.push('Shift');

            const key = e.key.toUpperCase();
            // Don't register if it's JUST a modifier key
            if (['CONTROL', 'ALT', 'SHIFT', 'META'].includes(key)) return;

            if (modifiers.length === 0) {
                showToast('Hotkey must include Ctrl, Alt, or Shift', 'error');
                setIsRecordingHotkey(false);
                return;
            }

            const hotkeyString = [...modifiers, key].join('+');
            const electronHotkey = hotkeyString.replace('Ctrl', 'CommandOrControl');

            ppapi.invoke('register-hotkey', electronHotkey).then(result => {
                if (result.success) {
                    setCurrentHotkey(hotkeyString);
                    showToast(`Hotkey set to ${hotkeyString}`);
                } else {
                    showToast(result.message || 'Failed to register hotkey', 'error');
                }
                setIsRecordingHotkey(false);
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isRecordingHotkey]);

    return (
        <div className="settings-container" style={{
            padding: '20px', height: '100vh', overflowY: 'auto', background: '#1a1a1a', color: '#fff'
        }}>
            {toast && (
                <div style={{
                    position: 'fixed', bottom: '20px', right: '20px',
                    background: toast.type === 'error' ? '#f44336' : '#4caf50',
                    color: 'white', padding: '12px 24px', borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)', zIndex: 10000,
                    animation: 'slideUp 0.3s ease-out'
                }}>
                    {toast.message}
                </div>
            )}
            <h2 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span>Settings</span>
                    <span style={{ fontSize: '0.4em', color: '#444', fontWeight: 'bold', background: '#1a1a1a', padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>v1.0</span>
                </div>
                <div className="auth-status" style={{ fontSize: '0.45em', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {user ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: plan === 'pro' ? '#4caf50' : '#888', display: 'inline-block', boxShadow: plan === 'pro' ? '0 0 8px #4caf50' : 'none' }}></span>
                                <span style={{ color: plan === 'pro' ? '#4caf50' : '#aaa', fontWeight: 'bold', letterSpacing: '1px' }}>{plan === 'pro' ? 'PRO ACTIVE' : 'FREE PLAN'}</span>
                            </div>
                            <span style={{ color: '#eee', opacity: 0.5, fontSize: '0.85em' }}>{user.email}</span>
                            <button onClick={handleLogout} style={{ padding: '4px 10px', background: '#333', border: '1px solid #555', color: '#fff', cursor: 'pointer', borderRadius: '4px' }}>Logout</button>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#888', display: 'inline-block' }}></span>
                                <span style={{ color: '#666', fontWeight: 'bold' }}>NOT LOGGED IN</span>
                            </div>
                            <form onSubmit={handleLogin} style={{ display: 'flex', gap: '5px' }}>
                                <input
                                    type="email"
                                    placeholder="Email for Magic Link"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ padding: '6px 10px', background: '#222', border: '1px solid #444', color: '#fff', fontSize: '1.2em', width: '160px', borderRadius: '4px' }}
                                />
                                <button disabled={isLoggingIn} type="submit" style={{ padding: '6px 12px', background: '#4caf50', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
                                    {isLoggingIn ? '...' : 'Login'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </h2>

            <section style={{ marginBottom: '30px' }}>
                <h3>General</h3>

                <div className="setting-row" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Voice</label>
                    {/* Voice Dropdown */}
                    <div style={{ position: 'relative', flex: 1 }}>
                        <select
                            value={selectedVoice || ''}
                            onChange={(e) => handleVoiceChange(e)}
                            style={{
                                width: '100%',
                                padding: '12px 40px 12px 16px',
                                background: '#222',
                                border: '1px solid #444',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: '600',
                                appearance: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                outline: 'none',
                            }}
                        >
                            <optgroup label="✨ AI Voices (PRO)" style={{ background: '#222', color: '#fff' }}>
                                {voices.filter(v => v.uri.startsWith('piper-')).map(voice => (
                                    <option key={voice.uri} value={voice.uri} style={{ background: '#222', color: '#fff' }}>{voice.name} {plan === 'free' ? '(PRO)' : ''}</option>
                                ))}
                            </optgroup>
                            <optgroup label="💻 System Voices" style={{ background: '#222', color: '#fff' }}>
                                {voices.filter(v => !v.uri.startsWith('piper-')).map(voice => (
                                    <option key={voice.uri} value={voice.uri} style={{ background: '#222', color: '#fff' }}>{voice.name}</option>
                                ))}
                            </optgroup>
                        </select>
                        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }}>▾</div>
                    </div>
                </div>

                <div className="setting-row" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" checked={autoCopy} onChange={handleAutoCopyToggle} disabled={!robotAvailable} />
                        Auto-copy selection (Ctrl+C)
                    </label>
                    {!robotAvailable && <small style={{ color: '#aaa', display: 'block', marginTop: '5px' }}>Requires robotjs (not available)</small>}
                </div>

                <div className="setting-row" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Rewind Duration</label>
                    <select
                        value={rewindDuration}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setRewindDuration(val);
                            ppapi.invoke('store-set', 'rewindDuration', val);
                        }}
                        style={{ width: '100%', padding: '8px', background: '#222', color: '#fff', border: '1px solid #444', borderRadius: '4px' }}
                    >
                        <option value={5}>5 seconds</option>
                        <option value={10}>10 seconds</option>
                        <option value={15}>15 seconds</option>
                    </select>
                </div>
                {/* ... Other settings valid ... */}
                <div className="setting-row" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type="checkbox" checked={alwaysOnTop} onChange={(e) => {
                            const val = e.target.checked;
                            setAlwaysOnTop(val);
                            ppapi.send('set-always-on-top', val);
                        }} />
                        Always on Top (Stay in front)
                    </label>
                </div>

                <div className="setting-row" style={{ marginBottom: '20px', opacity: plan === 'free' ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Store History {plan === 'free' && <span style={{ color: '#ff9800', fontSize: '0.8em', marginLeft: '5px' }}>(PRO)</span>}</label>
                        <div style={{ fontSize: '0.8em', color: '#888' }}>{storeHistory ? 'Copied text is saved locally' : 'History disabled (Incognito)'}</div>
                    </div>
                    <div
                        onClick={() => {
                            if (plan === 'pro') handleStoreHistoryToggle();
                        }}
                        style={{
                            width: '44px', height: '24px', background: storeHistory ? '#4caf50' : '#444',
                            borderRadius: '12px', position: 'relative', cursor: plan === 'pro' ? 'pointer' : 'not-allowed', transition: 'background 0.2s',
                            opacity: plan === 'free' ? 0.5 : 1
                        }}
                    >
                        <div style={{
                            width: '20px', height: '20px', background: '#fff', borderRadius: '50%',
                            position: 'absolute', top: '2px', left: storeHistory ? '22px' : '2px',
                            transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                        }} />
                    </div>
                </div>

                <div className="setting-row" style={{ marginBottom: '25px', opacity: plan === 'free' ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                        <label style={{ display: 'block', fontWeight: 'bold' }}>Capture Hotkey {plan === 'free' && <span style={{ color: '#ff9800', fontSize: '0.8em' }}>(PRO)</span>}</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => {
                                    if (plan !== 'pro') return;
                                    showToast(`Hotkey Active: ${currentHotkey}`, 'success');
                                }}
                                disabled={plan === 'free'}
                                style={{
                                    fontSize: '0.7em', padding: '4px 10px', background: '#333', border: '1px solid #555',
                                    color: '#eee', borderRadius: '4px', cursor: plan === 'pro' ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Test
                            </button>
                            <button
                                onClick={() => {
                                    if (plan !== 'pro') return;
                                    if (confirm('Reset hotkey to default (Ctrl+Alt+R)?')) {
                                        ppapi.invoke('register-hotkey', 'CommandOrControl+Alt+R').then(res => {
                                            if (res.success) {
                                                setCurrentHotkey('Ctrl+Alt+R');
                                                showToast('Reset to default: Ctrl+Alt+R');
                                            } else {
                                                showToast('Failed to reset', 'error');
                                            }
                                        });
                                    }
                                }}
                                disabled={plan === 'free'}
                                style={{
                                    fontSize: '0.7em', padding: '4px 10px', background: '#333', border: '1px solid #555',
                                    color: '#eee', borderRadius: '4px', cursor: plan === 'pro' ? 'pointer' : 'not-allowed'
                                }}
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={startRecordingHotkey}
                        disabled={plan === 'free'}
                        style={{
                            padding: '12px 15px',
                            background: isRecordingHotkey ? '#2e7d32' : '#222',
                            border: isRecordingHotkey ? '1px solid #4caf50' : '1px solid #444',
                            color: '#fff',
                            cursor: plan === 'free' ? 'not-allowed' : 'pointer',
                            width: '100%',
                            borderRadius: '6px',
                            fontWeight: 'bold',
                            fontSize: '1em',
                            transition: 'all 0.2s',
                            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
                        }}
                    >
                        {plan === 'free' ? `Standard Hotkey: ${currentHotkey}` : (isRecordingHotkey ? 'Press keys now...' : currentHotkey || 'Click to Record')}
                    </button>
                    {isRecordingHotkey && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsRecordingHotkey(false); }}
                            style={{ width: '100%', marginTop: '5px', padding: '8px', background: '#d32f2f', border: 'none', color: 'white', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            Cancel Recording
                        </button>
                    )}
                    <div style={{ fontSize: '0.85em', color: '#888', marginTop: '10px', lineHeight: '1.4' }}>
                        <p style={{ margin: '4px 0' }}>• Global hotkey to copy & read text.</p>
                        <p style={{ margin: '4px 0' }}>• Must include <strong>Ctrl</strong>, <strong>Alt</strong>, or <strong>Shift</strong>.</p>
                        <p style={{ margin: '4px 0' }}>• Default: <strong>Ctrl+Alt+R</strong></p>
                    </div>
                </div>

                {/* Window Scale Slider Removed */}

                <div className="setting-row" style={{ marginTop: '30px', borderTop: '1px solid #333', paddingTop: '20px' }}>
                    <button
                        onClick={handleAppRelaunch}
                        style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}
                    >
                        Hard Reset App (Refresh)
                    </button>
                    <small style={{ display: 'block', color: '#aaa', marginTop: '5px', textAlign: 'center' }}>
                        Use this if the app freezes or updates are not showing.
                    </small>
                </div>
            </section>


            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '15px', gap: '15px' }}>
                    <h3 style={{ margin: 0 }}>History</h3>

                    {plan === 'pro' && (
                        <div style={{ flex: 1, position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search clips..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '6px 10px 6px 30px',
                                    background: '#222',
                                    border: '1px solid #444',
                                    borderRadius: '4px',
                                    color: '#eee',
                                    fontSize: '0.9em'
                                }}
                            />
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            if (window.confirm('Delete ALL history items?')) handleClearHistory();
                        }}
                        title="Delete All History"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em' }}
                    >
                        🗑️
                    </button>
                </div>
                {/* ... History List ... */}
                <div className="history-list">
                    {plan === 'free' ? (
                        <div style={{ background: '#222', border: '1px dashed #444', padding: '20px', borderRadius: '8px', textAlign: 'center', opacity: 0.9 }}>
                            <div style={{ fontSize: '1.8em', marginBottom: '10px' }}>🔒</div>
                            <div style={{ fontWeight: 'bold', color: '#ff9800', fontSize: '1.1em', marginBottom: '8px' }}>History is a Pro Feature</div>
                            <p style={{ fontSize: '0.9em', color: '#ccc', lineHeight: '1.4', margin: '0 0 15px 0' }}>
                                Unlock <strong>Unlimited Local History</strong> and lightning-fast search for all your clips.
                                Keep everything organized privately on your device.
                            </p>
                            <div style={{ fontSize: '0.85em', color: '#aaa', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
                                Upgrade to Pro ($7.99/mo) for unlimited local archives.
                            </div>
                        </div>
                    ) : history.length === 0 ? (
                        <p style={{ color: '#666', fontStyle: 'italic' }}>No history yet.</p>
                    ) : (
                        history
                            .filter(item =>
                                item.text.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .sort((a, b) => {
                                // Sort by pinned first, then timestamp
                                if (a.pinned && !b.pinned) return -1;
                                if (!a.pinned && b.pinned) return 1;
                                return b.timestamp - a.timestamp;
                            })
                            .map((item, index) => (
                                <div key={index} style={{
                                    background: item.pinned ? 'rgba(255, 235, 59, 0.1)' : '#222',
                                    border: item.pinned ? '1px solid rgba(255, 235, 59, 0.3)' : '1px solid transparent',
                                    padding: '10px', marginBottom: '8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                                }}>
                                    <div
                                        onClick={() => handlePlayHistory(item.text)}
                                        style={{ flex: 1, cursor: 'pointer', marginRight: '10px' }}
                                        title="Click to play in widget"
                                    >
                                        <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {item.pinned && <span>⭐️</span>}
                                            {item.text.substring(0, 50)}{item.text.length > 50 ? '...' : ''}
                                        </div>
                                        <div style={{ fontSize: '0.8em', color: '#888' }}>{formatRelativeTime(item.timestamp)}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '5px' }}>
                                        {plan === 'pro' && (
                                            <button
                                                onClick={() => handleTogglePin(index)}
                                                title={item.pinned ? "Unpin for later" : "Pin for later"}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: item.pinned ? 1 : 0.5, filter: item.pinned ? 'grayscale(0%)' : 'grayscale(100%)' }}
                                            >
                                                ⭐️
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteHistory(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}>✕</button>
                                    </div>
                                </div>
                            ))
                    )}
                </div>
            </section>
        </div>
    );
}

function App() {
    const [mode, setMode] = useState('widget');
    const [updateStatus, setUpdateStatus] = useState(null); // 'available', 'downloading', 'downloaded'

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mode') === 'settings') {
            setMode('settings');
            document.title = 'PastePlay Settings';
        } else {
            setMode('widget');
        }

        const unAvail = ppapi.on('update-available', () => setUpdateStatus('available'));
        const unDown = ppapi.on('update-downloading', () => setUpdateStatus('downloading'));
        const unDone = ppapi.on('update-downloaded', () => setUpdateStatus('downloaded'));

        return () => {
            unAvail();
            unDown();
            unDone();
        };
    }, []);

    const handleRestartForUpdate = () => {
        ppapi.send('install-update');
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
                {mode === 'settings' ? <SettingsViewer /> : <WidgetViewer />}
            </div>

            {updateStatus && (
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: '#4caf50', color: 'white', padding: '6px 12px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    fontSize: '0.85em', fontWeight: 'bold', zIndex: 20000,
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>✨</span>
                        {updateStatus === 'available' && "New Update Available!"}
                        {updateStatus === 'downloading' && "Downloading Update..."}
                        {updateStatus === 'downloaded' && "Update Ready to Install!"}
                    </div>
                    {updateStatus === 'downloaded' && (
                        <button
                            onClick={handleRestartForUpdate}
                            style={{
                                background: 'white', color: '#4caf50', border: 'none',
                                padding: '2px 10px', borderRadius: '4px', cursor: 'pointer',
                                fontSize: '0.9em', fontWeight: 'bold'
                            }}
                        >
                            Restart Now
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
