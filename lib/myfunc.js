const fs = require('fs');
const path = require('path');
const fetchLib = require('node-fetch');

function smsg(sock, message) {
  return message;
}

function isUrl(text) {
  return typeof text === 'string' && /https?:\/\//i.test(text);
}

function generateMessageTag() {
  return `${Date.now()}@${Math.floor(Math.random() * 1000)}`;
}

async function getBuffer(url) {
  if (!url) return null;
  if (url.startsWith('http')) {
    const response = await fetchLib(url);
    return Buffer.from(await response.arrayBuffer());
  }
  if (fs.existsSync(url)) {
    return fs.readFileSync(url);
  }
  return null;
}

function getSizeMedia(pathOrBuffer) {
  try {
    const size = Buffer.isBuffer(pathOrBuffer)
      ? pathOrBuffer.length
      : fs.existsSync(pathOrBuffer)
      ? fs.statSync(pathOrBuffer).size
      : 0;
    return size;
  } catch {
    return 0;
  }
}

async function fetch(url, opts) {
  return fetchLib(url, opts);
}

function awaitFn(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sleep(ms = 0) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function reSize(buffer, width, height) {
  return buffer;
}

module.exports = {
  smsg,
  isUrl,
  generateMessageTag,
  getBuffer,
  getSizeMedia,
  fetch,
  await: awaitFn,
  sleep,
  reSize
};
