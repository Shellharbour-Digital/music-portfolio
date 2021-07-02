// Util functions

export default {
  formatTime(time) {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.round((time - minutes * 60) || 0);

    // if seconds is < 10 add a zero so the format is 00:00
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  },
};
