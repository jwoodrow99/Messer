module.exports = messer => {
  return {
    commands: ["mycommand"],

    regexp: /mycommand/,

    help: "mycommand",

    handler() {
      const argv = parseCommand(commandTypes.RECENT.regexp, rawCommand);
      if (!argv)
        return Promise.reject(Error("Invalid command - check your syntax"));

      const DEFAULT_COUNT = 5;

      const threadCount = argv[2]
        ? parseInt(argv[2].trim(), 10)
        : DEFAULT_COUNT;

      const withHistory = argv[3] === "--history";

      const threadList = this.messen.store.threads.getThreadList(
        threadCount,
        "desc",
      );

      return (withHistory
        ? Promise.all(
            threadList.map(thread =>
              getThreadHistory(this.messen, thread.name, 5),
            ),
          )
        : Promise.resolve([])
      ).then(threadHistories => {
        return Promise.all(
          threadList.map((thread, i) => {
            const logText = `[${i + 1}] ${thread.name}${
              thread.unreadCount > 0 ? ` (${thread.unreadCount} unread)` : ""
            }`;

            if (!withHistory) return Promise.resolve(logText);

            return formatThreadHistory(
              this.messen,
              threadHistories[i],
              "\t",
            ).then(_th => {
              return `${logText}\n${_th}`;
            });
          }),
        ).then(lines => {
          return lines.join("\n");
        });
      });
    },
  };
};
