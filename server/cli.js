import net from "net";

const sock = net.connect(1337);

process.stdin.pipe(sock);
sock.pipe(process.stdout);

process.stdin.on("data", (b) => {
  if (b.length === 1 && b[0] === 4) {
    process.stdin.emit("end");
  }
});
