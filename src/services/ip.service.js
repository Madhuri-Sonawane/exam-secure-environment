function getClientIp(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.socket.remoteAddress
  );
}

module.exports = { getClientIp };
