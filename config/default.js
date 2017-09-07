"use strict";

module.exports = {
  port: 12580,
  url: "mongodb://localhost:27017/simplenotbook",
  session: {
    name: "SID",
    secret: "SID",
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge:  60 * 60 * 1000 //过期时间60分钟
    }
  }
};
