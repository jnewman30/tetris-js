
export function createAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
}

export async function loadTrack(audioCtx, filepath) {
    const response = await fetch(filepath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

export function playTrack(audioCtx, audioBuffer, loop = false, offset = 0) {
    const trackSource = audioCtx.createBufferSource();
    trackSource.buffer = audioBuffer;
    trackSource.loop = loop;
    trackSource.connect(audioCtx.destination);

    if (offset == 0) {
        trackSource.start();
        offset = audioCtx.currentTime;
    } else {
        trackSource.start(0, audioCtx.currentTime - offset);
    }

    return trackSource;
}
