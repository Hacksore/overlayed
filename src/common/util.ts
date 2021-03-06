import net from "net";

function pid() {
  if (typeof process !== "undefined") {
    return process.pid;
  }
  return null;
}

function getIPCPath(id: number) {
  if (process.platform === "win32") {
    return `\\\\?\\pipe\\discord-ipc-${id}`;
  }
  const {
    env: { XDG_RUNTIME_DIR, TMPDIR, TMP, TEMP },
  } = process;
  const prefix = XDG_RUNTIME_DIR || TMPDIR || TMP || TEMP || "/tmp";
  return `${prefix.replace(/\/$/, "")}/discord-ipc-${id}`;
}

function testSocketConnection(id: number) {
  return new Promise((resolve, reject) => {
    const sock = net.createConnection(getIPCPath(id), () => {
      resolve(`connected to discord @ index ${id}`);
      sock.end();
    });

    sock.once("error", () => {
      reject(`error connecting to discord @ index ${id}`);
      sock.end();
    });

    sock.once("close", () => {
      reject(`error connecting to discord @ index ${id}`);
      sock.end();
    });
  });
}

async function isDiscordRunning() {
  for (let i = 0; i < 10; i++) {
    try {
      const res = await testSocketConnection(i);
      if (res) {
        return true;
      }
    } catch (err) {
      // Do nothing
    }
  }

  return false;
}

function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export { pid, isDiscordRunning, uuid };
